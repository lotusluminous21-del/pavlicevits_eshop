"use client"

import * as React from "react"
import { Product } from "@/lib/shopify/types"
import { Header } from "@/components/ui/skeumorphic/header"
import { BottomNav } from "@/components/ui/skeumorphic/bottom-nav"
import { ProductGallery } from "@/components/ui/skeumorphic/product-gallery"
import { QuantitySelector } from "@/components/ui/skeumorphic/quantity-selector"
import { PrimaryButton } from "@/components/ui/skeumorphic/primary-button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/skeumorphic/accordion"
import { ShieldAlert, Info, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/store/cart-store"
import { addItemToCart } from "@/app/actions/cart"
import { CustomColorForm } from "@/components/custom-paint/custom-color-form"
import { isCustomPaintProduct, colorSpecToAttributes, type CustomColorSpec } from "@/components/custom-paint/custom-paint-helpers"

export function ProductClient({ product }: { product: Product }) {
    const [quantity, setQuantity] = React.useState(1);
    const isCustomPaint = isCustomPaintProduct(product.handle);
    const [colorSpec, setColorSpec] = React.useState<CustomColorSpec | null>(null);
    const [showColorValidation, setShowColorValidation] = React.useState(false);

    // Shopify variants selection state
    const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>(() => {
        const defaultOptions: Record<string, string> = {};
        if (product.options) {
            product.options.forEach(opt => {
                if (opt.values.length > 0) defaultOptions[opt.name] = opt.values[0];
            });
        }
        return defaultOptions;
    });

    // Find the current variant that matches all selected options
    const selectedVariant = product.variants.edges.find((variantEdge) =>
        variantEdge.node.selectedOptions.every(
            (option) => selectedOptions[option.name] === option.value
        )
    )?.node || product.variants.edges[0]?.node;

    const isAvailable = selectedVariant?.availableForSale ?? false;
    const price = selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount;
    const currencyCode = selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode;

    const handleOptionChange = (optionName: string, value: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [optionName]: value
        }));
    };

    const { setCart, isSyncing, setIsSyncing } = useCartStore();
    const handleAddToCart = async () => {
        if (!selectedVariant || isSyncing) return;

        // Gate: custom paint products require a valid color spec
        if (isCustomPaint && !colorSpec) {
            setShowColorValidation(true);
            return;
        }

        setIsSyncing(true);

        try {
            const attributes = isCustomPaint && colorSpec
                ? colorSpecToAttributes(colorSpec)
                : undefined;

            const updatedCart = await addItemToCart(selectedVariant.id, quantity, attributes);
            if (updatedCart) {
                setCart(updatedCart);
                alert(`Added ${quantity} x ${product.title} to cart`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to add to cart");
        }

        setIsSyncing(false);
    };

    const images = product.images?.edges.map(e => e.node) || [];
    if (product.featuredImage && images.length === 0) {
        images.push(product.featuredImage);
    }

    return (
        <div className="min-h-screen bg-[#F0F2F6] flex flex-col font-sans mb-[80px]">
            <Header showBack title={product.title.length > 20 ? product.title.slice(0, 20) + '...' : product.title} />

            <main className="flex-1 w-full max-w-md mx-auto relative px-6 md:px-8 mt-[90px] md:mt-[100px] mb-8 z-10 space-y-8">
                {/* Product Images */}
                <ProductGallery images={images} />

                {/* Title & Price */}
                <div className="space-y-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                        {product.title}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-primary">
                            €{Number(price).toFixed(2)}
                        </span>
                        {!isAvailable && (
                            <span className="text-sm font-bold text-destructive ml-2 bg-destructive/10 px-2 py-1 rounded-md">
                                Out of Stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Options/Variants */}
                {product.options && product.options.map((option) => (
                    // Don't show if the only option is "Title" with value "Default Title"
                    (option.name !== "Title" || option.values[0] !== "Default Title") && (
                        <div key={option.id} className="space-y-3">
                            <h3 className="font-bold text-slate-800 text-sm">{option.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                {option.values.map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => handleOptionChange(option.name, val)}
                                        className={cn(
                                            "h-[42px] px-4 rounded-md font-bold text-sm transition-all outline-none border",
                                            selectedOptions[option.name] === val
                                                ? "bg-slate-800 text-white shadow-sm"
                                                : "bg-[#ffffff] text-slate-600 shadow-sm hover:text-slate-900"
                                        )}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                ))}

                {/* Custom Color Form — only for custom paint products */}
                {isCustomPaint && (
                    <CustomColorForm
                        onChange={setColorSpec}
                        showValidation={showColorValidation}
                    />
                )}

                {/* Add to Cart Sticky-like Container */}
                <div className="flex gap-4 items-center p-4 rounded-xl border bg-[#ffffff] shadow-sm">
                    <QuantitySelector
                        value={quantity}
                        onValueChange={(val) => setQuantity(Math.max(1, val))}
                    />
                    <PrimaryButton
                        onClick={handleAddToCart}
                        disabled={!isAvailable || (isCustomPaint && !colorSpec)}
                        className={cn(
                            "flex-1",
                            (!isAvailable || (isCustomPaint && !colorSpec)) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {!isAvailable ? "Sold Out" : isCustomPaint && !colorSpec ? "Επιλέξτε Χρώμα" : "Add to Cart"}
                    </PrimaryButton>
                </div>

                {/* Description and Info Accordion */}
                <div className="mt-8 space-y-4">
                    <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="desc">
                        {product.descriptionHtml && (
                            <AccordionItem value="desc" className="border-none">
                                <AccordionTrigger className="h-[60px] px-6 rounded-xl border bg-[#ffffff] shadow-sm outline-none hover:no-underline transition-all">
                                    <div className="flex items-center gap-3">
                                        <Info className="w-5 h-5 text-slate-600" />
                                        <span className="font-bold text-slate-800 text-[16px]">Description</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 px-2 pb-2">
                                    <div
                                        className="prose prose-sm prose-slate p-4 rounded-xl border bg-[#ffffff] shadow-sm"
                                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Display Metafields if any apply to instructions/tech features */}
                        {product.metafields && product.metafields.length > 0 && product.metafields.some(m => m !== null) && (
                            <AccordionItem value="features" className="border-none">
                                <AccordionTrigger className="h-[60px] px-6 rounded-xl border bg-[#ffffff] shadow-sm outline-none hover:no-underline transition-all">
                                    <div className="flex items-center gap-3">
                                        <Settings className="w-5 h-5 text-slate-600" />
                                        <span className="font-bold text-slate-800 text-[16px]">Features & Specs</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 px-2 pb-2">
                                    <div className="p-4 rounded-xl border bg-[#ffffff] shadow-sm space-y-3">
                                        {product.metafields.filter(m => m !== null).map((metafield) => (
                                            <div key={metafield?.id} className="flex flex-col gap-1 border-b border-black/5 pb-2 last:border-0 last:pb-0">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{metafield?.key?.replace('_', ' ')}</span>
                                                <span className="text-sm text-slate-800 font-medium">{metafield?.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Safety (Mock Section using ShieldAlert just to show off components) */}
                        <AccordionItem value="safety" className="border-none">
                            <AccordionTrigger className="h-[60px] px-6 rounded-xl border bg-[#ffffff] shadow-sm outline-none hover:no-underline transition-all">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="w-5 h-5 text-slate-600" />
                                    <span className="font-bold text-slate-800 text-[16px]">Safety Instructions</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 px-2 pb-2">
                                <div className="p-4 rounded-xl border bg-[#ffffff] shadow-sm text-sm text-slate-700">
                                    Please read carefully before using this product. Store in a cool, dry place. Keep out of reach of children.
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </div>
            </main>

            {/* Mobile Bottom Navigation Wrapper */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-center pb-6 z-50 pointer-events-none">
                <div className="pointer-events-auto w-[calc(100%-48px)] max-w-[420px]">
                    <BottomNav className="w-full rounded-[32px]" />
                </div>
            </div>

            <style jsx global>{`
                .prose img {
                    border-radius: 12px;
                    margin: 1rem 0;
                }
            `}</style>
        </div>
    );
}
