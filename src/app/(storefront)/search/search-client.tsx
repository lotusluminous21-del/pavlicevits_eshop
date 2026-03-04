"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Product } from "@/lib/shopify/types"
import { Header } from "@/components/ui/skeumorphic/header"
import { BottomNav } from "@/components/ui/skeumorphic/bottom-nav"
import { ProductCard } from "@/components/ui/skeumorphic/product-card"
import { SmartSearchBar } from "@/components/ui/skeumorphic/smart-search-bar"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

export function SearchClient({
    initialProducts,
    initialQuery
}: {
    initialProducts: Product[],
    initialQuery: string
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = React.useState(initialQuery)
    const [isSearching, setIsSearching] = React.useState(false)

    // Update local state when URL params change backwards
    React.useEffect(() => {
        const urlQ = searchParams.get("q") || ""
        setQuery(urlQ)
        setIsSearching(false) // turn off loader when new props map to view
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim() === initialQuery) return; // ignore duplicate submissions
        setIsSearching(true)
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        } else {
            router.push(`/search`)
        }
    }

    return (
        <div className="min-h-screen bg-[#ffffff] flex flex-col font-sans mb-[80px]">
            <Header showBack title="Search" />

            <main className="flex-1 w-full max-w-md mx-auto relative px-6 md:px-8 mt-[90px] md:mt-[100px] mb-8 z-10 flex flex-col">
                {/* Search Bar Container */}
                <div className="w-full mb-8">
                    <form onSubmit={handleSearch} className="w-full">
                        <div className="relative">
                            <SmartSearchBar
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search products (e.g., Varnish)..."
                                autoFocus
                            />
                        </div>
                    </form>
                </div>

                {/* Loading State or Results */}
                <div className={cn("flex-1 transition-opacity duration-300", isSearching && "opacity-50")}>
                    {initialQuery === "" ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-[100px] h-[100px] rounded-[30px] bg-[#ffffff] shadow-sm flex items-center justify-center mb-6">
                                <Search className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Find exactly what you need</h2>
                            <p className="text-[15px] font-medium text-slate-500 mt-2 max-w-[260px]">
                                Search by product name, category, or chemical handle.
                            </p>
                        </div>
                    ) : initialProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                            <div className="w-[80px] h-[80px] rounded-[24px] bg-[#ffffff] shadow-sm flex items-center justify-center mb-6">
                                <span className="text-3xl">🤔</span>
                            </div>
                            <p className="text-lg font-bold text-slate-800 tracking-tight">No products found</p>
                            <p className="text-[14px] mt-2 max-w-[240px]">
                                We couldn't find anything matching "{initialQuery}". Try another keyword.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="font-bold text-slate-500 text-sm pl-2">
                                Found {initialProducts.length} result{initialProducts.length !== 1 && 's'}
                            </p>
                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                {initialProducts.map((product) => (
                                    <Link key={product.id} href={`/products/${product.handle}`} className="flex justify-center outline-none">
                                        <ProductCard product={product} className="w-full h-full flex-1 hover:scale-[1.02] transition-transform duration-300" />
                                    </Link>
                                ))}
                            </div>
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
        </div>
    )
}
