"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PageProps {
    params: Promise<{ sku: string }>;
}

export default function ProductReviewPage({ params: paramsPromise }: PageProps) {
    const params = React.use(paramsPromise);
    const sku = params.sku;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removingBgIdx, setRemovingBgIdx] = useState<number | null>(null);

    // Editable State
    const [titleEl, setTitleEl] = useState("");
    const [description, setDescription] = useState("");
    const [descriptionEl, setDescriptionEl] = useState("");
    const [selectedImage, setSelectedImage] = useState("");
    const [images, setImages] = useState<{ url: string; score: number; bg_removed_url?: string }[]>([]);

    const router = useRouter();

    useEffect(() => {
        if (!db) return;
        const load = async () => {
            const docRef = doc(db!, "staging_products", sku);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setProduct(data);
                setTitleEl(data.ai_data?.title_el || data.pylon_data?.name || "");
                setDescription(data.ai_data?.description || data.ai_data?.description_html || "");
                setDescriptionEl(data.ai_data?.description_el || "");
                const imageList = data.ai_data?.images || [];
                setImages(imageList);
                if (imageList.length > 0) {
                    setSelectedImage(imageList[0].bg_removed_url || imageList[0].url);
                }
            } else {
                alert("Product not found");
                router.push("/admin/products");
            }
            setLoading(false);
        };
        load();
    }, [sku, router]);

    const handleRemoveBg = async (idx: number) => {
        const img = images[idx];
        if (!img) return;

        setRemovingBgIdx(idx);
        try {
            const res = await fetch("/api/remove-bg", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_url: img.url,
                    sku: sku,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to remove background");
            }

            const data = await res.json();

            // Update local state
            const updatedImages = [...images];
            updatedImages[idx] = { ...updatedImages[idx], bg_removed_url: data.result_url };
            setImages(updatedImages);

            // If this was the selected image, switch to the cleaned version
            if (selectedImage === img.url) {
                setSelectedImage(data.result_url);
            }

            // Persist to Firestore
            if (db) {
                await updateDoc(doc(db, "staging_products", sku), {
                    "ai_data.images": updatedImages,
                });
            }

        } catch (err: any) {
            console.error(err);
            alert("Remove BG failed: " + err.message);
        } finally {
            setRemovingBgIdx(null);
        }
    };

    const handleApprove = async () => {
        if (!confirm("Confirm approval? This will trigger sync to Shopify.")) return;
        setSaving(true);
        try {
            if (!db) throw new Error("Database not initialized");

            await updateDoc(doc(db, "staging_products", sku), {
                "ai_data.title_el": titleEl,
                "ai_data.description": description,
                "ai_data.description_el": descriptionEl,
                "ai_data.selected_image_url": selectedImage,
                "status": "APPROVED",
                "approved_at": new Date().toISOString()
            });

            alert("Product Approved!");
            router.push("/admin/products");
        } catch (e) {
            console.error(e);
            alert("Error: " + e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!product) return <div className="p-8">Not Found</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Content Review */}
            <div>
                <Link href="/admin/products" className="text-sm text-gray-500 hover:underline mb-4 block">&larr; Back to List</Link>
                <div className="bg-white p-6 shadow rounded-lg">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Product Name (Pylon)</label>
                        <div className="mt-1 p-2 bg-gray-50 rounded border">{product.pylon_data.name}</div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Product Title (Greek)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-4 border bg-gray-50/30 transition-all font-sans"
                            value={titleEl}
                            onChange={(e) => setTitleEl(e.target.value)}
                            placeholder="Greek Title..."
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">AI Description (Greek)</label>
                        <textarea
                            className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm h-48 p-4 border bg-gray-50/30 transition-all font-sans"
                            value={descriptionEl}
                            onChange={(e) => setDescriptionEl(e.target.value)}
                            placeholder="Ελληνική περιγραφή..."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">AI Description (English)</label>
                        <textarea
                            className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm h-48 p-4 border bg-gray-50/30 transition-all"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="English description..."
                        />
                    </div>
                </div>
            </div>

            {/* Right Column: Image Selection & Actions */}
            <div className="space-y-6">
                <div className="bg-white p-6 shadow rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Image</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {images.map((img, idx) => {
                            const displayUrl = img.bg_removed_url || img.url;
                            const isSelected = selectedImage === displayUrl || selectedImage === img.url;
                            const isRemoving = removingBgIdx === idx;

                            return (
                                <div
                                    key={idx}
                                    className={`relative border-2 rounded-lg p-1 overflow-hidden ${isSelected ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    {/* Image — click to select */}
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => setSelectedImage(displayUrl)}
                                    >
                                        <img
                                            src={displayUrl}
                                            alt={`Candidate ${idx}`}
                                            className="w-full h-32 object-contain bg-white rounded"
                                        />
                                    </div>

                                    {/* Selected checkmark */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}

                                    {/* BG Removed badge */}
                                    {img.bg_removed_url && (
                                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                            BG Removed
                                        </div>
                                    )}

                                    {/* Bottom bar: source + Remove BG button */}
                                    <div className="flex items-center justify-between mt-1 gap-1">
                                        <div className="text-[10px] text-gray-400 truncate flex-1">
                                            {(() => { try { return new URL(img.url).hostname; } catch { return 'image'; } })()}
                                        </div>
                                        {!img.bg_removed_url && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveBg(idx); }}
                                                disabled={isRemoving}
                                                className="text-[10px] bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded font-medium disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {isRemoving ? (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                        Processing...
                                                    </span>
                                                ) : "Remove BG"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {images.length === 0 && (
                        <div className="text-gray-500 italic">No images found by AI.</div>
                    )}
                </div>

                <div className="bg-white p-6 shadow rounded-lg flex justify-between items-center">
                    <div className="text-sm">
                        <p className="font-bold">Confidence Score: {product.ai_data?.confidence_score ? (product.ai_data.confidence_score * 100).toFixed(0) : '–'}%</p>
                        <p className="text-gray-500">Status: {product.status}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-700">Reject</button>
                        <button
                            onClick={handleApprove}
                            disabled={saving}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold shadow-lg"
                        >
                            {saving ? "Syncing..." : "Approve & Sync"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
