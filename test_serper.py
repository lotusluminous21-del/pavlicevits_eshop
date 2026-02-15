import requests
import json
import os
from dotenv import load_dotenv

load_dotenv("functions/.env")
api_key = os.getenv("SERPER_API_KEY")

def test_image_search():
    url = "https://google.serper.dev/images"
    payload = json.dumps({
        "q": "apple",
        "num": 5
    })
    headers = {
        'X-API-KEY': api_key,
        'Content-Type': 'application/json'
    }
    
    response = requests.request("POST", url, headers=headers, data=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_image_search()
