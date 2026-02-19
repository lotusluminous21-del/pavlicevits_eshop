"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check, ChevronRight, ChevronLeft, Plus, Trash2, Tag, Layers, Loader2, Wand2, RefreshCw } from "lucide-react";
import { WizardLayout } from "./wizard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    WizardSidebarItem,
    SharedWizardHeader,
    SharedWizardFooter,
    SharedWizardSidebarTitle,
    WizardProduct
} from "./shared-wizard-components";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface Variant {
    sku_suffix: string;
    variant_name: string;
    option_name: string;
    option_value: string;
    pylon_sku: string;
}

interface ProductData {
    sku: string;
    status: string;
    enrichment_message?: string;
    name: string;
    pylon_data?: {
        name: string;
        price_retail: number;
        stock_quantity: number;
        active: boolean;
    };
    ai_data?: {
        title_el?: string;
        description?: string;
        description_el?: string;
        category?: string;
        tags?: string[];
        variants?: Variant[];
        technical_specs?: Record<string, any>;
        attributes?: Record<string, any>;
    };
}

interface MetadataStepProps {
    products: ProductData[];
    onStartScan: () => void;
    onRetry?: (sku: string) => void;
    onComplete: (updatedProducts: ProductData[]) => void;
}

export function MetadataStep({ products, onStartScan, onRetry, onComplete }: MetadataStepProps) {
    const [localProducts, setLocalProducts] = useState(products);
    const [activeIndex, setActiveIndex] = useState(0);

    // Memoize the storage key based on SKUs to avoid cross-batch contamination
    const storageKey = `wizard_metadata_draft_${products.map(p => p.sku).sort().join(",")}`;

    // Load draft on mount or update localProducts when props change
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                const draftSkus = draft.map((p: any) => p.sku).sort().join(",");
                const propSkus = products.map(p => p.sku).sort().join(",");

                if (draftSkus === propSkus) {
                    // Update the draft with any NEW real-time data from Firestore (ai_data)
                    const merged = draft.map((dp: any) => {
                        const pp = products.find(p => p.sku === dp.sku);
                        if (!pp) return dp;

                        const newAiData = { ...(dp.ai_data || {}) };
                        let hasChanges = false;

                        // Merge missing fields from pp.ai_data into newAiData
                        if (pp.ai_data) {
                            Object.entries(pp.ai_data).forEach(([key, value]) => {
                                if (value && (!newAiData[key] || (Array.isArray(value) && value.length > 0 && (!newAiData[key] || newAiData[key].length === 0)))) {
                                    newAiData[key] = value;
                                    hasChanges = true;
                                }
                            });
                        }

                        if (hasChanges || pp.status !== dp.status || pp.enrichment_message !== dp.enrichment_message) {
                            return {
                                ...dp,
                                ai_data: newAiData,
                                status: pp.status,
                                enrichment_message: pp.enrichment_message
                            };
                        }
                        return dp;
                    });
                    setLocalProducts(merged);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse metadata draft", e);
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
    const isScanning = products.some(p => p.status === 'PENDING_METADATA');
    const hasFailures = products.some(p => p.status === 'ENRICHMENT_FAILED');
    const hasResults = products.some(p => p.ai_data?.title_el || p.status === 'PENDING_METADATA_REVIEW');

    const updateProduct = (sku: string, updates: any) => {
        setLocalProducts(prev => prev.map(p =>
            p.sku === sku ? { ...p, ai_data: { ...p.ai_data, ...updates } } : p
        ));
    };

    const addVariant = () => {
        const newVariant: Variant = {
            sku_suffix: "",
            variant_name: "",
            option_name: "Color",
            option_value: "",
            pylon_sku: activeProduct.sku
        };
        updateProduct(activeProduct.sku, {
            variants: [...(activeProduct.ai_data?.variants || []), newVariant]
        });
    };

    const removeVariant = (index: number) => {
        const variants = [...(activeProduct.ai_data?.variants || [])];
        variants.splice(index, 1);
        updateProduct(activeProduct.sku, { variants });
    };

    // Sidebar Content
    const sidebarList = (
        <TooltipProvider>
            <div className="flex flex-col gap-1 px-2">
                {localProducts.map((p, idx) => (
                    <WizardSidebarItem
                        key={p.sku}
                        product={p as unknown as WizardProduct}
                        isActive={activeIndex === idx}
                        onClick={() => setActiveIndex(idx)}
                        statusIndicator={
                            p.status === 'PENDING_METADATA' ? (
                                <><Loader2 className="w-2.5 h-2.5 animate-spin text-indigo-500" /> Scanning...</>
                            ) : p.status === 'ENRICHMENT_FAILED' ? (
                                <><div className="w-2 h-2 rounded-full bg-red-500" /> Scan Failed</>
                            ) : p.ai_data?.title_el ? (
                                <><Check className="w-2.5 h-2.5 text-green-500" /> Catalog Found</>
                            ) : p.enrichment_message ? (
                                <span className="text-orange-400 truncate max-w-[100px]">{p.enrichment_message}</span>
                            ) : "Pending Discovery"
                        }
                    />
                ))}
            </div>
        </TooltipProvider>
    );

    // Main Content
    const mainContent = !hasResults && !isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-indigo-50/50">
                <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Initialize AI Discovery</h2>
            <p className="text-gray-500 max-w-md mb-8 text-base">
                The AI will scan official catalogs for technical specs,
                Greek translations, and discover hidden variants (colors/sizes).
            </p>
            <Button
                onClick={onStartScan}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-xl shadow-indigo-200 transition-all transform hover:scale-105"
            >
                <Wand2 className="w-4 h-4 mr-2" />
                Run AI Batch Scan
            </Button>
        </div>
    ) : isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Scanning Catalogs...</h2>
            <p className="text-gray-500 max-w-sm text-sm">
                Gemini 3 is currently analyzing product families for your batch.
                Results will appear here in seconds.
            </p>
        </div>
    ) : activeProduct ? (
        <div className="p-8 space-y-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            {(activeProduct.status === 'ENRICHMENT_FAILED' || activeProduct.enrichment_message) && !activeProduct.ai_data?.title_el && (
                <div className={cn(
                    "p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium shadow-sm border",
                    activeProduct.status === 'ENRICHMENT_FAILED'
                        ? "bg-red-50 border-red-100 text-red-800"
                        : "bg-orange-50 border-orange-100 text-orange-800"
                )}>
                    <div className="flex items-center gap-3">
                        {activeProduct.status === 'ENRICHMENT_FAILED' ? <Layers className="w-4 h-4 text-red-500" /> : <Sparkles className="w-4 h-4 text-orange-500" />}
                        {activeProduct.enrichment_message || (activeProduct.status === 'ENRICHMENT_FAILED' ? "Enrichment failed for this product." : "")}
                    </div>
                    {activeProduct.status === 'ENRICHMENT_FAILED' && onRetry && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRetry(activeProduct.sku)}
                            className="bg-white border-red-200 text-red-600 hover:bg-red-50 h-8 font-bold"
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-2" />
                            Retry Scan
                        </Button>
                    )}
                </div>
            )}

            <div className="flex gap-8 items-start">
                <div className="flex-1 space-y-6">
                    {/* Title & Category form */}
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Greek Title</Label>
                            <Input
                                className="font-medium text-lg h-12 md:text-lg bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                                value={activeProduct.ai_data?.title_el || ""}
                                onChange={(e) => updateProduct(activeProduct.sku, { title_el: e.target.value })}
                                placeholder="Product Title"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</Label>
                            <Input
                                className="bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                                value={activeProduct.ai_data?.category || ""}
                                onChange={(e) => updateProduct(activeProduct.sku, { category: e.target.value })}
                                placeholder="Category"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Greek Description</Label>
                        <Textarea
                            rows={6}
                            className="resize-none bg-gray-50/50 focus:bg-white transition-all shadow-sm text-sm leading-relaxed"
                            value={activeProduct.ai_data?.description_el || ""}
                            onChange={(e) => updateProduct(activeProduct.sku, { description_el: e.target.value })}
                            placeholder="Product description in Greek..."
                        />
                    </div>

                    {/* Technical Specifications */}
                    {activeProduct.ai_data?.technical_specs && (
                        <div className="grid gap-4 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Wand2 className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Technical Specifications</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                {(() => {
                                    const preferredOrder = [
                                        "drying_time", "surface_suitability",
                                        "durability_features", "finish",
                                        "coverage", "application",
                                        "environment"
                                    ];

                                    const specs = activeProduct.ai_data?.technical_specs || {};
                                    const entries = Object.entries(specs).filter(([_, v]) => v !== null && v !== undefined);

                                    // Sort entries based on preferredOrder. Keys not in preferredOrder go to the end.
                                    entries.sort(([a], [b]) => {
                                        const indexA = preferredOrder.indexOf(a);
                                        const indexB = preferredOrder.indexOf(b);
                                        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                                        if (indexA === -1) return 1;
                                        if (indexB === -1) return -1;
                                        return indexA - indexB;
                                    });

                                    return entries.map(([key, value]) => {
                                        const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
                                        const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                        return (
                                            <div key={key} className="grid gap-1.5">
                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{displayKey}</Label>
                                                <Input
                                                    className="h-9 text-xs bg-white/80 focus:bg-white border-gray-100"
                                                    value={displayValue}
                                                    onChange={(e) => {
                                                        const newSpecs = { ...activeProduct.ai_data?.technical_specs, [key]: e.target.value };
                                                        updateProduct(activeProduct.sku, { technical_specs: newSpecs });
                                                    }}
                                                />
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Variants & Tags */}
                <div className="w-[350px] space-y-6 flex-shrink-0">
                    <Card className="shadow-sm">
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                    Variants
                                </Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={addVariant}
                                    className="h-6 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add
                                </Button>
                            </div>

                            <ScrollArea className="h-[200px] pr-3 -mr-3">
                                <div className="space-y-2">
                                    {activeProduct.ai_data?.variants?.map((v, vIdx) => (
                                        <div key={vIdx} className="flex gap-2 items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group">
                                            <Input
                                                placeholder="Suffix"
                                                className="w-16 h-7 px-2 text-[10px] font-mono uppercase bg-white border-gray-200"
                                                value={v.sku_suffix}
                                                onChange={(e) => {
                                                    const variants = [...(activeProduct.ai_data?.variants || [])];
                                                    variants[vIdx].sku_suffix = e.target.value.toUpperCase();
                                                    updateProduct(activeProduct.sku, { variants });
                                                }}
                                            />
                                            <Input
                                                placeholder="Value"
                                                className="flex-1 h-7 px-2 text-xs font-medium bg-white border-gray-200"
                                                value={v.option_value}
                                                onChange={(e) => {
                                                    const variants = [...(activeProduct.ai_data?.variants || [])];
                                                    variants[vIdx].option_value = e.target.value;
                                                    variants[vIdx].variant_name = `Color: ${e.target.value}`;
                                                    updateProduct(activeProduct.sku, { variants });
                                                }}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeVariant(vIdx)}
                                                className="h-7 w-7 text-gray-300 hover:text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!activeProduct.ai_data?.variants || activeProduct.ai_data.variants.length === 0) && (
                                        <div className="text-xs text-gray-400 italic text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50/30">
                                            No variants detected.
                                            <br />
                                            Add one manually.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Additional Attributes Card */}
                    {activeProduct.ai_data?.attributes && Object.keys(activeProduct.ai_data.attributes).length > 0 && (
                        <Card className="shadow-sm border-orange-100 bg-orange-50/10">
                            <CardContent className="p-4 space-y-4">
                                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5 text-orange-400" />
                                    Product Attributes
                                </Label>
                                <div className="space-y-3">
                                    {Object.entries(activeProduct.ai_data.attributes).map(([key, value]) => (
                                        <div key={key} className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <Input
                                                className="h-8 text-xs bg-white border-orange-100/50"
                                                value={String(value)}
                                                onChange={(e) => {
                                                    const attrs = { ...activeProduct.ai_data?.attributes, [key]: e.target.value };
                                                    updateProduct(activeProduct.sku, { attributes: attrs });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="shadow-sm">
                        <CardContent className="p-4 space-y-4">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 text-gray-400" />
                                Smart Tags
                            </Label>
                            <div className="flex flex-wrap gap-2 content-start bg-gray-50/30 p-3 rounded-lg border border-gray-100 min-h-[100px]">
                                {activeProduct.ai_data?.tags?.map((tag, tIdx) => (
                                    <Badge key={tIdx} variant="secondary" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 gap-1 pr-1 shadow-sm">
                                        {tag}
                                        <button
                                            onClick={() => {
                                                const tags = activeProduct.ai_data?.tags?.filter((_, i) => i !== tIdx);
                                                updateProduct(activeProduct.sku, { tags });
                                            }}
                                            className="hover:text-red-500 rounded-full p-0.5 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                                <Button variant="outline" size="sm" className="h-6 text-[10px] bg-white border-gray-200 border-dashed text-gray-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50">
                                    + Add Tag
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    ) : null;

    // Footer Actions
    const footerActions = activeProduct ? (
        <SharedWizardFooter
            isSaving={true}
            rightContent={
                <div className="flex gap-3">
                    {(hasResults || hasFailures) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onStartScan}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold"
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-2" />
                            {hasFailures ? "Retry Failed" : "Re-run Scan"}
                        </Button>
                    )}
                    <Button
                        onClick={handleComplete}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-100 transition-all transform hover:scale-105"
                    >
                        Approve & Next Step
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            }
        />
    ) : null;

    const sidebarTitle = <SharedWizardSidebarTitle count={localProducts.length} />;

    const headerContent = activeProduct && (
        <SharedWizardHeader
            title={activeProduct.ai_data?.title_el || activeProduct.pylon_data?.name || activeProduct.name || activeProduct.sku}
            phaseLabel="Phase 1 / Metadata Editor"
            icon={Sparkles}
            onPrev={() => setActiveIndex(prev => Math.max(0, prev - 1))}
            onNext={() => setActiveIndex(prev => Math.min(localProducts.length - 1, prev + 1))}
            prevDisabled={activeIndex === 0}
            nextDisabled={activeIndex === localProducts.length - 1}
        />
    );

    return (
        <WizardLayout
            sidebarList={sidebarList}
            mainContent={mainContent}
            footerActions={activeProduct ? footerActions : undefined}
            sidebarTitle={sidebarTitle}
            headerContent={headerContent}
        />
    );
}
