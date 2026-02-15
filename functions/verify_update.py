
from firebase_admin import firestore, initialize_app

def verify():
    initialize_app()
    db = firestore.client()
    
    batch_id = '8246bda8-34fa-4dcb-98b6-2397e8603df8'
    sku = 'SP101101'
    
    batch = db.collection('enrichment_batches').document(batch_id).get()
    if batch.exists:
        print(f"Batch {batch_id} status: {batch.to_dict().get('status')}")
    else:
        print(f"Batch {batch_id} not found")
        
    product = db.collection('staging_products').document(sku).get()
    if product.exists:
        print(f"Product {sku} status: {product.to_dict().get('status')}")
        print(f"Product {sku} message: {product.to_dict().get('enrichment_message')}")
    else:
        print(f"Product {sku} not found")

if __name__ == "__main__":
    verify()
