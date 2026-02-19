"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2, CheckCircle2, ChevronLeft, ChevronRight, Wand2, ArrowRight, XCircle, RotateCcw, Layers, Image as ImageIcon, RefreshCw, PenTool, Trash2 } from "lucide-react";
import { WizardLayout } from "./wizard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    WizardSidebarItem,
    SharedWizardHeader,
    SharedWizardFooter,
    WizardProduct
} from "./shared-wizard-components";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Variant {
    sku_suffix: string;
    variant_name: string;
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
        selected_images?: Record<string, string>;
        generated_images?: Record<string, string>; // suffix -> new_url
        images?: { url: string; suffix: string }[];
    };
}

interface NanoStepProps {
    products: ProductData[];
    onBack: () => void;
    onRetry: (sku: string) => void;
    onRemoveBg: (sku: string, mode?: "generated" | "source") => void;
    onStartStudio: (environment: string, model: string) => void;
    onRegenerate: (sku: string, environment: string, model: string) => void;
    onRegenerateAll: (environment: string, model: string) => void;
    onAbort: () => void;
    onComplete: () => void;
}

type Environment = "clean" | "realistic" | "modern";

export function NanoStep({ products, onBack, onRetry, onRemoveBg, onStartStudio, onRegenerate, onRegenerateAll, onAbort, onComplete }: NanoStepProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [environment, setEnvironment] = useState<Environment>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('nano_banana_env');
            if (saved === 'clean' || saved === 'realistic' || saved === 'modern') return saved;
        }
        return 'clean';
    });

    const [generationModel, setGenerationModel] = useState<"gemini" | "imagen">(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('nano_banana_model');
            if (saved === 'gemini' || saved === 'imagen') return saved;
        }
        return 'gemini';
    });

    useEffect(() => {
        localStorage.setItem('nano_banana_env', environment);
    }, [environment]);

    useEffect(() => {
        localStorage.setItem('nano_banana_model', generationModel);
    }, [generationModel]);

    const activeProduct = products[activeIndex];

    // Helper to get the best display image (BG removed > Generated) with cache buster
    const getDisplayImage = (product: ProductData) => {
        if (!product?.ai_data) return null;

        // Check for final BG removed image first
        const finalImage = product.ai_data.images?.find(img => img.suffix === 'base')?.url;
        const url = finalImage || product.ai_data.generated_images?.base;

        if (!url) return null;

        // Add cache buster if it's a studio image that might have been overwritten
        const buster = `?t=${Date.now()}`;
        return url.includes('studio_base.jpg') ? `${url}${buster}` : url;
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

    // Any items have generated images?
    const hasAnyGenerated = products.some(p => p.ai_data?.generated_images?.base);

    // Check if we are in the "Start" state
    const hasVisuals = products.some(p => p.ai_data?.generated_images?.base);
    const isReady = products.every(p => p.status === 'READY_FOR_STUDIO') && !hasVisuals;
    const isBatchGenerating = products.some(p => p.status === 'BATCH_GENERATING');

    const sidebarTitle = (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-[11px] uppercase tracking-wider px-1">
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                Studio Config
            </h3>

            {/* Compact Selectors Container */}
            <div className="space-y-3 px-1">
                {/* Model Selector - Horizontal */}
                <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">Engine</span>
                    <div className="grid grid-cols-2 gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-100">
                        <button
                            onClick={() => setGenerationModel("gemini")}
                            className={cn(
                                "py-1.5 px-2 rounded-md text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1.5",
                                generationModel === "gemini"
                                    ? "bg-white text-indigo-700 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                            )}
                        >
                            <div className={cn("w-1.5 h-1.5 rounded-full", generationModel === "gemini" ? "bg-indigo-500" : "bg-gray-400")} />
                            Gemini
                        </button>
                        <button
                            onClick={() => setGenerationModel("imagen")}
                            className={cn(
                                "py-1.5 px-2 rounded-md text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1.5",
                                generationModel === "imagen"
                                    ? "bg-white text-indigo-700 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                            )}
                        >
                            <div className={cn("w-1.5 h-1.5 rounded-full", generationModel === "imagen" ? "bg-purple-500" : "bg-gray-400")} />
                            Imagen
                        </button>
                    </div>
                </div>

                {/* Environment Selector - 3-column grid */}
                <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">Style</span>
                    <div className="grid grid-cols-3 gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-100">
                        <button
                            onClick={() => setEnvironment("clean")}
                            className={cn(
                                "py-2 rounded-md text-[9px] font-bold transition-all flex flex-col items-center gap-1",
                                environment === "clean"
                                    ? "bg-white text-indigo-700 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                            )}
                        >
                            <div className={cn("w-1 h-1 rounded-full", environment === "clean" ? "bg-indigo-500" : "bg-gray-300")} />
                            Clean
                        </button>
                        <button
                            onClick={() => setEnvironment("realistic")}
                            className={cn(
                                "py-2 rounded-md text-[9px] font-bold transition-all flex flex-col items-center gap-1",
                                environment === "realistic"
                                    ? "bg-white text-indigo-700 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                            )}
                        >
                            <div className={cn("w-1 h-1 rounded-full", environment === "realistic" ? "bg-amber-500" : "bg-gray-300")} />
                            Real
                        </button>
                        <button
                            onClick={() => setEnvironment("modern")}
                            className={cn(
                                "py-2 rounded-md text-[9px] font-bold transition-all flex flex-col items-center gap-1",
                                environment === "modern"
                                    ? "bg-white text-indigo-700 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                            )}
                        >
                            <div className={cn("w-1 h-1 rounded-full", environment === "modern" ? "bg-teal-500" : "bg-gray-300")} />
                            Modern
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const sidebarList = (
        <TooltipProvider>
            <div className="flex flex-col gap-1 px-2">
                {products.map((p, idx) => {
                    const status = p.status;
                    const isEnriching = status === 'PENDING_NANO_BANANA' || status.includes('GENERATING') || status === 'BATCH_GENERATING';
                    const isFailed = status === 'ENRICHMENT_FAILED';
                    const isBgRemoving = status === 'PENDING_BG_REMOVAL' || status === 'PENDING_SOURCE_BG_REMOVAL';

                    return (
                        <WizardSidebarItem
                            key={p.sku}
                            product={p as unknown as WizardProduct}
                            isActive={activeIndex === idx}
                            onClick={() => setActiveIndex(idx)}
                            statusIndicator={
                                status === 'BATCH_GENERATING' ? (
                                    <><Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-400" /> Batch Processing...</>
                                ) : isEnriching ? (
                                    <><Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-400" /> {p.enrichment_message?.replace("...", "") || "Rendering"}</>
                                ) : isBgRemoving ? (
                                    <><Loader2 className="w-2.5 h-2.5 animate-spin text-cyan-500" /> Removing BG...</>
                                ) : isFailed ? (
                                    <><XCircle className="w-2.5 h-2.5 text-red-500" /> Failed</>
                                ) : status === 'APPROVED' ? (
                                    <><CheckCircle2 className="w-2.5 h-2.5 text-green-500" /> Done</>
                                ) : status === 'PENDING_STUDIO_REVIEW' ? (
                                    <><Sparkles className="w-2.5 h-2.5 text-amber-500" /> Ready for Review</>
                                ) : status === 'READY_FOR_STUDIO' ? (
                                    <span className="text-gray-300">Ready</span>
                                ) : "Queued"
                            }
                        />
                    );
                })}
            </div>
        </TooltipProvider>
    );

    const failedCount = products.filter(p => p.status === 'ENRICHMENT_FAILED').length;

    const mainContent = isReady ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-inset ring-white/50">
                <Wand2 className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Nano Banana Studio</h2>
            <p className="text-gray-500 max-w-md mb-8 text-lg font-medium leading-relaxed">
                Generate professional product photography automatically.
            </p>

            <Button
                onClick={() => onStartStudio(environment, generationModel)}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 rounded-full font-bold text-sm shadow-xl shadow-indigo-200 transition-all transform hover:scale-105"
            >
                <Wand2 className="w-4 h-4 mr-2" />
                Start Generation
            </Button>
        </div>
    ) : activeProduct ? (
        <div className="flex-1 flex flex-col h-full bg-gray-50/30">
            {/* Live progress banner moved to footer */}

            {/* Product comparison view — always visible */}
            <div className="p-8 space-y-12 max-w-7xl mx-auto flex-1 w-full flex flex-col justify-center">
                <div className="space-y-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 justify-center">
                        <PenTool className="w-3 h-3" />
                        Studio Transformation
                    </h4>

                    <div className="grid grid-cols-2 gap-8 items-center max-w-5xl mx-auto w-full">
                        {/* Source */}
                        <div className="space-y-3 group relative">
                            <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-white bg-white shadow-xl shadow-gray-200/50 transition-all group-hover:shadow-2xl group-hover:scale-[1.02]">
                                {activeProduct.ai_data?.selected_images?.base ? (
                                    <img
                                        src={`${activeProduct.ai_data.selected_images.base}${activeProduct.ai_data.selected_images.base.includes('studio_base.jpg') ? `?t=${Date.now()}` : ''}`}
                                        alt="Source"
                                        className="w-full h-full object-cover cursor-pointer grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                        onClick={() => setLightboxImage(activeProduct.ai_data?.selected_images?.base ? `${activeProduct.ai_data.selected_images.base}?t=${Date.now()}` : null)}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase backdrop-blur-md shadow-sm flex items-center gap-2">
                                    Original Input
                                    {activeProduct.status === 'PENDING_SOURCE_BG_REMOVAL' && <Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-600" />}
                                </div>

                                {activeProduct.status === 'PENDING_SOURCE_BG_REMOVAL' && (
                                    <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                                        <Badge variant="secondary" className="bg-white/80 backdrop-blur-md text-indigo-900 shadow-sm animate-pulse">
                                            Removing Background...
                                        </Badge>
                                    </div>
                                )}

                                {/* Manual BG Removal for Source */}
                                {activeProduct.ai_data?.selected_images?.base && !['BATCH_GENERATING', 'PENDING_NANO_BANANA', 'PENDING_SOURCE_BG_REMOVAL'].includes(activeProduct.status) && (
                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-30">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveBg(activeProduct.sku, "source");
                                            }}
                                            className="w-full bg-white/90 hover:bg-white text-gray-900 border-0 text-[10px] font-bold uppercase"
                                        >
                                            <Layers className="w-3 h-3 mr-2" />
                                            Remove Background
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Result */}
                        <div className="space-y-3 relative group">
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg shadow-indigo-100 rounded-full p-2 border border-gray-100 text-indigo-600">
                                <ArrowRight className="w-5 h-5" />
                            </div>

                            <div className={cn(
                                "relative aspect-square rounded-3xl overflow-hidden border-4 bg-white transition-all shadow-2xl",
                                displayImage
                                    ? "border-white shadow-green-200/50 ring-4 ring-green-50/30"
                                    : activeProduct.status === 'ENRICHMENT_FAILED'
                                        ? "border-red-100 shadow-red-100/50"
                                        : "border-white shadow-indigo-200/50 ring-4 ring-indigo-50/30 animate-pulse"
                            )}>
                                {displayImage ? (
                                    <>
                                        <img
                                            src={displayImage}
                                            alt="Generated"
                                            className="w-full h-full object-contain cursor-pointer transition-transform duration-700 hover:scale-105"
                                            onClick={() => setLightboxImage(displayImage)}
                                        />

                                        {/* BG Removal Loading Overlay */}
                                        {activeProduct.status === 'PENDING_BG_REMOVAL' && (
                                            <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                                                <Badge variant="secondary" className="bg-white/80 backdrop-blur-md text-indigo-900 shadow-sm animate-pulse">
                                                    Removing Background...
                                                </Badge>
                                            </div>
                                        )}

                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLightboxImage(displayImage);
                                            }}
                                            className="absolute top-4 right-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-0 z-20"
                                        >
                                            <ImageIcon className="w-4 h-4" />
                                        </Button>

                                        {!['BATCH_GENERATING', 'PENDING_NANO_BANANA', 'PENDING_STUDIO_GENERATION'].some(s => activeProduct.status.includes(s)) && (
                                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 grid grid-cols-2 gap-3 z-30">
                                                <Button
                                                    size="sm"
                                                    onClick={() => onRegenerate(activeProduct.sku, environment, generationModel)}
                                                    className="col-span-1 bg-indigo-600 hover:bg-indigo-700 text-white border-0 text-[10px] font-bold uppercase"
                                                >
                                                    <RotateCcw className="w-3 h-3 mr-2" />
                                                    Retry
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => onRemoveBg(activeProduct.sku)}
                                                    className="col-span-1 bg-white/90 hover:bg-white text-gray-900 border-0 text-[10px] font-bold uppercase"
                                                >
                                                    <Layers className="w-3 h-3 mr-2" />
                                                    Remove BG
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : activeProduct.status === 'ENRICHMENT_FAILED' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-red-500 p-8 text-center bg-red-50/50">
                                        <XCircle className="w-12 h-12 mb-4 drop-shadow-sm" />
                                        <span className="text-xs font-bold uppercase tracking-widest mb-2">Generation Failed</span>
                                        <p className="text-xs text-red-400 mb-6 max-w-[200px] leading-relaxed">{activeProduct.enrichment_message}</p>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => onRetry(activeProduct.sku)}
                                            className="rounded-full font-bold"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 mr-2" /> Retry Generation
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                        <div className="relative">
                                            {isBatchGenerating || activeProduct.status === 'PENDING_NANO_BANANA' || activeProduct.status.includes('GENERATING') ? (
                                                <>
                                                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                                                    <Loader2 className="w-12 h-12 text-indigo-500 animate-[spin_3s_linear_infinite] relative z-10" />
                                                </>
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner">
                                                    <Wand2 className="w-8 h-8 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-gray-900 uppercase tracking-tight text-sm">Studio Transformation</h4>
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    {isBatchGenerating || activeProduct.status === 'PENDING_NANO_BANANA' || activeProduct.status.includes('GENERATING')
                                                        ? "AI is synthesizing your studio shot..."
                                                        : "Product ready for studio synthesis."}
                                                </p>
                                            </div>

                                            {(isBatchGenerating || activeProduct.status === 'PENDING_NANO_BANANA' || activeProduct.status.includes('GENERATING')) ? (
                                                <div className="flex flex-col gap-2 w-full max-w-[200px] mx-auto text-left">
                                                    {[
                                                        { label: "Normalization", key: "Optimizing frame" },
                                                        { label: "Studio Synthesis", key: "Synthesizing studio" },
                                                        { label: "Final Render", key: "Generating high-fidelity" }
                                                    ].map((phase, i) => {
                                                        const isActive = activeProduct.enrichment_message?.includes(phase.key);
                                                        const isDone = !isActive && activeProduct.enrichment_message && i < [
                                                            "Optimizing frame",
                                                            "Synthesizing studio",
                                                            "Generating high-fidelity"
                                                        ].findIndex(k => activeProduct.enrichment_message?.includes(k));

                                                        return (
                                                            <div key={phase.label} className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                                                    isActive ? "bg-indigo-500 ring-4 ring-indigo-100 animate-pulse" :
                                                                        isDone ? "bg-green-500" : "bg-gray-200"
                                                                )} />
                                                                <span className={cn(
                                                                    "text-[10px] font-bold uppercase tracking-wider transition-colors",
                                                                    isActive ? "text-indigo-600" :
                                                                        isDone ? "text-green-600/60" : "text-gray-300"
                                                                )}>
                                                                    {phase.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => onRegenerate(activeProduct.sku, environment, generationModel)}
                                                    size="sm"
                                                    disabled={isBatchGenerating}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-[10px]"
                                                >
                                                    <Sparkles className="w-3 h-3 mr-2" /> Start Generation
                                                </Button>
                                            )}
                                        </div>

                                        {(activeProduct.status === 'ENRICHMENT_FAILED' || isBatchGenerating || activeProduct.status === 'PENDING_NANO_BANANA' || activeProduct.status.includes('GENERATING')) && activeProduct.enrichment_message && (
                                            <span className="text-[9px] text-indigo-400/60 font-medium mt-6 italic bg-white/50 px-3 py-1 rounded-full border border-indigo-50">
                                                {activeProduct.enrichment_message}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <Badge
                                    className={cn(
                                        "absolute top-4 left-4 text-[10px] font-bold px-3 py-1 uppercase backdrop-blur-md shadow-sm border-0",
                                        displayImage ? "bg-green-500/90 hover:bg-green-600/90" :
                                            activeProduct.status === 'ENRICHMENT_FAILED' ? "bg-red-500/90" :
                                                (isBatchGenerating || activeProduct.status === 'PENDING_NANO_BANANA' || activeProduct.status.includes('GENERATING')) ? "bg-indigo-500/90" : "bg-gray-400/90"
                                    )}
                                >
                                    {displayImage
                                        ? (activeProduct.status === 'APPROVED' ? "Ready / BG Removed" : "Studio Visual")
                                        : activeProduct.status === 'ENRICHMENT_FAILED'
                                            ? "Failed"
                                            : (isBatchGenerating || activeProduct.status === 'PENDING_NANO_BANANA' || activeProduct.status.includes('GENERATING'))
                                                ? "Generating..."
                                                : "Pending"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null;

    const footerActions = (
        <SharedWizardFooter
            onBack={onBack}
            centerContent={
                <div className="flex flex-col flex-1 max-w-sm">
                    {isBatchGenerating ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
                                    <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-tight">Studio Working...</span>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                    {completedItems + failedCount}/{totalItems}
                                </span>
                            </div>
                            <Progress value={((completedItems + failedCount) / totalItems) * 100} className="h-1 bg-indigo-50" />
                            <div className="mt-1.5 flex justify-between">
                                <span className="text-[9px] text-gray-400 font-medium">Estimated time:</span>
                                <span className="text-[9px] text-indigo-500 font-bold uppercase">
                                    {(() => {
                                        const totalSeconds = Math.max(1, (totalItems - completedItems) * 5);
                                        const mins = Math.ceil(totalSeconds / 60);
                                        return `${mins} minutes`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0.5 opacity-60">
                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Visuals generated at 4K resolution.
                            </span>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Studio Idle</p>
                        </div>
                    )}
                </div>
            }
            rightContent={
                <div className="flex items-center gap-3">
                    {/* Abort Action (Visible only when generating) */}
                    {isBatchGenerating && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="h-10 px-5 rounded-full font-bold text-xs transition-all transform hover:scale-105 duration-200 shadow-lg shadow-red-100"
                                >
                                    <XCircle className="w-3.5 h-3.5 mr-2" />
                                    Abort
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Abort Studio Process?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will stop any running and queued studio generation processes.
                                        Products currently being processed may finish, but subsequent ones will be skipped.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onAbort} className="bg-red-600 hover:bg-red-700">
                                        Abort Process
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {/* Regenerate All Action */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={isBatchGenerating}
                                className="h-10 px-5 rounded-full border-indigo-100 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-bold text-xs transition-all transform hover:scale-105 duration-200"
                            >
                                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                Regenerate All
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Regenerate All Visuals?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will cancel any existing processes and restart studio generation for all products in this list.
                                    Existing studio images will be overwritten.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onRegenerateAll(environment, generationModel)} className="bg-indigo-600 hover:bg-indigo-700">
                                    Regenerate All
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Bulk Remove BG Action */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={!hasAnyGenerated || isBatchGenerating}
                                className="h-10 px-5 rounded-full border-cyan-100 text-cyan-700 hover:bg-cyan-100 hover:text-cyan-800 font-bold text-xs transition-all transform hover:scale-105 duration-200"
                            >
                                <Layers className="w-3.5 h-3.5 mr-2" />
                                Bulk Remove BG
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bulk Remove Background?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Background removal will be triggered for products that have studio images generated but haven't had their background removed yet.
                                    Products with manual edits or already removed backgrounds will be skipped to preserve your work.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onRemoveBg("ALL")} className="bg-cyan-600 hover:bg-cyan-700">
                                    Remove Backgrounds
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                disabled={isBatchGenerating}
                                className="bg-green-600 hover:bg-green-700 h-10 px-6 text-white rounded-full font-bold shadow-lg shadow-green-100 transition-all transform hover:scale-105 disabled:opacity-30 disabled:scale-100 disabled:shadow-none text-xs"
                            >
                                Send to Staging Area <CheckCircle2 className="w-4 h-4 ml-2" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Send All Products to Staging Area?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will move all products to the Visual Staging Area for final review. You can still reach them in the Staging Area before they go live on Shopify.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                                    Send to Staging Area
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            }
        />
    );

    const headerContent = activeProduct && (
        <SharedWizardHeader
            title={activeProduct.ai_data?.title_el || activeProduct.pylon_data?.name || activeProduct.name || activeProduct.sku}
            phaseLabel="Phase 3 / Studio Monitor"
            icon={Wand2}
            onPrev={() => setActiveIndex(prev => Math.max(0, prev - 1))}
            onNext={() => setActiveIndex(prev => Math.min(products.length - 1, prev + 1))}
            prevDisabled={activeIndex === 0}
            nextDisabled={activeIndex === products.length - 1}
        />
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
