'use client';

/**
 * ExpertContent — AI Expert Assistant Screen (Industrial Design System)
 * Refactored to use Assistant UI (@assistant-ui/react)
 */

import { useEffect, useState, useMemo } from 'react';
import {
    RotateCcw,
    Zap,
    PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExpertStore, type SidebarState } from '@/lib/expert/store';
import { useProductDetails } from '@/lib/expert/use-product-details';
import { ProjectProgress, type ProgressStep } from '@/components/industrial_ui/ProjectProgress';
import { ProductLightbox } from '@/components/industrial_ui/ProductLightbox';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Package, Loader2 } from 'lucide-react';

// Assistant UI Integration
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useExpertRuntime } from "@/lib/expert/runtime";
import { MyThread } from "@/components/industrial_ui/MyThread";

// ─── Progress derivation ──────────────────────────────────────────

const VISUAL_PHASE_ORDER: Array<SidebarState['overallPhase']> = [
    'initialization',
    'gathering_info',
    'product_matching',
    'complete',
];

const OVERALL_PHASE_LABELS: Record<string, string> = {
    initialization: 'Αρχικοποίηση',
    gathering_info: 'Συλλογή Πληροφοριών',
    product_matching: 'Αντιστοίχιση Προϊόντων',
    solution_ready: 'Ολοκλήρωση',
    complete: 'Ολοκλήρωση',
};

function deriveProgressFromSidebar(
    sidebarState: SidebarState | null,
    isTyping: boolean,
    solution: any,
): { steps: ProgressStep[]; progress: number } {
    const currentPhase = sidebarState?.overallPhase || 'initialization';
    const visualPhase = currentPhase === 'solution_ready' ? 'complete' : currentPhase;
    const currentIdx = VISUAL_PHASE_ORDER.indexOf(visualPhase as SidebarState['overallPhase']);

    const steps: ProgressStep[] = VISUAL_PHASE_ORDER.map((phase, idx) => {
        const label = sidebarState?.overallPhaseLabel && phase === visualPhase
            ? sidebarState.overallPhaseLabel
            : OVERALL_PHASE_LABELS[phase];

        let status: ProgressStep['status'];
        if (idx < currentIdx) status = 'completed';
        else if (idx === currentIdx) status = isTyping ? 'current' : (solution ? 'completed' : 'current');
        else status = 'pending';

        return { id: String(idx + 1), label, status };
    });

    const completed = steps.filter(s => s.status === 'completed').length;
    const progress = Math.round((completed / steps.length) * 100);

    return { steps, progress };
}

interface SidebarProps {
    steps: ProgressStep[];
    progress: number;
    sidebarState: SidebarState | null;
}

function SidebarContent({ steps, progress, sidebarState }: SidebarProps) {
    const [lightboxHandle, setLightboxHandle] = useState<string | null>(null);

    const uniqueProducts = useMemo(() => {
        if (!sidebarState?.recommendedProducts) return [];
        const seen = new Set<string>();
        return sidebarState.recommendedProducts.filter(p => {
            const key = p.handle;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [sidebarState?.recommendedProducts]);

    const productHandles = useMemo(() => uniqueProducts.map(p => p.handle), [uniqueProducts]);
    const { products, loading } = useProductDetails(productHandles);

    const lightboxProduct = lightboxHandle ? products.get(lightboxHandle) ?? null : null;
    const lightboxMeta = sidebarState?.recommendedProducts?.find(p => p.handle === lightboxHandle);

    const dimensions = sidebarState?.knowledgeDimensions || [];
    const hasDimensions = dimensions.length > 0;

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* 1. Progress Section */}
            <div>
                <ProjectProgress
                    title="ΠΡΟΟΔΟΣ ΑΝΑΛΥΣΗΣ"
                    progress={progress}
                    steps={steps}
                />
            </div>

            {/* 2. Dimensions Section */}
            {hasDimensions && (
                <div className="flex flex-col gap-3">
                    <div className="h-px bg-border/50 mb-1" />
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                        <span>ΑΝΑΛΥΣΗ ΕΡΓΟΥ</span>
                        {sidebarState?.domain && (
                            <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                {sidebarState.domain}
                            </span>
                        )}
                    </h3>
                    
                    <div className="space-y-2.5">
                        {dimensions.map((dim) => (
                            <div key={dim.id} className="flex items-center gap-2.5 text-sm">
                                <span className={cn(
                                    "w-2 h-2 rounded-full flex-shrink-0 relative top-0.5",
                                    dim.status === 'identified' ? 'bg-accent' :
                                    dim.status === 'pending' ? 'bg-primary animate-pulse' :
                                    'bg-secondary'
                                )} />
                                <span className={cn(
                                    "font-medium truncate flex-1",
                                    dim.status === 'identified' ? 'text-foreground' : 'text-muted-foreground'
                                )}>
                                    {dim.label}
                                </span>
                                {dim.value && dim.status === 'identified' && (
                                    <span className="ml-auto px-2 py-0.5 rounded text-xs font-semibold bg-secondary text-foreground flex-shrink-0 max-w-[130px] truncate">
                                        {dim.value}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Recommended Products Section */}
            <div className="flex flex-col gap-3">
                <div className="h-px bg-border/50 mb-1" />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    ΠΡΟΤΕΙΝΟΜΕΝΑ
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent ml-auto" />}
                </h3>

                {uniqueProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        {uniqueProducts.map((rec) => {
                            const shopifyProduct = products.get(rec.handle);
                            const image = shopifyProduct?.featuredImage;
                            const price = shopifyProduct?.priceRange?.minVariantPrice;

                            return (
                                <button
                                    key={rec.handle}
                                    onClick={() => setLightboxHandle(rec.handle)}
                                    className="flex flex-col rounded-xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-md transition-all text-left group cursor-pointer overflow-hidden"
                                >
                                    <div className="relative w-full aspect-square bg-secondary/30 overflow-hidden flex items-center justify-center p-3">
                                        {image?.url ? (
                                            <Image
                                                src={image.url}
                                                alt={image.altText || rec.title}
                                                fill
                                                className="object-contain p-3 group-hover:scale-110 transition-transform duration-500 ease-out"
                                                sizes="120px"
                                            />
                                        ) : (
                                            <Package className="w-6 h-6 text-muted-foreground/30" />
                                        )}
                                    </div>
                                    <div className="p-2.5 flex flex-col gap-1 w-full bg-card">
                                        <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                                            {rec.title}
                                        </p>
                                        <div className="flex items-center justify-between gap-1 mt-1">
                                            {rec.sequence_step && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent truncate">
                                                    {rec.sequence_step}
                                                </span>
                                            )}
                                            {price && (
                                                <span className="text-[11px] font-bold text-muted-foreground flex-shrink-0 ml-auto leading-none">
                                                    {parseFloat(price.amount).toLocaleString('el-GR', { style: 'currency', currency: price.currencyCode || 'EUR' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-24 rounded-xl border border-dashed border-border flex items-center justify-center bg-secondary/20 mt-1">
                        <p className="text-xs text-muted-foreground/60 font-medium">Αναμονή ανάλυσης...</p>
                    </div>
                )}
            </div>

            <ProductLightbox
                product={lightboxProduct}
                open={!!lightboxHandle}
                onOpenChange={(open) => !open && setLightboxHandle(null)}
                sequenceStep={lightboxMeta?.sequence_step}
                reason={lightboxMeta?.reason}
            />
        </div>
    );
}

export default function ExpertContent() {
    const runtime = useExpertRuntime();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const {
        messages,
        solution,
        isTyping,
        sidebarState,
        resetSession,
        initSessionListener,
    } = useExpertStore();

    useEffect(() => {
        initSessionListener();
    }, [initSessionListener]);

    // Force strict overflow lock on body to prevent window-level scrolling in expert session
    useEffect(() => {
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyOverflow = document.body.style.overflow;
        const originalBodyHeight = document.body.style.height;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100dvh';

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.overflow = originalBodyOverflow;
            document.body.style.height = originalBodyHeight;
        };
    }, []);

    const { steps: progressSteps, progress } = deriveProgressFromSidebar(sidebarState, isTyping, solution);

    return (
        <div className="flex w-full h-[calc(100dvh-64px)] overflow-hidden">
            <aside data-lenis-prevent="true" className="hidden md:flex w-80 flex-shrink-0 border-r border-border flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-6">
                    <SidebarContent steps={progressSteps} progress={progress} sidebarState={sidebarState} />
                </ScrollArea>
            </aside>

            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent data-lenis-prevent="true" side="left" className="w-80 p-0 flex flex-col">
                    <SheetTitle className="sr-only">Κατάσταση Έργου</SheetTitle>
                    <SheetDescription className="sr-only">
                        Δείτε την πρόοδο του έργου, τα τεχνικά ημερολόγια και τις προτεινόμενες επικαλύψεις.
                    </SheetDescription>
                    <ScrollArea className="flex-1 p-6">
                        <SidebarContent steps={progressSteps} progress={progress} sidebarState={sidebarState} />
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-shrink-0 flex items-center justify-between md:justify-end gap-2 px-4 sm:px-6 md:px-10 py-3 border-b border-border bg-background/60 backdrop-blur-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-secondary border border-border hover:bg-muted transition-colors"
                    >
                        <PanelLeftOpen className="w-4 h-4" />
                        <span>Κατάσταση</span>
                    </button>

                    <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                            <button
                                onClick={resetSession}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground hover:text-destructive bg-secondary border border-border transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span className="hidden sm:inline">Νέα Συνεδρία</span>
                                <span className="sm:hidden">Νέα</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden bg-background">
                    <AssistantRuntimeProvider runtime={runtime}>
                        <MyThread />
                    </AssistantRuntimeProvider>
                </div>

                <div className="flex-shrink-0 border-t border-border bg-background/80 backdrop-blur-sm p-3 md:px-10">
                    <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Σύστημα Online
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Συμμόρφωση ISO V2.4
                        </span>
                        <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent hover:underline transition-colors">
                            <Zap className="w-3 h-3" />
                            Εξαγωγή Αναφοράς PDF
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
