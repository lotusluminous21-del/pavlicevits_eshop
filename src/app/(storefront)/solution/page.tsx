'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Download,
    Share2,
    ShieldCheck,
    ClipboardList,
    Lightbulb,
    AlertTriangle,
    ShoppingCart,
    Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useExpertStore } from '@/lib/expert/store';
import { cn } from '@/lib/utils';
import { SolutionProductItem } from './solution-product-item';

const formatPrice = (price: number | undefined | null) => {
    const val = typeof price === 'number' && !isNaN(price) ? price : 0;
    return new Intl.NumberFormat('el-GR', {
        style: 'currency',
        currency: 'EUR',
    }).format(val);
};

export default function SolutionPage() {
    const router = useRouter();
    const solution = useExpertStore(state => state.solution);
    const resetSession = useExpertStore(state => state.resetSession);

    const [expandedSteps, setExpandedSteps] = useState<number[]>([1]);
    const [actualPrices, setActualPrices] = useState<Record<string, number>>({});

    const handlePriceChange = (productKey: string, price: number) => {
        setActualPrices(prev => ({
            ...prev,
            [productKey]: price
        }));
    };

    const actualTotalPrice = useMemo(() => {
        return Object.values(actualPrices).reduce((sum, price) => sum + price, 0);
    }, [actualPrices]);

    // Collect all unique products from all steps for the Recommended Products section
    const allProducts = useMemo(() => {
        if (!solution) return [];
        const seen = new Set<string>();
        const products: { stepOrder: number; handle: string; variantId?: string; title?: string; variantTitle?: string; isCustomPaint?: boolean; customColorInfo?: { color_system: string; color_code: string; notes?: string } }[] = [];
        solution.steps.forEach(step => {
            if ((step.selected_products?.length ?? 0) > 0) {
                (step.selected_products || []).forEach((p: any, pIdx: number) => {
                    const key = `${p.handle}-${pIdx}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        products.push({
                            stepOrder: step.order,
                            handle: p.handle,
                            variantId: p.variant_id,
                            title: p.product_title,
                            variantTitle: p.variant_title,
                            isCustomPaint: p.is_custom_paint || false,
                            customColorInfo: p.custom_color_info || undefined,
                        });
                    }
                });
            } else if ((step.product_handles?.length ?? 0) > 0) {
                (step.product_handles || []).forEach((handle: string) => {
                    if (!seen.has(handle)) {
                        seen.add(handle);
                        products.push({ stepOrder: step.order, handle });
                    }
                });
            }
        });
        return products;
    }, [solution]);

    // All safety warnings collected from all steps
    const allWarnings = useMemo(() => {
        if (!solution) return [];
        return solution.steps.flatMap(step => step.warnings || []);
    }, [solution]);

    const toggleStep = (stepOrder: number) => {
        setExpandedSteps(prev =>
            prev.includes(stepOrder)
                ? prev.filter(s => s !== stepOrder)
                : [...prev, stepOrder]
        );
    };

    if (!solution) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
                <div className="bg-card border border-border rounded-lg p-10 text-center space-y-6 max-w-sm shadow-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-secondary flex items-center justify-center">
                        <ClipboardList className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-foreground tracking-tight uppercase">No Solution Plan</h2>
                        <p className="text-sm text-muted-foreground">Start by describing your project to our AI Expert.</p>
                    </div>
                    <button
                        onClick={() => router.push('/expert')}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest rounded hover:bg-primary/90 transition-colors"
                    >
                        Launch Expert Guide
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Main Content */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-8 md:py-14">

                    {/* ── Hero Section ─────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end"
                    >
                        <div className="lg:col-span-8 space-y-4">
                            {/* AI badge */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                AI Generated Strategy
                            </span>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tighter uppercase text-foreground">
                                Industrial<br />
                                <span>Solution Plan</span>
                            </h1>

                            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                                {solution.title} — Customized industrial coating protocol engineered based on your facility's substrate analysis and environmental stressors.
                            </p>
                        </div>

                        <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-3">
                            <button className="flex items-center gap-2 px-5 h-11 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider rounded hover:bg-primary/90 transition-colors">
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                            <button className="flex items-center justify-center w-11 h-11 border border-border rounded text-foreground hover:bg-secondary transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>

                    {/* ── Dashboard Grid ────────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-6">
                            {/* Project Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="bg-card border border-border rounded-lg p-6"
                            >
                                <div className="flex items-center gap-2 mb-5">
                                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Project Summary</h3>
                                </div>
                                <div className="space-y-0">
                                    {[
                                        { label: 'Project Type', value: solution.projectType },
                                        { label: 'Est. Duration', value: solution.estimatedTime },
                                        { label: 'Difficulty', value: solution.difficulty ? solution.difficulty.charAt(0).toUpperCase() + solution.difficulty.slice(1) : 'N/A' },
                                        { label: 'Phases', value: `${solution.steps.length} Steps` },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                'flex justify-between items-center py-3 text-sm',
                                                i < 3 && 'border-b border-border'
                                            )}
                                        >
                                            <span className="text-muted-foreground font-medium">{item.label}</span>
                                            <span className="font-bold text-foreground">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Safety Protocol */}
                            {allWarnings.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-accent/5 border border-accent/20 rounded-lg p-6"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShieldCheck className="w-5 h-5 text-accent" />
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-accent">Safety Protocol</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {allWarnings.map((warning, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                                                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                                                <span>{warning}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}

                            {/* Cost Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-card border border-border rounded-lg p-6"
                            >
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Estimated Cost</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-black text-foreground">
                                        {formatPrice(actualTotalPrice > 0 ? actualTotalPrice : solution.totalPrice)}
                                    </p>
                                    <span className="text-xs text-muted-foreground font-semibold">
                                        {actualTotalPrice > 0 ? 'actual' : 'estimated'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => router.push('/cart')}
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider rounded hover:bg-primary/90 transition-colors"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add All to Cart
                                </button>
                            </motion.div>
                        </aside>

                        {/* Step-by-Step Guideline Panel */}
                        <div className="lg:col-span-8">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-card border border-border rounded-lg overflow-hidden"
                            >
                                {/* Panel Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/40">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Step-by-Step Guideline</h3>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-secondary border border-border text-muted-foreground rounded uppercase tracking-widest">
                                        {solution.steps.length} Phases
                                    </span>
                                </div>

                                {/* Steps */}
                                <div className="p-6 space-y-10">
                                    {solution.steps.map((step, idx) => {
                                        const isExpanded = expandedSteps.includes(step.order);
                                        const isLast = idx === solution.steps.length - 1;

                                        return (
                                            <div key={step.order} className={cn('flex gap-5 relative', !isLast && 'pb-2')}>
                                                {/* Connector line */}
                                                {!isLast && (
                                                    <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
                                                )}

                                                {/* Step number bubble */}
                                                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-base">
                                                    {step.order}
                                                </div>

                                                {/* Step content */}
                                                <div className="flex-1 pb-4">
                                                    {/* Step header — clickable on mobile to toggle */}
                                                    <button
                                                        onClick={() => toggleStep(step.order)}
                                                        className="md:cursor-default w-full flex items-center justify-between text-left gap-2 outline-none"
                                                    >
                                                        <h4 className="text-base font-black uppercase tracking-tight text-foreground">
                                                            Phase {step.order}: {step.title}
                                                        </h4>
                                                        {/* Chevron only on mobile */}
                                                        <svg
                                                            className={cn('md:hidden w-4 h-4 text-muted-foreground shrink-0 transition-transform', isExpanded && 'rotate-180')}
                                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {/* Always visible on desktop, toggleable on mobile */}
                                                    <div className={cn('hidden md:block mt-2 space-y-4', isExpanded && '!block')}>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            {step.description}
                                                        </p>

                                                        {/* Tips */}
                                                        {step.tips && step.tips.length > 0 && (
                                                            <div className="p-4 bg-secondary border-l-4 border-accent rounded-r-lg">
                                                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-2">
                                                                    <Lightbulb className="w-3.5 h-3.5" />
                                                                    Tech Note
                                                                </div>
                                                                <ul className="space-y-1">
                                                                    {step.tips.map((tip, i) => (
                                                                        <li key={i} className="text-xs text-muted-foreground leading-relaxed">{tip}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Warnings */}
                                                        {step.warnings && step.warnings.length > 0 && (
                                                            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                                                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-warning mb-2">
                                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                                    Safety Warning
                                                                </div>
                                                                <ul className="space-y-1">
                                                                    {step.warnings.map((w, i) => (
                                                                        <li key={i} className="text-xs text-muted-foreground">{w}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Feature checklist */}
                                                        {step.tips && step.tips.length === 0 && step.description && (
                                                            null // no checklist if no tips
                                                        )}

                                                        {/* Products */}
                                                        {((step.selected_products?.length ?? 0) > 0 || (step.product_handles?.length ?? 0) > 0) && (
                                                            <div className="space-y-2">
                                                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Related Products</p>
                                                                <div className="space-y-2">
                                                                    {(step.selected_products?.length ?? 0) > 0 ? (
                                                                        (step.selected_products || []).map((selProduct: any, pIdx: number) => (
                                                                            <SolutionProductItem
                                                                                key={pIdx}
                                                                                handle={selProduct.handle}
                                                                                suggestedVariantId={selProduct.variant_id}
                                                                                fallbackTitle={selProduct.product_title || selProduct.handle?.replace(/-/g, ' ').toUpperCase()}
                                                                                fallbackVariantTitle={selProduct.variant_title}
                                                                                onPriceChange={(price: number) => handlePriceChange(`${step.order}-${selProduct.handle}-${pIdx}`, price)}
                                                                                isCustomPaint={selProduct.is_custom_paint || false}
                                                                                customColorInfo={selProduct.custom_color_info}
                                                                            />
                                                                        ))
                                                                    ) : (
                                                                        step.product_handles.map((productHandle: string, pIdx: number) => (
                                                                            <SolutionProductItem
                                                                                key={productHandle}
                                                                                handle={productHandle}
                                                                                onPriceChange={(price: number) => handlePriceChange(`${step.order}-${productHandle}-${pIdx}`, price)}
                                                                            />
                                                                        ))
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* ── Recommended Products ──────────────────────────── */}
                    {allProducts.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="mb-8"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-foreground">Recommended Products</h2>
                                    <p className="text-muted-foreground text-sm mt-1">Optimized inventory for your specific solution plan.</p>
                                </div>
                                <button
                                    onClick={() => router.push('/cart')}
                                    className="flex-none flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-wider rounded hover:bg-primary/90 transition-colors"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add All to Cart ({allProducts.length} items)
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {allProducts.map((p, idx) => (
                                    <motion.div
                                        key={`${p.handle}-${idx}`}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.05 }}
                                    >
                                        <SolutionProductItem
                                            handle={p.handle}
                                            suggestedVariantId={p.variantId}
                                            fallbackTitle={p.title || p.handle?.replace(/-/g, ' ').toUpperCase()}
                                            fallbackVariantTitle={p.variantTitle}
                                            onPriceChange={(price: number) => handlePriceChange(`rec-${p.handle}-${idx}`, price)}
                                            cardLayout
                                            isCustomPaint={p.isCustomPaint}
                                            customColorInfo={p.customColorInfo}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>
            </main>
        </div>
    );
}
