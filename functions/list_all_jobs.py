
import os
import sys
from google import genai
from google.genai import types

# Add parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from core.llm_config import LLMConfig

def list_all():
    client = LLMConfig.get_client()
    print("--- GEMINI BATCH JOBS ---")
    try:
        batches = client.batches.list()
        for b in batches:
            print(f"\nName: {b.name}")
            print(f"State: {b.state}")
            print(f"Create Time: {b.create_time}")
            print(f"Source: {b.src}")
            if hasattr(b, 'config') and b.config:
                print(f"Dest: {getattr(b.config, 'dest', 'N/A')}")
            if hasattr(b, 'error_config') and b.error_config:
                 print(f"Errors: {b.error_config}")
    except Exception as e:
        print(f"Error listing batches: {e}")

if __name__ == "__main__":
    list_all()
