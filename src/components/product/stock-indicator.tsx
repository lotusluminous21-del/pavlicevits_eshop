import { cn } from "@/lib/utils";

interface StockIndicatorProps {
    availableForSale: boolean;
    totalInventory?: number; // Optional, strict inventory tracking might not be exposed
    className?: string;
}

export function StockIndicator({ availableForSale, totalInventory, className }: StockIndicatorProps) {
    if (!availableForSale) {
        return (
            <div className={cn("inline-flex items-center gap-1.5 text-destructive text-xs font-medium", className)}>
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
                Εξαντλήθηκε
            </div>
        );
    }

    // Low stock logic (e.g., < 5)
    if (totalInventory !== undefined && totalInventory > 0 && totalInventory < 5) {
        return (
            <div className={cn("inline-flex items-center gap-1.5 text-secondary text-xs font-medium", className)}>
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                Τελευταία κομμάτια
            </div>
        );
    }

    return (
        <div className={cn("inline-flex items-center gap-1.5 text-green-600 text-xs font-medium", className)}>
            <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
            </span>
            Διαθέσιμο
        </div>
    );
}
