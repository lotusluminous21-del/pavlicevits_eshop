"use client"

import { useState, useEffect } from 'react';
import { getProducts, getProduct, getCollection, getCollections } from '@/lib/shopify/client';
import type { Product, Collection } from '@/lib/shopify/types';

export function useProducts(options?: { query?: string; reverse?: boolean; sortKey?: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const data = await getProducts(options);
                setProducts(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [options?.query, options?.reverse, options?.sortKey]);

    return { products, loading, error };
}

export function useProduct(handle: string) {
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!handle) return;
        async function fetchProduct() {
            try {
                setLoading(true);
                const data = await getProduct(handle);
                setProduct(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [handle]);

    return { product, loading, error };
}

export function useCollection(handle: string) {
    const [collection, setCollection] = useState<Collection | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!handle) return;
        async function fetchCollection() {
            try {
                setLoading(true);
                const data = await getCollection(handle);
                setCollection(data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }

        fetchCollection();
    }, [handle]);

    return { collection, loading, error };
}
