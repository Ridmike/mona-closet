// components/products/ProductCard.tsx
"use client";

import Link  from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye } from "lucide-react";
import { cn, formatPrice, discountedPrice } from "@/lib/utils";
import type { ProductCardData } from "@/types";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useToast } from "@/components/shared/Toast";

interface ProductCardProps {
  product:   ProductCardData;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [hovered, setHovered]     = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const wishlistIds    = useWishlistStore(state => state.productIds);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const isWishlisted   = wishlistIds.includes(product.id);

  const finalPrice   = discountedPrice(product.price, product.discount);
  const hasDiscount  = !!product.discount && product.discount > 0;
  const isOutOfStock = !product.inStock;

  return (
    <article
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl overflow-hidden",
        "border border-brand-sand/60 hover:border-brand-mauve/30",
        "shadow-sm hover:shadow-xl",
        "transition-all duration-400 ease-out",
        "hover:-translate-y-1",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image wrapper ──────────────────────────────────────────── */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-brand-sand"
        aria-label={product.name}
      >
        {/* Skeleton shimmer */}
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-brand-sand to-brand-mist" />
        )}

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "object-cover transition-transform duration-600 ease-out",
            hovered ? "scale-108" : "scale-100",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Dark gradient scrim on hover for CTA buttons */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-transparent to-transparent",
          "transition-opacity duration-300",
          hovered ? "opacity-100" : "opacity-0"
        )} />

        {/* ── Badges top-left ── */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-brand-mauve text-white text-[11px] font-semibold font-body px-2.5 py-1 rounded-full shadow-sm">
              -{product.discount}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-brand-charcoal/80 backdrop-blur-sm text-white text-[11px] font-medium font-body px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* ── Wishlist button top-right ── */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
            if (isWishlisted) {
              toast(`${product.name} removed from wishlist.`, "info");
            } else {
              toast(`${product.name} added to wishlist!`, "success");
            }
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 z-10 p-2.5 rounded-full",
            "bg-white/90 backdrop-blur-sm shadow-md",
            "transition-all duration-250",
            "hover:scale-110 hover:bg-white",
            isWishlisted
              ? "opacity-100 translate-y-0"
              : hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className={cn(
              "w-4 h-4 transition-colors duration-200",
              isWishlisted ? "fill-brand-mauve text-brand-mauve" : "fill-none text-brand-charcoal/70"
            )}
            stroke="currentColor" strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* ── Quick-action bar (slides up from bottom on hover) ── */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 z-10 flex gap-2 p-3",
          "transition-all duration-350 ease-out",
          hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); router.push(`/product/${product.slug}`); }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-sm text-brand-charcoal text-xs font-semibold font-body py-2 rounded-xl hover:bg-white transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
          {!isOutOfStock && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); router.push(`/product/${product.slug}`); }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-brand-mauve text-white text-xs font-semibold font-body py-2 rounded-xl hover:bg-brand-plum transition-colors shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Shop Now
            </button>
          )}
        </div>
      </Link>

      {/* ── Details ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between px-3.5 py-3 pt-2.5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-brand-mauve/80 font-body uppercase tracking-widest font-semibold">
            {product.category}
          </span>

          <Link
            href={`/product/${product.slug}`}
            className="text-sm font-medium text-brand-charcoal font-body line-clamp-2 hover:text-brand-mauve transition-colors leading-snug"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-bold text-brand-plum font-display">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-brand-charcoal/35 line-through font-body">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {/* In-stock dot */}
          {!isOutOfStock && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-body font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              In Stock
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent line — slides in on hover */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-blush via-brand-mauve to-brand-plum",
        "transition-all duration-400",
        hovered ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
      )} />
    </article>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-brand-sand/60 shadow-sm animate-pulse">
      <div className="aspect-[3/4] bg-gradient-to-br from-brand-sand to-brand-mist" />
      <div className="px-3.5 py-3 flex flex-col gap-2">
        <div className="h-2.5 bg-brand-sand rounded-full w-1/3" />
        <div className="h-4 bg-brand-sand rounded w-5/6" />
        <div className="h-4 bg-brand-sand rounded w-1/2 mt-1" />
      </div>
    </div>
  );
}
