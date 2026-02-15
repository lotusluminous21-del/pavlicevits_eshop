
import firebase_admin
from firebase_admin import credentials, firestore
import os

key_path = "c:\\Users\\lotus\\Documents\\pavlicevits\\serviceAccountKey.json"

if not firebase_admin._apps:
    if os.path.exists(key_path):
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)
    else:
        print(f"Warning: Key file not found at {key_path}")
        firebase_admin.initialize_app()

db = firestore.client()

skus = ["SP101101", "SP101001", "SP100901", "SP100801", "SP100701", "SP100601"] 

print(f"Checking status for SKUs: {skus}")

for sku in skus:
    doc = db.collection("staging_products").document(sku).get()
    if doc.exists:
        data = doc.to_dict()
        ai_data = data.get("ai_data", {})
        status = data.get("status")
        
        gen_img = ai_data.get("generated_images", {})
        base_gen = gen_img.get("base")
        
        print(f"\nSKU: {sku}")
        print(f"  Status: {status}")
        print(f"  Generated Base Image: {base_gen}")
    else:
        print(f"\nSKU: {sku} - Not Found")

