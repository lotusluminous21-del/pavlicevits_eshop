"""Cancel ALL batch jobs on Vertex AI and clean up ALL Firestore batch docs."""
from google import genai
import firebase_admin
from firebase_admin import firestore

# 1. Cancel all Vertex AI batch jobs
client = genai.Client(vertexai=True, project="pavlicevits-9a889", location="europe-west1")
all_jobs = list(client.batches.list())

print(f"Found {len(all_jobs)} Vertex AI batch jobs")
for j in all_jobs:
    jid = j.name.split("/")[-1]
    state = str(j.state)
    if "RUNNING" in state or "PENDING" in state:
        try:
            client.batches.cancel(name=j.name)
            print(f"  Cancelled: {jid} ({state})")
        except Exception as e:
            print(f"  Skip {jid}: {e}")
    else:
        print(f"  Already terminal: {jid} ({state})")

# 2. Clean up Firestore batch docs
try:
    firebase_admin.initialize_app()
except ValueError:
    pass

db = firestore.client()
all_batches = db.collection("enrichment_batches").get()
print(f"\nFound {len(all_batches)} Firestore batch docs")

for doc in all_batches:
    data = doc.to_dict()
    status = data.get("status", "?")
    if status in ("RUNNING", "PENDING"):
        doc.reference.update({
            "status": "CANCELLED",
            "error_details": "Bulk cleanup - switching to parallel processing",
            "updated_at": firestore.SERVER_TIMESTAMP,
        })
        # Reset stuck products
        for sku in data.get("skus", []):
            try:
                prod = db.collection("staging_products").document(sku).get()
                if prod.exists and prod.to_dict().get("status") == "BATCH_GENERATING":
                    db.collection("staging_products").document(sku).update({
                        "status": "READY_FOR_STUDIO",
                        "enrichment_message": "Ready to retry"
                    })
                    print(f"  Reset {sku} -> READY_FOR_STUDIO")
            except Exception:
                pass
        print(f"  Cancelled Firestore batch: {doc.id}")
    else:
        print(f"  Already {status}: {doc.id}")

print("\nDone. All clear for fresh parallel processing.")
