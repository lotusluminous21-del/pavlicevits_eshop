"use client"

import { useParams } from "next/navigation"
import { Container } from "@/components/ui/container"
import { ProductGallery } from "@/components/shop/product-gallery"
import { ProductInfo } from "@/components/shop/product-info"
import { RelatedProducts } from "@/components/shop/related-products"
import { useProduct } from "@/hooks/useShopifyProducts"
import { Button } from "@/components/ui/button"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

export default function ProductPage() {
    const params = useParams()
    const handle = params.handle as string
    const category = params.category as string
    const subcategory = params.subcategory as string

    const { product, loading, error } = useProduct(handle)

    if (loading) {
        return (
            <div className="bg-background min-h-screen pt-20">
                <Container>
                    <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
                        <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
                        <div className="space-y-4">
                            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
                            <div className="h-32 w-full animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Το προϊόν δεν βρέθηκε</h2>
                    <Button variant="link" asChild className="mt-4">
                        <Link href="/proionta">Επιστροφή στον κατάλογο</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="border-b py-4 mt-28">
                <Container>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">
                            <Home className="h-4 w-4" />
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href="/proionta" className="hover:text-foreground">
                            Προϊόντα
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href={`/proionta/${category}`} className="capitalize hover:text-foreground">
                            {category.replace(/-/g, ' ')}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="truncate text-foreground font-medium">{product.title}</span>
                    </div>
                </Container>
            </div>

            <Container className="pt-10">
                <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
                    {/* Gallery */}
                    <div>
                        <ProductGallery images={product.images.edges.map(e => e.node)} />
                    </div>

                    {/* Info */}
                    <div className="md:sticky md:top-24 h-fit">
                        <ProductInfo product={product} />
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-16 md:mt-24">
                    <RelatedProducts id={product.id} />
                </div>
            </Container>
        </div>
    )
}
