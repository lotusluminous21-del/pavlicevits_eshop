
try:
    from google import genai
    import inspect
    import os

    print("google.genai file:", genai.__file__)
    print("re-checking version...", getattr(genai, "__version__", "unknown"))

    try:
        # Try to initialize with dummy values if needed
        client = genai.Client(vertexai=True, project="test-project", location="us-central1")
        print("Client initialized (Vertex AI mode)")
    except Exception as e:
        print(f"Client init failed: {e}")
        try:
             client = genai.Client(api_key="MUST_PROVIDE_API_KEY")
             print("Client initialized (API Key mode)")
        except Exception:
             pass

    if 'client' in locals():
        if hasattr(client, 'batches'):
            print("\nclient.batches found.")
            if hasattr(client.batches, 'create'):
                print("Signature of client.batches.create:")
                try:
                    print(inspect.signature(client.batches.create))
                except Exception as e:
                    print(f"Could not get signature: {e}")
                
                print("\nDocstring:")
                print(client.batches.create.__doc__)
            else:
                 print("client.batches.create NOT found")
                 print("Dir of client.batches:", dir(client.batches))
        else:
            print("client.batches NOT found")
            print("Dir of client:", dir(client))

except ImportError:
    print("google.genai not installed")
except Exception as e:
    print(f"General Error: {e}")
