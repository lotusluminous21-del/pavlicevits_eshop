import { createStorefrontClient } from '@shopify/hydrogen-react';

const client = createStorefrontClient({
    storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'pavlicevits.myshopify.com',
    publicStorefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!,
    storefrontApiVersion: '2024-01',
});

// export const storefront = client.storefront; // Removed: property does not exist on client
export const getStorefrontApiUrl = client.getStorefrontApiUrl;
export const getPublicTokenHeaders = client.getPublicTokenHeaders;
