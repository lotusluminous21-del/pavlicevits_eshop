'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Brain } from "lucide-react"

export function TypingIndicator({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-start gap-3", className)}>
            <div className="w-[42px] h-[42px] rounded-full bg-skeuo-bg flex items-center justify-center shadow-skeuo-raised">
                <Brain className="w-[22px] h-[22px] text-pink-600 drop-shadow-sm" strokeWidth={2.5} />
            </div>
            <div className="skeuo-card px-5 py-4 rounded-[24px] rounded-tl-[8px]">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 typing-dot" />
                </div>
            </div>
        </div>
    )
}
