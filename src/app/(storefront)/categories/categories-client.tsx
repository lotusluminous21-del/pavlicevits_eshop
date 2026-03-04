"use client"

import * as React from "react"
import { Product, Collection } from "@/lib/shopify/types"
import { Header } from "@/components/ui/skeumorphic/header"
import { BottomNav } from "@/components/ui/skeumorphic/bottom-nav"
import { ProductCard } from "@/components/ui/skeumorphic/product-card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function CategoriesClient({
    products,
    collections,
    activeCollection
}: {
    products: Product[],
    collections: Collection[],
    activeCollection: string
}) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = React.useState(false);

    const handleCollectionClick = (handle: string) => {
        setIsNavigating(true);
        router.push(`/categories${handle === 'all' ? '' : `?collection=${handle}`}`, { scroll: false });
    };

    React.useEffect(() => {
        setIsNavigating(false);
    }, [activeCollection, products]);

    return (
        <div className="min-h-screen bg-[#ffffff] flex flex-col font-sans mb-[80px]">
            <Header showBack title="Collections" />

            <main className="flex-1 w-full max-w-md mx-auto relative px-6 md:px-8 mt-[90px] md:mt-[100px] mb-8 z-10 space-y-8">

                {/* Categories Horizontal Scroll */}
                <div
                    className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-6 px-6 md:-mx-8 md:px-8"
                    style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                >
                    <button
                        onClick={() => handleCollectionClick("all")}
                        className={cn(
                            "snap-start shrink-0 h-[48px] px-6 rounded-full font-bold text-sm transition-all duration-300 outline-none flex items-center justify-center",
                            activeCollection === "all"
                                ? "bg-slate-800 text-white shadow-sm"
                                : "bg-[#ffffff] text-slate-600 shadow-sm hover:text-slate-900",
                            isNavigating && activeCollection !== "all" && "opacity-60"
                        )}
                    >
                        All
                    </button>
                    {collections.map((collection) => (
                        <button
                            key={collection.id}
                            onClick={() => handleCollectionClick(collection.handle)}
                            className={cn(
                                "snap-start shrink-0 h-[48px] px-6 rounded-full font-bold text-sm transition-all duration-300 outline-none flex items-center justify-center",
                                activeCollection === collection.handle
                                    ? "bg-slate-800 text-white shadow-sm"
                                    : "bg-[#ffffff] text-slate-600 shadow-sm hover:text-slate-900",
                                isNavigating && activeCollection !== collection.handle && "opacity-60"
                            )}
                        >
                            {collection.title}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className={cn("transition-opacity duration-300", isNavigating && "opacity-50")}>
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                            <p className="text-lg font-bold">No products found</p>
                            <p className="text-sm mt-2">Try selecting a different category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            {products.map((product) => (
                                <Link key={product.id} href={`/products/${product.handle}`} className="flex justify-center outline-none">
                                    <ProductCard product={product} className="w-full h-full flex-1 hover:scale-[1.02] transition-transform duration-300" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Navigation Wrapper */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-center pb-6 z-50 pointer-events-none">
                <div className="pointer-events-auto w-[calc(100%-48px)] max-w-[420px]">
                    <BottomNav className="w-full rounded-[32px]" />
                </div>
            </div>

            <style jsx global>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
