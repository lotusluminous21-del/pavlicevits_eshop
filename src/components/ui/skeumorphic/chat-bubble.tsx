'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Brain, User } from "lucide-react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
    role: "user" | "assistant" | "ai";
    content: string;
    imageUrl?: string;
    readyForSolution?: boolean;
    onGenerateSolution?: () => void;
}

export function ChatBubble({ role, content, imageUrl, readyForSolution, onGenerateSolution, className, ...props }: ChatBubbleProps) {
    const isUser = role === "user";

    return (
        <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start", className)} {...props}>
            {!isUser && (
                <div className="flex-shrink-0 mt-1">
                    <div className="w-[42px] h-[42px] rounded-full bg-skeuo-bg flex items-center justify-center shadow-skeuo-raised">
                        <Brain className="w-[22px] h-[22px] text-pink-600 drop-shadow-sm" strokeWidth={2.5} />
                    </div>
                </div>
            )}
            <div
                className={cn(
                    "max-w-[78%] px-[20px] py-[14px]",
                    isUser
                        ? "bg-skeuo-accent rounded-[24px] rounded-tr-[8px] shadow-sm text-slate-800"
                        : "bg-skeuo-bg rounded-[24px] rounded-tl-[8px] shadow-skeuo-raised text-slate-700"
                )}
            >
                {imageUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden">
                        <div className="relative aspect-video w-full max-w-[240px]">
                            <Image src={imageUrl} alt="Uploaded image" width={240} height={135} className="object-cover" />
                        </div>
                    </div>
                )}
                <div className={cn(
                    "text-[15px] font-semibold leading-[1.4] tracking-tight whitespace-pre-wrap",
                    "[&_b]:font-bold [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                )}>
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
                {readyForSolution && onGenerateSolution && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                        <button
                            onClick={onGenerateSolution}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-skeuo-accent to-skeuo-accent-dark text-slate-900 font-bold rounded-xl shadow-skeuo-button hover:brightness-105 active:scale-[0.98] transition-all"
                        >
                            <span className="text-lg">✨</span>
                            Δημιουργία Λύσης
                        </button>
                    </div>
                )}
            </div>
            {isUser && (
                <div className="flex-shrink-0 mt-1">
                    <div className="w-[42px] h-[42px] rounded-full bg-skeuo-bg flex items-center justify-center shadow-skeuo-raised">
                        <User className="w-[20px] h-[20px] text-slate-600" strokeWidth={2} />
                    </div>
                </div>
            )}
        </div>
    )
}
