"use client"

import * as React from "react"
import { Cart } from "@/lib/shopify/types"
import { Header } from "@/components/ui/skeumorphic/header"
import { BottomNav } from "@/components/ui/skeumorphic/bottom-nav"
import { QuantitySelector } from "@/components/ui/skeumorphic/quantity-selector"
import { PrimaryButton } from "@/components/ui/skeumorphic/primary-button"
import { EmptyCartState } from "@/components/ui/skeumorphic/empty-cart-state"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useCartStore } from "@/store/cart-store"
import { updateCartItemQuantity, removeCartItem } from "@/app/actions/cart"

export function CartClient({ initialCart }: { initialCart?: Cart | null }) {
    const { cart, setCart, isSyncing, setIsSyncing } = useCartStore();
    const [isCheckingOut, setIsCheckingOut] = React.useState(false);

    // Sync initial server cart to Zustand if the server cart differs
    React.useEffect(() => {
        if (initialCart && (!cart || cart.id !== initialCart.id)) {
            setCart(initialCart);
        }
    }, [initialCart, cart, setCart]);

    // Use zustand cart as primary display logic instead of raw initial
    const displayCart = cart || initialCart;

    const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
        if (isSyncing) return;
        setIsSyncing(true);
        // Optimistic bounds
        const q = Math.max(1, newQuantity);
        try {
            const updatedCart = await updateCartItemQuantity(lineId, q);
            if (updatedCart) setCart(updatedCart);
        } catch (e) {
            console.error(e);
        }
        setIsSyncing(false);
    };

    const handleRemoveLine = async (lineId: string) => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            const updatedCart = await removeCartItem(lineId);
            if (updatedCart) setCart(updatedCart);
        } catch (e) {
            console.error(e);
        }
        setIsSyncing(false);
    }

    const handleCheckout = () => {
        if (!displayCart?.checkoutUrl) return;
        setIsCheckingOut(true);
        window.location.href = displayCart.checkoutUrl;
    };

    const hasItems = displayCart && displayCart.lines.edges.length > 0;

    return (
        <div className="min-h-screen bg-[#ffffff] flex flex-col font-sans mb-[80px]">
            <Header showBack title="Your Cart" />

            <main className="flex-1 w-full max-w-md mx-auto relative px-4 md:px-8 mt-[90px] md:mt-[100px] mb-24 z-10 flex flex-col">
                {!hasItems ? (
                    <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                        <EmptyCartState />
                    </div>
                ) : (
                    <>
                        <div className={cn("space-y-6 flex-1 transition-opacity", isSyncing && "opacity-70")}>
                            {displayCart.lines.edges.map(({ node }) => (
                                <div key={node.id} className="p-4 rounded-[28px] bg-[#ffffff] shadow-sm flex gap-4 pr-6">
                                    <div className="w-[80px] h-[80px] shrink-0 rounded-[20px] bg-[#ffffff] shadow-sm p-2 relative">
                                        {node.merchandise.image && (
                                            <Image
                                                src={node.merchandise.image.url}
                                                alt={node.merchandise.title}
                                                fill
                                                className="object-contain drop-shadow-sm p-2"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1 flex flex-col">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2">
                                                {node.merchandise.product.title}
                                            </h3>
                                            <button
                                                onClick={() => handleRemoveLine(node.id)}
                                                disabled={isSyncing}
                                                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm active:shadow-sm outline-none transition-all disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {node.merchandise.title !== "Default Title" && (
                                            <p className="text-[13px] font-medium text-slate-500 mb-2">{node.merchandise.title}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="font-extrabold text-slate-900 text-lg">
                                                {node.merchandise.price.currencyCode === 'EUR' ? '€' : '$'}{Number(node.merchandise.price.amount).toFixed(2)}
                                            </span>
                                            <QuantitySelector
                                                value={node.quantity}
                                                onValueChange={(v) => handleUpdateQuantity(node.id, Math.max(1, v))}
                                                className={cn("h-[36px] min-w-[90px]", isSyncing && "pointer-events-none opacity-50")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary & Checkout Box */}
                        <div className="mt-8 p-6 rounded-[32px] bg-[#ffffff] shadow-sm space-y-4 fixed bottom-[88px] left-[5%] right-[5%] md:relative md:bottom-auto md:left-auto md:right-auto md:w-full z-40 backdrop-blur-md bg-opacity-95 md:bg-opacity-100">
                            <div className="flex justify-between items-center px-2">
                                <span className="font-bold text-slate-600">Subtotal</span>
                                <span className="font-bold text-slate-800">
                                    {displayCart.cost.subtotalAmount.currencyCode === 'EUR' ? '€' : '$'}{Number(displayCart.cost.subtotalAmount.amount).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center px-2 pb-2 border-b border-black/5">
                                <span className="font-bold text-slate-600">Taxes & Shipping</span>
                                <span className="font-medium text-slate-500 text-sm">Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between items-center px-2 pb-2">
                                <span className="font-black text-slate-900 text-xl">Total</span>
                                <span className="font-black text-primary text-2xl">
                                    {displayCart.cost.totalAmount.currencyCode === 'EUR' ? '€' : '$'}{Number(displayCart.cost.totalAmount.amount).toFixed(2)}
                                </span>
                            </div>

                            <PrimaryButton
                                className="w-full mt-2"
                                onClick={handleCheckout}
                                disabled={isCheckingOut || !displayCart.checkoutUrl || isSyncing}
                            >
                                {isCheckingOut ? "Preparing checkout..." : "Proceed to Checkout"}
                            </PrimaryButton>
                        </div>
                    </>
                )}
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
