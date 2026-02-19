import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import crypto from 'crypto';

/**
 * Shopify Webhook Endpoint: /api/webhooks/shopify
 * Handles 'products/update' events to maintain Shopify as the Single Source of Truth.
 */
export async function POST(req: NextRequest) {
    try {
        const hmac = req.headers.get('x-shopify-hmac-sha256');
        const body = await req.text();
        const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

        // 0. Verify HMAC Signature for Security
        if (secret) {
            const digest = crypto
                .createHmac('sha256', secret)
                .update(body, 'utf8')
                .digest('base64');

            if (digest !== hmac) {
                console.error("[Shopify Webhook] Invalid HMAC signature");
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const payload = JSON.parse(body);
        const shopifyProductId = String(payload.id);

        console.log(`[Shopify Webhook] Received update for Product ID: ${shopifyProductId}`);

        if (!db) {
            console.error("[Shopify Webhook] Firebase DB not initialized");
            return NextResponse.json({ error: "DB not available" }, { status: 500 });
        }

        // 1. Find the corresponding product in Staging Lab
        const productsRef = collection(db, "staging_products");
        const q = query(productsRef, where("shopify_product_id", "==", shopifyProductId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.warn(`[Shopify Webhook] No matching Lab product found for Shopify ID: ${shopifyProductId}`);
            return NextResponse.json({ message: "No match found" }, { status: 200 }); // Still 200 to acknowledge Shopify
        }

        // 2. Extract key commerce data from Shopify payload
        const firstVariant = payload.variants?.[0];
        const newPrice = firstVariant ? parseFloat(firstVariant.price) : 0;
        const newStock = firstVariant ? firstVariant.inventory_quantity : 0;
        const newTags = payload.tags ? payload.tags.split(',').map((t: string) => t.trim()) : [];
        const newTitle = payload.title;

        // 3. Update the Lab baseline in Firestore
        // We update pylon_data to reflect reality, and potentially raw tags
        const updatePromises = querySnapshot.docs.map(productDoc => {
            return updateDoc(doc(db!, "staging_products", productDoc.id), {
                "pylon_data.price_retail": newPrice,
                "pylon_data.stock_quantity": newStock,
                "pylon_data.name": newTitle, // We update name to track Shopify title
                "last_remote_sync": new Date().toISOString(),
                // We keep ai_data.title_el as the Greek translation, but maybe mark if out of sync
            });
        });

        await Promise.all(updatePromises);
        console.log(`[Shopify Webhook] Successfully updated Lab data for ${shopifyProductId}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Shopify Webhook] Error processing request:", error);
        return NextResponse.json({ error: "Interal Error" }, { status: 500 });
    }
}
