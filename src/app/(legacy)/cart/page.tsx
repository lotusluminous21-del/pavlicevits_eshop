import { getCart } from "@/lib/shopify/cart";
import { CartClient } from "./cart-client";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your Cart | Pavlicevits",
    description: "Review your selected premium products",
};

export default async function CartPage() {
    // A robust Shopify implementation would pull 'cartId' from cookies here 
    // to hydrate the server-side with any existing cart session:
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;

    let cart = null;

    if (cartId) {
        cart = await getCart(cartId);
    }

    // For demonstration, if no cartId was found or fetch failed, 
    // cart will safely be null, triggering the EmptyCartState
    return <CartClient initialCart={cart} />;
}
