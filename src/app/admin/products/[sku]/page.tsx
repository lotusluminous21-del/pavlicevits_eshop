"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { publishProductAction, unpublishProductAction } from "@/app/actions/publish-product";
import {
    ChevronLeft,
    Save,
    Globe,
    Loader2,
    ImageIcon,
    Wand2,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Settings,
    UploadCloud,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
        title?: string;
        description?: string;
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

    // Editable Fields (Using new schema fields title, description)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [priceBulk, setPriceBulk] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [technicalSpecs, setTechnicalSpecs] = useState<Record<string, any>>({});
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
                    setTitle(data.ai_data?.title || data.pylon_data.name);
                    setDescription(data.ai_data?.description || data.pylon_data.description || "");
                    setPrice(String(data.pylon_data.price_retail || 0));
                    setPriceBulk(String(data.pylon_data.price_bulk || 0));
                    setCategory(data.ai_data?.category || "");
                    setTags(data.ai_data?.tags || []);
                    setTechnicalSpecs(data.ai_data?.technical_specs || {});
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
                "ai_data.title": title,
                "ai_data.description": description,
                "ai_data.category": category,
                "ai_data.tags": tags,
                "ai_data.technical_specs": technicalSpecs,
                "ai_data.variants": variants,
                "pylon_data.price_retail": parseFloat(price),
                "pylon_data.price_bulk": parseFloat(priceBulk),
                status: (product.status === 'IMPORTED' || product.status === 'PENDING_METADATA') ? 'PENDING_METADATA_REVIEW' : product.status,
                updated_at: new Date().toISOString()
            });

            if (product.shopify_product_id) {
                console.log("Auto-syncing changes to Shopify Production...");
                const enrichedProduct = {
                    ...product,
                    ai_data: {
                        ...product.ai_data,
                        title,
                        description,
                        category,
                        tags,
                        technical_specs: technicalSpecs,
                        variants
                    },
                    pylon_data: {
                        ...product.pylon_data,
                        price_retail: parseFloat(price),
                        price_bulk: parseFloat(priceBulk)
                    }
                };
                const sanitizedProduct = JSON.parse(JSON.stringify(enrichedProduct));
                await publishProductAction(sku, sanitizedProduct);
            }

        } catch (e) {
            console.error(e);
            alert("Save failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!product) return;
        setIsPublishing(true);
        try {
            const enrichedProduct = {
                ...product,
                ai_data: {
                    ...product.ai_data,
                    title,
                    description,
                    category,
                    tags,
                    technical_specs: technicalSpecs,
                    variants
                },
                pylon_data: {
                    ...product.pylon_data,
                    price_retail: parseFloat(price),
                    price_bulk: parseFloat(priceBulk)
                }
            };

            const sanitizedProduct = JSON.parse(JSON.stringify(enrichedProduct));
            const result = await publishProductAction(sku, sanitizedProduct);

            if (result.success) {
                const docRef = doc(db!, "staging_products", sku);
                await updateDoc(docRef, {
                    shopify_product_id: result.shopifyId,
                    shopify_handle: result.handle,
                    published_at: new Date().toISOString(),
                    status: 'APPROVED'
                });
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
        if (!confirm("Withdraw from Shopify?")) return;

        setIsUnpublishing(true);
        try {
            const result = await unpublishProductAction(product.shopify_product_id);
            if (result.success) {
                const docRef = doc(db!, "staging_products", sku);
                await updateDoc(docRef, {
                    shopify_product_id: null,
                    shopify_handle: null,
                    status: 'PENDING_METADATA_REVIEW',
                    updated_at: new Date().toISOString()
                });
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
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-zinc-500">
                <AlertCircle className="w-8 h-8" />
                <p className="text-sm font-medium">Product Not Found</p>
                <Button variant="outline" onClick={() => router.push('/admin/products')}>Back to Catalogue</Button>
            </div>
        );
    }

    const mainImage = product.ai_data?.generated_images?.base || product.ai_data?.selected_images?.base || product.ai_data?.images?.[0]?.url;
    const isPublished = !!product.shopify_product_id;

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-white overflow-hidden">
            {/* Minimalist Top Nav */}
            <div className="flex items-center justify-between h-14 px-6 border-b border-zinc-200 shrink-0 bg-zinc-50/50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/admin/products')} className="text-zinc-500 hover:text-zinc-900 -ml-2 h-8 px-2">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <div className="h-4 w-px bg-zinc-300" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500">{sku}</span>
                        {isPublished && <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[9px] py-0 px-1.5 h-4">SYNCED</Badge>}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/products/wizard?skus=${sku}`)}
                        className="text-xs font-medium h-8"
                    >
                        <Wand2 className="w-3.5 h-3.5 mr-2 text-zinc-400" /> Wizard
                    </Button>

                    <div className="h-4 w-px bg-zinc-300 mx-1" />

                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-medium h-8 min-w-[100px]"
                        onClick={handleSave}
                        disabled={isSaving || isPublishing || isUnpublishing}
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                        Save Edits
                    </Button>

                    <Button
                        size="sm"
                        className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 text-xs font-medium h-8 min-w-[120px]"
                        onClick={handlePublish}
                        disabled={isSaving || isPublishing || isUnpublishing}
                    >
                        {isPublishing ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 mr-2" />}
                        {isPublished ? "Sync Updates" : "Deploy Live"}
                    </Button>

                    {isPublished && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 ml-1"
                            onClick={handleUnpublish}
                            disabled={isSaving || isPublishing || isUnpublishing}
                        >
                            {isUnpublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                    )}
                </div>
            </div>

            {/* Split View Content */}
            <div className="flex flex-1 overflow-hidden">

                {/* Visuals Sidebar (Left) */}
                <div className="w-[380px] border-r border-zinc-200 bg-zinc-50/30 flex flex-col overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Main Image Hero */}
                        <div className="aspect-[4/5] rounded-lg border border-zinc-200 bg-white shadow-sm flex items-center justify-center relative overflow-hidden group">
                            {mainImage ? (
                                <img src={mainImage} alt={title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-zinc-400">
                                    <ImageIcon className="w-8 h-8" />
                                    <span className="text-[10px] uppercase font-medium">No Visual</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {product.ai_data?.images && product.ai_data.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.ai_data.images.slice(0, 4).map((img, i) => (
                                    <div key={i} className="aspect-square rounded-md border border-zinc-200 bg-white overflow-hidden cursor-pointer hover:border-zinc-400 transition-colors p-1">
                                        <img src={img.url} className="w-full h-full object-cover rounded-sm mix-blend-multiply" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Status Block */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
                            <h3 className="text-xs font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Readiness Status</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Metadata Enriched</span>
                                    {title ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Visuals Sourced</span>
                                    {mainImage ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Shopify Link</span>
                                    {isPublished ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Curation Form (Right) */}
                <div className="flex-1 overflow-y-auto bg-white p-8 lg:p-12">
                    <div className="max-w-3xl mx-auto space-y-12">

                        {/* Core Data */}
                        <section className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-semibold text-zinc-900">Greek Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-lg font-medium border-x-0 border-t-0 border-b-2 border-zinc-200 rounded-none px-0 h-auto pb-2 focus-visible:ring-0 focus-visible:border-zinc-900 bg-transparent"
                                    placeholder="Semantic title..."
                                />
                                <div className="text-[10px] text-zinc-400 font-mono">Original: {product.pylon_data.name}</div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-900">Category</label>
                                    <Input
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="text-sm bg-zinc-50 border-zinc-200 h-9"
                                        placeholder="Category..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-900">Retail Price (€)</label>
                                    <Input
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        type="number"
                                        className="text-sm bg-zinc-50 border-zinc-200 h-9"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-900">Wholesale Price (€)</label>
                                    <Input
                                        value={priceBulk}
                                        onChange={(e) => setPriceBulk(e.target.value)}
                                        type="number"
                                        className="text-sm bg-zinc-50 border-zinc-200 h-9"
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-zinc-100" />

                        {/* Semantic Description */}
                        <section className="space-y-4">
                            <label className="text-xs font-semibold text-zinc-900 flex items-center justify-between">
                                Greek Semantic Description
                                <Badge variant="outline" className="text-[9px] font-normal text-zinc-500 py-0 border-zinc-200">AI Authored</Badge>
                            </label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[200px] text-sm bg-zinc-50/50 border-zinc-200 rounded-md p-4 leading-relaxed focus-visible:ring-1 focus-visible:ring-zinc-400"
                                placeholder="Awaiting enrichment..."
                            />
                        </section>

                        {/* Technical Specs & Variants Side-by-Side */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                            {/* Technical Specs */}
                            <section className="space-y-4">
                                <label className="text-xs font-semibold text-zinc-900">Technical Specifications</label>
                                <div className="rounded-lg border border-zinc-200 overflow-hidden text-sm">
                                    {Object.entries(technicalSpecs).length > 0 ? (
                                        <table className="w-full text-left">
                                            <tbody className="divide-y divide-zinc-100">
                                                {Object.entries(technicalSpecs).map(([key, value]) => (
                                                    <tr key={key} className="bg-white hover:bg-zinc-50/50">
                                                        <td className="p-2.5 font-medium text-zinc-600 border-r border-zinc-100 w-1/3 bg-zinc-50/50">
                                                            {key}
                                                        </td>
                                                        <td className="p-0">
                                                            <Input
                                                                className="h-full w-full border-none bg-transparent rounded-none px-3 focus-visible:ring-1 focus-visible:ring-inset text-zinc-900"
                                                                value={Array.isArray(value) ? value.join(", ") : String(value)}
                                                                onChange={(e) => setTechnicalSpecs(prev => ({ ...prev, [key]: e.target.value }))}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-50">No specifications found.</div>
                                    )}
                                </div>
                            </section>

                            {/* Dynamic Variants */}
                            <section className="space-y-4">
                                <label className="text-xs font-semibold text-zinc-900 flex items-center justify-between">
                                    Dynamic Variants
                                    <Badge variant="outline" className="text-[9px] font-normal text-indigo-600 bg-indigo-50 border-indigo-200 py-0">Mapped to Shopify</Badge>
                                </label>
                                <div className="rounded-lg border border-zinc-200 overflow-hidden text-sm">
                                    {variants.length > 0 ? (
                                        <table className="w-full text-left">
                                            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase text-zinc-500">
                                                <tr>
                                                    <th className="p-2 font-medium">SKU Suffix</th>
                                                    <th className="p-2 font-medium">Option</th>
                                                    <th className="p-2 font-medium">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 bg-white">
                                                {variants.map((v, i) => (
                                                    <tr key={i}>
                                                        <td className="p-2 font-mono text-xs text-zinc-500">{v.sku_suffix}</td>
                                                        <td className="p-2 font-medium text-zinc-900">{v.option_name}</td>
                                                        <td className="p-2 text-zinc-600">{v.option_value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-50">No dynamic variants detected.</div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Tags */}
                        <section className="space-y-4 pb-12">
                            <label className="text-xs font-semibold text-zinc-900">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-normal pr-1 gap-1">
                                        {tag}
                                        <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="text-zinc-400 hover:text-red-500 rounded-full p-0.5">
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
                                    className="h-6 px-3 text-[10px] border-dashed text-zinc-500"
                                >
                                    + Add Tag
                                </Button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
