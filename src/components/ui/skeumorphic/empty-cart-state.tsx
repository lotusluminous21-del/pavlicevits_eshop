import * as React from "react"
import { cn } from "@/lib/utils"
import { ShoppingCart, Plus } from "lucide-react"

export interface EmptyCartStateProps extends React.HTMLAttributes<HTMLDivElement> { }

export function EmptyCartState({ className, ...props }: EmptyCartStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center w-full min-h-[300px] text-center",
                className
            )}
            {...props}
        >
            <div className="relative mb-8 flex items-center justify-center w-[160px] h-[160px]">
                {/* Intensified Extruded Cart Icon */}
                <ShoppingCart
                    className="w-[100px] h-[100px] text-[#F0F2F6]"
                    strokeWidth={2.5}
                    style={{
                        // Boosted shadow blur and distances to make the extrusion pop harder
                        filter: `
                            drop-shadow(2px 2px 1.5px rgba(0,0,0,0.2))
                            drop-shadow(-2px -2px 1.5px rgba(255,255,255,1))
                            drop-shadow(8px 8px 14px rgba(0,0,0,0.08))
                            drop-shadow(-8px -8px 14px rgba(255,255,255,0.8))
                        `
                    }}
                />

                {/* Embedded Teal Badge */}
                <div
                    className={cn(
                        "absolute top-[20px] right-[10px] w-[38px] h-[38px] rounded-full flex items-center justify-center",
                        "bg-[#00D4CA]",
                        "shadow-sm"
                    )}
                >
                    <Plus className="w-[20px] h-[20px] text-slate-900" strokeWidth={3} />
                </div>
            </div>

            <h2 className="text-[20px] font-bold text-slate-800 tracking-tight leading-tight mb-2">
                Empty Cart screen
            </h2>
            <p className="text-[15px] font-medium text-slate-500 max-w-[280px] leading-[1.4] tracking-tight">
                (future-proof) shown for variety
            </p>
        </div>
    )
}
