
import os
import requests
from dotenv import load_dotenv

load_dotenv('.env.local')

SHOPIFY_STORE_DOMAIN = os.getenv('SHOPIFY_STORE_DOMAIN')
SHOPIFY_ADMIN_ACCESS_TOKEN = os.getenv('SHOPIFY_ADMIN_ACCESS_TOKEN')
API_VERSION = '2024-01'

def find_product_by_sku(sku):
    url = f"https://{SHOPIFY_STORE_DOMAIN}/admin/api/{API_VERSION}/graphql.json"
    headers = {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
        "Content-Type": "application/json"
    }
    
    query = """
    query($query: String!) {
      products(first: 1, query: $query) {
        edges {
          node {
            id
            handle
            title
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

# Test with a SKU that likely exists but failed fetch earlier (e.g. HB103101)
sku = 'HB103101'
print(f"Verifying discovery for SKU: {sku}")
result = find_product_by_sku(sku)
print(result)
