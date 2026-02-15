import os
import sys
import json
from google.genai import types
from dotenv import load_dotenv

# Add functions to path so we can import core.llm_config
sys.path.append(os.path.abspath("functions"))

from core.llm_config import LLMConfig

# Load functions env
load_dotenv("functions/.env")

def test_gemini_grounding():
    # Test us-central1 for better grounding support
    client = genai.Client(
        vertexai=True,
        project="pavlicevits-9a889",
        location="us-central1"
    )
    model_name = "gemini-2.5-flash"
    
    # Define tool
    google_search_tool = types.Tool(
        google_search_retrieval=types.GoogleSearchRetrieval()
    )
    
    prompt = "Search for 'COLORMATIC 1K HG2 400ml' and find its official specifications."
    
    print(f"DEBUG: Using Model: {model_name} in us-central1")
    print(f"DEBUG: Calling Gemini with Google Search tool...")
    
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=[prompt],
            config=types.GenerateContentConfig(
                tools=[google_search_tool]
            )
        )
        
        print(f"DEBUG: Response Text: {response.text}")
        if response.candidates and response.candidates[0].grounding_metadata:
            print(f"DEBUG: Grounding Metadata found!")
    except Exception as e:
        print(f"DEBUG: Error: {e}")

if __name__ == "__main__":
    test_gemini_grounding()
