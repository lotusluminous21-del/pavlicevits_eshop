import firebase_admin
from firebase_admin import firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()
doc = db.collection('staging_products').document('HB101201').get()

if doc.exists:
    data = doc.to_dict()
    print(f"SKU: HB101201")
    print(f"Status: {data.get('status')}")
    print(f"Message: {data.get('enrichment_message')}")
else:
    print("Not found")
