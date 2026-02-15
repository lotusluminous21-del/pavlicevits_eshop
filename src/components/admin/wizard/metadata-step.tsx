"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check, ChevronRight, ChevronLeft, Plus, Trash2, Tag, Layers, Loader2, Wand2 } from "lucide-react";
import { WizardLayout } from "./wizard-layout";

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
    ai_data?: {
        title_el?: string;
        description?: string;
        description_el?: string;
        category?: string;
        tags?: string[];
        variants?: Variant[];
    };
}

interface MetadataStepProps {
    products: ProductData[];
    onStartScan: () => void;
    onComplete: (updatedProducts: ProductData[]) => void;
}

export function MetadataStep({ products, onStartScan, onComplete }: MetadataStepProps) {
    const [localProducts, setLocalProducts] = useState(products);
    const [activeIndex, setActiveIndex] = useState(0);

    // Memoize the storage key based on SKUs to avoid cross-batch contamination
    const storageKey = `wizard_metadata_draft_${products.map(p => p.sku).sort().join(",")}`;

    // Load draft on mount
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                // Basic validation: ensure the draft has the same SKUs as the props
                const draftSkus = draft.map((p: any) => p.sku).sort().join(",");
                const propSkus = products.map(p => p.sku).sort().join(",");

                if (draftSkus === propSkus) {
                    setLocalProducts(draft);
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
        <div className="flex flex-col gap-1 p-2">
            {localProducts.map((p, idx) => (
                <button
                    key={p.sku}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-full p-3 text-left transition-all rounded-xl flex items-center justify-between group ${activeIndex === idx ? "bg-white shadow-sm ring-1 ring-inset ring-indigo-100" : "hover:bg-gray-100/50 text-gray-600"
                        }`}
                >
                    <div className="truncate pr-2">
                        <div className={`text-sm font-bold truncate ${activeIndex === idx ? "text-indigo-600" : "text-gray-700"}`}>
                            {p.ai_data?.title_el || p.name || p.sku}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider flex items-center gap-2">
                            {p.status === 'PENDING_METADATA' ? (
                                <><Loader2 className="w-2 h-2 animate-spin" /> {p.enrichment_message || "Scanning..."}</>
                            ) : p.ai_data?.title_el ? (
                                <Check className="w-2.5 h-2.5 text-green-500" />
                            ) : p.enrichment_message ? (
                                <span className="text-orange-400">{p.enrichment_message}</span>
                            ) : "Ready"}
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );

    // Main Content
    const mainContent = !hasResults && !isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Initialize AI Discovery</h2>
            <p className="text-gray-500 max-w-sm mb-8 text-sm">
                The AI will scan official catalogs for technical specs,
                Greek translations, and discover hidden variants (colors/sizes).
            </p>
            <button
                onClick={onStartScan}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all transform hover:scale-105"
            >
                <Wand2 className="w-4 h-4" />
                Run AI Batch Scan
            </button>
        </div>
    ) : isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Scanning Catalogs...</h2>
            <p className="text-gray-500 max-w-sm text-sm">
                Gemini 3 is currently analyzing product families for your batch.
                Results will appear here in seconds.
            </p>
        </div>
    ) : activeProduct ? (
        <div className="p-8 space-y-6 max-w-5xl mx-auto">
            {activeProduct.enrichment_message && !activeProduct.ai_data?.title_el && (
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-center gap-3 text-orange-700 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    {activeProduct.enrichment_message}
                </div>
            )}

            {/* Title & Category Row */}
            <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Greek Title</label>
                    <input
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
                        value={activeProduct.ai_data?.title_el || ""}
                        onChange={(e) => updateProduct(activeProduct.sku, { title_el: e.target.value })}
                        placeholder="Product Title"
                    />
                </div>
                <div className="w-1/3 space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category</label>
                    <input
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
                        value={activeProduct.ai_data?.category || ""}
                        onChange={(e) => updateProduct(activeProduct.sku, { category: e.target.value })}
                        placeholder="Category"
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Greek Description</label>
                <textarea
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm leading-relaxed resize-none"
                    value={activeProduct.ai_data?.description_el || ""}
                    onChange={(e) => updateProduct(activeProduct.sku, { description_el: e.target.value })}
                    placeholder="Product description in Greek..."
                />
            </div>

            {/* Two Column Layout for Variants and Tags */}
            <div className="grid grid-cols-2 gap-6">
                {/* Variants Discovery */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            Discovered Variants
                        </label>
                        <button
                            onClick={addVariant}
                            className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
                        >
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {activeProduct.ai_data?.variants?.map((v, vIdx) => (
                            <div key={vIdx} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                <input
                                    placeholder="Suffix"
                                    className="w-16 px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-mono uppercase focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={v.sku_suffix}
                                    onChange={(e) => {
                                        const variants = [...(activeProduct.ai_data?.variants || [])];
                                        variants[vIdx].sku_suffix = e.target.value.toUpperCase();
                                        updateProduct(activeProduct.sku, { variants });
                                    }}
                                />
                                <input
                                    placeholder="Value (e.g. Red)"
                                    className="flex-1 px-2 py-1 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                                    value={v.option_value}
                                    onChange={(e) => {
                                        const variants = [...(activeProduct.ai_data?.variants || [])];
                                        variants[vIdx].option_value = e.target.value;
                                        variants[vIdx].variant_name = `Color: ${e.target.value}`;
                                        updateProduct(activeProduct.sku, { variants });
                                    }}
                                />
                                <button onClick={() => removeVariant(vIdx)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        {(!activeProduct.ai_data?.variants || activeProduct.ai_data.variants.length === 0) && (
                            <div className="text-xs text-gray-400 italic text-center py-4 border border-dashed border-gray-200 rounded-lg">
                                No variants detected.
                            </div>
                        )}
                    </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-3 h-3 text-gray-400" />
                        Tags
                    </label>
                    <div className="flex flex-wrap gap-2 content-start bg-gray-50/50 p-3 rounded-lg border border-gray-100 min-h-[100px]">
                        {activeProduct.ai_data?.tags?.map((tag, tIdx) => (
                            <span key={tIdx} className="bg-white border border-gray-200 px-2 py-1 rounded text-[10px] font-bold text-gray-600 flex items-center gap-1 group shadow-sm">
                                {tag}
                                <button
                                    onClick={() => {
                                        const tags = activeProduct.ai_data?.tags?.filter((_, i) => i !== tIdx);
                                        updateProduct(activeProduct.sku, { tags });
                                    }}
                                    className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-2.5 h-2.5" />
                                </button>
                            </span>
                        ))}
                        <button className="border border-dashed border-gray-300 px-2 py-1 rounded text-[10px] font-bold text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-all">
                            + Add Tag
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : null;

    // Footer Actions
    const footerActions = activeProduct ? (
        <>
            <span className="text-xs text-gray-400 italic">Auto-saving local changes...</span>
            <div className="flex gap-3">
                <button
                    onClick={onStartScan}
                    className="px-4 py-2 rounded-full font-bold text-xs text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                    Re-run Scan
                </button>
                <button
                    onClick={handleComplete}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-bold text-xs shadow-lg shadow-indigo-100 transition-all transform hover:scale-105"
                >
                    Approve & Move to Images
                </button>
            </div>
        </>
    ) : null;

    const sidebarTitle = (
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-indigo-600" />
                Bundle Items
            </h3>
            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500">{localProducts.length}</span>
        </div>
    );

    const headerContent = activeProduct && (
        <div className="px-6 py-3 flex justify-between items-center bg-white">
            <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Phase 1 / Editor</span>
                <h2 className="text-lg font-bold text-gray-900 mt-1 truncate max-w-md">{activeProduct.ai_data?.title_el || activeProduct.name || activeProduct.sku}</h2>
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
        <WizardLayout
            sidebarList={sidebarList}
            mainContent={mainContent}
            footerActions={activeProduct ? footerActions : undefined}
            sidebarTitle={sidebarTitle}
            headerContent={headerContent}
        />
    );
}

