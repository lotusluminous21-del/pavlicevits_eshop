"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Check, ChevronLeft, ChevronRight, Globe, Layers, AlertCircle, Sparkles, Loader2, ArrowLeft, Plus, Upload, FileImage } from "lucide-react";
import { WizardLayout } from "./wizard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    WizardSidebarItem,
    SharedWizardHeader,
    SharedWizardFooter,
    SharedWizardSidebarTitle,
    WizardProduct
} from "./shared-wizard-components";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    pylon_data?: {
        name: string;
    };
    ai_data?: {
        title_el?: string;
        variants?: Variant[];
        variant_images?: Record<string, { url: string; score: number; source?: string }[]>;
        selected_images?: Record<string, string>; // suffix -> url
    };
}

interface ImageStepProps {
    products: ProductData[];
    onBack: () => void;
    onRetry: (sku: string, query?: string) => void;
    onSelectImage: (sku: string, suffix: string, url: string) => void;
    onManualUpload: (sku: string, file: File | Blob) => void;
    onStartSourcing: () => void;
    onComplete: (updatedProducts: ProductData[]) => void;
}

export function ImageStep({ products, onBack, onRetry, onSelectImage, onManualUpload, onStartSourcing, onComplete }: ImageStepProps) {
    const [localProducts, setLocalProducts] = useState(products);
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Sync from props (Firestore source of truth)
    useEffect(() => {
        setLocalProducts(products);
        // If an upload was in progress and products changed, we can assume it finished
        setIsUploading(false);
    }, [products]);

    const handleComplete = () => {
        onComplete(localProducts);
    };

    const activeProduct = localProducts[activeIndex];

    // Clipboard Paste Listener
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items || !activeProduct) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        try {
                            setIsUploading(true);
                            await onManualUpload(activeProduct.sku, blob);
                        } catch (err) {
                            setIsUploading(false);
                        }
                    }
                }
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [activeProduct, onManualUpload]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && activeProduct) {
            try {
                setIsUploading(true);
                await onManualUpload(activeProduct.sku, file);
            } catch (err) {
                setIsUploading(false);
            }
        }
    };

    const isSourcing = products.some(p => p.status === 'PENDING_IMAGE_SOURCING');
    const hasImages = products.some(p => p.ai_data?.variant_images?.base && p.ai_data.variant_images.base.length > 0);
    const isReady = products.every(p => p.status === 'READY_FOR_IMAGES') && !hasImages;

    const selectImage = (suffix: string, url: string) => {
        onSelectImage(activeProduct.sku, suffix, url);
        // Optimistic local update
        setLocalProducts(prev => prev.map(p => {
            if (p.sku !== activeProduct.sku) return p;
            const selected = { ...(p.ai_data?.selected_images || {}) };
            selected[suffix] = url;
            return { ...p, ai_data: { ...p.ai_data, selected_images: selected } };
        }));
    };

    const sidebarList = (
        <TooltipProvider>
            <div className="flex flex-col gap-1 px-2">
                {localProducts.map((p, idx) => {
                    const selectedCount = Object.keys(p.ai_data?.selected_images || {}).length;
                    const totalNeeded = 1;
                    const complete = selectedCount >= totalNeeded;

                    return (
                        <WizardSidebarItem
                            key={p.sku}
                            product={p as unknown as WizardProduct}
                            isActive={activeIndex === idx}
                            onClick={() => setActiveIndex(idx)}
                            statusIndicator={
                                p.status === 'PENDING_IMAGE_SOURCING' ? (
                                    <><Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-500" /> Sourcing...</>
                                ) : (
                                    <span className={cn("flex items-center gap-1.5", complete ? "text-green-600" : "")}>
                                        {complete && <Check className="w-2.5 h-2.5" />}
                                        {selectedCount}/{totalNeeded} Selected
                                    </span>
                                )
                            }
                        />
                    );
                })}
            </div>
        </TooltipProvider>
    );

    const mainContent = isReady ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/50">
                <Globe className="w-10 h-10 text-indigo-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Source Product Images</h2>
            <p className="text-gray-500 max-w-md mb-8 text-base">
                The AI will search the web for high-quality source images to use as a reference for the studio generation.
            </p>
            <Button
                onClick={onStartSourcing}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-xl shadow-indigo-100 transition-all transform hover:scale-105"
            >
                <Globe className="w-4 h-4 mr-2" />
                Start Image Sourcing
            </Button>
        </div>
    ) : isSourcing ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Searching the Web...</h2>
            <p className="text-gray-500 max-w-sm text-sm">
                Finding the best reference images for your products.
            </p>
        </div>
    ) : activeProduct ? (
        <div className="p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Section: Base Image */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        Main Product Image (Source of Truth)
                    </h4>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const q = window.prompt("Refine search query (e.g. add brand name, color, or specific model):", activeProduct.name);
                            if (q !== null) onRetry(activeProduct.sku, q);
                        }}
                        disabled={isSourcing}
                        className="h-7 text-xs bg-indigo-50/50 border-indigo-100 text-indigo-700 hover:bg-indigo-100 font-bold"
                    >
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        Refine Search
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {activeProduct.ai_data?.variant_images?.base?.map((img, i) => {
                        const isSelected = activeProduct.ai_data?.selected_images?.base === img.url;
                        const isManual = img.source === "manual";

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shadow-sm hover:shadow-md",
                                    isSelected
                                        ? "border-indigo-600 ring-4 ring-indigo-50"
                                        : "border-gray-100 hover:border-gray-300"
                                )}
                                onClick={() => selectImage("base", img.url)}
                            >
                                <img
                                    src={img.url}
                                    alt="Base"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {isManual && (
                                    <div className="absolute top-2 left-2">
                                        <Badge className="bg-amber-500 text-white text-[10px] py-0 px-1.5 border-0">
                                            Manual
                                        </Badge>
                                    </div>
                                )}

                                {/* Expand Button */}
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxImage(img.url);
                                    }}
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-0"
                                    title="View Large"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </Button>

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center pointer-events-none">
                                        <div className="bg-indigo-600 text-white rounded-full p-2 shadow-lg animate-in zoom-in duration-200">
                                            <Check className="w-5 h-5" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                    <span className="text-[10px] font-bold text-white bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                                        {isManual ? "Manual User Upload" : `${(img.score * 100).toFixed(0)}% Match`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Manual Upload Card */}
                    <div
                        className={cn(
                            "relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group",
                            isUploading
                                ? "bg-gray-50 border-indigo-200"
                                : "bg-gray-50/30 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 border-indigo-200 cursor-pointer"
                        )}
                        onClick={() => !isUploading && document.getElementById('manual-upload-input')?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
                        }}
                        onDrop={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
                            const file = e.dataTransfer.files?.[0];
                            if (file && activeProduct && file.type.startsWith('image/')) {
                                try {
                                    setIsUploading(true);
                                    await onManualUpload(activeProduct.sku, file);
                                } catch (err) {
                                    setIsUploading(false);
                                }
                            }
                        }}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                <span className="text-[10px] font-bold text-indigo-600 animate-pulse tracking-tight">UPLOADING...</span>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-indigo-500" />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[11px] font-bold text-gray-900 leading-tight">Drop / Paste Image</p>
                                    <p className="text-[9px] text-gray-500 mt-0.5">or click to browse</p>
                                </div>
                                <input
                                    type="file"
                                    id="manual-upload-input"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </>
                        )}
                    </div>
                    {(!activeProduct.ai_data?.variant_images?.base || activeProduct.ai_data.variant_images.base.length === 0) && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">No images found.</p>
                            <Button variant="link" onClick={() => onRetry(activeProduct.sku)} className="text-indigo-600">Try searching again</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : null;

    // Footer Actions
    const footerActions = activeProduct ? (
        <SharedWizardFooter
            onBack={onBack}
            centerContent={
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {localProducts.slice(0, 3).map((p, i) => (
                            <div key={i} className={cn(
                                "w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm",
                                p.ai_data?.selected_images?.base ? "bg-indigo-50" : "bg-gray-100"
                            )}>
                                {p.ai_data?.selected_images?.base ? (
                                    <img src={p.ai_data.selected_images.base} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-3 h-3 text-gray-300" />
                                )}
                            </div>
                        ))}
                        {localProducts.length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[8px] font-bold text-gray-400 shadow-sm">
                                +{localProducts.length - 3}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-900">
                                {localProducts.filter(p => p.ai_data?.selected_images?.base).length} / {localProducts.length} Selected
                            </span>
                            {localProducts.every(p => p.ai_data?.selected_images?.base) && (
                                <Badge className="bg-green-500 text-white text-[8px] h-4 py-0 px-1.5 border-0 font-bold">READY</Badge>
                            )}
                        </div>
                        <div className="w-32 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-500"
                                style={{ width: `${(localProducts.filter(p => p.ai_data?.selected_images?.base).length / localProducts.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            }
            rightContent={
                <Button
                    onClick={handleComplete}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-100 transition-all transform hover:scale-105"
                >
                    Generate Studio Visuals
                    <Sparkles className="w-4 h-4 ml-2" />
                </Button>
            }
        />
    ) : null;

    const sidebarTitle = <SharedWizardSidebarTitle count={localProducts.length} />;

    const headerContent = activeProduct && (
        <SharedWizardHeader
            title={activeProduct.ai_data?.title_el || activeProduct.pylon_data?.name || activeProduct.name || activeProduct.sku}
            phaseLabel="Phase 2 / Image Picker"
            icon={Globe}
            onPrev={() => setActiveIndex(prev => Math.max(0, prev - 1))}
            onNext={() => setActiveIndex(prev => Math.min(localProducts.length - 1, prev + 1))}
            prevDisabled={activeIndex === 0}
            nextDisabled={activeIndex === localProducts.length - 1}
        />
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
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <img
                            src={lightboxImage}
                            alt="Lightbox"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
