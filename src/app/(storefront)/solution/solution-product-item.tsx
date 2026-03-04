'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Loader2, Plus, Palette } from 'lucide-react';
import { fetchProductAction } from '@/app/actions/shopify';
import { Product, ProductVariant } from '@/lib/shopify/types';
import { cn } from '@/lib/utils';

interface SolutionProductItemProps {
    handle: string;
    suggestedVariantId?: string;
    fallbackTitle?: string;
    fallbackVariantTitle?: string;
    onPriceChange?: (price: number) => void;
    /** When true, renders as a vertical product card (for Recommended Products grid) */
    cardLayout?: boolean;
    /** Custom color info for custom paint products */
    customColorInfo?: {
        color_system: string;
        color_code: string;
        notes?: string;
    };
    /** Whether this is a custom paint product */
    isCustomPaint?: boolean;
}

export function SolutionProductItem({
    handle,
    suggestedVariantId,
    fallbackTitle,
    fallbackVariantTitle,
    onPriceChange,
    cardLayout = false,
    customColorInfo,
    isCustomPaint = false,
}: SolutionProductItemProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadProduct() {
            try {
                const data = await fetchProductAction(handle);
                if (!mounted) return;

                if (data) {
                    setProduct(data);

                    let matchedVariant = null;
                    if (suggestedVariantId) {
                        const cleanId = suggestedVariantId.replace('gid://shopify/ProductVariant/', '');
                        matchedVariant = data.variants.edges.find(e =>
                            e.node.id.endsWith(cleanId)
                        )?.node;
                    }

                    const variantToSet = matchedVariant || data.variants.edges[0]?.node || null;
                    setSelectedVariant(variantToSet);

                    if (variantToSet && onPriceChange) {
                        onPriceChange(parseFloat(variantToSet.price.amount));
                    }
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Error loading product:', err);
                if (mounted) setError(true);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadProduct();
        return () => { mounted = false; };
    }, [handle, suggestedVariantId]);

    const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!product) return;
        const newVariantId = e.target.value;
        const newVariant = product.variants.edges.find(edge => edge.node.id === newVariantId)?.node;
        if (newVariant) {
            setSelectedVariant(newVariant);
            if (onPriceChange) onPriceChange(parseFloat(newVariant.price.amount));
        }
    };

    // ── Card Layout (Recommended Products grid) ──────────────────────────
    if (cardLayout) {
        const title = product?.title || fallbackTitle || handle.replace(/-/g, ' ').toUpperCase();
        const image = selectedVariant?.image || product?.featuredImage;
        const price = selectedVariant?.price.amount || product?.priceRange.minVariantPrice.amount;
        const currency = product?.priceRange.minVariantPrice.currencyCode === 'EUR' ? '€' : '$';

        return (
            <div className="group bg-card border border-border rounded-lg overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                {/* Image */}
                <div className="relative aspect-square bg-secondary overflow-hidden">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                        </div>
                    ) : image ? (
                        <Image
                            src={image.url}
                            alt={image.altText || title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            {handle.substring(0, 3)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Custom Paint Badge */}
                    {isCustomPaint && customColorInfo && (
                        <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded bg-accent/10 border border-accent/20 w-fit">
                            <Palette className="w-3 h-3 text-accent" />
                            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                                {customColorInfo.color_system}: {customColorInfo.color_code}
                            </span>
                        </div>
                    )}
                    {fallbackVariantTitle && fallbackVariantTitle.toLowerCase() !== 'default title' && (
                        <span className="inline-block mb-1 text-[10px] font-bold uppercase tracking-widest text-accent">
                            {fallbackVariantTitle}
                        </span>
                    )}
                    <h4 className="font-bold text-foreground text-sm leading-tight line-clamp-2 mb-3">{title}</h4>
                    <div className="flex items-center justify-between">
                        <span className="text-base font-black text-foreground">
                            {price ? `${currency}${price}` : '—'}
                        </span>
                        <Link
                            href={`/products/${handle}${selectedVariant ? `?variant=${selectedVariant.id.replace('gid://shopify/ProductVariant/', '')}` : ''}`}
                            className="w-7 h-7 rounded bg-secondary border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Row Layout (inline within steps) ─────────────────────────────────
    const title = product?.title || fallbackTitle || handle.replace(/-/g, ' ').toUpperCase();

    if (loading || error || !product) {
        return (
            <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 opacity-70">
                <div className="w-14 h-14 rounded bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                    {loading
                        ? <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />
                        : <span className="text-[10px] text-muted-foreground font-bold">{handle.substring(0, 3).toUpperCase()}</span>
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground leading-tight line-clamp-2">{title}</p>
                    {fallbackVariantTitle && fallbackVariantTitle.toLowerCase() !== 'default title' && (
                        <span className="mt-1 inline-block text-[11px] text-accent font-bold tracking-wide uppercase bg-accent/10 px-2 py-0.5 rounded border border-accent/20 truncate max-w-[140px]">
                            {fallbackVariantTitle}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    const image = selectedVariant?.image || product.featuredImage;
    const price = selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount;
    const currency = product.priceRange.minVariantPrice.currencyCode === 'EUR' ? '€' : '$';
    const hasMultipleVariants = product.variants.edges.length > 1;

    return (
        <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-3 hover:shadow-sm group transition-all relative">
            <Link
                href={`/products/${product.handle}${selectedVariant ? `?variant=${selectedVariant.id.replace('gid://shopify/ProductVariant/', '')}` : ''}`}
                className="absolute inset-0 z-0"
            />

            {/* Thumbnail */}
            <div className="z-10 w-14 h-14 rounded bg-secondary flex items-center justify-center overflow-hidden shrink-0 pointer-events-none border border-border">
                <div className="relative w-full h-full p-1">
                    {image ? (
                        <Image
                            src={image.url}
                            alt={image.altText || product.title}
                            fill
                            className="object-contain"
                            sizes="56px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                            IMG
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="z-10 flex-1 min-w-0 flex flex-col justify-center pointer-events-none">
                {isCustomPaint && customColorInfo && (
                    <div className="flex items-center gap-1 mb-1 w-fit">
                        <Palette className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                            {customColorInfo.color_system}: {customColorInfo.color_code}
                        </span>
                    </div>
                )}
                <p className="text-sm font-bold text-foreground leading-tight group-hover:text-accent transition-colors line-clamp-2">
                    {product.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-foreground">
                        {currency}{price}
                    </span>
                    {hasMultipleVariants && selectedVariant && selectedVariant.title !== 'Default Title' ? (
                        <div className="pointer-events-auto relative">
                            <select
                                value={selectedVariant.id}
                                onChange={handleVariantChange}
                                onClick={(e) => e.stopPropagation()}
                                className="appearance-none text-[11px] text-accent font-bold tracking-wide uppercase bg-accent/10 px-2 pr-6 py-0.5 rounded border border-accent/30 max-w-[140px] truncate outline-none cursor-pointer hover:bg-accent/20 transition-colors"
                            >
                                {product.variants.edges.map(edge => (
                                    <option key={edge.node.id} value={edge.node.id}>
                                        {edge.node.title}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-accent">
                                <svg className="h-3 w-3 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        selectedVariant && selectedVariant.title !== 'Default Title' && (
                            <span className="text-[11px] text-accent font-bold tracking-wide uppercase bg-accent/10 px-2 py-0.5 rounded border border-accent/30 truncate max-w-[140px]">
                                {selectedVariant.title}
                            </span>
                        )
                    )}
                </div>
            </div>

            {/* Arrow */}
            <div className="z-10 shrink-0 w-7 h-7 rounded bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:text-accent ml-1 pointer-events-none transition-colors">
                <ChevronRight className="w-4 h-4" />
            </div>
        </div>
    );
}
