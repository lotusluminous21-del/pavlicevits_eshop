import { getProduct } from "@/lib/shopify/client";
import { notFound } from "next/navigation";
import { ProductClient } from "./product-client";
import { Metadata } from "next";

export async function generateMetadata({
    params
}: {
    params: Promise<{ handle: string }>
}): Promise<Metadata> {
    const { handle } = await params;
    const decodedHandle = decodeURIComponent(handle);
    const product = await getProduct(decodedHandle);

    if (!product) {
        return { title: 'Product Not Found' };
    }

    return {
        title: product.seo?.title || product.title,
        description: product.seo?.description || product.description,
    };
}

export default async function ProductPage({
    params
}: {
    params: Promise<{ handle: string }>
}) {
    const { handle } = await params;
    const decodedHandle = decodeURIComponent(handle);
    const product = await getProduct(decodedHandle);

    if (!product) {
        return notFound();
    }

    return <ProductClient product={product} />;
}
