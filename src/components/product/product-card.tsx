"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/shopify/types';
import { TechBadge } from '@/components/ui/tech-badge';
import { motion } from 'framer-motion';

export function ProductCard({ product, index }: { product: Product; index: number }) {
    // Format price
    const price = new Intl.NumberFormat('el-GR', {
        style: 'currency',
        currency: product.priceRange.minVariantPrice.currencyCode,
    }).format(parseFloat(product.priceRange.minVariantPrice.amount));

    return (
        <Link
            href={`/products/${product.handle}`}
            className="group relative flex flex-col h-full rounded-xl bg-white/80 backdrop-blur-md border border-white/20 hover:border-black/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
        >
            <div className="absolute top-4 left-4 z-20">
                <TechBadge variant="ghost" className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-md shadow-sm">
                    {`NO. ${String(index + 1).padStart(3, '0')}`}
                </TechBadge>
            </div>

            {/* Image Container with Parallax-like effect */}
            <div className="aspect-square relative overflow-hidden bg-gray-50/50">
                <motion.div
                    className="w-full h-full relative"
                    initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
                    whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.05 }}
                >
                    {product.featuredImage && (
                        <Image
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText || product.title}
                            fill
                            className="object-contain p-8"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}
                </motion.div>

                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors duration-500" />
            </div>

            <div className="flex flex-col p-5 gap-3 bg-white/40">
                <div className="flex justify-between items-start">
                    <h3 className="font-heading font-medium text-lg leading-tight tracking-tight text-gray-900 group-hover:text-black transition-colors">
                        {product.title}
                    </h3>
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-900">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </motion.div>
                </div>

                <div className="flex justify-between items-end mt-auto pt-2 border-t border-gray-100/50">
                    <span className="font-medium text-gray-900">
                        {price}
                    </span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        View Product
                    </span>
                </div>
            </div>
        </Link>
    );
}
