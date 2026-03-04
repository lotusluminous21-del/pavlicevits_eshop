import * as React from "react"
import { cn } from "@/lib/utils"
import { Package } from "lucide-react"

export interface CompatibleProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
}

export function CompatibleProductCard({ title, className, ...props }: CompatibleProductCardProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-between p-3 pb-[14px] shrink-0 w-[124px] h-[156px] cursor-pointer",
                "rounded-[24px] bg-[#ffffff] transition-all duration-300",
                "shadow-sm",
                "hover:shadow-sm",
                "active:scale-[0.97] active:shadow-sm",
                className
            )}
            {...props}
        >
            <div className="w-full flex-1 flex items-center justify-center opacity-80 pt-1 pb-1">
                <div className="w-[52px] h-[64px] bg-gradient-to-br from-slate-200 to-slate-300 rounded-[8px] flex items-center justify-center shadow-inner">
                    <Package className="w-6 h-6 text-slate-400" />
                </div>
            </div>
            <span className="text-[14px] font-bold text-slate-800 text-center leading-[1.2] tracking-tight line-clamp-2 mt-2">
                {title}
            </span>
        </div>
    )
}
