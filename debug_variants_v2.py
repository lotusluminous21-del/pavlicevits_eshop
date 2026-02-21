
import firebase_admin
from firebase_admin import firestore
import json
import sys

if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()
skus = ['HB102701', 'HB101501', 'HB100802', 'HB100601']

for sku in skus:
    doc = db.collection('staging_products').document(sku).get()
    if doc.exists:
        data = doc.to_dict()
        variants = data.get('ai_data', {}).get('variants', [])
        print(f"--- SKU: {sku} ---")
        for i, v in enumerate(variants):
            print(f"Variant {i}: {json.dumps(v, ensure_ascii=False)}")
    else:
        print(f"SKU: {sku} - NOT FOUND")
    sys.stdout.flush()
