'use server';

import { getProduct } from '@/lib/shopify/client';
import { Product } from '@/lib/shopify/types';

export async function fetchProductAction(handle: string): Promise<Product | undefined> {
    try {
        const product = await getProduct(handle);
        return product;
    } catch (error) {
        console.error(`Failed to fetch product ${handle}:`, error);
        return undefined;
    }
}
