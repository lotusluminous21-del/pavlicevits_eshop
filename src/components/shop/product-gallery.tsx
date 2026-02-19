"use client"

import { Image as ShopifyImage } from "@/lib/shopify/types"
import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
    images: ShopifyImage[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0])

    if (!images.length) return null

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image with Reveal Effect */}
            <motion.div
                className="relative aspect-square overflow-hidden rounded-xl bg-muted"
                initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
                animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.img
                    src={selectedImage?.url}
                    alt={selectedImage?.altText || "Product image"}
                    className="h-full w-full object-cover object-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                />
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(image)}
                            className={cn(
                                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2",
                                selectedImage?.url === image.url
                                    ? "border-primary"
                                    : "border-transparent"
                            )}
                        >
                            <img
                                src={image.url}
                                alt={image.altText || "Thumbnail"}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
