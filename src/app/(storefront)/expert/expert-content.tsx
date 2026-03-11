'use client';

/**
 * ExpertContent — AI Expert Assistant Screen
 * Rebuilt with Meta AI-inspired animated chat UI.
 * Backend: Zustand store + Firestore (unchanged).
 * Sidebar: preserved (progress, dimensions, recommended products).
 */

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
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

// New chat components
import { ChatHeader } from '@/components/expert_chat/ChatHeader';
import { ChatComposer } from '@/components/expert_chat/ChatComposer';
import { ChatMessageBubble, seedRevealedMessages } from '@/components/expert_chat/ChatMessage';
import { WelcomeScreen } from '@/components/expert_chat/WelcomeScreen';

// ─── Progress derivation (unchanged) ──────────────────────────────

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

// ─── Sidebar ──────────────────────────────────────────

import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="flex flex-col gap-10 h-full pb-10">
            {/* 1. Progress Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <ProjectProgress
                    title="ΠΡΟΟΔΟΣ ΑΝΑΛΥΣΗΣ"
                    progress={progress}
                    steps={steps}
                />
            </motion.div>

            {/* 2. Dimensions Section - Redesigned for No-Crop */}
            {hasDimensions && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">
                            ΑΝΑΛΥΣΗ ΕΡΓΟΥ
                        </h3>
                        {sidebarState?.domain && (
                            <span className="text-[9px] font-black tracking-tighter text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
                                {sidebarState.domain.toUpperCase()}
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {dimensions.map((dim) => (
                                <motion.div 
                                    key={dim.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col gap-1.5"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            dim.status === 'identified' ? 'bg-accent shadow-[0_0_4px_rgba(var(--accent),0.5)]' :
                                                dim.status === 'pending' ? 'bg-primary animate-pulse' :
                                                    'bg-muted'
                                        )} />
                                        <span className={cn(
                                            "text-[12px] font-semibold tracking-tight",
                                            dim.status === 'identified' ? 'text-foreground' : 'text-muted-foreground'
                                        )}>
                                            {dim.label}
                                        </span>
                                    </div>
                                    
                                    {dim.value && dim.status === 'identified' && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="ml-3.5"
                                        >
                                            <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-secondary/80 text-foreground border border-border/40 backdrop-blur-sm leading-none">
                                                {dim.value}
                                            </span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}

            {/* 3. Recommended Products Section - Single Column List */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-4"
            >
                <div className="h-px bg-gradient-to-r from-border/50 via-border to-transparent" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2">
                    <Package className="w-3 h-3 opacity-70" />
                    ΠΡΟΤΕΙΝΟΜΕΝΑ
                    {loading && <Loader2 className="w-3 h-3 animate-spin text-accent ml-auto" />}
                </h3>

                <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {uniqueProducts.length > 0 ? (
                            uniqueProducts.map((rec, idx) => {
                                const shopifyProduct = products.get(rec.handle);
                                const image = shopifyProduct?.featuredImage;
                                const price = shopifyProduct?.priceRange?.minVariantPrice;

                                return (
                                    <motion.button
                                        layout
                                        key={rec.handle}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => setLightboxHandle(rec.handle)}
                                        className="flex items-center gap-3 p-2 rounded-xl bg-card border border-border/40 hover:border-accent/30 hover:shadow-sm transition-all text-left group cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="relative w-16 h-16 flex-shrink-0 bg-secondary/30 rounded-lg overflow-hidden flex items-center justify-center p-1.5">
                                            {image?.url ? (
                                                <Image
                                                    src={image.url}
                                                    alt={image.altText || rec.title}
                                                    fill
                                                    className="object-contain p-1 group-hover:scale-110 transition-transform duration-500 ease-out"
                                                    sizes="64px"
                                                />
                                            ) : (
                                                <Package className="w-5 h-5 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col gap-1 pr-1">
                                            <p className="text-[13px] font-bold text-foreground line-clamp-2 leading-[1.2] group-hover:text-accent transition-colors">
                                                {rec.title}
                                            </p>
                                            <div className="flex items-center justify-between gap-2">
                                                {rec.sequence_step && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-accent/5 text-accent border border-accent/10 whitespace-nowrap">
                                                        {rec.sequence_step}
                                                    </span>
                                                )}
                                                {price && (
                                                    <span className="text-[11px] font-bold text-muted-foreground tabular-nums ml-auto">
                                                        {parseFloat(price.amount).toLocaleString('el-GR', { style: 'currency', currency: price.currencyCode || 'EUR' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-28 rounded-xl border border-dashed border-border/60 flex flex-col items-center justify-center bg-secondary/10 gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-ping" />
                                <p className="text-[10px] text-muted-foreground/50 font-bold tracking-widest uppercase">Αναμονή ανάλυσης</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

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

// ─── Main Expert Page ─────────────────────────────────────────────

export default function ExpertContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const { user, loading: authLoading } = useAuth();

    const {
        messages,
        solution,
        isTyping,
        sidebarState,
        resetSession,
        sendMessage,
        initSessionListener,
    } = useExpertStore();

    useEffect(() => {
        initSessionListener();
    }, [initSessionListener]);

    // Seed revealed messages on mount so page-reload doesn't re-animate
    useEffect(() => {
        seedRevealedMessages(messages.map((m) => m.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Force strict overflow lock on body
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

    // Track scroll position to determine if we should follow the bottom
    const handleScroll = useCallback(() => {
        if (!messageContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
        // If we are within 100px of the bottom, we consider it "at bottom"
        const atBottom = scrollHeight - scrollTop - clientHeight < 100;
        setIsAtBottom(atBottom);
    }, []);

    // Auto-scroll to bottom on new messages (force scroll for user's own messages)
    useEffect(() => {
        const container = messageContainerRef.current;
        if (!container) return;

        const lastMessage = messages[messages.length - 1];
        const isUserLast = lastMessage?.role === 'user';

        // If user just sent a message, ALWAYS scroll to bottom
        // Otherwise, only scroll if we were already at the bottom
        if (isUserLast || isAtBottom) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, isAtBottom]);

    const { steps: progressSteps, progress } = deriveProgressFromSidebar(sidebarState, isTyping, solution);

    const handleSend = useCallback(
        (text: string) => {
            sendMessage(text);
        },
        [sendMessage],
    );

    const hasMessages = messages.length > 0;

    return (
        <div className="flex w-full h-[calc(100dvh-64px)] overflow-hidden">
            {/* Desktop Sidebar */}
            <aside data-lenis-prevent="true" className="hidden md:flex w-[340px] flex-shrink-0 border-r border-border flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-5">
                    <SidebarContent steps={progressSteps} progress={progress} sidebarState={sidebarState} />
                </ScrollArea>
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent data-lenis-prevent="true" side="left" className="w-80 p-0 flex flex-col">
                    <SheetTitle className="sr-only">Κατάσταση Έργου</SheetTitle>
                    <SheetDescription className="sr-only">
                        Δείτε την πρόοδο του έργου, τα τεχνικά ημερολόγια και τις προτεινόμενες επικαλύψεις.
                    </SheetDescription>
                    <ScrollArea className="flex-1 p-5">
                        <SidebarContent steps={progressSteps} progress={progress} sidebarState={sidebarState} />
                    </ScrollArea>
                </SheetContent>
            </Sheet>

            {/* Chat Area */}
            <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <ChatHeader
                    hasMessages={hasMessages}
                    onReset={resetSession}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />

                {/* Messages / Welcome */}
                <div className="flex-1 relative overflow-hidden bg-background">
                    {/* Welcome screen (empty state) */}
                    {!hasMessages && (
                        <div className="flex h-full">
                            <WelcomeScreen
                                visible={!hasMessages}
                                user={user}
                                authLoading={authLoading}
                            />
                        </div>
                    )}

                    {/* Message thread */}
                    {hasMessages && (
                        <div
                            ref={messageContainerRef}
                            onScroll={handleScroll}
                            className="h-full overflow-y-auto scroll-smooth p-4 sm:p-5 md:px-8 chat-scrollbar-hidden"
                        >
                            <div className="max-w-[800px] mx-auto space-y-8">
                                {messages.map((message, i) => (
                                    <ChatMessageBubble
                                        key={message.id}
                                        message={message}
                                        isLast={i === messages.length - 1}
                                        isTyping={isTyping}
                                    />
                                ))}

                                {/* Typing indicator when no assistant message yet */}
                                {isTyping && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                                    <div className="flex gap-2">
                                        <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-accent flex items-center justify-center shadow-sm">
                                            <span className="text-accent-foreground text-xs">✦</span>
                                        </div>
                                        <div className="rounded-2xl rounded-tl-sm px-3.5 py-2 bg-card border border-border/50">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-1.5 h-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                                                <div className="w-1.5 h-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                                                <div className="w-1.5 h-1.5 animate-bounce rounded-full bg-muted-foreground/40" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* Spacer to keep content above the floating composer */}
                            <div className="h-40" aria-hidden="true" />
                        </div>
                    )}

                    {/* Gradient fade above composer */}
                    {hasMessages && (
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-[5]" />
                    )}

                    {/* Floating Composer */}
                    <ChatComposer
                        onSend={handleSend}
                        isLoading={isTyping}
                    />
                </div>


            </section>
        </div>
    );
}
