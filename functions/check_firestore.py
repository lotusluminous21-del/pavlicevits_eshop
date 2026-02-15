try:
    from google.cloud import firestore
    print("SUCCESS: google.cloud.firestore imported")
except ImportError as e:
    print(f"FAILURE: {e}")
