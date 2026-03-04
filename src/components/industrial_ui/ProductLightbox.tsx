'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/shopify/types';

interface ProductLightboxProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sequenceStep?: string;
    reason?: string;
}

/**
 * A modal dialog that shows full product details when a sidebar
 * product card is clicked. Uses the existing Radix Dialog component.
 */
export function ProductLightbox({
    product,
    open,
    onOpenChange,
    sequenceStep,
    reason,
}: ProductLightboxProps) {
    if (!product) return null;

    const price = product.priceRange?.minVariantPrice;
    const image = product.featuredImage;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden rounded-xl sm:rounded-2xl">
                {/* Product Image */}
                {image?.url && (
                    <div className="relative w-full aspect-square bg-secondary">
                        <Image
                            src={image.url}
                            alt={image.altText || product.title}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 640px) 100vw, 512px"
                        />
                    </div>
                )}

                <div className="p-6 space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold tracking-tight">
                            {product.title}
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-2 mt-1">
                                {/* Price */}
                                {price && (
                                    <p className="text-base font-semibold text-foreground">
                                        {parseFloat(price.amount).toLocaleString('el-GR', {
                                            style: 'currency',
                                            currency: price.currencyCode || 'EUR',
                                        })}
                                    </p>
                                )}

                                {/* Sequence step badge */}
                                {sequenceStep && (
                                    <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                                        {sequenceStep}
                                    </span>
                                )}

                                {/* Reason */}
                                {reason && (
                                    <p className="text-sm text-muted-foreground italic">
                                        {reason}
                                    </p>
                                )}

                                {/* Short description */}
                                {product.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-4">
                                        {product.description}
                                    </p>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Link
                            href={`/products/${product.handle}`}
                            className="flex-1 btn-primary py-3 text-sm font-semibold rounded-lg text-center inline-flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Προβολή Προϊόντος
                        </Link>
                        <button
                            className="flex-1 py-3 text-sm font-semibold rounded-lg border border-border bg-secondary hover:bg-muted transition-colors inline-flex items-center justify-center gap-2"
                            onClick={() => {
                                // Future: add to cart
                                onOpenChange(false);
                            }}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Προσθήκη
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
