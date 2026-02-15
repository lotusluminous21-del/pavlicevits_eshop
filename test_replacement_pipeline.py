import os
import sys
import asyncio
from dotenv import load_dotenv

# Add functions to path
sys.path.append(os.path.abspath("functions"))

from core.discovery_service import DiscoveryService
from core.content_extractor import ContentExtractor

async def run_test():
    print("=== Testing Replacement Pipeline (Grounding + Scraper) ===")
    
    # 1. Initialize Services
    discovery = DiscoveryService()
    extractor = ContentExtractor()
    
    product_name = "COLORMATIC 1K Αστάρι Γεμιστικό HG2 400ml"
    
    # 2. Step 1: Grounded Search
    print(f"\nStep 1: Searching for '{product_name}'...")
    search_result = discovery.search_and_enrich(product_name)
    
    if "error" in search_result:
        print(f"Error in search: {search_result['error']}")
        return

    # print(f"\n[Gemini Text]:\n{search_result['text'][:200]}...")
    
    source_urls = search_result.get("source_urls", [])
    print(f"\n[Source URLs Found]: {len(source_urls)}")
    for url in source_urls:
        print(f"- {url}")
        
    if not source_urls:
        print("WARNING: No source URLs found by Grounding!")
        return

    # 3. Step 2: Image Extraction
    print(f"\nStep 2: Extracting Images from top URLs...")
    # This is synchronous in the class, so we call it directly
    images = extractor.fetch_images_from_urls(source_urls, limit=3)
    
    print(f"\n[Extracted Images]: {len(images)}")
    for img in images:
        print(f"- {img}")
        
    if images:
        print("\nSUCCESS: Pipeline found images without Serper!")
    else:
        print("\nFAILURE: No images extracted.")

if __name__ == "__main__":
    asyncio.run(run_test())
