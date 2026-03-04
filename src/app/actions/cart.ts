"use server"

import { cookies } from "next/headers"
import { createCart, addToCart, removeFromCart, updateCart, getCart } from "@/lib/shopify/cart"
import { Cart } from "@/lib/shopify/types"

export async function getCartAction(): Promise<Cart | null> {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;

    if (!cartId) return null;

    try {
        const cart = await getCart(cartId);
        return cart || null;
    } catch (error) {
        console.error("Error fetching cart:", error);
        return null;
    }
}

export async function addItemToCart(variantId: string, quantity: number, attributes?: { key: string; value: string }[]): Promise<Cart | null> {
    const cookieStore = await cookies();
    let cartId = cookieStore.get('cartId')?.value;

    try {
        if (!cartId) {
            const newCart = await createCart();
            cartId = newCart.id;
            // Set cookie for 100 days
            cookieStore.set('cartId', cartId, { maxAge: 60 * 60 * 24 * 100 });
        }

        const lineItem: { merchandiseId: string; quantity: number; attributes?: { key: string; value: string }[] } = { merchandiseId: variantId, quantity };
        if (attributes && attributes.length > 0) {
            lineItem.attributes = attributes;
        }

        const updatedCart = await addToCart(cartId, [lineItem]);
        return updatedCart;
    } catch (error) {
        console.error("Error adding to cart:", error);
        return null;
    }
}

export async function updateCartItemQuantity(lineId: string, quantity: number): Promise<Cart | null> {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;
    if (!cartId) return null;

    try {
        const updatedCart = await updateCart(cartId, [{ id: lineId, quantity }]);
        return updatedCart;
    } catch (error) {
        console.error("Error updating cart:", error);
        return null;
    }
}

export async function removeCartItem(lineId: string): Promise<Cart | null> {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;
    if (!cartId) return null;

    try {
        const updatedCart = await removeFromCart(cartId, [lineId]);
        return updatedCart;
    } catch (error) {
        console.error("Error removing from cart:", error);
        return null;
    }
}
