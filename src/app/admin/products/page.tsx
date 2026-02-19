"use client";

import { useEffect, useState, Suspense } from "react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { CatalogueUploader } from "@/components/admin/catalogue-uploader";
import { publishProductAction } from "@/app/actions/publish-product";
import {
    Search,
    Globe,
    ExternalLink,
    Settings2,
    LayoutGrid,
    ListFilter,
    Loader2,
    Wand2,
    Eye,
    Rocket,
    CheckCircle2,
    AlertCircle,
    Plus,
    Sparkles,
    Trash2,
    ChevronRight,
    ArrowRight,
    MousePointer2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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

// Types
interface StagingProduct {
    sku: string;
    status: string;
    pylon_data: {
        name: string;
        price_retail: number;
    };
    ai_data?: {
        title_el?: string;
        description_el?: string;
        images?: Array<{ url: string }>;
        generated_images?: Record<string, string>;
        selected_images?: Record<string, string>;
    };
    shopify_product_id?: string;
    shopify_handle?: string;
}

function StagingAreaContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<StagingProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [showUploader, setShowUploader] = useState(false);

    // Listen to ALL staging products
    useEffect(() => {
        if (!db) return;

        const q = query(
            collection(db, "staging_products"),
            orderBy("updated_at", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: StagingProduct[] = [];
            snapshot.forEach((doc) => items.push(doc.data() as StagingProduct));
            setProducts(items);
            setLoading(false);
        }, (err) => {
            console.error("Firestore Listen Error:", err);
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

    const handleBulkDelete = async () => {
        if (selectedSkus.size === 0) return;
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

    const handleBulkPublish = async () => {
        if (selectedSkus.size === 0) return;
        setIsProcessing(true);
        let successCount = 0;
        let failCount = 0;

        try {
            for (const sku of Array.from(selectedSkus)) {
                const product = products.find(p => p.sku === sku);
                if (!product) continue;

                const result = await publishProductAction(sku, product);
                if (result.success) {
                    const docRef = doc(db!, "staging_products", sku);
                    await writeBatch(db!).update(docRef, {
                        shopify_product_id: result.shopifyId,
                        shopify_handle: result.handle,
                        published_at: new Date().toISOString(),
                        status: 'APPROVED'
                    }).commit();
                    successCount++;
                } else {
                    failCount++;
                }
            }
            alert(`Publish complete. Success: ${successCount}, Failed: ${failCount}`);
            setSelectedSkus(new Set());
        } catch (e) {
            console.error(e);
            alert("Bulk publish encountered an error.");
        } finally {
            setIsProcessing(false);
        }
    };

    const ReadinessTracker = ({ product }: { product: StagingProduct }) => {
        const hasMetadata = product.status !== 'IMPORTED' && product.status !== 'PENDING_METADATA';
        const hasImages = !!product.ai_data?.selected_images?.base;
        const hasStudio = !!product.ai_data?.generated_images?.base;
        const isApproved = product.status === 'APPROVED' || !!product.shopify_product_id;

        return (
            <div className="flex items-center gap-1">
                <TooltipProvider>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <div className={cn("w-1.5 h-1.5 rounded-full", hasMetadata ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" : "bg-gray-200")} />
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px] font-bold">Metadata</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <div className={cn("w-1.5 h-1.5 rounded-full", hasImages ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" : "bg-gray-200")} />
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px] font-bold">Images</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <div className={cn("w-1.5 h-1.5 rounded-full", hasStudio ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-gray-200")} />
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px] font-bold">Studio</TooltipContent>
                    </Tooltip>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <div className={cn("w-1.5 h-1.5 rounded-full", isApproved ? "bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.3)]" : "bg-gray-200")} />
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px] font-bold">Ready</TooltipContent>
                    </Tooltip>
                    {product.shopify_product_id && (
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <div className="w-1.5 h-1.5 rounded-full bg-black ring-1 ring-white" />
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px] font-bold">Published</TooltipContent>
                        </Tooltip>
                    )}
                </TooltipProvider>
            </div>
        );
    };

    const filteredProducts = products.filter(p =>
        p.pylon_data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ai_data?.title_el?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectMacro = (type: 'all' | 'ready' | 'issues' | 'none') => {
        if (type === 'none') {
            setSelectedSkus(new Set());
            return;
        }

        const next = new Set<string>();
        filteredProducts.forEach(p => {
            if (type === 'all') next.add(p.sku);
            if (type === 'ready' && (p.status === 'APPROVED' || p.shopify_product_id)) next.add(p.sku);
            if (type === 'issues' && p.status === 'ENRICHMENT_FAILED') next.add(p.sku);
        });
        setSelectedSkus(next);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-48">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-black px-2 py-0 uppercase text-[9px] tracking-[0.2em]">
                            Unified Staging Gallery
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-gray-900">Product Lab</h1>
                    <p className="text-gray-500 text-lg font-medium max-w-lg leading-relaxed">Refine, enrich, and deploy your inventory from a single visual hub.</p>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Macro Controls */}
                    <div className="bg-gray-100/50 p-1 rounded-2xl flex items-center gap-1 border border-gray-100 shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectMacro('all')}
                            className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-xl hover:bg-white hover:shadow-sm"
                        >
                            All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectMacro('ready')}
                            className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-xl hover:bg-white hover:shadow-sm text-emerald-600"
                        >
                            Ready
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectMacro('issues')}
                            className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-xl hover:bg-white hover:shadow-sm text-red-600"
                        >
                            Issues
                        </Button>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectMacro('none')}
                            className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-xl hover:bg-white hover:shadow-sm text-gray-400"
                        >
                            None
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 w-full md:w-[300px] h-12 border-gray-100 focus:ring-indigo-500 rounded-2xl text-sm bg-white shadow-sm transition-all focus:bg-white font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant={showUploader ? "secondary" : "default"}
                            onClick={() => setShowUploader(!showUploader)}
                            className="font-black rounded-2xl h-12 px-6 shadow-xl shadow-indigo-100 transition-all active:scale-95 uppercase tracking-widest text-[10px] gap-2"
                        >
                            {showUploader ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showUploader ? "Cancel" : "Import"}
                        </Button>
                    </div>
                </div>
            </div>

            {showUploader && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                    <CatalogueUploader />
                </div>
            )}

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <span className="font-bold uppercase tracking-widest text-xs">Awaiting Products...</span>
                </div>
            ) : filteredProducts.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 rounded-[2.5rem]">
                    <CardContent className="h-96 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
                            <LayoutGrid className="w-10 h-10 text-gray-200" />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 text-xl tracking-tight">Your lab is empty</p>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1 font-medium italic">Upload a CSV or PDF to begin generating store-ready products.</p>
                        </div>
                        <Button
                            className="font-black rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-12 px-10 shadow-lg shadow-indigo-100 uppercase tracking-widest text-[10px]"
                            onClick={() => setShowUploader(true)}
                        >
                            Start First Import
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                    {filteredProducts.map((p) => {
                        const isSelected = selectedSkus.has(p.sku);
                        const isPublished = !!p.shopify_product_id;

                        return (
                            <div
                                key={p.sku}
                                className="group relative cursor-pointer"
                                onClick={(e) => {
                                    if (e.ctrlKey || e.metaKey) {
                                        toggleSku(p.sku);
                                    } else {
                                        router.push(`/admin/products/${p.sku}`);
                                    }
                                }}
                            >
                                <div
                                    className={cn(
                                        "relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-sm transition-all duration-700 border-2",
                                        isSelected ? "border-indigo-600 ring-[12px] ring-indigo-50" : "border-gray-100 group-hover:shadow-2xl group-hover:border-indigo-100"
                                    )}
                                >
                                    {/* Selection Overlay / Toggle */}
                                    <div
                                        className={cn(
                                            "absolute top-6 right-6 z-20 w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center",
                                            isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white/80 border-gray-200 border-dashed opacity-0 group-hover:opacity-100"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent navigation
                                            toggleSku(p.sku);
                                        }}
                                    >
                                        {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <MousePointer2 className="w-4 h-4 text-gray-400" />}
                                    </div>

                                    {/* Image Logic */}
                                    {(p.ai_data?.selected_images?.base || p.ai_data?.generated_images?.base || p.ai_data?.images?.[0]?.url) ? (
                                        <img
                                            src={p.ai_data?.generated_images?.base || p.ai_data?.selected_images?.base || p.ai_data?.images?.[0]?.url}
                                            alt={p.ai_data?.title_el || p.pylon_data.name}
                                            className={cn(
                                                "w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-1000",
                                                isPublished ? "opacity-60 grayscale-[0.3]" : ""
                                            )}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 text-gray-300 group-hover:bg-indigo-50/30 transition-colors">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center mb-4 shadow-sm border border-gray-100/50">
                                                <Settings2 className="w-8 h-8 opacity-10" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">No Hero Visual</span>
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-6 left-6 flex flex-col gap-2 z-10 pointer-events-none">
                                        <Badge className="bg-white/90 backdrop-blur-md text-gray-900 border-0 font-black text-[9px] shadow-sm uppercase px-2.5 py-1 tracking-widest">
                                            {p.sku}
                                        </Badge>
                                        {isPublished && (
                                            <Badge className="bg-black text-white border-0 font-black text-[9px] shadow-sm uppercase px-2.5 py-1 flex items-center gap-1.5 tracking-tighter">
                                                <Globe className="w-3 h-3" /> Live
                                            </Badge>
                                        )}
                                        {p.status === 'ENRICHMENT_FAILED' && (
                                            <Badge variant="destructive" className="border-0 font-black text-[9px] shadow-sm uppercase px-2.5 py-1 flex items-center gap-1.5 tracking-tighter">
                                                <AlertCircle className="w-3 h-3" /> Issue
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Info Area */}
                                <div className="mt-6 px-2">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h3 className="font-black text-gray-900 leading-tight text-base line-clamp-3 flex-1 group-hover:text-indigo-600 transition-colors">
                                            {p.ai_data?.title_el || p.pylon_data.name}
                                        </h3>
                                        <span className="font-black text-gray-900 text-lg italic tracking-tighter shrink-0">
                                            €{(p.pylon_data.price_retail || 0).toFixed(0)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <ReadinessTracker product={p} />
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="w-3 h-3" /> Details
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Floating Bulk Action Bar */}
            {selectedSkus.size > 0 && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-gray-950/95 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2rem] px-10 py-6 flex items-center gap-10 z-[100] animate-in fade-in slide-in-from-bottom-12 duration-700 ring-1 ring-white/10 backdrop-blur-3xl">
                    <div className="flex items-center gap-5">
                        <div className="bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-xl shadow-indigo-500/30">
                            {selectedSkus.size}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Batch Selection</span>
                            <span className="text-[10px] font-bold text-gray-500">Apply lab actions to staging</span>
                        </div>
                    </div>

                    <div className="w-px h-12 bg-gray-800" />

                    <div className="flex items-center gap-4">
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-500 text-white h-12 text-[11px] font-black uppercase tracking-[0.2em] px-10 shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 rounded-2xl gap-3"
                            onClick={() => router.push(`/admin/products/wizard?skus=${Array.from(selectedSkus).join(",")}`)}
                            disabled={isProcessing}
                        >
                            <Sparkles className="w-4 h-4" />
                            Enrich
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-[11px] font-black uppercase tracking-[0.2em] px-10 shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 rounded-2xl gap-3"
                                    disabled={isProcessing}
                                >
                                    <Rocket className="w-4 h-4" />
                                    Publish
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-3xl font-black tracking-tight">Deploy to Shopify?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-500 text-lg font-medium leading-relaxed mt-4">
                                        You are about to launch <span className="text-indigo-600 font-black">{selectedSkus.size} products</span> directly into production. This action will sync all metadata and visuals.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-10 gap-4">
                                    <AlertDialogCancel className="h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest border-gray-100 hover:bg-gray-50 bg-white px-8">No, Review First</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleBulkPublish}
                                        className="h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white px-10 shadow-xl shadow-emerald-100"
                                    >
                                        Yes, Deploy Now
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button
                            variant="outline"
                            className="bg-transparent border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white h-12 text-[11px] font-black uppercase tracking-[0.2em] px-8 transition-all active:scale-95 rounded-2xl gap-3"
                            onClick={handleBulkDelete}
                            disabled={isProcessing}
                        >
                            <Trash2 className="w-4 h-4" />
                            Purge
                        </Button>
                    </div>

                    <div className="w-px h-12 bg-gray-800" />

                    <button
                        onClick={() => setSelectedSkus(new Set())}
                        className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors px-2"
                    >
                        Dismiss
                    </button>
                </div>
            )}
        </div>
    );
}

export default function AdminStagingAreaPage() {
    return (
        <Suspense fallback={
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <span className="font-bold uppercase tracking-widest text-xs">Connecting to Lab...</span>
            </div>
        }>
            <StagingAreaContent />
        </Suspense>
    );
}
