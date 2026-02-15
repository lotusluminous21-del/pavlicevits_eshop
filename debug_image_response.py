import os
import logging
from google import genai
from google.genai import types
from functions.core.llm_config import LLMConfig

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def debug_image_generation():
    """
    Simulates the image generation call and prints the response structure.
    """
    try:
        client = LLMConfig.get_client()
        model_name = "gemini-2.5-flash-image" # Explicitly using the one we set
        
        print(f"Testing model: {model_name}")
        
        prompt = "Create a small red square image."
        import time, random
        
        response = None
        for i in range(5):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.4,
                        response_mime_type="image/jpeg"
                    )
                )
                break
            except Exception as e:
                print(f"Attempt {i+1} failed: {e}")
                time.sleep(2 ** i + random.uniform(0, 1))
        
        if not response:
            print("Failed after retries")
            return

        print("\n--- Response Directory ---")
        print(dir(response))
        
        print("\n--- Response Candidates ---")
        if response.candidates:
            print(f"Count: {len(response.candidates)}")
            first_candidate = response.candidates[0]
            print(dir(first_candidate))
            if first_candidate.content:
                print("\n--- Content Parts ---")
                for part in first_candidate.content.parts:
                    print(part)
        else:
            print("No candidates found.")

    except Exception as e:
        print(f"\nERROR: {e}")

if __name__ == "__main__":
    # Ensure we are in the right directory or pythonpath is set
    # This assumes running from 'pavlicevits' root
    debug_image_generation()
