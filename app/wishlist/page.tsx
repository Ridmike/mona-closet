// app/wishlist/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { getProducts } from "@/lib/db/products";
import type { Product } from "@/types";
import { discountedPrice, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const wishlistIds    = useWishlistStore(state => state.productIds);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const addToCart      = useCartStore(state => state.addItem);

  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await getProducts({ publishedOnly: true });
        setProducts(list);
      } catch (err) {
        console.error("Error loading wishlist products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  const handleAddToCart = (product: Product) => {
    const firstVariant = product.variants.find(v => v.stock > 0);
    if (!firstVariant) {
      toast.error("This item is currently out of stock.");
      return;
    }
    addToCart({
      productId:   product.id,
      variantId:   firstVariant.id,
      name:        product.name,
      image:       product.images[0] || "",
      price:       product.price,
      discount:    product.discount,
      size:        firstVariant.size,
      color:       firstVariant.color,
      quantity:    1,
      sku:         firstVariant.sku,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemove = (productId: string) => {
    toggleWishlist(productId);
    toast.success("Removed from wishlist.");
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-charcoal">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-brand-plum via-[#6b3a5a] to-brand-mauve py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <Heart
              key={i}
              className="absolute fill-white text-white"
              style={{
                width: `${Math.random() * 24 + 8}px`,
                top:   `${Math.random() * 100}%`,
                left:  `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                transform: `rotate(${Math.random() * 30 - 15}deg)`
              }}
            />
          ))}
        </div>
        <div className="relative max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-xs font-body px-4 py-1.5 rounded-full border border-white/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Your personal curated collection
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white">
            My Wishlist
          </h1>
          <p className="text-white/70 font-body text-sm max-w-md mx-auto">
            {wishlistIds.length === 0
              ? "Start exploring and save pieces you love."
              : `You have ${wishlistIds.length} saved item${wishlistIds.length !== 1 ? "s" : ""}. Ready to treat yourself?`}
          </p>
          {wishlistIds.length > 0 && (
            <Link href="/shop">
              <Button className="bg-white text-brand-plum hover:bg-brand-mist font-body font-semibold text-sm px-6 py-2.5 rounded-full border border-white/30 inline-flex items-center gap-2 transition-all">
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-brand-sand animate-spin border-t-brand-mauve" />
              <Heart className="absolute inset-0 m-auto w-6 h-6 fill-brand-mauve text-brand-mauve" />
            </div>
            <p className="text-zinc-500 font-body text-sm">Loading your saved items…</p>
          </div>

        /* Empty State */
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-24 space-y-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto border-2 border-brand-sand shadow-sm">
              <Heart className="w-12 h-12 text-brand-sand stroke-2" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display text-brand-plum">Your wishlist is empty</h2>
              <p className="text-sm font-body text-brand-charcoal/60 max-w-xs mx-auto">
                Browse our catalog and tap the ♥ on any product to save it here.
              </p>
            </div>
            <Link href="/shop">
              <Button variant="primary" className="bg-brand-mauve text-white px-8 py-3 rounded-full font-body font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                <ShoppingBag className="w-4 h-4" /> Explore Catalog
              </Button>
            </Link>
          </div>

        /* Grid */
        ) : (
          <div className="space-y-8">
            {/* Action bar */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-body text-brand-charcoal/60">
                <span className="font-semibold text-brand-plum">{wishlistProducts.length}</span>{" "}
                saved item{wishlistProducts.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => wishlistIds.forEach(id => toggleWishlist(id))}
                className="text-xs font-body text-brand-charcoal/50 hover:text-red-500 transition-colors underline underline-offset-2"
              >
                Clear all
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map(product => {
                const finalPrice  = discountedPrice(product.price, product.discount);
                const hasDiscount = !!product.discount && product.discount > 0;
                const inStock     = product.variants.some(v => v.stock > 0);

                return (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-brand-sand/30"
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-brand-sand">
                      <Image
                        src={product.images[0] || "/images/hero.png"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {hasDiscount && (
                          <span className="bg-brand-mauve text-white text-xs font-body font-semibold px-2.5 py-0.5 rounded-full">
                            -{product.discount}%
                          </span>
                        )}
                        {!inStock && (
                          <span className="bg-zinc-700 text-white text-xs font-body px-2.5 py-0.5 rounded-full">
                            Sold out
                          </span>
                        )}
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(product.id)}
                        aria-label="Remove from wishlist"
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow hover:bg-red-50 hover:text-red-500 text-brand-charcoal transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* View overlay on hover */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <span className="bg-white/90 backdrop-blur-sm text-brand-plum text-xs font-body font-semibold px-5 py-2 rounded-full shadow hover:bg-white transition-colors">
                          View Product
                        </span>
                      </Link>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-body uppercase tracking-widest text-brand-charcoal/40 mb-1">
                          {product.category}
                        </p>
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-sm font-body font-semibold text-brand-charcoal hover:text-brand-mauve transition-colors line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </Link>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-display font-semibold text-brand-plum">
                          {formatPrice(finalPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-zinc-400 line-through font-body">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!inStock}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-body font-semibold transition-all duration-200 ${
                          inStock
                            ? "bg-brand-plum text-white hover:bg-brand-mauve"
                            : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {inStock ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
