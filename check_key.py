import os
from dotenv import load_dotenv
load_dotenv("functions/.env")

key = os.getenv("GOOGLE_AI_API_KEY")
if key:
    print(f"API Key exists: {key[:5]}...")
else:
    print("No API Key found.")
