"use client"

import { Product, ProductVariant } from "@/lib/shopify/types"
import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2, Plus, Minus } from "lucide-react"
import { ProductTechnicalSpecs } from "./product-specs"

interface ProductInfoProps {
    product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
    const { addItem, isLoading } = useCart()
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
        product.variants.edges[0]?.node
    )
    const [quantity, setQuantity] = useState(1)

    const handleAddToCart = async () => {
        if (!selectedVariant) return
        await addItem(selectedVariant.id, quantity)
    }

    const price = selectedVariant?.price || product.priceRange.minVariantPrice

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-heading font-bold text-foreground">{product.title}</h1>
                <div className="text-2xl font-medium text-primary">
                    {parseFloat(price.amount).toLocaleString('el-GR', { style: 'currency', currency: price.currencyCode })}
                </div>
            </div>

            {/* Variants */}
            {product.variants.edges.length > 1 && (
                <div className="space-y-4">
                    <label className="text-sm font-medium">Επιλογές</label>
                    <div className="flex flex-wrap gap-3">
                        {product.variants.edges.map(({ node: variant }) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={cn(
                                    "rounded-md border px-4 py-2 text-sm transition-all",
                                    selectedVariant?.id === variant.id
                                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                        : "border-border hover:border-foreground/50"
                                )}
                            >
                                {variant.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
                <div className="flex items-center rounded-md border border-input">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-none"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-none"
                        onClick={() => setQuantity(quantity + 1)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <Button
                    className="flex-1 h-10"
                    onClick={handleAddToCart}
                    disabled={isLoading || !selectedVariant.availableForSale}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Προσθήκη...
                        </>
                    ) : (
                        selectedVariant.availableForSale ? "Προσθήκη στο Καλάθι" : "Εξαντλήθηκε"
                    )}
                </Button>
            </div>

            {/* Technical Specs */}
            <ProductTechnicalSpecs product={product} />

            {/* Description */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </div>
        </div>
    )
}
