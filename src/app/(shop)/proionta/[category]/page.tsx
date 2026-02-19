"use client"

import { useParams } from "next/navigation"
import { Container } from "@/components/ui/container"
import { FilterSidebar } from "@/components/shop/filter-sidebar"
import { ProductGrid } from "@/components/shop/product-grid"
import { useCollection } from "@/hooks/useShopifyProducts"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

export default function CategoryPage() {
    const params = useParams()
    const handle = params.category as string

    // In a real app, 'category' from URL might need mapping to Shopify collection handle.
    // For now, assuming URL handle == Shopify collection handle.
    const { collection, loading, error } = useCollection(handle)

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[var(--header-height)] z-30 mt-32">
                <Container>
                    <div className="flex h-16 items-center justify-between py-4">
                        <h1 className="text-2xl font-heading font-bold text-foreground capitalize">
                            {collection?.title || handle?.replace(/-/g, ' ')}
                        </h1>
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
                                Παρουσιάστηκε σφάλμα κατά τη φόρτωση της κατηγορίας.
                            </div>
                        ) : collection ? (
                            <>
                                {collection.description && (
                                    <p className="mb-8 text-muted-foreground">{collection.description}</p>
                                )}
                                <ProductGrid products={collection.products.edges.map(e => e.node)} />
                            </>
                        ) : (
                            <div className="flex h-96 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                                Δεν βρέθηκαν προϊόντα σε αυτή την κατηγορία
                            </div>
                        )}
                    </main>
                </div>
            </Container>
        </div>
    )
}
