import os
from google import genai
from google.genai import types

def list_models():
    # Force pavlicevits project
    project_id = "pavlicevits-9a889"
    location = "europe-west1"
    
    print(f"DEBUG: Connecting to Vertex AI")
    print(f"DEBUG: Project: {project_id}")
    
    client = genai.Client(
        vertexai=True,
        project=project_id,
        location=location
    )
    
    try:
        print("\nListing available models...")
        models = client.models.list()
        for model in models:
            print(f"- {model.name} (Supported: {model.supported_actions})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_models()
