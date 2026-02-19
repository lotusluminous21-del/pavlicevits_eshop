import { createShopifyProduct, updateShopifyProduct, deleteShopifyProduct, getShopifyProduct } from '@/lib/shopify/admin';

/**
 * Publishes or Updates a product from Staging (Firestore) to Shopify Production.
 * Establishes Shopify as the Single Source of Truth for Commerce data.
 */
export async function publishProductAction(sku: string, productData: any) {
    console.log("Syncing product to Shopify:", sku);

    // 1. Fetch current remote state if product is already live
    let remoteProduct: any = null;
    if (productData.shopify_product_id) {
        try {
            remoteProduct = await getShopifyProduct(productData.shopify_product_id);
            console.log("Fetched remote Shopify state for merge");
        } catch (e) {
            console.error("Could not fetch remote product, proceeding with local data baseline", e);
        }
    }

    // 2. Format Technical Specs & Attributes into HTML for Description
    // We prioritize Lab-owned enrichment fields
    let enrichedDescription = productData.ai_data?.description_el || productData.pylon_data?.description || "";

    const specs = productData.ai_data?.technical_specs || {};
    const attributes = productData.ai_data?.attributes || {};
    const bulkPrice = productData.pylon_data?.price_bulk;

    if (bulkPrice && bulkPrice > 0) {
        enrichedDescription += `<p><strong>Wholesale Price:</strong> €${bulkPrice.toFixed(2)}</p>`;
    }

    if (Object.keys(specs).length > 0) {
        enrichedDescription += `<h3>Technical Specifications</h3><ul>`;
        Object.entries(specs).forEach(([key, value]) => {
            enrichedDescription += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${Array.isArray(value) ? value.join(", ") : value}</li>`;
        });
        enrichedDescription += `</ul>`;
    }

    if (Object.keys(attributes).length > 0) {
        enrichedDescription += `<h3>Product Features</h3><ul>`;
        Object.entries(attributes).forEach(([key, value]) => {
            enrichedDescription += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</li>`;
        });
        enrichedDescription += `</ul>`;
    }

    // 3. Prepare Variant Payload
    // Priority: remoteProduct price/inventory > pylon_data
    const basePrice = remoteProduct?.variants?.[0]?.price || String(productData.pylon_data?.price_retail || "0.00");
    const baseInventory = remoteProduct?.variants?.[0]?.inventory_quantity;

    const variants = productData.ai_data?.variants && productData.ai_data.variants.length > 0
        ? productData.ai_data.variants.map((v: any, index: number) => ({
            price: remoteProduct?.variants?.[index]?.price || basePrice,
            sku: `${sku}-${v.sku_suffix}`,
            option1: v.option_value,
            inventory_quantity: remoteProduct?.variants?.[index]?.inventory_quantity || 0,
            requires_shipping: true
        }))
        : [
            {
                price: basePrice,
                sku: productData.sku,
                inventory_quantity: baseInventory !== undefined ? baseInventory : (productData.pylon_data?.stock_quantity || 0),
                requires_shipping: true
            }
        ];

    // 4. Prepare Final Payload (Remote-First Merge)
    const shopifyPayload: any = {
        title: productData.ai_data?.title_el || remoteProduct?.title || productData.pylon_data?.name || productData.sku,
        body_html: enrichedDescription,
        vendor: remoteProduct?.vendor || "Nano Studio",
        product_type: remoteProduct?.product_type || productData.ai_data?.category || "Hardware",
        tags: remoteProduct?.tags
            ? Array.from(new Set([...remoteProduct.tags.split(', '), ...(productData.ai_data?.tags || []), "StagingApproved", "NanoLab"])).join(', ')
            : [...(productData.ai_data?.tags || []), "StagingApproved", "NanoLab"],
        variants: variants,
        options: productData.ai_data?.variants && productData.ai_data.variants.length > 0
            ? [{ name: productData.ai_data.variants[0].option_name, values: productData.ai_data.variants.map((v: any) => v.option_value) }]
            : []
    };

    // Images: If remote has images and Lab doesn't provide new ones, keep remote; otherwise prefer Lab (Mirror Storefront design)
    if (productData.ai_data?.images?.length > 0) {
        shopifyPayload.images = productData.ai_data.images.map((img: any) => ({
            src: img.url,
            altText: productData.ai_data?.title_el || productData.sku
        }));
    }

    try {
        let shopifyProduct;
        if (productData.shopify_product_id) {
            console.log("Updating existing Shopify product with remote-first merge:", productData.shopify_product_id);
            shopifyProduct = await updateShopifyProduct(productData.shopify_product_id, shopifyPayload);
        } else {
            console.log("Creating new Shopify product");
            shopifyProduct = await createShopifyProduct(shopifyPayload);
        }

        return {
            success: true,
            shopifyId: String(shopifyProduct.id),
            handle: shopifyProduct.handle
        };
    } catch (error) {
        console.error("Shopify Sync failed:", error);
        return {
            success: false,
            error: (error as Error).message
        };
    }
}

/**
 * Removes a product from Shopify Production.
 */
export async function unpublishProductAction(shopifyProductId: string | number) {
    try {
        await deleteShopifyProduct(shopifyProductId);
        return { success: true };
    } catch (error) {
        console.error("Shopify Unpublish failed:", error);
        return {
            success: false,
            error: (error as Error).message
        };
    }
}
