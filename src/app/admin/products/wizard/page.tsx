"use client";

import { useEffect, useState, Suspense } from "react";
import { collection, onSnapshot, query, doc, writeBatch, where, deleteField } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useRouter, useSearchParams } from "next/navigation";
import { MetadataStep } from "@/components/admin/wizard/metadata-step";
import { ImageStep } from "@/components/admin/wizard/image-step";
import { NanoStep } from "@/components/admin/wizard/nano-step";
import { CompleteStep } from "@/components/admin/wizard/complete-step";
import { Loader2, ArrowLeft, Layers, Sparkles, Globe, Wand2, CheckCircle2 } from "lucide-react";

type Step = "METADATA" | "IMAGES" | "STUDIO" | "FINISH";

function WizardContent() {

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<Step>("METADATA");
    const [initialized, setInitialized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeBatchIds, setActiveBatchIds] = useState<string[]>([]);

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
        const database = db!; // Narrow for closure

        // Firestore 'in' operator has a limit of 30 values.
        // We chunk the SKUs and create multiple listeners to bypass this limit.
        const chunkSize = 30;
        const chunks = [];
        for (let i = 0; i < skus.length; i += chunkSize) {
            chunks.push(skus.slice(i, i + chunkSize));
        }

        const productMap: Record<string, any> = {};
        const unsubscribes: (() => void)[] = [];

        chunks.forEach((chunk) => {
            const q = query(
                collection(database, "staging_products"),
                where("sku", "in", chunk)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    productMap[data.sku] = data;
                });

                // Aggregate results from all active listeners and update state
                // This ensures that products from all chunks are merged in real-time.
                const allItems = Object.values(productMap);
                setProducts(allItems);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching product chunk:", error);
                setLoading(false);
            });
            unsubscribes.push(unsubscribe);
        });

        return () => unsubscribes.forEach(unsub => unsub());
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

    const isStepComplete = (stepId: Step): boolean => {
        if (!products.length) return false;
        const statuses = products.map(p => p.status);

        switch (stepId) {
            case "METADATA":
                // Phase 1 complete if all have titles
                return products.every(p => p.ai_data?.title_el);
            case "IMAGES":
                // Phase 2 complete if all have source images
                return products.every(p => p.ai_data?.selected_images?.base);
            case "STUDIO":
                // Phase 3 complete if all have generated studio images
                return products.every(p => p.ai_data?.generated_images?.base);
            case "FINISH":
                return false;
            default:
                return false;
        }
    };

    // Initial step detection based on products and URL
    useEffect(() => {
        if (!products.length || initialized) return;

        const urlStep = searchParams.get("step") as Step;
        const stepOrder: Step[] = ["METADATA", "IMAGES", "STUDIO", "FINISH"];

        // Determine the furthest reachable step based on data
        let targetStep: Step = "METADATA";
        for (let i = 0; i < stepOrder.length - 1; i++) {
            const stepId = stepOrder[i];

            // For the purpose of AUTO-detecting the initial step:
            // Only advance past STUDIO if the objects are actually APPROVED.
            // This ensures we always land on the monitor to click "Send to Staging Area"
            // even if images are already generated.
            const isComplete = stepId === "STUDIO"
                ? products.every(p => p.status === 'APPROVED')
                : isStepComplete(stepId);

            if (isComplete) {
                targetStep = stepOrder[i + 1];
            } else {
                break;
            }
        }

        // If URL has a specific step, respect it if it's reachable or behind
        if (urlStep) {
            const targetIdx = stepOrder.indexOf(targetStep);
            const urlIdx = stepOrder.indexOf(urlStep);

            if (urlIdx !== -1) {
                // Allow going back to any step
                // Allow going forward only up to the targetStep
                if (urlIdx <= targetIdx) {
                    targetStep = urlStep;
                }
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

    const handleRetryImageSearch = async (sku: string, query?: string) => {
        try {
            const docRef = doc(db!, "staging_products", sku);
            const updates: any = {
                status: "PENDING_IMAGE_SOURCING",
                enrichment_message: query ? `Refining search for: ${query}...` : "Restarting image scan..."
            };
            if (query) {
                updates.search_query = query;
            }
            await writeBatch(db!).update(docRef, updates).commit();
        } catch (e) {
            console.error(e);
        }
    };

    const handleRetryMetadata = async (sku: string) => {
        try {
            const docRef = doc(db!, "staging_products", sku);
            await writeBatch(db!).update(docRef, {
                status: "PENDING_METADATA",
                enrichment_message: "Restarting discovery scan..."
            }).commit();
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelectImage = async (sku: string, suffix: string, url: string) => {
        try {
            const docRef = doc(db!, "staging_products", sku);
            await writeBatch(db!).update(docRef, {
                [`ai_data.selected_images.${suffix}`]: url
            }).commit();
        } catch (e) {
            console.error(e);
        }
    };

    const handleManualUpload = async (sku: string, file: File | Blob) => {
        setIsSaving(true);
        try {
            const fileName = `${Date.now()}_${sku}_manual.jpg`;
            const storageRef = ref(storage!, `source-images/${sku}/${fileName}`);

            // Upload to Firebase Storage
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(uploadResult.ref);

            // Update Firestore: Append to variant_images and set as selected
            const docRef = doc(db!, "staging_products", sku);
            const product = products.find(p => p.sku === sku);
            const existingImages = product?.ai_data?.variant_images?.base || [];

            const newImage = {
                url: downloadUrl,
                score: 1.0,
                source: "manual"
            };

            await writeBatch(db!).update(docRef, {
                "status": "PENDING_IMAGE_SELECTION", // Ensure it stays in selection mode
                "ai_data.variant_images.base": [...existingImages, newImage],
                "ai_data.selected_images.base": downloadUrl
            }).commit();

        } catch (e) {
            console.error("Manual upload failed:", e);
            alert("Upload failed. please try again.");
        } finally {
            setIsSaving(false);
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

    const handleRegenerateSingle = async (sku: string, environment: string = "clean", model: string = "gemini") => {
        try {
            const product = products.find(p => p.sku === sku);
            if (!product?.ai_data?.selected_images?.base) {
                alert("Cannot regenerate: No source image selected.");
                return;
            }

            // First clear the image to show immediate feedback
            const docRef = doc(db!, "staging_products", sku);
            await writeBatch(db!).update(docRef, {
                "ai_data.generated_images": deleteField(),
                "ai_data.images": deleteField(), // Atomic Reset: Clear derived BG removal
                "status": "BATCH_GENERATING",
                "enrichment_message": "Queued for Regeneration..."
            }).commit();

            const functions = getFunctions(undefined, 'europe-west1');
            const triggerBatch = httpsCallable(functions, 'trigger_batch_enrichment');

            console.log(`Regenerating ${sku} with environment=${environment}, model=${model}, priority=high`);
            const result = await triggerBatch({
                skus: [sku],
                environment,
                generation_model: model,
                priority: "high"
            });
            const data = result.data as any;

            if (data.error) {
                alert(`Regeneration Error: ${data.error}`);
                return;
            }
            console.log("Regeneration session started:", data);
            if (data.batch_ids) {
                setActiveBatchIds(prev => [...prev, ...data.batch_ids]);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to regenerate: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    const handleRemoveBg = async (sku: string, mode: string = "generated") => {
        setIsSaving(true);
        try {
            const functions = getFunctions(undefined, 'europe-west1');
            const triggerBg = httpsCallable(functions, 'trigger_bg_removal');

            let skus: string[] = [];

            if (sku === "ALL") {
                // IDEMPOTENCY: Only process items that have a studio image BUT don't have a background-removed version yet
                skus = products
                    .filter(p => {
                        const hasStudio = !!p.ai_data?.generated_images?.base;
                        const hasRemovedBg = p.status === 'APPROVED' || (p.ai_data?.images?.some((img: any) => img.suffix === 'base'));
                        return hasStudio && !hasRemovedBg;
                    })
                    .map(p => p.sku);
            } else {
                skus = [sku];
            }

            if (skus.length === 0) {
                console.log("No products need background removal.");
                return;
            }

            const result = await triggerBg({ skus, mode });
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

    const handleRegenerateAll = async (environment: string = "clean", model: string = "gemini") => {
        try {
            // Filter products: Must have a selected source image
            const toProcess = products.filter(p => p.ai_data?.selected_images?.base);
            const skus = toProcess.map(p => p.sku);

            if (skus.length === 0) {
                alert("No products have source images selected.");
                return;
            }

            const batch = writeBatch(db!);
            skus.forEach(sku => {
                const docRef = doc(db!, "staging_products", sku);
                batch.update(docRef, {
                    "ai_data.generated_images": deleteField(),
                    "ai_data.images": deleteField(), // Atomic Reset
                    "status": "BATCH_GENERATING",
                    "enrichment_message": "Queued for Regeneration..."
                });
            });
            await batch.commit();

            setIsSaving(true);
            const functions = getFunctions(undefined, 'europe-west1');
            const triggerBatch = httpsCallable(functions, 'trigger_batch_enrichment');

            try {
                const result = await triggerBatch({
                    skus,
                    environment,
                    generation_model: model,
                    priority: "high",
                    force: true // Signal to cancel/override existing processes if possible
                });
                const data = result.data as any;

                if (data.error) {
                    alert(`Regeneration Error: ${data.error}`);
                    return;
                }
                console.log("Bulk regeneration session started:", data);
                if (data.batch_ids) {
                    setActiveBatchIds(prev => [...prev, ...data.batch_ids]);
                }
            } catch (e) {
                console.error(e);
                alert("Failed to regenerate all: " + (e instanceof Error ? e.message : String(e)));
            } finally {
                setIsSaving(false);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to regenerate all: " + (e instanceof Error ? e.message : String(e)));
        }
    };

    const handleStartBatchStudio = async (productsToProcess = products, environment: string = "clean", model: string = "gemini") => {
        try {
            if (!productsToProcess || productsToProcess.length === 0) {
                alert("No products found.");
                return;
            }

            const functions = getFunctions(undefined, 'europe-west1');
            const triggerBatch = httpsCallable(functions, 'trigger_batch_enrichment');

            // Filter products: Must not have a generated image AND must have a selected source image
            const toProcess = productsToProcess.filter(p => !p.ai_data?.generated_images?.base && p.ai_data?.selected_images?.base);
            const skus = toProcess.map(p => p.sku);

            // Products with NO selected images - handle them gracefully by skipping
            const toSkip = productsToProcess.filter(p => !p.ai_data?.selected_images?.base);
            const skusToSkip = toSkip.map(p => p.sku);

            if (skus.length === 0 && skusToSkip.length === 0) {
                const confirmRes = confirm("All products already have generated images. Re-render?");
                if (!confirmRes) return;
                skus.push(...productsToProcess.filter(p => p.ai_data?.selected_images?.base).map(p => p.sku));
            }

            console.log(`Starting studio generation (env=${environment}, model=${model}) for:`, skus);
            console.log(`Skipping generation for (no images):`, skusToSkip);

            const batch = writeBatch(db!);

            // 1. Mark processing SKUs
            skus.forEach(sku => {
                const docRef = doc(db!, "staging_products", sku);
                batch.update(docRef, {
                    "ai_data.generated_images": deleteField(),
                    "ai_data.images": deleteField(), // Atomic Reset
                    "status": "BATCH_GENERATING",
                    "enrichment_message": "Preparing for Studio..."
                });
            });

            // 2. Mark skipped SKUs so they don't look "stuck"
            skusToSkip.forEach(sku => {
                const docRef = doc(db!, "staging_products", sku);
                batch.update(docRef, {
                    "status": "ENRICHMENT_FAILED",
                    "enrichment_message": "Generation skipped: No source image selected."
                });
            });

            if (skus.length > 0 || skusToSkip.length > 0) {
                await batch.commit();
            }

            if (skus.length === 0) {
                console.log("No images to generate.");
                setIsSaving(false);
                return;
            }

            setIsSaving(true);
            try {
                const result = await triggerBatch({ skus, environment, generation_model: model });
                const data = result.data as any;

                if (data.error) {
                    alert(`Studio Error: ${data.error}`);
                    return;
                }

                console.log("Studio session started:", data);
                if (data.batch_ids) {
                    setActiveBatchIds(prev => [...prev, ...data.batch_ids]);
                }
            } catch (e) {
                console.error(e);
                alert("Failed to start studio: " + (e instanceof Error ? e.message : String(e)));
            } finally {
                setIsSaving(false);
            }
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
                const generatedUrl = p.ai_data?.generated_images?.base;

                const updates: any = {
                    status: "APPROVED",
                    enrichment_message: generatedUrl ? "Finalized (Background preserved)" : "Finalized (No visual changes)"
                };

                // Only move studio image to 'images' if it's not already there (e.g. from BG removal)
                if (generatedUrl && !p.ai_data?.images?.some((img: any) => img.suffix === 'base')) {
                    updates["ai_data.images"] = [{ url: generatedUrl, suffix: "base" }];
                }

                batch.update(docRef, updates);
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

    const handleAbortStudio = async () => {
        if (activeBatchIds.length === 0) return;

        setIsSaving(true);
        try {
            const functions = getFunctions(undefined, 'europe-west1');
            const abortFn = httpsCallable(functions, 'abort_studio_session');

            console.log("Aborting studio sessions:", activeBatchIds);
            const result = await abortFn({ batch_ids: activeBatchIds });
            const data = result.data as any;

            if (data.error) {
                alert(`Abort Error: ${data.error}`);
            } else {
                console.log(`Aborted ${data.aborted_count} sessions.`);
                setActiveBatchIds([]); // Clear after aborting
            }
        } catch (e) {
            console.error(e);
            alert("Failed to abort studio processes");
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
        <div className="h-full bg-white flex flex-col overflow-hidden">
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
                            const isDone = currentIndex > stepIndex || isStepComplete(s.id);

                            // A step is clickable if:
                            // 1. It is the current step (effectively no-op)
                            // 2. It is a previous step (always allow going back)
                            // 3. It is a future step AND all steps before it are complete
                            const isClickable = stepIndex <= currentIndex || steps.slice(0, stepIndex).every(prev => isStepComplete(prev.id));

                            return (
                                <button
                                    key={s.id}
                                    onClick={() => isClickable && setCurrentStep(s.id)}
                                    disabled={!isClickable}
                                    className={`flex items-center transition-all group outline-none ${isClickable ? "cursor-pointer hover:opacity-80" : "cursor-default"
                                        }`}
                                >
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isActive ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100" :
                                        isDone ? "text-green-600 bg-green-50/30 lg:bg-transparent" : "text-gray-400"
                                        } ${isClickable ? "group-hover:bg-gray-50" : ""}`}>
                                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                        <span className={`text-xs font-bold ${isActive ? "block" : "hidden lg:block"}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`w-8 h-px mx-2 ${isDone ? "bg-green-200" : "bg-gray-100"}`} />
                                    )}
                                </button>
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
                        onRetry={handleRetryMetadata}
                        onComplete={handleMetadataComplete}
                    />
                )}
                {currentStep === "IMAGES" && (
                    <ImageStep
                        products={products}
                        onBack={() => setCurrentStep("METADATA")}
                        onRetry={handleRetryImageSearch}
                        onSelectImage={handleSelectImage}
                        onManualUpload={handleManualUpload}
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
                        onStartStudio={(env, model) => handleStartBatchStudio(products, env, model)}
                        onRegenerate={handleRegenerateSingle}
                        onRegenerateAll={handleRegenerateAll}
                        onAbort={handleAbortStudio}
                        onComplete={handleStudioComplete}
                    />
                )}
                {currentStep === "FINISH" && (
                    <CompleteStep products={products} />
                )}
            </main>

            {isSaving && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-gray-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-gray-800 backdrop-blur-md bg-opacity-90">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span className="text-xs font-bold tracking-wide uppercase">Propagating Changes...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Default export wrapper
export default function ProductWizardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        }>
            <WizardContent />
        </Suspense>
    );
}

