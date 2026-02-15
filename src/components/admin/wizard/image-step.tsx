"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Check, ChevronLeft, ChevronRight, Globe, Layers, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { WizardLayout } from "./wizard-layout";

interface Variant {
    sku_suffix: string;
    variant_name: string;
    option_name: string;
    option_value: string;
}

interface ProductData {
    sku: string;
    status: string;
    enrichment_message?: string;
    name: string;
    ai_data?: {
        title_el?: string;
        variants?: Variant[];
        variant_images?: Record<string, { url: string; score: number }[]>;
        selected_images?: Record<string, string>; // suffix -> url
    };
}

interface ImageStepProps {
    products: ProductData[];
    onBack: () => void;
    onRetry: (sku: string) => void;
    onStartSourcing: () => void;
    onComplete: (updatedProducts: ProductData[]) => void;
}

export function ImageStep({ products, onBack, onRetry, onStartSourcing, onComplete }: ImageStepProps) {
    const [localProducts, setLocalProducts] = useState(products);
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Memoize the storage key based on SKUs
    const storageKey = `wizard_images_draft_${products.map(p => p.sku).sort().join(",")}`;

    // Sync with backend updates AND load draft on mount
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                const draftSkus = draft.map((p: any) => p.sku).sort().join(",");
                const propSkus = products.map(p => p.sku).sort().join(",");

                if (draftSkus === propSkus) {
                    setLocalProducts(draft);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse image draft", e);
            }
        }
        setLocalProducts(products);
    }, [products, storageKey]);

    // Save draft to localStorage whenever localProducts change
    useEffect(() => {
        if (localProducts.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(localProducts));
        }
    }, [localProducts, storageKey]);

    const handleComplete = () => {
        localStorage.removeItem(storageKey);
        onComplete(localProducts);
    };

    const activeProduct = localProducts[activeIndex];
    const isSourcing = products.some(p => p.status === 'PENDING_IMAGE_SOURCING');
    const hasImages = products.some(p => p.ai_data?.variant_images?.base && p.ai_data.variant_images.base.length > 0);
    const isReady = products.every(p => p.status === 'READY_FOR_IMAGES') && !hasImages;

    const selectImage = (suffix: string, url: string) => {
        setLocalProducts(prev => prev.map(p => {
            if (p.sku !== activeProduct.sku) return p;
            const selected = { ...(p.ai_data?.selected_images || {}) };
            selected[suffix] = url;
            return { ...p, ai_data: { ...p.ai_data, selected_images: selected } };
        }));
    };

    const sidebarList = (
        <div className="flex flex-col gap-1 p-2">
            {localProducts.map((p, idx) => {
                const selectedCount = Object.keys(p.ai_data?.selected_images || {}).length;
                const totalNeeded = 1; // Only main image needed now
                const complete = selectedCount >= totalNeeded;

                return (
                    <button
                        key={p.sku}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-full p-3 text-left transition-all rounded-xl flex items-center justify-between group ${activeIndex === idx ? "bg-white shadow-sm ring-1 ring-inset ring-indigo-100" : "hover:bg-gray-100/50 text-gray-600"
                            }`}
                    >
                        <div className="truncate pr-2">
                            <div className={`text-sm font-bold truncate ${activeIndex === idx ? "text-indigo-600" : "text-gray-700"}`}>
                                {p.ai_data?.title_el || p.name}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider flex items-center gap-2">
                                {p.status === 'PENDING_IMAGE_SOURCING' ? (
                                    <><Loader2 className="w-2 h-2 animate-spin" /> {p.enrichment_message || "Sourcing..."}</>
                                ) : (
                                    <>{selectedCount}/{totalNeeded} Selected</>
                                )}
                            </div>
                        </div>
                        {complete && <Check className="w-3.5 h-3.5 text-green-500" />}
                    </button>
                );
            })}
        </div>
    );

    const mainContent = isReady ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Source Product Images</h2>
            <p className="text-gray-500 max-w-sm mb-8 text-sm">
                The AI will search the web for high-quality source images to use as a reference for the studio generation.
            </p>
            <button
                onClick={onStartSourcing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all transform hover:scale-105"
            >
                <Globe className="w-4 h-4" />
                Start Image Sourcing
            </button>
        </div>
    ) : isSourcing ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Searching the Web...</h2>
            <p className="text-gray-500 max-w-sm text-sm">
                Finding the best reference images for your products.
            </p>
        </div>
    ) : activeProduct ? (
        <div className="p-8 space-y-8">
            {/* Section: Base Image */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    Main Product Image (Source of Truth)
                </h4>
                <div className="grid grid-cols-5 gap-4">
                    {activeProduct.ai_data?.variant_images?.base?.map((img, i) => (
                        <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:border-gray-300">
                            <img
                                src={img.url}
                                alt="Base"
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => selectImage("base", img.url)}
                            />

                            {/* Expand Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxImage(img.url);
                                }}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                title="View Large"
                            >
                                <ImageIcon className="w-3 h-3" />
                            </button>

                            {/* Selection Indicator */}
                            {activeProduct.ai_data?.selected_images?.base === img.url && (
                                <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center pointer-events-none border-2 border-indigo-600 rounded-xl">
                                    <div className="bg-white rounded-full p-1 shadow-lg">
                                        <Check className="w-3 h-3 text-indigo-600" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {(!activeProduct.ai_data?.variant_images?.base || activeProduct.ai_data.variant_images.base.length === 0) && (
                        <div className="col-span-5 text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                            No images found. Try re-running the search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : null;

    const footerActions = activeProduct ? (
        <>
            <button
                onClick={onBack}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 underline flex items-center gap-1"
            >
                <ChevronLeft className="w-3 h-3" /> Back to Metadata
            </button>
            <button
                onClick={handleComplete}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-bold text-xs shadow-lg shadow-indigo-100 transition-all transform hover:scale-105"
            >
                Generate Studio Visuals
            </button>
        </>
    ) : null;

    const sidebarTitle = (
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-indigo-600" />
            Source Selection ({localProducts.length})
        </h3>
    );

    const headerContent = activeProduct && (
        <div className="px-6 py-3 flex justify-between items-center bg-white">
            <div className="flex-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Phase 2 / Image Picker</span>
                <div className="flex items-center gap-4 mt-1">
                    <h2 className="text-lg font-bold text-gray-900 truncate max-w-md">{activeProduct.ai_data?.title_el || activeProduct.name}</h2>
                    <button
                        onClick={() => onRetry(activeProduct.sku)}
                        disabled={isSourcing}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 underline disabled:opacity-30"
                    >
                        Re-run Image Search
                    </button>
                </div>
            </div>
            <div className="flex gap-1">
                <button
                    onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeIndex === 0}
                    className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button
                    onClick={() => setActiveIndex(prev => Math.min(localProducts.length - 1, prev + 1))}
                    disabled={activeIndex === localProducts.length - 1}
                    className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
            </div>
        </div>
    );

    return (
        <>
            <WizardLayout
                sidebarList={sidebarList}
                mainContent={mainContent}
                footerActions={activeProduct ? footerActions : undefined}
                sidebarTitle={sidebarTitle}
                headerContent={headerContent}
            />

            {/* Lightbox Overlay */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <img
                            src={lightboxImage}
                            alt="Lightbox"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-white/10 p-2 rounded-full backdrop-blur-md"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

