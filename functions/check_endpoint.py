
import requests
import json

url = "https://europe-west1-pavlicevits-9a889.cloudfunctions.net/debug_env_http"
try:
    print(f"Checking URL: {url}")
    response = requests.get(url, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
