import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cart } from '@/lib/shopify/types'

interface CartState {
    cart: Cart | null;
    isOpen: boolean;
    isSyncing: boolean;
    setCart: (cart: Cart | null) => void;
    setIsOpen: (isOpen: boolean) => void;
    setIsSyncing: (isSyncing: boolean) => void;
    getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: null,
            isOpen: false,
            isSyncing: false,
            setCart: (cart) => set({ cart }),
            setIsOpen: (isOpen) => set({ isOpen }),
            setIsSyncing: (isSyncing) => set({ isSyncing }),
            getCartCount: () => {
                const cart = get().cart;
                if (!cart) return 0;
                return cart.totalQuantity || cart.lines.edges.reduce((sum, e) => sum + e.node.quantity, 0);
            }
        }),
        {
            name: 'pavlicevits-cart-storage',
            // Only store 'cart' and not UI flags like 'isOpen'
            partialize: (state) => ({ cart: state.cart }),
        }
    )
);
