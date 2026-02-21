import os
import time
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
try:
    from dotenv import load_dotenv
    # Load environment variables
    load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))
except ImportError:
    # In production/cloud, variables might already be set or dotenv not needed
    pass

# Config
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "pavlicevits-9a889")
LOCATION = "us-central1" # Grounding often requires us-central1
MODEL_NAME = "gemini-2.5-flash"

class DiscoveryService:
    def __init__(self):
        self.client = genai.Client(
            vertexai=True,
            project=PROJECT_ID,
            location=LOCATION
        )
        self.google_search_tool = types.Tool(
            google_search=types.GoogleSearch()
        )

    def search_and_enrich(self, product_name: str, search_query: Optional[str] = None) -> Dict[str, Any]:
        """
        Performs a Grounded Search for a product.
        Returns a dictionary with:
        - text: The generated description/specs.
        - source_urls: A list of unique URLs used for grounding.
        """
        query_to_use = search_query if search_query else product_name
        prompt = f"""
        Conduct a deep web search for the official Technical Data Sheets (TDS), specifications, and details for the product: '{query_to_use}'.
        
        CRITICAL SEARCH INSTRUCTION: 
        You MUST search for and synthesize information from BOTH English and Greek sources. English sources often contain the most accurate deep technical specifications (like mixing ratios, pot life, nozzle types, VOCs), while Greek sources will help with local naming conventions.
        
        Please provide a comprehensive summary of the product based on your search:
        1. A detailed, professional product description translated/synthesized into Greek.
        2. A complete list of deep technical specifications (chemical base, sequence step, drying times, coverages, etc.).
        3. A list of relevant tags for an e-commerce store.
        4. ALL available variants mentioned in any catalogs (colors, sizes, specific codes).
        
        Format the output as clean, structured text.
        """
        
        # print(f"DEBUG: Searching for '{product_name}'...")
        
        try:
            response = self.client.models.generate_content(
                model=MODEL_NAME,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    tools=[self.google_search_tool],
                    temperature=0.3 # Low temperature for factual data
                )
            )
            
            # Extract Text
            generated_text = response.text if response.text else ""
            
            # Extract Source URLs from Grounding Metadata
            source_urls = []
            if response.candidates and response.candidates[0].grounding_metadata:
                metadata = response.candidates[0].grounding_metadata
                if metadata.grounding_chunks:
                    for chunk in metadata.grounding_chunks:
                        if chunk.web and chunk.web.uri:
                            source_urls.append(chunk.web.uri)
            
            # Deduplicate URLs while preserving order
            unique_urls = list(dict.fromkeys(source_urls))
            
            return {
                "text": generated_text,
                "source_urls": unique_urls
            }

        except Exception as e:
            print(f"ERROR: Grounding search failed: {e}")
            return {
                "text": "",
                "source_urls": [],
                "error": str(e)
            }
