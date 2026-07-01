// app/wishlist/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { getProducts } from "@/lib/db/products";
import type { Product, ProductCardData } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const wishlistProductIds = useWishlistStore(state => state.productIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await getProducts({ publishedOnly: true });
        setProducts(list);
      } catch (err) {
        console.error("Error loading products for wishlist:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter products in wishlist
  const wishlistProducts = products.filter(p => wishlistProductIds.includes(p.id));

  const wishlistCards: ProductCardData[] = wishlistProducts.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    discount: p.discount,
    image: p.images[0] || "/images/hero.png",
    category: p.category,
    inStock: p.variants.some(v => v.stock > 0)
  }));

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-4xl font-display font-medium text-brand-plum flex items-center justify-center gap-2">
            <Heart className="w-8 h-8 fill-brand-mauve text-brand-mauve" /> My Wishlist
          </h1>
          <p className="text-sm font-body text-brand-charcoal/60 mt-2">
            Your saved items. Pick your sizes and check them out in your cart.
          </p>
        </div>

        {/* Wishlist Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
            <p className="text-zinc-500 font-body text-xs">Loading wishlist items...</p>
          </div>
        ) : wishlistCards.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-card border border-brand-sand/50 shadow-sm max-w-md mx-auto p-8 space-y-4">
            <p className="text-sm text-brand-charcoal/60 font-body">Your wishlist is currently empty.</p>
            <Link href="/shop" className="block">
              <Button variant="primary" className="bg-brand-mauve text-white w-full">Explore Catalog</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistCards.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
