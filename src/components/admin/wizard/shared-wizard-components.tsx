"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export interface WizardProduct {
    sku: string;
    status: string;
    name: string;
    enrichment_message?: string;
    pylon_data?: {
        name: string;
    };
    ai_data?: {
        title_el?: string;
        selected_images?: Record<string, string>;
        generated_images?: Record<string, string>;
    };
}

interface WizardSidebarItemProps {
    product: WizardProduct;
    isActive: boolean;
    onClick: () => void;
    statusIndicator?: React.ReactNode;
}

export function WizardSidebarItem({ product, isActive, onClick, statusIndicator }: WizardSidebarItemProps) {
    const originalName = product.pylon_data?.name || product.name || product.sku;
    const enrichedName = product.ai_data?.title_el;

    return (
        <TooltipProvider>
            <button
                onClick={onClick}
                className={cn(
                    "w-full p-3 text-left transition-colors rounded-none flex items-center justify-between group border-l-2",
                    isActive
                        ? "bg-zinc-100/50 border-zinc-900"
                        : "hover:bg-zinc-50 border-transparent text-zinc-600"
                )}
            >
                <div className="flex flex-col w-full min-w-0 pointer-events-none text-left gap-1">
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild className="pointer-events-auto">
                            <div className={cn(
                                "text-sm font-medium truncate leading-tight",
                                isActive ? "text-zinc-900" : "text-zinc-500"
                            )}>
                                {originalName}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[300px] text-xs font-medium">
                            <div className="text-[10px] text-zinc-500 uppercase mb-0.5">Original Name</div>
                            {originalName}
                        </TooltipContent>
                    </Tooltip>

                    {enrichedName && (
                        <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild className="pointer-events-auto">
                                <div className={cn(
                                    "text-[11px] truncate leading-none",
                                    isActive ? "text-zinc-600" : "text-zinc-400"
                                )}>
                                    {enrichedName}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[300px] text-xs font-medium">
                                <div className="text-[10px] text-emerald-600 uppercase mb-0.5">Enriched AI Title</div>
                                {enrichedName}
                            </TooltipContent>
                        </Tooltip>
                    )}

                    <div className="flex items-center gap-2 mt-1 justify-between w-full">
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1 py-0.5 rounded-sm">
                            {product.sku}
                        </span>

                        {/* Minimalist Progress Dots (Using neutral grays and 1 accent color for errors/success) */}
                        <div className="flex items-center gap-1.5 opacity-80">
                            <div
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-colors",
                                    product.status !== 'PENDING_METADATA' ? "bg-zinc-800" : "bg-zinc-200"
                                )}
                                title="Metadata Generated"
                            />
                            <div
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-colors",
                                    product.ai_data?.selected_images?.base ? "bg-zinc-800" : "bg-zinc-200"
                                )}
                                title="Source Image Selected"
                            />
                            <div
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-colors",
                                    product.ai_data?.generated_images?.base ? "bg-emerald-500" : "bg-zinc-200"
                                )}
                                title="Studio Image Generated"
                            />
                        </div>
                    </div>
                </div>
            </button>
        </TooltipProvider>
    );
}

interface WizardHeaderProps {
    title: string;
    phaseLabel: string;
    icon?: any;
    onPrev?: () => void;
    onNext?: () => void;
    prevDisabled?: boolean;
    nextDisabled?: boolean;
}

export function SharedWizardHeader({
    title,
    phaseLabel,
    icon: Icon,
    onPrev,
    onNext,
    prevDisabled,
    nextDisabled
}: WizardHeaderProps) {
    return (
        <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-zinc-200">
            <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                        {phaseLabel}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-zinc-900" />}
                    <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
                        {title}
                    </h2>
                </div>
            </div>
            {(onPrev || onNext) && (
                <div className="flex gap-1 bg-zinc-50 p-1 border border-zinc-200 rounded-md">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onPrev}
                        disabled={prevDisabled}
                        className="h-7 w-7 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNext}
                        disabled={nextDisabled}
                        className="h-7 w-7 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-sm"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

interface SharedWizardFooterProps {
    onBack?: () => void;
    backLabel?: string;
    centerContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    isSaving?: boolean;
}

export function SharedWizardFooter({
    onBack,
    backLabel = "Back",
    centerContent,
    rightContent,
    isSaving
}: SharedWizardFooterProps) {
    return (
        <div className="flex items-center justify-between w-full h-full">
            <div className="flex items-center gap-6 h-full">
                {onBack && (
                    <>
                        <Button
                            variant="ghost"
                            className="text-zinc-500 hover:text-zinc-900 px-3 font-medium text-xs h-full flex items-center rounded-none hover:bg-zinc-100"
                            onClick={onBack}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1.5" />
                            {backLabel}
                        </Button>
                        <div className="h-4 w-px bg-zinc-300" />
                    </>
                )}
                {centerContent}
            </div>

            <div className="flex items-center gap-4">
                {isSaving && (
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Saving
                    </span>
                )}
                {rightContent}
            </div>
        </div>
    );
}

export function SharedWizardSidebarTitle({ count }: { count: number }) {
    return (
        <div className="flex justify-between items-center px-1 mb-1">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2 text-xs uppercase tracking-widest">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                Batch
            </h3>
            <Badge variant="outline" className="text-[10px] border-zinc-200 text-zinc-500 font-mono py-0 h-5">
                {count}
            </Badge>
        </div>
    );
}
