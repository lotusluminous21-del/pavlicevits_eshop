"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CatalogueUploader } from "@/components/admin/catalogue-uploader";
import { IngestionStatus } from "@/components/admin/ingestion-status";
import { Check, Loader2, Sparkles, Trash2 } from "lucide-react";

// Types
interface StagingProduct {
    sku: string;
    status: string;
    enrichment_message?: string;
    pylon_data: {
        name: string;
        stock_quantity: number;
        price_retail: number;
    };
    ai_data?: {
        description?: string;
        description_el?: string;
        confidence_score?: number;
        images?: any[];
    };
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<StagingProduct[]>([]);
    const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    // Listen to staging_products
    useEffect(() => {
        if (!db) return;

        const q = query(collection(db, "staging_products"), orderBy("updated_at", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: StagingProduct[] = [];
            snapshot.forEach((doc) => items.push(doc.data() as StagingProduct));
            setProducts(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleSku = (sku: string) => {
        const next = new Set(selectedSkus);
        if (next.has(sku)) next.delete(sku);
        else next.add(sku);
        setSelectedSkus(next);
    };

    const toggleAll = () => {
        if (selectedSkus.size === products.length && products.length > 0) {
            setSelectedSkus(new Set());
        } else {
            setSelectedSkus(new Set(products.map(p => p.sku)));
        }
    };

    const handleBulkEnrich = async () => {
        if (selectedSkus.size === 0) return;
        setIsProcessing(true);
        try {
            const batch = writeBatch(db!);
            selectedSkus.forEach(sku => {
                const docRef = doc(db!, "staging_products", sku);
                batch.update(docRef, {
                    status: "PENDING_ENRICHMENT",
                    enrichment_message: "Queued for AI enrichment..."
                });
            });
            await batch.commit();
            setSelectedSkus(new Set());
        } catch (e) {
            console.error(e);
            alert("Bulk enrich failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedSkus.size === 0) return;
        if (!confirm(`Delete ${selectedSkus.size} products from staging?`)) return;

        setIsProcessing(true);
        try {
            const batch = writeBatch(db!);
            selectedSkus.forEach(sku => {
                batch.delete(doc(db!, "staging_products", sku));
            });
            await batch.commit();
            setSelectedSkus(new Set());
        } catch (e) {
            console.error(e);
            alert("Bulk delete failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearAll = async () => {
        if (products.length === 0) return;
        if (!confirm("Are you sure you want to delete ALL products from staging? This cannot be undone.")) return;

        setIsProcessing(true);
        try {
            // Firestore batches have a limit of 500 operations
            const batchSize = 400;
            const skus = products.map(p => p.sku);

            for (let i = 0; i < skus.length; i += batchSize) {
                const batch = writeBatch(db!);
                const chunk = skus.slice(i, i + batchSize);
                chunk.forEach(sku => {
                    batch.delete(doc(db!, "staging_products", sku));
                });
                await batch.commit();
            }
            setSelectedSkus(new Set());
        } catch (e) {
            console.error(e);
            alert("Clear all failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (sku: string) => {
        if (!confirm("Delete this product from staging?")) return;
        if (db) await deleteDoc(doc(db, "staging_products", sku));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staging Product Manager</h1>
                    <p className="text-gray-500 mt-1">Review and approve products before they go live on Shopify.</p>
                </div>
                {products.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Clear All
                    </button>
                )}
            </div>

            <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Catalogue Ingestion</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <CatalogueUploader />
                    <IngestionStatus />
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedSkus.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-gray-200 rounded-full px-6 py-3 flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <span className="text-sm font-semibold text-gray-700">{selectedSkus.size} products selected</span>
                    <div className="h-6 w-px bg-gray-200" />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push(`/admin/products/wizard?skus=${Array.from(selectedSkus).join(",")}`)}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-bold transition-all disabled:opacity-50"
                        >
                            <Sparkles className="w-4 h-4" />
                            Launch Enrichment Wizard
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full text-sm font-bold transition-all disabled:opacity-50 border border-red-200"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete Selected
                        </button>
                    </div>
                    <button
                        onClick={() => setSelectedSkus(new Set())}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 w-4 text-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                                    checked={products.length > 0 && selectedSkus.size === products.length}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">AI Attributes</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {products.map((p) => {
                            const isSelected = selectedSkus.has(p.sku);
                            const isEnriching = p.status === 'ENRICHING' || p.status === 'PENDING_ENRICHMENT';

                            return (
                                <tr key={p.sku} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                                            checked={isSelected}
                                            onChange={() => toggleSku(p.sku)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{p.pylon_data.name}</div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-mono">SKU: {p.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2.5 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full w-fit uppercase
                                                ${p.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    p.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' :
                                                        isEnriching ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                                                            p.status === 'ENRICHMENT_FAILED' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-600'}`}>
                                                {p.status.replace(/_/g, " ")}
                                            </span>
                                            {p.enrichment_message && (
                                                <span className="text-[10px] text-gray-500 italic flex items-center gap-1">
                                                    {isEnriching && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                                                    {p.enrichment_message}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-4">
                                            {p.ai_data?.confidence_score ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full",
                                                                p.ai_data.confidence_score > 0.8 ? "bg-green-500" : "bg-amber-500"
                                                            )}
                                                            style={{ width: `${(p.ai_data.confidence_score * 100).toFixed(0)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-medium text-gray-900 text-xs">{(p.ai_data.confidence_score * 100).toFixed(0)}%</span>
                                                </div>
                                            ) : <span className="text-gray-300 text-xs">-</span>}

                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase">
                                                {p.ai_data?.images ? p.ai_data.images.length : 0} Images
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/admin/products/${p.sku}`} className="text-indigo-600 hover:text-indigo-900 font-bold border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                                                Review
                                            </Link>
                                            <button onClick={() => handleDelete(p.sku)} className="text-gray-300 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {products.length === 0 && !loading && (
                    <div className="text-center py-20 bg-gray-50/50">
                        <p className="text-gray-400 font-medium">No products in staging.</p>
                        <p className="text-gray-300 text-sm mt-1">Upload a catalogue to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
