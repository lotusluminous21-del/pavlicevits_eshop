import { getProducts, getProductTypes } from "@/lib/shopify/client";
import HomeContent from "./home-content";

export default async function Page() {
    // Fetch real data from Shopify
    const [products, categories] = await Promise.all([
        getProducts({}),
        getProductTypes()
    ]);

    // Format categories for the UI
    const formattedCategories = categories.map(name => ({
        id: name,
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        icon: name, // Will be mapped in HomeContent
        count: 0 // We don't have accurate counts from getProductTypes but can derive from products if needed
    }));

    return (
        <HomeContent
            initialProducts={products}
            initialCategories={formattedCategories}
        />
    );
}
