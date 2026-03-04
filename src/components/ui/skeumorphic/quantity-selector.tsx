import * as React from "react"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"

export interface QuantitySelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    value?: number;
    onValueChange?: (val: number) => void;
}

export function QuantitySelector({ className, value = 1, onValueChange, ...props }: QuantitySelectorProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center justify-between px-2 h-[42px] min-w-[104px] rounded-full bg-[#ffffff]",
                "shadow-sm",
                className
            )}
            {...props}
        >
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 active:text-slate-900 active:scale-95 transition-all outline-none active:shadow-sm">
                <Minus className="w-[16px] h-[16px]" strokeWidth={2.5} />
            </button>
            <span className="text-[16px] font-bold text-slate-800 w-5 text-center leading-none">{value}</span>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 active:text-slate-900 active:scale-95 transition-all outline-none active:shadow-sm">
                <Plus className="w-[16px] h-[16px]" strokeWidth={2.5} />
            </button>
        </div>
    )
}
