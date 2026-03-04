'use client'

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Package, ChevronRight } from "lucide-react"
import type { SuggestedProduct } from "@/lib/expert/types"

export interface SuggestedProductsStripProps extends React.HTMLAttributes<HTMLDivElement> {
    products: SuggestedProduct[];
}

export function SuggestedProductsStrip({ products, className, ...props }: SuggestedProductsStripProps) {
    if (!products || products.length === 0) return null;

    return (
        <div className={cn("space-y-2", className)} {...props}>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                Προτεινόμενα Προϊόντα
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {products.map((product, i) => (
                    <Link
                        key={product.handle || i}
                        href={`/products/${product.handle}`}
                        className="flex-shrink-0 w-[160px] skeuo-card p-3 flex flex-col gap-2 group hover:shadow-skeuo-raised transition-all"
                    >
                        {/* Product Image / Icon */}
                        <div className="w-full h-[80px] rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                            {product.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-full object-contain p-2"
                                />
                            ) : (
                                <Package className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-black text-slate-700 leading-tight line-clamp-2 group-hover:text-skeuo-accent transition-colors tracking-tight">
                                {product.title}
                            </p>
                            {product.reason && (
                                <p className="text-[10px] text-slate-400 font-semibold mt-1 line-clamp-2 leading-tight">
                                    {product.reason}
                                </p>
                            )}
                        </div>

                        {/* Price + Arrow */}
                        <div className="flex items-center justify-between">
                            {product.price != null && (
                                <span className="text-[12px] font-black text-skeuo-accent-dark">
                                    {new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(product.price)}
                                </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-skeuo-accent transition-colors ml-auto" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
