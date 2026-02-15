import requests
import traceback

def test_requests():
    print("Testing requests...")
    try:
        # Test 1: Simple URL
        print("Fetching https://www.google.com ...")
        r = requests.get("https://www.google.com", timeout=5)
        print(f"Status: {r.status_code}")
        
        # Test 2: Vertex URL (Sample if I had one, but I don't have the exact one here easily visible in full)
        # I'll just skip 2 for now.
        
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    test_requests()
