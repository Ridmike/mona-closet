// store/useCartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const existingIndex = state.items.findIndex(
          (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
        );

        if (existingIndex > -1) {
          const updatedItems = [...state.items];
          updatedItems[existingIndex].quantity += newItem.quantity;
          return { items: updatedItems };
        }

        return { items: [...state.items, newItem] };
      }),

      removeItem: (productId, variantId) => set((state) => ({
        items: state.items.filter(
          (item) => !(item.productId === productId && item.variantId === variantId)
        ),
      })),

      updateQuantity: (productId, variantId, qty) => set((state) => ({
        items: state.items.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: Math.max(1, qty) }
            : item
        ),
      })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "monas-closet-cart",
    }
  )
);
