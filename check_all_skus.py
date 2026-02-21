import firebase_admin
from firebase_admin import firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()
skus = ['HB100601', 'HB100801', 'HB100802', 'HB100803', 'HB100889', 'HB100890', 'HB100901', 'HB101101', 'HB101201', 'HB101301', 'HB101401', 'HB101501', 'HB101502', 'HB101601', 'HB101701', 'HB101801', 'HB101901', 'HB102001', 'HB102601', 'HB102701', 'HB103101']

print("--- Product Statuses ---")
for sku in skus:
    doc = db.collection('staging_products').document(sku).get()
    if doc.exists:
        data = doc.to_dict()
        status = data.get('status')
        gen_img = data.get('ai_data', {}).get('generated_images', {}).get('base')
        print(f"{sku}: {status} | Image: {'EXISTS' if gen_img else 'NONE'}")
    else:
        print(f"{sku}: NOT FOUND")
