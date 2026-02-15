import requests
import re
from urllib.parse import urljoin
from typing import List, Optional
import traceback

class ContentExtractor:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

    def fetch_images_from_urls(self, urls: List[str], limit: int = 5) -> List[str]:
        """
        Visits the provided URLs and extracts high-quality product images (og:image, etc.).
        Returns a list of image URLs.
        """
        found_images = []
        
        print(f"DEBUG: Extracting images from {len(urls)} sources...")

        # Use a session for better performance
        with requests.Session() as session:
            session.headers.update(self.headers)
            
            for url in urls[:limit]: # Limit number of pages to visit
                try:
                    print(f"DEBUG: Fetching {url}...")
                    # Verify=False to avoid SSL issues with some redirects or proxies if any
                    response = session.get(url, timeout=10.0, allow_redirects=True, verify=False)
                    response.raise_for_status()
                    
                    # Print the final URL after redirect
                    print(f"DEBUG: Resolved to {response.url}")
                    
                    images = self._parse_images_regex(response.text, response.url)
                    print(f"DEBUG: Found {len(images)} images on page.")
                    found_images.extend(images)
                    
                    if len(found_images) >= 5: # Stop if we have enough images
                        break
                        
                except Exception as e:
                    print(f"DEBUG: Failed to fetch {url}: {e}")
                    # traceback.print_exc()
                    continue
        
        # Deduplicate
        return list(dict.fromkeys(found_images))

    def _parse_images_regex(self, html_content: str, base_url: str) -> List[str]:
        """
        Parses HTML using regex to find og:image and other relevant product images.
        Why regex? To avoid bs4 dependency issues in deployment.
        """
        images = []
        
        # 1. Open Graph Image
        # <meta property="og:image" content="...">
        og_matches = re.findall(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
        for match in og_matches:
            images.append(urljoin(base_url, match))
            
        # 2. Twitter Image
        # <meta name="twitter:image" content="...">
        twitter_matches = re.findall(r'<meta\s+name=["\']twitter:image["\']\s+content=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
        for match in twitter_matches:
            images.append(urljoin(base_url, match))

        # 3. Link rel="image_src"
        # <link rel="image_src" href="...">
        link_matches = re.findall(r'<link\s+rel=["\']image_src["\']\s+href=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
        for match in link_matches:
            images.append(urljoin(base_url, match))

        return images
