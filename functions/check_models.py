import os
from google import genai

# Configuration
PROJECT_ID = "pavlicevits-9a889"
REGION = "europe-west1"

print(f"Checking models for project {PROJECT_ID} in {REGION}...")

try:
    client = genai.Client(
        vertexai=True,
        project=PROJECT_ID,
        location=REGION
    )
    
    # List models
    # Note: method signature might vary by SDK version, trying standard list_models
    # For google-genai SDK 0.1+, it might be client.models.list() or similar.
    # We'll try to iterate via client.models.list()
    
    print("\nAvailable Models:")
    for model in client.models.list():
        print(f"- {model.name}")
        
except Exception as e:
    print(f"\nError listing models: {e}")
    # Fallback/Debug info
    import traceback
    traceback.print_exc()
