
const SHOPIFY_STORE_DOMAIN = 'pavlicevits.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = '818efc5c7b4c87d4735ea084b342bf2c';

async function testFetch() {
    const url = `https://${SHOPIFY_STORE_DOMAIN}/api/2025-04/graphql.json`;
    console.log(`Fetching from: ${url}`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
            },
            body: JSON.stringify({
                query: '{ shop { name } }'
            }),
        });
        const data = await response.json();
        console.log('Success:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

testFetch();
