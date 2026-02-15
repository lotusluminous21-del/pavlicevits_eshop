"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, doc, writeBatch, where, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useRouter, useSearchParams } from "next/navigation";
import { MetadataStep } from "@/components/admin/wizard/metadata-step";
import { ImageStep } from "@/components/admin/wizard/image-step";
import { NanoStep } from "@/components/admin/wizard/nano-step";
import { CompleteStep } from "@/components/admin/wizard/complete-step";
import { Loader2, ArrowLeft, Layers, Sparkles, Globe, Wand2, CheckCircle2 } from "lucide-react";

type Step = "METADATA" | "IMAGES" | "STUDIO" | "FINISH";

export default function ProductWizardPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<Step>("METADATA");
    const [initialized, setInitialized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const skusParam = searchParams.get("skus");

    // Load selected products
    useEffect(() => {
        if (!db || !skusParam) {
            setLoading(false);
            return;
        }

        const skus = skusParam.split(",");
        const q = query(
            collection(db, "staging_products"),
            where("sku", "in", skus)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: any[] = [];
            snapshot.forEach((doc) => items.push(doc.data()));
            setProducts(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [skusParam]);

    // Sync URL with currentStep
    useEffect(() => {
        if (!initialized) return;
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.get("step") !== currentStep) {
            currentParams.set("step", currentStep);
            const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
            window.history.replaceState({ path: newUrl }, "", newUrl);
        }
    }, [currentStep, initialized]);

    // Initial step detection based on products and URL
    useEffect(() => {
        if (!products.length || initialized) return;

        const urlStep = searchParams.get("step") as Step;
        const statuses = products.map(p => p.status);

        // Calculate logical progress
        const isReadyForFinish = statuses.every(s => s === 'APPROVED');
        const isReadyForStudio = statuses.every(s => s === 'READY_FOR_STUDIO' || s === 'PENDING_NANO_BANANA' || s.includes('GENERATING') || s === 'PENDING_STUDIO_REVIEW' || s === 'BATCH_GENERATING');
        const isReadyForImages = statuses.every(s => s === 'READY_FOR_IMAGES' || s === 'PENDING_IMAGE_SOURCING' || s === 'PENDING_IMAGE_SELECTION' || s === 'READY_FOR_STUDIO');

        let targetStep: Step = "METADATA";

        if (isReadyForFinish) targetStep = "FINISH";
        else if (isReadyForStudio) targetStep = "STUDIO";
        else if (isReadyForImages) targetStep = "IMAGES";

        // If URL has a specific step, respect it unless it's way ahead of reality
        if (urlStep && steps.some(s => s.id === urlStep)) {
            // Basic guard: don't go to FINISH or STUDIO if products aren't ready
            if (urlStep === "FINISH" && !isReadyForFinish) {
                // stay on targetStep
            } else if (urlStep === "STUDIO" && (!isReadyForStudio && !isReadyForFinish)) {
                // stay on targetStep
            } else {
                targetStep = urlStep;
            }
        }

        setCurrentStep(targetStep);
        setInitialized(true);
    }, [products, searchParams, initialized]);

    // Auto-advance step based on product statuses (only for background transitions)
    useEffect(() => {
        if (!products.length || !initialized) return;

        const statuses = products.map(p => p.status);

        // We only auto-advance to "FINISH" when everything is "APPROVED"
        // Transitions to IMAGES and STUDIO are handled manually by clicking "Approve/Complete" in those steps.
        if (statuses.every(s => s === 'APPROVED') && currentStep === "STUDIO") {
            setCurrentStep("FINISH");
        }
    }, [products, currentStep, initialized]);

    const handleStartScan = async () => {
        setIsSaving(true);
        try {
            const batch = writeBatch(db!);
            products.forEach(p => {
                const docRef = doc(db!, "staging_products", p.sku);
                batch.update(docRef, {
                    status: "PENDING_METADATA",
                    enrichment_message: "Waking up Gemini 3..."
                });
            });
            await batch.commit();
        } catch (e) {
            console.error(e);
            alert("Failed to start AI scan");
        } finally {
            setIsSaving(false);
        }
    };

    const handleMetadataComplete = async (updatedProducts: any[]) => {
        setIsSaving(true);
        try {
            const batch = writeBatch(db!);
            updatedProducts.forEach(p => {
                const docRef = doc(db!, "staging_products", p.sku);
                batch.update(docRef, {
                    ai_data: p.ai_data,
                    status: "READY_FOR_IMAGES", // STOP: Wait for manual trigger
                    enrichment_message: "Metadata Approved. Ready for Images."
                });
            });
            await batch.commit();
            setCurrentStep("IMAGES");
        } catch (e) {
            console.error(e);
            alert("Failed to save metadata");
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartImageSourcing = async () => {
        setIsSaving(true);
        try {
            const batch = writeBatch(db!);
            products.forEach(p => {
                const docRef = doc(db!, "staging_products", p.sku);
                batch.update(docRef, {
                    status: "PENDING_IMAGE_SOURCING",
                    enrichment_message: "Sourcing images from web..."
                });
            });
            await batch.commit();
        } catch (e) {
            console.error(e);
            alert("Failed to start image sourcing");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRetryImageSearch = async (sku: string) => {
        try {
            const docRef = doc(db!, "staging_products", sku);
            await writeBatch(db!).update(docRef, {
                status: "PENDING_IMAGE_SOURCING",
                enrichment_message: "Restarting image scan..."
            }).commit();
        } catch (e) {
            console.error(e);
        }
    };

    const handleImagesComplete = async (updatedProducts: any[]) => {
        setIsSaving(true);
        try {
            const batch = writeBatch(db!);
            updatedProducts.forEach(p => {
                const docRef = doc(db!, "staging_products", p.sku);
                batch.update(docRef, {
                    "ai_data.selected_images": p.ai_data.selected_images,
                    status: "READY_FOR_STUDIO", // STOP: Wait for manual trigger
                    enrichment_message: "Images Selected. Ready for Studio."
                });
            });
            await batch.commit();
            setCurrentStep("STUDIO");
        } catch (e) {
            console.error(e);
            alert("Failed to save image selection");
        } finally {
            setIsSaving(false);
        }
    };

    const steps = [
        { id: "METADATA" as Step, label: "Metadata & Variants", icon: Sparkles },
        { id: "IMAGES" as Step, label: "Source Images", icon: Globe },
        { id: "STUDIO" as Step, label: "Nano Banana Studio", icon: Wand2 },
        { id: "FINISH" as Step, label: "Complete", icon: CheckCircle2 },
    ];

    const handleRetryStudio = async (sku: string) => {
        try {
            const docRef = doc(db!, "staging_products", sku);
            await writeBatch(db!).update(docRef, {
                status: "PENDING_NANO_BANANA",
                enrichment_message: "Retrying Nano Banana Studio..."
            }).commit();
        } catch (e) {
            console.error(e);
            alert("Failed to retry studio generation");
        }
    };

    const handleRegenerateSingle = async (sku: string, environment: string = "clean") => {
        try {
            // First clear the image to show immediate feedback
            const docRef = doc(db!, "staging_products", sku);
            await writeBatch(db!).update(docRef, {
                "ai_data.generated_images": deleteField(),
                "status": "BATCH_GENERATING",
                "enrichment_message": "Queued for Regeneration..."
            }).commit();

            const functions = getFunctions(undefined, 'europe-west1');
            const triggerBatch = httpsCallable(functions, 'trigger_batch_enrichment');

            console.log(`Regenerating ${sku} with environment=${environment}, priority=high`);
            const result = await triggerBatch({
                skus: [sku],
                environment,
                priority: "high"
            });
            const data = result.data as any;

            if (data.error) {
                alert(`Regeneration Error: ${data.error}`);
                return;
            }
            console.log("Regeneration session started:", data);
        } catch (e) {
            console.error(e);
            alert("Failed to regenerate: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    const handleRemoveBg = async (sku: string) => {
        setIsSaving(true);
        try {
            const functions = getFunctions(undefined, 'europe-west1');
            const triggerBg = httpsCallable(functions, 'trigger_bg_removal');

            const skus = sku === "ALL"
                ? products.filter(p => p.status === 'PENDING_STUDIO_REVIEW').map(p => p.sku)
                : [sku];

            if (skus.length === 0) return;

            const result = await triggerBg({ skus });
            const data = result.data as any;

            if (data.error) {
                alert(`Error: ${data.error}`);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to trigger background removal");
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartBatchStudio = async (productsToProcess = products, environment: string = "clean") => {
        try {
            if (!productsToProcess || productsToProcess.length === 0) {
                alert("No products found.");
                return;
            }

            const functions = getFunctions(undefined, 'europe-west1');
            const triggerBatch = httpsCallable(functions, 'trigger_batch_enrichment');

            // Filter products that don't have a generated image yet
            const skus = productsToProcess
                .filter(p => !p.ai_data?.generated_images?.base)
                .map(p => p.sku);

            if (skus.length === 0) {
                const confirmRes = confirm("All products already have generated images. Re-render?");
                if (!confirmRes) return;
                skus.push(...productsToProcess.map(p => p.sku));
            }

            console.log(`Starting studio generation (env=${environment}) for:`, skus);

            // Clear existing images to reflect "Processing" state immediately
            if (skus.length > 0) {
                const batch = writeBatch(db!);
                skus.forEach(sku => {
                    const docRef = doc(db!, "staging_products", sku);
                    batch.update(docRef, {
                        "ai_data.generated_images": deleteField(),
                        "status": "BATCH_GENERATING",
                        "enrichment_message": "Preparing for Studio..."
                    });
                });
                await batch.commit();
            }

            const result = await triggerBatch({ skus, environment });
            const data = result.data as any;

            if (data.error) {
                alert(`Studio Error: ${data.error}`);
                return;
            }

            console.log("Studio session started:", data);
        } catch (e) {
            console.error(e);
            alert("Failed to start studio: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    const handleStudioComplete = async () => {
        setIsSaving(true);
        try {
            const batch = writeBatch(db!);
            // Any products still in PENDING_STUDIO_REVIEW need to be finalized (skipped BG removal)
            const productsToFinalize = products.filter(p => p.status === 'PENDING_STUDIO_REVIEW');

            productsToFinalize.forEach(p => {
                const docRef = doc(db!, "staging_products", p.sku);
                batch.update(docRef, {
                    // Copy generated images to the final images array
                    "ai_data.images": [
                        { url: p.ai_data.generated_images.base, suffix: "base" }
                    ],
                    status: "APPROVED",
                    enrichment_message: "Approved (Background preserved)"
                });
            });

            if (productsToFinalize.length > 0) {
                await batch.commit();
            }

            // Effect will handle transition to FINISH
        } catch (e) {
            console.error(e);
            alert("Failed to finalize products");
        } finally {
            setIsSaving(false);
        }
    };

    // NOTE: No polling needed. The Cloud Scheduler (cron_check_batches) writes
    // batch results directly to Firestore. The onSnapshot listener above (line 40)
    // automatically picks up product status changes in real-time.


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Preparing your wizard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-65px)] bg-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 shrink-0 z-40 relative">
                <div className="w-full px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push("/admin/products")} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                            <ArrowLeft className="w-4 h-4 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Enrichment Wizard</h1>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            // Active if current matches, or if we are past this step
                            const stepIndex = steps.findIndex(step => step.id === s.id);
                            const currentIndex = steps.findIndex(step => step.id === currentStep);

                            const isActive = currentStep === s.id;
                            const isDone = currentIndex > stepIndex;

                            return (
                                <div key={s.id} className="flex items-center">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isActive ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100" :
                                        isDone ? "text-green-600" : "text-gray-400"
                                        }`}>
                                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                        <span className={`text-xs font-bold ${isActive ? "block" : "hidden lg:block"}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`w-8 h-px mx-2 ${isDone ? "bg-green-200" : "bg-gray-100"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-bold text-gray-700">{products.length} Items</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 overflow-hidden relative">
                {currentStep === "METADATA" && (
                    <MetadataStep
                        products={products}
                        onStartScan={handleStartScan}
                        onComplete={handleMetadataComplete}
                    />
                )}
                {currentStep === "IMAGES" && (
                    <ImageStep
                        products={products}
                        onBack={() => setCurrentStep("METADATA")}
                        onRetry={handleRetryImageSearch}
                        onStartSourcing={handleStartImageSourcing}
                        onComplete={handleImagesComplete}
                    />
                )}
                {currentStep === "STUDIO" && (
                    <NanoStep
                        products={products}
                        onBack={() => setCurrentStep("IMAGES")}
                        onRetry={handleRetryStudio}
                        onRemoveBg={handleRemoveBg}
                        onStartStudio={(env) => handleStartBatchStudio(products, env)}
                        onRegenerate={handleRegenerateSingle}
                        onComplete={handleStudioComplete}
                    />
                )}
                {currentStep === "FINISH" && (
                    <CompleteStep products={products} />
                )}
            </main>

            {isSaving && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[60] flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-20"></div>
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 relative z-10" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-900 text-lg">Synchronizing</h3>
                            <p className="text-gray-500 text-sm">Please wait while we update the pipeline...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
