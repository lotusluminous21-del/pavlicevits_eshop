
const SHOPIFY_DOMAIN = "pavlicevits.myshopify.com";
const STOREFRONT_TOKEN = "818efc5c7b4c87d4735ea084b342bf2c";

async function checkCollections() {
    const url = `https://${SHOPIFY_DOMAIN}/api/2025-04/graphql.json`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
        },
        body: JSON.stringify({
            query: `query { collections(first: 50) { edges { node { id title handle products(first: 10) { edges { node { title } } } } } } }`
        })
    });

    const data = await response.json();
    if (data.errors) {
        console.error("Error from Storefront API:", JSON.stringify(data.errors, null, 2));
        return;
    }

    const collections = data.data.collections.edges;
    console.log(`Storefront API returned ${collections.length} collections`);
    collections.forEach(edge => {
        const c = edge.node;
        console.log(`- ${c.title} (${c.handle}) | Products: ${c.products.edges.length}`);
    });
}

checkCollections();
