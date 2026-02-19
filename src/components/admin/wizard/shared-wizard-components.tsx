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
        <button
            onClick={onClick}
            className={cn(
                "w-full p-3 text-left transition-all rounded-lg flex items-center justify-between group border border-transparent mb-1.5",
                isActive
                    ? "bg-indigo-50 border-indigo-100 shadow-sm"
                    : "hover:bg-gray-100 text-gray-600"
            )}
        >
            <div className="flex flex-col w-full min-w-0 gap-0.5 pointer-events-none text-left">
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild className="pointer-events-auto">
                        <div className={cn(
                            "text-sm font-bold truncate tracking-tight leading-tight",
                            isActive ? "text-indigo-700" : "text-gray-900"
                        )}>
                            {originalName}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[300px] text-xs font-semibold">
                        <div className="text-[10px] text-indigo-500 uppercase font-bold mb-0.5">Original Name</div>
                        {originalName}
                    </TooltipContent>
                </Tooltip>

                {enrichedName && (
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild className="pointer-events-auto">
                            <div className={cn(
                                "text-[10px] truncate leading-tight font-medium italic",
                                isActive ? "text-indigo-600/60" : "text-gray-400"
                            )}>
                                {enrichedName}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[300px] text-xs font-medium">
                            <div className="text-[10px] text-emerald-500 uppercase font-bold mb-0.5">Enriched AI Title</div>
                            {enrichedName}
                        </TooltipContent>
                    </Tooltip>
                )}

                <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-gray-100/50">
                    <span className="text-[10px] font-mono font-bold text-gray-400">
                        {product.sku}
                    </span>

                    {/* Progress Dots */}
                    <div className="flex items-center gap-1 mx-2">
                        <div
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                                product.status !== 'PENDING_METADATA' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-gray-200"
                            )}
                            title="Metadata Generated"
                        />
                        <div
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                                product.ai_data?.selected_images?.base ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "bg-gray-200"
                            )}
                            title="Source Image Selected"
                        />
                        <div
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                                product.ai_data?.generated_images?.base ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-200"
                            )}
                            title="Studio Image Generated"
                        />
                        <div
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-300 border",
                                (product.status === 'APPROVED' && !product.enrichment_message?.includes('preserved'))
                                    ? "bg-white border-black shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                                    : "bg-gray-200 border-transparent"
                            )}
                            title="Background Removed"
                        />
                    </div>

                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1 ml-auto">
                        {statusIndicator}
                    </div>
                </div>
            </div>
        </button>
    );
}

interface WizardHeaderProps {
    title: string;
    phaseLabel: string;
    icon?: React.ElementType;
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
        <div className="px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-md gap-4 border-b border-gray-100/50">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 border-indigo-100 bg-indigo-50">
                        {phaseLabel}
                    </Badge>
                    {Icon && <Icon className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-snug">
                    {title}
                </h2>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onPrev}
                    disabled={prevDisabled}
                    className="h-9 w-9 bg-white"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onNext}
                    disabled={nextDisabled}
                    className="h-9 w-9 bg-white"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
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
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
                {onBack && (
                    <>
                        <Button
                            variant="ghost"
                            className="text-gray-500 hover:text-gray-900 px-2 font-bold text-xs"
                            onClick={onBack}
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            {backLabel}
                        </Button>
                        <div className="h-8 w-px bg-gray-200" />
                    </>
                )}
                {centerContent}
            </div>

            <div className="flex items-center gap-3">
                {isSaving && (
                    <span className="text-xs text-gray-400 italic font-medium flex items-center gap-2 mr-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Auto-saving
                    </span>
                )}
                {rightContent}
            </div>
        </div>
    );
}

export function SharedWizardSidebarTitle({ count }: { count: number }) {
    return (
        <div className="flex justify-between items-center px-1 mb-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-indigo-600" />
                Batch Items
            </h3>
            <Badge variant="secondary" className="text-[10px] font-bold px-2 h-5 flex items-center justify-center bg-gray-100 text-gray-500">
                {count}
            </Badge>
        </div>
    );
}
