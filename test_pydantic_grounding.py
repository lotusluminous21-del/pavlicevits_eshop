import os
import sys
import json
from typing import List, Optional
from pydantic import BaseModel, Field
from google.genai import types
from dotenv import load_dotenv

# Add functions to path so we can import core.llm_config
sys.path.append(os.path.abspath("functions"))
from core.llm_config import LLMConfig

# Load functions env
load_dotenv("functions/.env")

class ProductImage(BaseModel):
    url: str
    source: str = Field(description="The website source of this image")
    relevance_score: float = Field(default=0.8, description="0.0-1.0 score of how well this matches the product")

class ProductEnrichment(BaseModel):
    description: str = Field(description="A professional, SEO-optimized product description in Greek")
    tags: List[str] = Field(description="List of relevant tags for Shopify")
    category: str = Field(description="Recommended Shopify category")
    found_images: List[ProductImage] = Field(description="List of product image URLs found on the web")

def test_step1_grounding():
    from google import genai
    # Test explicitly with us-central1
    client = genai.Client(
        vertexai=True,
        project="pavlicevits-9a889",
        location="us-central1"
    )
    model_name = "gemini-2.5-flash" 
    
    # 1. GROUNDED SEARCH
    print(f"DEBUG: types.Tool fields: {types.Tool.__annotations__}")
    
    # Try alternate tool config
    google_search_tool = types.Tool(
         google_search=types.GoogleSearch() 
    )
    
    product_name = "COLORMATIC 1K Αστάρι Γεμιστικό HG2 400ml"
    search_prompt = f"Search for the official specifications and high-quality image URLs for the product '{product_name}'. List technical specs in Greek and provide a list of direct image URLs."
    
    print(f"DEBUG: Using Model: {model_name}")
    print(f"DEBUG: Calling Step 1 (Grounding Search)...")
    
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=[search_prompt],
            config=types.GenerateContentConfig(
                tools=[google_search_tool]
            )
        )
        
        print("\n=== STEP 1 RESULTS ===")
        print(response.text)
        if response.candidates and response.candidates[0].grounding_metadata:
            print("\nDEBUG: Grounding Metadata found!")
            metadata = response.candidates[0].grounding_metadata
            print(f"Web Search Queries: {metadata.web_search_queries}")
            if metadata.grounding_chunks:
                print(f"Grounding Chunks ({len(metadata.grounding_chunks)}):")
                for i, chunk in enumerate(metadata.grounding_chunks):
                    print(f"  [{i}] Title: {chunk.web.title}")
                    print(f"      URL: {chunk.web.uri}")

    except Exception as e:
        print(f"DEBUG: Error: {e}")

if __name__ == "__main__":
    test_step1_grounding()
