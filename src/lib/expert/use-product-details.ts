'use client';

import { useEffect, useState, useRef } from 'react';
import { getProduct } from '@/lib/shopify/client';
import type { Product } from '@/lib/shopify/types';

/**
 * Fetches full Shopify product data for an array of product handles.
 * Returns a Map<handle, Product> with images, prices, descriptions.
 * 
 * Uses an internal cache so products are only fetched once per handle,
 * even if the component re-renders or the handles array changes.
 */
export function useProductDetails(handles: string[]): {
    products: Map<string, Product>;
    loading: boolean;
} {
    const [products, setProducts] = useState<Map<string, Product>>(new Map());
    const [loading, setLoading] = useState(false);
    const cacheRef = useRef<Map<string, Product>>(new Map());
    const fetchingRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!handles || handles.length === 0) return;

        // Determine which handles aren't cached yet
        const uncached = handles.filter(
            (h) => h && !cacheRef.current.has(h) && !fetchingRef.current.has(h)
        );

        if (uncached.length === 0) {
            // All cached — just update state if needed
            const existing = new Map<string, Product>();
            for (const h of handles) {
                const cached = cacheRef.current.get(h);
                if (cached) existing.set(h, cached);
            }
            setProducts(existing);
            return;
        }

        setLoading(true);

        // Mark as fetching to prevent duplicate requests
        uncached.forEach((h) => fetchingRef.current.add(h));

        Promise.allSettled(
            uncached.map(async (handle) => {
                try {
                    const product = await getProduct(handle);
                    if (product) {
                        cacheRef.current.set(handle, product);
                    }
                } catch (err) {
                    console.warn(`Failed to fetch product: ${handle}`, err);
                } finally {
                    fetchingRef.current.delete(handle);
                }
            })
        ).then(() => {
            // Rebuild the full map from cache
            const result = new Map<string, Product>();
            for (const h of handles) {
                const cached = cacheRef.current.get(h);
                if (cached) result.set(h, cached);
            }
            setProducts(result);
            setLoading(false);
        });
    }, [handles.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    return { products, loading };
}
