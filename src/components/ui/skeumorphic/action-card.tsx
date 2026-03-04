import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ActionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const ActionCard = React.forwardRef<HTMLButtonElement, ActionCardProps>(
    ({ className, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                ref={ref}
                className={cn(
                    "flex flex-col items-center justify-center text-center outline-none transition-all duration-300",
                    "rounded-[24px] bg-[#ffffff]",
                    "shadow-sm",
                    "hover:shadow-sm",
                    "active:scale-[0.97] active:shadow-sm",
                    className
                )}
                {...props}
            />
        )
    }
)
ActionCard.displayName = "ActionCard"

export { ActionCard }
