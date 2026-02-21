
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv('.env.local')

SHOPIFY_STORE_DOMAIN = os.getenv('SHOPIFY_STORE_DOMAIN')
SHOPIFY_ADMIN_ACCESS_TOKEN = os.getenv('SHOPIFY_ADMIN_ACCESS_TOKEN')
API_VERSION = '2024-04'

def find_product_by_sku(sku):
    url = f"https://{SHOPIFY_STORE_DOMAIN}/admin/api/{API_VERSION}/graphql.json"
    headers = {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
        "Content-Type": "application/json"
    }
    
    query = """
    query($query: String!) {
      products(first: 5, query: $query) {
        edges {
          node {
            id
            handle
            title
            variants(first: 10) {
              edges {
                node {
                  id
                  sku
                  title
                }
              }
            }
          }
        }
      }
    }
    """
    
    variables = {
        "query": f"sku:{sku}"
    }
    
    response = requests.post(url, json={"query": query, "variables": variables}, headers=headers)
    return response.json()

skus = ['HB102701', 'HB101501', 'HB100802', 'HB100601']
for sku in skus:
    print(f"Searching for {sku}...")
    result = find_product_by_sku(sku)
    print(json.dumps(result, indent=2, ensure_ascii=False))
