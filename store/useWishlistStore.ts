// store/useWishlistStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  productIds: string[];
  toggleWishlist: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      
      toggleWishlist: (productId) => {
        const ids = get().productIds;
        const exists = ids.includes(productId);
        if (exists) {
          set({ productIds: ids.filter((id) => id !== productId) });
        } else {
          set({ productIds: [...ids, productId] });
        }
      },
    }),
    {
      name: "monas-closet-wishlist",
    }
  )
);
