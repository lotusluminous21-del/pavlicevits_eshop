import firebase_admin
from firebase_admin import firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()
docs = db.collection('staging_products').get()

processed = 0
for d in docs:
    status = d.get('status')
    if status in ['BATCH_GENERATING', 'PENDING_NANO_BANANA', 'PENDING_STUDIO_GENERATION']:
        d.reference.update({
            'status': 'ENRICHMENT_FAILED',
            'enrichment_message': 'Manually aborted (cleanup)'
        })
        processed += 1

# Also clear the global lock just in case
db.collection('system_config').document('studio_lock').delete()

print(f"Cleaned up {processed} products and cleared lock.")
