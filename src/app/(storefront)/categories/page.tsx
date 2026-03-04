import { getProducts, getCollections, getCollection } from "@/lib/shopify/client";
import { CategoriesClient } from "./categories-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Categories | Pavlicevits",
    description: "Browse our premium product collections",
};

export default async function CategoriesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Next 15+ searchParams comes as a Promise!
    const params = await searchParams;
    const collectionHandle = typeof params.collection === 'string' ? params.collection : 'all';

    let fetchedItems = [];
    const collections = await getCollections();

    if (collectionHandle === 'all') {
        fetchedItems = await getProducts();
    } else {
        const collection = await getCollection(collectionHandle);
        if (collection && collection.products) {
            fetchedItems = collection.products.edges.map((e: any) => e.node);
        }
    }

    return (
        <CategoriesClient
            products={fetchedItems}
            collections={collections}
            activeCollection={collectionHandle}
        />
    );
}
