"use client"

import { Container } from "@/components/ui/container"
import { FilterSidebar } from "@/components/shop/filter-sidebar"
import { ProductGrid } from "@/components/shop/product-grid"
import { useProducts } from "@/hooks/useShopifyProducts"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter, SlidersHorizontal } from "lucide-react"

export default function ProductsPage() {
    const { products, loading, error } = useProducts()

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[var(--header-height)] z-30 mt-32">
                <Container>
                    <div className="flex h-16 items-center justify-between py-4">
                        <h1 className="text-2xl font-heading font-bold text-foreground">Προϊόντα</h1>

                        <div className="flex items-center gap-4">
                            {/* Mobile Filter Trigger */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="lg:hidden gap-2">
                                        <Filter className="h-4 w-4" />
                                        Φίλτρα
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                    <div className="mt-6">
                                        <FilterSidebar />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground hidden sm:inline-block">Ταξινόμηση:</span>
                                <Select defaultValue="featured">
                                    <SelectTrigger className="w-[180px] h-9">
                                        <SelectValue placeholder="Επιλέξτε" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="featured">Προτεινόμενα</SelectItem>
                                        <SelectItem value="price-asc">Τιμή: Χαμηλή προς Υψηλή</SelectItem>
                                        <SelectItem value="price-desc">Τιμή: Υψηλή προς Χαμηλή</SelectItem>
                                        <SelectItem value="created">Νεότερα</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="pt-8">
                <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block shrink-0">
                        <div className="sticky top-32">
                            <FilterSidebar />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <main>
                        {loading ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="h-[300px] w-full animate-pulse rounded-xl bg-muted" />
                                        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                                        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                                Παρουσιάστηκε σφάλμα κατά τη φόρτωση των προϊόντων.
                            </div>
                        ) : (
                            <ProductGrid products={products} />
                        )}
                    </main>
                </div>
            </Container>
        </div>
    )
}
