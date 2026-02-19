"use client"

import { Product } from "@/lib/shopify/types"
import { ProductCard } from "@/components/product/product-card"
import { useProducts } from "@/hooks/useShopifyProducts"

interface RelatedProductsProps {
    id: string
}

export function RelatedProducts({ id }: RelatedProductsProps) {
    // In a real scenario, we might use the Shopify Recommendations API.
    // For now, we'll fetch a few products to simulate recommendations.
    const { products, loading } = useProducts({ sortKey: 'BEST_SELLING' })

    if (loading) return null

    // Filter out the current product
    const relatedProducts = products
        .filter((p) => p.id !== id)
        .slice(0, 4)

    if (relatedProducts.length === 0) return null

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold">Σχετικά Προϊόντα</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((product, index) => (
                    <div key={product.id} className="h-full">
                        <ProductCard product={product} index={index} />
                    </div>
                ))}
            </div>
        </div>
    )
}
