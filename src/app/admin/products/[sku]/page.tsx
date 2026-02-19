"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { publishProductAction, unpublishProductAction } from "@/app/actions/publish-product";
import {
    ChevronLeft,
    Save,
    Rocket,
    Loader2,
    Globe,
    AlertCircle,
    CheckCircle2,
    Image as ImageIcon,
    Layout,
    Wand2,
    Plus,
    Trash2,
    Tag,
    Layers,
    Sparkles,
    Eye,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Variant {
    sku_suffix: string;
    variant_name: string;
    option_name: string;
    option_value: string;
    pylon_sku: string;
}

interface StagingProduct {
    sku: string;
    status: string;
    pylon_data: {
        name: string;
        price_retail: number;
        price_bulk?: number;
        description?: string;
    };
    ai_data?: {
        title_el?: string;
        description_el?: string;
        category?: string;
        tags?: string[];
        technical_specs?: Record<string, any>;
        attributes?: Record<string, any>;
        variants?: Variant[];
        images?: Array<{ url: string }>;
        generated_images?: Record<string, string>;
        selected_images?: Record<string, string>;
    };
    shopify_product_id?: string;
    shopify_handle?: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ sku: string }> }) {
    const { sku } = use(params);
    const router = useRouter();
    const [product, setProduct] = useState<StagingProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUnpublishing, setIsUnpublishing] = useState(false);

    // Editable Fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [priceBulk, setPriceBulk] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [technicalSpecs, setTechnicalSpecs] = useState<Record<string, any>>({});
    const [attributes, setAttributes] = useState<Record<string, any>>({});
    const [variants, setVariants] = useState<Variant[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!db) return;
            try {
                const docRef = doc(db, "staging_products", sku);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as StagingProduct;
                    setProduct(data);
                    setTitle(data.ai_data?.title_el || data.pylon_data.name);
                    setDescription(data.ai_data?.description_el || data.pylon_data.description || "");
                    setPrice(String(data.pylon_data.price_retail || 0));
                    setPriceBulk(String(data.pylon_data.price_bulk || 0));
                    setCategory(data.ai_data?.category || "");
                    setTags(data.ai_data?.tags || []);
                    setTechnicalSpecs(data.ai_data?.technical_specs || {});
                    setAttributes(data.ai_data?.attributes || {});
                    setVariants(data.ai_data?.variants || []);
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [sku]);

    const handleSave = async () => {
        if (!product || !db) return;
        setIsSaving(true);
        try {
            const docRef = doc(db, "staging_products", sku);
            await updateDoc(docRef, {
                "ai_data.title_el": title,
                "ai_data.description_el": description,
                "ai_data.category": category,
                "ai_data.tags": tags,
                "ai_data.technical_specs": technicalSpecs,
                "ai_data.attributes": attributes,
                "ai_data.variants": variants,
                "pylon_data.price_retail": parseFloat(price),
                "pylon_data.price_bulk": parseFloat(priceBulk),
                status: (product.status === 'IMPORTED' || product.status === 'PENDING_METADATA') ? 'PENDING_METADATA_REVIEW' : product.status,
                updated_at: new Date().toISOString()
            });

            // If already published, trigger a non-disruptive Sync to Shopify
            if (product.shopify_product_id) {
                console.log("Auto-syncing changes to Shopify Production...");
                const enrichedProduct = {
                    ...product,
                    ai_data: {
                        ...product.ai_data,
                        title_el: title,
                        description_el: description,
                        category,
                        tags,
                        technical_specs: technicalSpecs,
                        attributes,
                        variants
                    },
                    pylon_data: {
                        ...product.pylon_data,
                        price_retail: parseFloat(price),
                        price_bulk: parseFloat(priceBulk)
                    }
                };
                await publishProductAction(sku, enrichedProduct);
                console.log("Shopify auto-sync complete.");
            }

            alert("Changes saved locally to Lab.");
        } catch (e) {
            console.error(e);
            alert("Save failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!product) return;
        if (!confirm(`Deploy "${title}" to Shopify Production?`)) return;

        setIsPublishing(true);
        try {
            const enrichedProduct = {
                ...product,
                ai_data: {
                    ...product.ai_data,
                    title_el: title,
                    description_el: description,
                    category,
                    tags,
                    technical_specs: technicalSpecs,
                    attributes,
                    variants
                },
                pylon_data: {
                    ...product.pylon_data,
                    price_retail: parseFloat(price),
                    price_bulk: parseFloat(priceBulk)
                }
            };

            const result = await publishProductAction(sku, enrichedProduct);

            if (result.success) {
                const docRef = doc(db!, "staging_products", sku);
                await updateDoc(docRef, {
                    shopify_product_id: result.shopifyId,
                    shopify_handle: result.handle,
                    published_at: new Date().toISOString(),
                    status: 'APPROVED'
                });
                alert("Product is now LIVE on Shopify!");
                router.push('/admin/products');
            } else {
                alert("Publish failed: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred during publishing.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        if (!product || !product.shopify_product_id) return;
        if (!confirm("Remove this product from your live Shopify Production store? (Local draft remains in Lab)")) return;

        setIsUnpublishing(true);
        try {
            const result = await unpublishProductAction(product.shopify_product_id);
            if (result.success) {
                const docRef = doc(db!, "staging_products", sku);
                await updateDoc(docRef, {
                    shopify_product_id: null,
                    shopify_handle: null,
                    status: 'PENDING_METADATA_REVIEW', // Reset to lab status
                    updated_at: new Date().toISOString()
                });
                alert("Product withdrawn from Shopify.");
                setProduct(prev => prev ? { ...prev, shopify_product_id: undefined, shopify_handle: undefined, status: 'PENDING_METADATA_REVIEW' } : null);
            } else {
                alert("Withdraw failed: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred during unpublishing.");
        } finally {
            setIsUnpublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h1 className="text-xl font-bold">Product Not Found</h1>
                <Button onClick={() => router.push('/admin/products')}>Back to Lab</Button>
            </div>
        );
    }

    const mainImage = product.ai_data?.generated_images?.base || product.ai_data?.selected_images?.base || product.ai_data?.images?.[0]?.url;

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32">
            {/* Nav Bar */}
            <div className="flex items-center justify-between sticky top-0 z-50 bg-white/90 backdrop-blur-xl py-6 border-b border-gray-100 -mx-8 px-8">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/admin/products')} className="font-black gap-2 text-gray-400 hover:text-indigo-600 uppercase tracking-widest text-[10px]">
                        <ChevronLeft className="w-4 h-4" /> Lab
                    </Button>
                    <div className="h-6 w-px bg-gray-100" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Staging Product</span>
                        <span className="text-sm font-black text-gray-900 tracking-tight">{sku}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/products/wizard?skus=${sku}`)}
                        className="font-black gap-2 rounded-2xl h-11 px-6 border-indigo-100 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-[10px] uppercase tracking-widest"
                    >
                        <Wand2 className="w-4 h-4" />
                        AI Wizard
                    </Button>
                    <div className="h-6 w-px bg-gray-100" />
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black px-3 py-1 uppercase text-[9px] tracking-widest">
                        {product.status.replace(/_/g, ' ')}
                    </Badge>
                    <div className="h-6 w-px bg-gray-100" />
                    <Button variant="outline" className="font-black gap-2 rounded-2xl h-11 px-6 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-all text-[10px] uppercase tracking-widest" onClick={handleSave} disabled={isSaving || isPublishing || isUnpublishing}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Edits
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black gap-2 rounded-2xl h-11 px-8 shadow-xl shadow-indigo-100 transition-all active:scale-95 text-[10px] uppercase tracking-widest" onClick={handlePublish} disabled={isSaving || isPublishing || isUnpublishing}>
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                        {product.shopify_product_id ? "Sync Production" : "Deploy Live"}
                    </Button>
                    {product.shopify_product_id && (
                        <Button
                            variant="ghost"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 font-black rounded-2xl h-11 px-4 transition-all text-[10px] uppercase tracking-widest"
                            onClick={handleUnpublish}
                            disabled={isSaving || isPublishing || isUnpublishing}
                        >
                            {isUnpublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pt-4">
                {/* Visual Section (Left) */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8 lg:sticky lg:top-32 h-fit">
                    <div className="aspect-[4/5] rounded-[3rem] bg-gray-50 border-4 border-white shadow-2xl shadow-indigo-100/50 flex items-center justify-center relative overflow-hidden group">
                        {mainImage ? (
                            <img
                                src={mainImage}
                                alt={title}
                                className="w-full h-full object-contain p-12 group-hover:scale-110 transition-transform duration-1000"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                                    <ImageIcon className="w-10 h-10 text-gray-200" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">No Visuals Generated</span>
                            </div>
                        )}

                        <div className="absolute top-8 left-8">
                            {product.shopify_product_id && (
                                <Badge className="bg-black text-white px-4 py-1.5 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                                    <Globe className="w-3.5 h-3.5" /> LIVE ON STOREFRONT
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Secondary Images/Thumbnails */}
                    <div className="grid grid-cols-4 gap-4 px-4">
                        {(product.ai_data?.images || []).slice(0, 4).map((img, i) => (
                            <div key={i} className="aspect-square rounded-[1.5rem] bg-white border-2 border-gray-100 overflow-hidden cursor-pointer hover:border-indigo-600 transition-all p-1.5 group">
                                <img src={img.url} className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Section (Right) */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-12">
                    {/* Core Identifiers */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Unified Greek Title</label>
                                {product.shopify_product_id && (
                                    <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                                        <Globe className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Master: Shopify</span>
                                    </div>
                                )}
                            </div>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-5xl font-black border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:bg-gray-50/50 rounded-2xl h-auto placeholder:opacity-10 tracking-tighter"
                                placeholder="Edit Name..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Category</label>
                                <Input
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="text-xl font-black border-none bg-indigo-50/30 px-4 py-2 focus-visible:ring-1 focus-visible:ring-indigo-100 rounded-xl h-12"
                                    placeholder="Uncategorized"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Retail Value</label>
                                <div className="relative group flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-gray-200 italic">€</span>
                                    <Input
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        type="number"
                                        className="text-4xl font-black border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:bg-gray-50/50 rounded-xl h-auto italic tracking-tighter w-full"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Wholesale Value</label>
                                <div className="relative group flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-gray-200 italic">€</span>
                                    <Input
                                        value={priceBulk}
                                        onChange={(e) => setPriceBulk(e.target.value)}
                                        type="number"
                                        className="text-4xl font-black border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:bg-gray-50/50 rounded-xl h-auto italic tracking-tighter w-full text-indigo-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-gray-100" />

                    {/* Rich Description */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">Greek Narrative (Enriched)</label>
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-2 py-0.5 uppercase tracking-widest">
                                AI Generated
                            </Badge>
                        </div>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[400px] border-none bg-gray-50/30 ring-1 ring-gray-100 focus:ring-4 focus:ring-indigo-50 focus:bg-white rounded-[2rem] p-8 text-gray-700 leading-relaxed font-medium transition-all text-lg"
                            placeholder="Awaiting enrichment..."
                        />
                    </div>

                    {/* Technical Specs Grid */}
                    {Object.keys(technicalSpecs).length > 0 && (
                        <div className="space-y-6 bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100 shadow-sm shadow-indigo-100/20">
                            <div className="flex items-center gap-3">
                                <Wand2 className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">Technical Specifications</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                {Object.entries(technicalSpecs).map(([key, value]) => (
                                    <div key={key} className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                                            {key.replace(/_/g, ' ')}
                                        </label>
                                        <Input
                                            className="h-10 text-xs font-bold bg-white border-gray-100 focus:border-indigo-600 rounded-xl transition-all"
                                            value={Array.isArray(value) ? value.join(", ") : String(value)}
                                            onChange={(e) => {
                                                setTechnicalSpecs(prev => ({ ...prev, [key]: e.target.value }));
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attributes & Tags Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Attributes */}
                        <div className="space-y-6 p-8 bg-orange-50/30 rounded-[2.5rem] border border-orange-100/50">
                            <div className="flex items-center gap-3">
                                <Tag className="w-5 h-5 text-orange-500" />
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">Custom Attributes</h3>
                            </div>
                            <div className="space-y-4">
                                {Object.keys(attributes).length > 0 ? (
                                    Object.entries(attributes).map(([key, value]) => (
                                        <div key={key} className="space-y-1.5">
                                            <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                                                {key.replace(/_/g, ' ')}
                                            </label>
                                            <Input
                                                className="h-10 text-xs font-bold bg-white border-orange-200/50 focus:border-orange-500 rounded-xl transition-all"
                                                value={String(value)}
                                                onChange={(e) => setAttributes(prev => ({ ...prev, [key]: e.target.value }))}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center py-4 bg-white/50 rounded-xl">No Custom Attributes</p>
                                )}
                            </div>
                        </div>

                        {/* Smart Tags */}
                        <div className="space-y-6 p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100/50">
                            <div className="flex items-center gap-3">
                                <Layers className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">Smart Tags</h3>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
                                {tags.map((tag, i) => (
                                    <Badge key={i} className="bg-white border-none text-indigo-700 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-sm hover:shadow-md transition-all group gap-2">
                                        {tag}
                                        <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="opacity-30 group-hover:opacity-100 hover:text-red-500 transition-opacity">
                                            <XCircle className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const newTag = prompt("Enter new tag:");
                                        if (newTag) setTags([...tags, newTag]);
                                    }}
                                    className="bg-white border-dashed border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-600 rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                                >
                                    + Add Tag
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Variants Preview */}
                    {variants.length > 0 && (
                        <div className="space-y-6 p-8 bg-gray-900 rounded-[2.5rem] text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-indigo-400" />
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em]">Synched Variants</h3>
                                </div>
                                <Badge className="bg-indigo-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                                    {variants.length} Detected
                                </Badge>
                            </div>
                            <ScrollArea className="h-[200px] pr-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {variants.map((v, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">{v.sku_suffix}</span>
                                                <span className="text-sm font-black text-white">{v.option_value}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-500">{v.option_name}</div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
