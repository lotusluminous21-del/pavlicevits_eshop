import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
    ({ className, children, icon, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center gap-[6px] px-[16px] h-[38px] rounded-full shrink-0",
                    "bg-[#ffffff]",
                    "shadow-sm",
                    "text-[14px] font-bold text-slate-700 tracking-tight",
                    className
                )}
                {...props}
            >
                {icon && <span className="flex items-center justify-center shrink-0">{icon}</span>}
                <span>{children}</span>
            </div>
        )
    }
)
Chip.displayName = "Chip"

export { Chip }
