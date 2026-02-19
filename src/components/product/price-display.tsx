import { cn } from "@/lib/utils";

interface PriceDisplayProps {
    price: number | string;
    compareAtPrice?: number | string | null;
    currencyCode?: string;
    className?: string;
    isOnSale?: boolean;
}

export function PriceDisplay({
    price,
    compareAtPrice,
    currencyCode = "EUR",
    className,
    isOnSale
}: PriceDisplayProps) {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    const numericCompare = compareAtPrice ? (typeof compareAtPrice === 'string' ? parseFloat(compareAtPrice) : compareAtPrice) : null;

    const formattedPrice = new Intl.NumberFormat("el-GR", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2
    }).format(numericPrice);

    const formattedCompare = numericCompare ? new Intl.NumberFormat("el-GR", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2
    }).format(numericCompare) : null;

    return (
        <div className={cn("flex items-center gap-2 font-bold", className)}>
            {isOnSale && formattedCompare ? (
                <>
                    <span className="text-destructive">{formattedPrice}</span>
                    <span className="text-muted-foreground line-through text-sm font-normal">
                        {formattedCompare}
                    </span>
                </>
            ) : (
                <span className="text-primary">{formattedPrice}</span>
            )}
        </div>
    );
}
