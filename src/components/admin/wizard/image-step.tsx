"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, CheckCircle2, ChevronLeft, ChevronRight, Globe, Layers, AlertCircle, Sparkles, Loader2, ArrowLeft, Plus, Upload, FileImage, Search } from "lucide-react";
import { WizardLayout } from "./wizard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    WizardSidebarItem,
    SharedWizardHeader,
    SharedWizardFooter,
    SharedWizardSidebarTitle,
    WizardProduct
} from "./shared-wizard-components";

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
        title?: string;
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

    useEffect(() => {
        setLocalProducts(products);
        setIsUploading(false);
    }, [products]);

    const handleComplete = () => {
        onComplete(localProducts);
    };

    const activeProduct = localProducts[activeIndex];

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
        setLocalProducts(prev => prev.map(p => {
            if (p.sku !== activeProduct.sku) return p;
            const selected = { ...(p.ai_data?.selected_images || {}) };
            selected[suffix] = url;
            return { ...p, ai_data: { ...p.ai_data, selected_images: selected } };
        }));
    };

    const sidebarList = (
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
                                <><Loader2 className="w-2.5 h-2.5 animate-spin text-zinc-500" /> SEARCH</>
                            ) : (
                                <span className={cn("flex items-center gap-1.5", complete ? "text-emerald-600" : "")}>
                                    {complete && <CheckCircle2 className="w-2.5 h-2.5" />}
                                    {selectedCount}/{totalNeeded}
                                </span>
                            )
                        }
                    />
                );
            })}
        </div>
    );

    const mainContent = isReady ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-2 tracking-tight">Image Web Sourcing</h2>
            <p className="text-zinc-500 max-w-sm mb-8 text-sm leading-relaxed">
                Scan the web for high-quality references matching the newly discovered metadata and titles.
            </p>
            <Button
                onClick={onStartSourcing}
                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-none h-10 px-8 font-medium"
            >
                <Search className="w-4 h-4 mr-2" />
                Start Web Search
            </Button>
        </div>
    ) : isSourcing ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <Loader2 className="w-8 h-8 text-zinc-800 animate-spin mb-6" />
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Searching...</h2>
            <p className="text-zinc-500 max-w-sm text-sm">
                Retrieving reference images across Google endpoints.
            </p>
        </div>
    ) : activeProduct ? (
        <div className="p-8 lg:p-12 space-y-8 max-w-[1400px] mx-auto">
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                    <h4 className="text-xs font-semibold text-zinc-900 flex items-center gap-2 uppercase tracking-widest">
                        <Layers className="w-3.5 h-3.5 text-zinc-400" />
                        Source Selection
                    </h4>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const q = window.prompt("Refine search query (e.g. add brand name, color):", activeProduct.name);
                            if (q !== null) onRetry(activeProduct.sku, q);
                        }}
                        disabled={isSourcing}
                        className="h-7 text-[10px] uppercase font-semibold tracking-widest bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded-sm"
                    >
                        <Search className="w-3 h-3 mr-1.5" />
                        Refine
                    </Button>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {activeProduct.ai_data?.variant_images?.base?.map((img, i) => {
                        const isSelected = activeProduct.ai_data?.selected_images?.base === img.url;
                        const isManual = img.source === "manual";

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "group relative aspect-square rounded-sm overflow-hidden border-2 transition-all cursor-pointer bg-zinc-50",
                                    isSelected
                                        ? "border-zinc-900 outline outline-4 outline-zinc-900/10 shadow-lg"
                                        : "border-zinc-200 hover:border-zinc-400 border-dashed hover:border-solid hover:shadow-md"
                                )}
                                onClick={() => selectImage("base", img.url)}
                            >
                                <img
                                    src={img.url}
                                    alt="Reference"
                                    className={cn(
                                        "w-full h-full object-cover transition-all duration-700",
                                        isSelected ? "scale-105" : "group-hover:scale-105 grayscale group-hover:grayscale-0"
                                    )}
                                />

                                {isManual && (
                                    <div className="absolute top-2 left-2">
                                        <Badge className="bg-amber-500 text-white text-[9px] py-0 font-bold px-1.5 border-0 rounded-none uppercase tracking-widest">
                                            User
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
                                    className="absolute top-2 right-2 h-7 w-7 rounded-none opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-zinc-100 text-zinc-900 border-0 shadow-sm"
                                    title="View Large"
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                </Button>

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-zinc-900/5 flex items-center justify-center pointer-events-none">
                                        <div className="bg-zinc-900 text-white rounded-none p-2 animate-in zoom-in duration-200 shadow-md border border-zinc-700">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                    </div>
                                )}

                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-900/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                    <span className="text-[10px] font-medium text-white px-1">
                                        {isManual ? "Direct Upload" : `${(img.score * 100).toFixed(0)}% Match`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Manual Upload Card */}
                    <div
                        className={cn(
                            "relative aspect-square rounded-sm border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group",
                            isUploading
                                ? "bg-zinc-50 border-zinc-300"
                                : "bg-transparent border-zinc-200 hover:bg-zinc-50 hover:border-zinc-400 hover:border-solid cursor-pointer"
                        )}
                        onClick={() => !isUploading && document.getElementById('manual-upload-input')?.click()}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.add('border-zinc-400', 'bg-zinc-50', 'border-solid');
                            e.currentTarget.classList.remove('border-dashed', 'border-zinc-200', 'bg-transparent');
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.remove('border-zinc-400', 'bg-zinc-50', 'border-solid');
                            e.currentTarget.classList.add('border-dashed', 'border-zinc-200', 'bg-transparent');
                        }}
                        onDrop={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.remove('border-zinc-400', 'bg-zinc-50', 'border-solid');
                            e.currentTarget.classList.add('border-dashed', 'border-zinc-200', 'bg-transparent');
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
                                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">UPLOADING</span>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Plus className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600" />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Upload</p>
                                    <p className="text-[9px] text-zinc-400 mt-1 uppercase">Drop file</p>
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
                        <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-sm bg-zinc-50/50">
                            <ImageIcon className="w-8 h-8 text-zinc-300 mb-3" />
                            <p className="text-zinc-500 font-medium text-sm">No images found on the web.</p>
                            <Button variant="link" onClick={() => onRetry(activeProduct.sku)} className="text-zinc-900 font-medium">Try Refining Search</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : null;

    const footerActions = activeProduct ? (
        <SharedWizardFooter
            onBack={onBack}
            centerContent={
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {localProducts.slice(0, 4).map((p, i) => (
                            <div key={i} className={cn(
                                "w-8 h-8 rounded-full border-[3px] border-white bg-zinc-100 flex items-center justify-center overflow-hidden shadow-sm transition-all",
                                p.ai_data?.selected_images?.base ? "ring-2 ring-emerald-500 ring-offset-1" : "ring-1 ring-zinc-200 ring-offset-1 opacity-50 grayscale"
                            )}>
                                {p.ai_data?.selected_images?.base ? (
                                    <img src={p.ai_data.selected_images.base} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                                )}
                            </div>
                        ))}
                        {localProducts.length > 4 && (
                            <div className="w-8 h-8 rounded-full border-[3px] border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600 shadow-sm z-10 relative">
                                +{localProducts.length - 4}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col ml-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">
                                {localProducts.filter(p => p.ai_data?.selected_images?.base).length} OF {localProducts.length} SELECTED
                            </span>
                            {localProducts.every(p => p.ai_data?.selected_images?.base) && (
                                <Badge variant="outline" className="border-emerald-500 text-emerald-600 text-[9px] h-4 py-0 px-1 font-bold rounded-none uppercase tracking-widest">COMPLETE</Badge>
                            )}
                        </div>
                        <div className="w-32 h-[3px] bg-zinc-200 rounded-none mt-1 overflow-hidden">
                            <div
                                className="h-full bg-zinc-900 transition-all duration-500"
                                style={{ width: `${(localProducts.filter(p => p.ai_data?.selected_images?.base).length / localProducts.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            }
            rightContent={
                <Button
                    onClick={handleComplete}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-none font-medium h-9 px-6 ml-2"
                >
                    Proceed to Studio
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
            }
        />
    ) : null;

    return (
        <>
            <WizardLayout
                sidebarList={sidebarList}
                mainContent={mainContent}
                footerActions={activeProduct ? footerActions : undefined}
                sidebarTitle={<SharedWizardSidebarTitle count={localProducts.length} />}
                headerContent={activeProduct && (
                    <SharedWizardHeader
                        title={activeProduct.ai_data?.title || activeProduct.pylon_data?.name || activeProduct.name || activeProduct.sku}
                        phaseLabel="Phase 2: Source Imagery"
                        icon={Globe}
                        onPrev={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                        onNext={() => setActiveIndex(prev => Math.min(localProducts.length - 1, prev + 1))}
                        prevDisabled={activeIndex === 0}
                        nextDisabled={activeIndex === localProducts.length - 1}
                    />
                )}
            />

            {/* Lightbox Overlay */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[100] bg-zinc-900/95 flex items-center justify-center p-8 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <img
                            src={lightboxImage}
                            alt="Lightbox"
                            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                        />
                        <Button
                            variant="secondary"
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-4 right-4 rounded-none bg-white font-bold h-10 px-6 hover:bg-zinc-200 text-zinc-900 border-0 shadow-lg"
                        >
                            CLOSE
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
