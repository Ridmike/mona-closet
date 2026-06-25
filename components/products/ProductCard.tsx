// components/products/ProductCard.tsx
"use client";

import Link  from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn, formatPrice, discountedPrice } from "@/lib/utils";
import type { ProductCardData } from "@/types";

interface ProductCardProps {
  product:   ProductCardData;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [hovered, setHovered]       = useState(false);
  const [wishlist, setWishlist]     = useState(false);
  const [imgLoaded, setImgLoaded]   = useState(false);

  const finalPrice   = discountedPrice(product.price, product.discount);
  const hasDiscount  = !!product.discount && product.discount > 0;
  const isOutOfStock = !product.inStock;

  return (
    <article
      className={cn(
        "group relative flex flex-col bg-white rounded-card overflow-hidden",
        "shadow-card hover:shadow-card-hover transition-shadow duration-300",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image wrapper */}
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
            "object-cover transition-transform duration-500 ease-brand-ease",
            hovered ? "scale-105" : "scale-100",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Overlay badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="bg-brand-mauve text-white text-xs font-medium font-body px-2 py-0.5 rounded-pill">
              -{product.discount}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-brand-charcoal/80 text-white text-xs font-medium font-body px-2 py-0.5 rounded-pill">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setWishlist((w) => !w);
          }}
          aria-label={wishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-sm",
            "transition-all duration-200",
            hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
            "hover:bg-white shadow-sm"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className={cn(
              "w-4 h-4 transition-colors duration-200",
              wishlist ? "fill-brand-mauve text-brand-mauve" : "fill-none text-brand-charcoal"
            )}
            stroke="currentColor" strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </Link>

      {/* Details */}
      <div className="flex flex-col gap-1 p-3">
        <span className="text-xs text-brand-charcoal/50 font-body uppercase tracking-wide">
          {product.category}
        </span>

        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-medium text-brand-charcoal font-body line-clamp-2 hover:text-brand-mauve transition-colors"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-base font-semibold text-brand-plum font-display">
            {formatPrice(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-brand-charcoal/40 line-through font-body">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-card overflow-hidden shadow-card animate-pulse">
      <div className="aspect-[3/4] bg-brand-sand" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 bg-brand-sand rounded w-1/3" />
        <div className="h-4 bg-brand-sand rounded w-5/6" />
        <div className="h-4 bg-brand-sand rounded w-1/2 mt-1" />
      </div>
    </div>
  );
}
