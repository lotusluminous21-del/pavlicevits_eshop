from firebase_functions import identity_fn
from firebase_admin import firestore
import time

# Decorator moved to main.py
def create_user_document(event: identity_fn.AuthBlockingEvent) -> identity_fn.BeforeCreateResponse | None:
    """
    Triggered before a new user is created in Firebase Auth (Blocking Function).
    Creates a corresponding document in Firestore 'users' collection with default role.
    """
    user = event.data
    db = firestore.client()
    
    # Check if document already exists (edge case)
    doc_ref = db.collection("users").document(user.uid)
    doc = doc_ref.get()
    
    if doc.exists:
        print(f"User document for {user.uid} already exists. Skipping.")
        return

    # Create new user profile
    user_data = {
        "uid": user.uid,
        "email": user.email,
        "displayName": user.display_name,
        "photoURL": user.photo_url,
        "role": "customer", # DEFAULT ROLE. Change to 'admin' manually in Console.
        "created_at": firestore.SERVER_TIMESTAMP,
        "preferences": {
            "newsletter": False
        }
    }
    
    doc_ref.set(user_data)
    print(f"Created user profile for {user.email} ({user.uid})")

    # --- Shopify Sync ---
    try:
        from shopify import ShopifyClient
        shopify = ShopifyClient()
        
        # Split display name for Shopify
        first_name, last_name = "", ""
        if user.display_name:
            parts = user.display_name.split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""
            
        shopify_customer = shopify.get_or_create_customer(
            email=user.email,
            first_name=first_name,
            last_name=last_name
        )
        
        if shopify_customer:
            # Update Firestore with Shopify ID and enhanced data
            updates = {
                "shopifyCustomerId": str(shopify_customer['id'])
            }
            
            # Sync Phone
            if shopify_customer.get("phone"):
                 updates["phoneNumber"] = shopify_customer["phone"]
            
            # Sync Default Address
            default_address = shopify_customer.get("default_address")
            if default_address:
                # Map to a simple structure or keep raw? 
                # Let's keep a structure that fits common frontend needs.
                updates["billingAddress"] = {
                    "address1": default_address.get("address1"),
                    "city": default_address.get("city"),
                    "country": default_address.get("country"),
                    "zip": default_address.get("zip"),
                    "phone": default_address.get("phone"),
                    "first_name": default_address.get("first_name"),
                    "last_name": default_address.get("last_name")
                }
                
            doc_ref.update(updates)
            print(f"Linked Shopify Customer ID {shopify_customer['id']} to User {user.uid} with enhanced data.")
            
    except Exception as e:
        print(f"Warning: Failed to sync with Shopify: {e}")

def sync_shopify_customer(req) -> dict:
    """
    Called by the frontend immediately after a user registers with Email/Password 
    and sets their displayName via updateProfile.
    """
    user_id = req.auth.uid if req.auth else None
    if not user_id:
        return {"error": "Unauthorized"}
        
    db = firestore.client()
    doc_ref = db.collection("users").document(user_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        return {"error": "User document not found"}
        
    user_data = doc.to_dict()
    first_name = req.data.get("firstName", "")
    last_name = req.data.get("lastName", "")
    email = user_data.get("email")
    
    if not email:
        return {"error": "User has no email"}
        
    display_name = f"{first_name} {last_name}".strip()
    
    # Update firestore
    doc_ref.update({"displayName": display_name})
    
    try:
        from shopify import ShopifyClient
        shopify = ShopifyClient()
        
        shopify_customer = shopify.get_or_create_customer(
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        
        if shopify_customer:
            doc_ref.update({"shopifyCustomerId": str(shopify_customer['id'])})
            return {"success": True, "customerId": str(shopify_customer['id'])}
            
    except Exception as e:
        print(f"Warning: Failed to sync with Shopify in callable: {e}")
        return {"error": str(e)}
        
    return {"success": False}
