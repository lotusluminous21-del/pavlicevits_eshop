import { Product } from "@/lib/shopify/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex h-96 flex-col items-center justify-center text-center border border-dashed border-border/50 bg-secondary/5">
                <h2 className="text-xl font-bold tracking-tight uppercase text-muted-foreground">System: No Products Found</h2>
                <p className="mt-2 text-xs font-mono text-muted-foreground">
                    ERR_EMPTY_SET: Please refresh or check database connection.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-l border-t border-border/40">
            {products.map((product, index) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                />
            ))}
        </div>
    );
}
