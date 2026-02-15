"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, CheckCircle2, ChevronLeft, ChevronRight, Wand2, ArrowRight, XCircle, RotateCcw, Layers, Image as ImageIcon, RefreshCw } from "lucide-react";
import { WizardLayout } from "./wizard-layout";

interface Variant {
    sku_suffix: string;
    variant_name: string;
}

interface ProductData {
    sku: string;
    status: string;
    enrichment_message?: string;
    name: string;
    ai_data?: {
        title_el?: string;
        variants?: Variant[];
        selected_images?: Record<string, string>;
        generated_images?: Record<string, string>; // suffix -> new_url
        images?: { url: string; suffix: string }[];
    };
}

interface NanoStepProps {
    products: ProductData[];
    onBack: () => void;
    onRetry: (sku: string) => void;
    onRemoveBg: (sku: string) => void;
    onStartStudio: (environment: string) => void;
    onRegenerate: (sku: string, environment: string) => void;
    onComplete: () => void;
}

type Environment = "clean" | "realistic";

export function NanoStep({ products, onBack, onRetry, onRemoveBg, onStartStudio, onRegenerate, onComplete }: NanoStepProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [environment, setEnvironment] = useState<Environment>("clean");
    const activeProduct = products[activeIndex];

    // Helper to get the best display image (BG removed > Generated)
    const getDisplayImage = (product: ProductData) => {
        if (!product?.ai_data) return null;

        // Check for final BG removed image first
        const finalImage = product.ai_data.images?.find(img => img.suffix === 'base')?.url;
        if (finalImage) return finalImage;

        // Fallback to generated image
        return product.ai_data.generated_images?.base || null;
    };

    const displayImage = activeProduct ? getDisplayImage(activeProduct) : null;

    // Calculate overall progress
    const totalItems = products.length; // 1 image per product
    const completedItems = products.reduce((acc, p) => {
        return acc + (p.ai_data?.generated_images?.base ? 1 : 0);
    }, 0);
    const progressPercent = Math.round((completedItems / totalItems) * 100);

    const isAllProcessed = products.every(p =>
        p.status === 'PENDING_STUDIO_REVIEW' ||
        p.status === 'PENDING_BG_REMOVAL' ||
        p.status === 'APPROVED' ||
        p.status === 'ENRICHMENT_FAILED'
    );

    // Check if we are in the "Start" state
    const hasVisuals = products.some(p => p.ai_data?.generated_images?.base);
    const isReady = products.every(p => p.status === 'READY_FOR_STUDIO') && !hasVisuals;
    const isBatchGenerating = products.some(p => p.status === 'BATCH_GENERATING');

    const sidebarTitle = (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Wand2 className="w-4 h-4 text-indigo-600" />
                Generation Status
            </h3>

            {/* Environment Toggle - Persistent */}
            <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Style Setting</span>
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => setEnvironment("clean")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all text-left flex items-center gap-2 ${environment === "clean"
                            ? "bg-white text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-100"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${environment === "clean" ? "bg-indigo-500" : "bg-gray-300"}`} />
                        Clean White
                    </button>
                    <button
                        onClick={() => setEnvironment("realistic")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all text-left flex items-center gap-2 ${environment === "realistic"
                            ? "bg-white text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-100"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${environment === "realistic" ? "bg-amber-500" : "bg-gray-300"}`} />
                        Realistic Setting
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Overall</span>
                    <span className="text-[10px] font-bold text-indigo-600">{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-indigo-600 h-full transition-all duration-1000 ease-in-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );

    const sidebarList = (
        <div className="flex flex-col gap-1 p-2">
            {products.map((p, idx) => {
                const status = p.status;
                const isEnriching = status === 'PENDING_NANO_BANANA' || status.includes('GENERATING') || status === 'BATCH_GENERATING';
                const isFailed = status === 'ENRICHMENT_FAILED';
                const isBgRemoving = status === 'PENDING_BG_REMOVAL';

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
                            <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider flex items-center gap-2">
                                {status === 'BATCH_GENERATING' ? (
                                    <><Loader2 className="w-2 h-2 animate-spin" /> Batch Processing...</>
                                ) : isEnriching ? (
                                    <><Loader2 className="w-2 h-2 animate-spin" /> Studio Rendering...</>
                                ) : isBgRemoving ? (
                                    <><Loader2 className="w-2 h-2 animate-spin" /> Removing BG...</>
                                ) : isFailed ? (
                                    <><XCircle className="w-2 h-2 text-red-500" /> Failed</>
                                ) : status === 'APPROVED' ? (
                                    <><CheckCircle2 className="w-2 h-2 text-green-500" /> Done</>
                                ) : status === 'PENDING_STUDIO_REVIEW' ? (
                                    <><Sparkles className="w-2 h-2 text-indigo-500" /> Ready for Review</>
                                ) : status === 'READY_FOR_STUDIO' ? (
                                    "Ready to Start"
                                ) : "Queued"}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );

    const failedCount = products.filter(p => p.status === 'ENRICHMENT_FAILED').length;

    const mainContent = isReady ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Wand2 className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nano Banana Studio</h2>
            <p className="text-gray-500 max-w-sm mb-6 text-sm">
                Generate professional product photography. <br />Select your style in the sidebar.
            </p>

            <button
                onClick={() => onStartStudio(environment)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all transform hover:scale-105"
            >
                <Wand2 className="w-4 h-4" />
                Start Studio Generation
            </button>
        </div>
    ) : activeProduct ? (
        <div className="flex-1 flex flex-col h-full">
            {/* Live progress banner — shown while generation is still in progress */}
            {isBatchGenerating && (
                <div className="mx-4 mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-4">
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-bold text-indigo-900">
                                Generating Studio Images
                            </span>
                            <span className="text-xs font-bold text-indigo-600">
                                {completedItems + failedCount} / {totalItems}
                            </span>
                        </div>
                        <div className="w-full bg-indigo-100 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-indigo-600 h-full transition-all duration-1000 ease-in-out rounded-full"
                                style={{ width: `${Math.round(((completedItems + failedCount) / totalItems) * 100)}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-indigo-500 mt-1.5">
                            {completedItems} completed{failedCount > 0 && <span className="text-red-500 font-bold"> · {failedCount} failed</span>}
                            {' '}· Select products in sidebar to preview
                        </p>
                    </div>
                </div>
            )}

            {/* Product comparison view — always visible */}
            <div className="p-8 space-y-12 max-w-7xl mx-auto flex-1">
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                        Master Product
                    </h4>

                    <div className="grid grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
                        {/* Source */}
                        <div className="space-y-2 group relative">
                            <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 grayscale opacity-70 transition-all group-hover:opacity-100 group-hover:grayscale-0">
                                {activeProduct.ai_data?.selected_images?.base && (
                                    <img
                                        src={activeProduct.ai_data.selected_images.base}
                                        alt="Source"
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() => setLightboxImage(activeProduct.ai_data?.selected_images?.base || null)}
                                    />
                                )}
                                <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase backdrop-blur-sm">Source</div>
                                {activeProduct.ai_data?.selected_images?.base && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLightboxImage(activeProduct.ai_data?.selected_images?.base || null);
                                        }}
                                        className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
                                        title="View Large"
                                    >
                                        <ImageIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Result */}
                        <div className="space-y-2 relative group">
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 border border-gray-100 text-gray-400">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                            <div className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${displayImage
                                ? "border-green-500 shadow-2xl shadow-green-100/50 ring-4 ring-green-50/50"
                                : activeProduct.status === 'ENRICHMENT_FAILED'
                                    ? "border-red-200 bg-red-50"
                                    : "border-indigo-100 bg-indigo-50 animate-pulse border-dashed"
                                }`}>
                                {displayImage ? (
                                    <>
                                        <img
                                            src={displayImage}
                                            alt="Generated"
                                            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-700"
                                            onClick={() => setLightboxImage(displayImage)}
                                        />

                                        {/* BG Removal Loading Overlay */}
                                        {activeProduct.status === 'PENDING_BG_REMOVAL' && (
                                            <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                                                <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest bg-white/80 px-4 py-1.5 rounded-full shadow-sm ring-1 ring-indigo-50">
                                                    Removing Background...
                                                </span>
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLightboxImage(displayImage);
                                            }}
                                            className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm z-20"
                                            title="View Large"
                                        >
                                            <ImageIcon className="w-3 h-3" />
                                        </button>

                                        {!['BATCH_GENERATING', 'PENDING_NANO_BANANA', 'PENDING_STUDIO_GENERATION'].some(s => activeProduct.status.includes(s)) && (
                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity grid grid-cols-2 gap-2 z-30">
                                                <button
                                                    onClick={() => onRegenerate(activeProduct.sku, environment)}
                                                    className="col-span-2 bg-indigo-600 text-white py-2 rounded-lg font-bold text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                    Create Alternative
                                                </button>
                                                <button
                                                    onClick={() => onRemoveBg(activeProduct.sku)}
                                                    className="col-span-2 bg-white/90 backdrop-blur text-gray-900 py-2 rounded-lg font-bold text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-lg"
                                                >
                                                    <Layers className="w-3 h-3 text-indigo-600" />
                                                    Remove BG
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : activeProduct.status === 'ENRICHMENT_FAILED' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-red-400 p-4 text-center">
                                        <XCircle className="w-8 h-8 mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest mb-1">Generation Failed</span>
                                        <p className="text-[10px] text-red-300 mb-3 max-w-[180px]">{activeProduct.enrichment_message}</p>
                                        <button
                                            onClick={() => onRetry(activeProduct.sku)}
                                            className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors font-bold"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Retry
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-indigo-300">
                                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest mb-1">
                                            {activeProduct.status === 'BATCH_GENERATING' ? 'In Queue...' : 'Rendering...'}
                                        </span>
                                        {activeProduct.enrichment_message && (
                                            <span className="text-[10px] text-indigo-400">{activeProduct.enrichment_message}</span>
                                        )}
                                    </div>
                                )}
                                <div className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase backdrop-blur-sm ${displayImage ? "bg-green-600/90"
                                    : activeProduct.status === 'ENRICHMENT_FAILED' ? "bg-red-600/90"
                                        : "bg-indigo-600/90"
                                    }`}>
                                    {displayImage
                                        ? (activeProduct.status === 'APPROVED' ? "Ready / BG Removed" : "Studio Visual")
                                        : activeProduct.status === 'ENRICHMENT_FAILED'
                                            ? "Failed"
                                            : "Generating..."}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null;

    const footerActions = (
        <>
            <div className="flex flex-col justify-center gap-2">
                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Visuals are generated at high resolution.
                </span>
                <div className="flex gap-4">
                    <button
                        onClick={() => onStartStudio(environment)}
                        disabled={isBatchGenerating}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 underline text-left disabled:opacity-30 flex items-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate All
                    </button>
                    <button
                        onClick={() => onRemoveBg("ALL")}
                        disabled={!isAllProcessed}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 underline text-left disabled:opacity-30"
                    >
                        Bulk Remove All Backgrounds
                    </button>
                </div>
            </div>
            <button
                onClick={onComplete}
                disabled={!isAllProcessed}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-full font-bold text-xs shadow-lg shadow-green-100 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
                Finalize & Approve All
            </button>
        </>
    );

    const headerContent = activeProduct && (
        <div className="px-6 py-3 flex justify-between items-center bg-white">
            <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Phase 3 / Studio Monitor</span>
                <h2 className="text-lg font-bold text-gray-900 mt-1 truncate max-w-md">{activeProduct.ai_data?.title_el || activeProduct.name}</h2>
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
                    onClick={() => setActiveIndex(prev => Math.min(products.length - 1, prev + 1))}
                    disabled={activeIndex === products.length - 1}
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
                footerActions={footerActions}
                sidebarTitle={sidebarTitle}
                headerContent={headerContent}
            />

            {/* Lightbox Overlay */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 backdrop-blur-md"
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
                            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-white/10 p-2 rounded-full backdrop-blur-md transition-colors hover:bg-white/20"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-mono uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                            High Resolution Preview
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
