
import { env } from '../env';

const SHOPIFY_ADMIN_API_VERSION = '2024-01';
const SHOPIFY_DOMAIN = env.SHOPIFY_STORE_DOMAIN;
const ACCESS_TOKEN = env.SHOPIFY_ADMIN_ACCESS_TOKEN;

export async function shopifyGraphql(query: string, variables = {}) {
    if (!ACCESS_TOKEN) throw new Error("Missing Admin Token");

    const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': ACCESS_TOKEN
        },
        body: JSON.stringify({ query, variables })
    });

    const data = await response.json();
    if (!response.ok || data.errors) {
        console.error("Shopify GraphQL Error:", data.errors || data);
        throw new Error("GraphQL request failed");
    }

    return data.data;
}

export async function findProductBySku(sku: string) {
    const query = `
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
    `;

    const data = await shopifyGraphql(query, { query: `sku:${sku}` });
    const products = data.products.edges;

    if (products.length > 0) {
        // Return REST-compatible ID (strip gid://shopify/Product/)
        const gid = products[0].node.id;
        return {
            id: gid.split('/').pop(),
            handle: products[0].node.handle,
            title: products[0].node.title
        };
    }

    return null;
}
