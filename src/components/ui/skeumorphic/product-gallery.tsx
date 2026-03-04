"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Package } from "lucide-react"

export interface ProductImage {
    url: string;
    altText?: string;
}

export interface ProductGalleryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    images?: ProductImage[];
}

export function ProductGallery({ className, images = [], ...props }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = React.useState(0);

    const hasImages = images && images.length > 0;
    const currentImage = hasImages ? images[activeIndex] : null;

    return (
        <div className={cn("flex flex-col items-center w-full", className)} {...props}>
            <div className={cn(
                "w-full aspect-[4/3.5] rounded-[32px] bg-[#ffffff]",
                "shadow-sm",
                "flex items-center justify-center p-6 relative overflow-hidden"
            )}>
                {currentImage ? (
                    <div className="relative w-full h-full rounded-[24px] overflow-hidden">
                        <Image
                            src={currentImage.url}
                            alt={currentImage.altText || "Product image"}
                            fill
                            className="object-contain"
                            priority={activeIndex === 0}
                        />
                    </div>
                ) : (
                    <div className="w-[120px] h-[160px] bg-gradient-to-br from-slate-200 to-slate-300 rounded-[12px] flex items-center justify-center shadow-inner">
                        <Package className="w-14 h-14 text-slate-400" strokeWidth={1.5} />
                    </div>
                )}
            </div>

            {images && images.length > 1 && (
                <div className="flex items-center gap-[10px] mt-[20px]">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={cn(
                                "w-[7px] h-[7px] rounded-full transition-all duration-300",
                                i === activeIndex
                                    ? "bg-slate-900 scale-[1.2] shadow-sm"
                                    : "bg-slate-300 hover:bg-slate-400"
                            )}
                            aria-label={`View image ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
