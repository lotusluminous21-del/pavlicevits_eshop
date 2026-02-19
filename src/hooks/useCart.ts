"use client"

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    createCart,
    addToCart,
    removeFromCart,
    updateCart,
    getCart
} from '@/lib/shopify/cart';
import type { Cart, CartLine } from '@/lib/shopify/types';

interface CartState {
    cart: Cart | null;
    isOpen: boolean;
    isLoading: boolean;
    error: Error | null;

    // Actions
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;

    initializeCart: () => Promise<void>;
    addItem: (variantId: string, quantity: number) => Promise<void>;
    removeItem: (lineId: string) => Promise<void>;
    updateItemQuantity: (lineId: string, quantity: number) => Promise<void>;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            cart: null,
            isOpen: false,
            isLoading: false,
            error: null,

            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            initializeCart: async () => {
                const { cart, isLoading } = get();
                if (isLoading) return;

                set({ isLoading: true, error: null });

                try {
                    let newCart: Cart;

                    if (cart?.id) {
                        // Refresh existing cart
                        const refreshedCart = await getCart(cart.id);
                        if (refreshedCart) {
                            newCart = refreshedCart;
                        } else {
                            // Cart expired or not found
                            newCart = await createCart();
                        }
                    } else {
                        newCart = await createCart();
                    }

                    set({ cart: newCart, isLoading: false });
                } catch (error) {
                    console.error('Error initializing cart:', error);
                    set({ error: error as Error, isLoading: false, cart: null });
                    // Retry creation if fetch failed (simple retry logic)
                    try {
                        const newCart = await createCart();
                        set({ cart: newCart, error: null });
                    } catch (retryError) {
                        set({ error: retryError as Error });
                    }
                }
            },

            addItem: async (variantId, quantity) => {
                const { cart, initializeCart } = get();
                let currentCartId = cart?.id;

                set({ isLoading: true, error: null, isOpen: true }); // Open cart when adding

                try {
                    if (!currentCartId) {
                        await initializeCart();
                        currentCartId = get().cart?.id;
                        if (!currentCartId) throw new Error("Failed to initialize cart");
                    }

                    const updatedCart = await addToCart(currentCartId, [{ merchandiseId: variantId, quantity }]);
                    set({ cart: updatedCart, isLoading: false });
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    set({ error: error as Error, isLoading: false });
                }
            },

            removeItem: async (lineId) => {
                const { cart } = get();
                if (!cart?.id) return;

                set({ isLoading: true, error: null });

                try {
                    const updatedCart = await removeFromCart(cart.id, [lineId]);
                    set({ cart: updatedCart, isLoading: false });
                } catch (error) {
                    console.error('Error removing from cart:', error);
                    set({ error: error as Error, isLoading: false });
                }
            },

            updateItemQuantity: async (lineId, quantity) => {
                const { cart } = get();
                if (!cart?.id) return;

                set({ isLoading: true, error: null });

                try {
                    const updatedCart = await updateCart(cart.id, [{ id: lineId, quantity }]);
                    set({ cart: updatedCart, isLoading: false });
                } catch (error) {
                    console.error('Error updating cart item:', error);
                    set({ error: error as Error, isLoading: false });
                }
            },
        }),
        {
            name: 'pavlicevits-cart',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ cart: state.cart }), // Only persist the cart data
        }
    )
);
