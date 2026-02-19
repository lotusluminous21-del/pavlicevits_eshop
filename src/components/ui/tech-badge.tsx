import { cn } from "@/lib/utils";

interface TechBadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: "outline" | "solid" | "ghost";
}

export function TechBadge({ children, className, variant = "outline" }: TechBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center justify-center px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono font-medium border",
                variant === "outline" && "border-border text-muted-foreground bg-transparent",
                variant === "solid" && "border-primary bg-primary text-primary-foreground",
                variant === "ghost" && "border-transparent text-muted-foreground bg-secondary/10",
                className
            )}
        >
            {children}
        </span>
    );
}
