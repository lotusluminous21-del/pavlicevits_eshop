import * as React from "react"
import { cn } from "@/lib/utils"

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export function PrimaryButton({ className, children, ...props }: PrimaryButtonProps) {
    return (
        <button
            className={cn(
                "w-full h-[56px] rounded-[28px] flex items-center justify-center transition-all duration-300 active:scale-[0.98] outline-none",
                "bg-primary text-primary-foreground text-[18px] font-bold tracking-tight",
                "shadow-sm",
                "active:shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}
