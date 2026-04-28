import { getProducts } from "@/lib/shopify/client";

export const dynamic = 'force-dynamic';
import { SearchClient } from "./search-client";
import { Metadata } from "next";

export async function generateMetadata({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
    const { q } = await searchParams;
    return {
        title: q ? `Search: ${q} | Pavlicevits` : "Search Products | Pavlicevits",
        description: "Find premium chemical products.",
    };
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams;

    // Shopify Storefront Search: if no query, return empty array.
    // If you want default products to show before search, change this to getProducts() with empty args.
    const products = q ? await getProducts({ query: q }) : [];

    return <SearchClient initialProducts={products} initialQuery={q || ""} />;
}
