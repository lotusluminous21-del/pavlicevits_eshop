import os
import logging
import requests
import json
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class SearchTool:
    """
    Wrapper for Serper.dev Google Search API.
    Replaces deprecated Google Programmable Search Engine 'Entire Web' feature.
    """
    def __init__(self):
        self.api_key = os.getenv("SERPER_API_KEY")
        self.base_url = "https://google.serper.dev/search"
        self.image_url = "https://google.serper.dev/images"

    def search(self, query: str, num_results: int = 5) -> List[Dict[str, str]]:
        """
        Performs a Google Search via Serper.dev.
        Returns strict structured results.
        """
        if not self.api_key:
            logger.error("Missing SERPER_API_KEY credentials.")
            return []

        payload = json.dumps({
            "q": query,
            "num": num_results
        })
        headers = {
            'X-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }

        try:
            logger.info(f"Performing Serper Search: {query}")
            response = requests.post(self.base_url, headers=headers, data=payload)
            response.raise_for_status()
            data = response.json()
            
            items = data.get("organic", [])
            logger.info(f"Serper found {len(items)} organic results")
            results = []
            
            for item in items:
                results.append({
                    "title": item.get("title"),
                    "link": item.get("link"),
                    "snippet": item.get("snippet"),
                    "domain": new_url_hostname(item.get("link"))
                })
                
            return results
            
        except Exception as e:
            logger.error(f"Serper Search failed for query '{query}': {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Serper Error Response: {e.response.text}")
            return []

    def find_product_images(self, query: str) -> List[str]:
        """
        Specialized search for images via Serper.dev.
        """
        if not self.api_key:
            return []

        logger.info(f"Performing Serper Image Search: {query}")
        payload = json.dumps({
            "q": query,
            "num": 8  # Increased slightly for better selection
        })
        headers = {
            'X-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(self.image_url, headers=headers, data=payload)
            response.raise_for_status()
            data = response.json()
            items = data.get("images", [])
            logger.info(f"Serper found {len(items)} images")
            
            # Return original image URLs
            return [item.get("imageUrl") for item in items if item.get("imageUrl")]
        except Exception as e:
            logger.error(f"Serper Image Search failed for '{query}': {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Serper Error Response: {e.response.text}")
            return []

def new_url_hostname(url):
    from urllib.parse import urlparse
    if not url: return ""
    return urlparse(url).hostname
