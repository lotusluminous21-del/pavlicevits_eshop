import firebase_admin
from firebase_admin import firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()
docs = db.collection('staging_products').get()

print("--- Product Statuses ---")
for d in docs:
    status = d.get('status')
    if status and ('GENERATING' in status or 'PENDING' in status):
        print(f"{d.id}: {status} | Message: {d.get('enrichment_message')}")
