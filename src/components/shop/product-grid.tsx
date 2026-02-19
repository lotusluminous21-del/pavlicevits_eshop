"use client"

import { Product } from "@/lib/shopify/types"
import { ProductCard } from "@/components/product/product-card"
import { motion } from "framer-motion"

interface ProductGridProps {
    products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
    if (!products?.length) {
        return (
            <div className="flex h-96 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                Δεν βρέθηκαν προϊόντα
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.4,
                        delay: index * 0.05, // Stagger effect
                        ease: "easeOut"
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <ProductCard product={product} index={index} />
                </motion.div>
            ))}
        </div>
    )
}
