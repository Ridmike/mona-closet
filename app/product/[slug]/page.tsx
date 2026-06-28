// app/product/[slug]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { getProductBySlug } from "@/lib/db/products";
import type { Product, ProductVariant, CartItem, ProductSize, ProductColor } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Button } from "@/components/ui/Button";
import { formatPrice, discountedPrice } from "@/lib/utils";
import { Heart, ShoppingBag, Truck, ShieldAlert, Award, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // we see sonner in package.json!

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  // Data States
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");

  // Selection States
  const [selectedSize, setSelectedSize] = useState<ProductSize | "">("");
  const [selectedColorName, setSelectedColorName] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Cart / Wishlist Hooks
  const addItem = useCartStore(state => state.addItem);
  const toggleWishlist = useWishlistStore(state => state.toggleWishlist);
  const wishlistProductIds = useWishlistStore(state => state.productIds);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const data = await getProductBySlug(slug);
        if (data) {
          setProduct(data);
          if (data.images.length > 0) {
            setSelectedImage(data.images[0]);
          }
          
          // Pre-select first available variant if present
          if (data.variants.length > 0) {
            const firstAvailable = data.variants.find(v => v.stock > 0) || data.variants[0];
            setSelectedSize(firstAvailable.size);
            setSelectedColorName(firstAvailable.color.name);
          }
        }
      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 bg-brand-cream text-brand-plum">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-mauve" />
        <p className="font-body text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-4 bg-brand-cream text-brand-plum px-4">
        <h2 className="text-2xl font-display">Product Not Found</h2>
        <p className="text-sm font-body text-zinc-500">The page you are looking for does not exist or has been removed.</p>
        <Link href="/shop">
          <Button variant="primary" className="bg-brand-mauve text-white">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  // Get unique colors and sizes available in variants
  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)));
  
  const uniqueColorsMap = new Map<string, ProductColor>();
  product.variants.forEach(v => {
    uniqueColorsMap.set(v.color.name, v.color);
  });
  const uniqueColors = Array.from(uniqueColorsMap.values());

  // Find selected variant
  const selectedVariant = product.variants.find(v => 
    v.size === selectedSize && v.color.name === selectedColorName
  );

  const isFavorited = wishlistProductIds.includes(product.id);

  // Price calculations
  const hasDiscount = !!product.discount && product.discount > 0;
  const unitPrice = discountedPrice(product.price, product.discount);

  // Stock status
  const stockCount = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = stockCount === 0;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColorName) {
      toast.error("Please select a size and color variant.");
      return;
    }

    if (!selectedVariant) {
      toast.error("Selected combination is unavailable.");
      return;
    }

    if (isOutOfStock) {
      toast.error("This variant is currently out of stock.");
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      image: product.images[0] || "",
      price: product.price,
      discount: product.discount,
      size: selectedSize as ProductSize,
      color: selectedVariant.color,
      quantity: quantity
    };

    addItem(cartItem);
    toast.success(`${product.name} (${selectedSize}, ${selectedColorName}) added to cart!`);
  };

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-brand-charcoal/50 font-body">
          <Link href="/" className="hover:text-brand-mauve transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-brand-mauve transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-mauve transition-colors">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-charcoal truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Images Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[3/4] bg-white rounded-card overflow-hidden relative shadow-sm border border-brand-sand/40">
              <img
                src={selectedImage || "/images/hero.png"}
                alt={product.name}
                className="w-full h-full object-cover object-center animate-fade-in"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-brand-mauve text-white text-xs font-semibold px-2.5 py-1 rounded-pill">
                  -{product.discount}% OFF
                </span>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 aspect-[3/4] rounded border overflow-hidden shrink-0 transition-all ${
                      selectedImage === img 
                        ? "border-brand-mauve ring-1 ring-brand-mauve" 
                        : "border-brand-sand/55 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Block */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-brand-mauve font-semibold font-body">
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-medium text-brand-plum leading-tight">
                {product.name}
              </h1>
              
              {/* Price display */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl font-bold text-brand-plum font-display">
                  {formatPrice(unitPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-brand-charcoal/40 line-through font-body">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-brand-charcoal/80 leading-relaxed font-body border-t border-b border-brand-sand/50 py-4">
              {product.description || "Beautiful crafted design with maximum comfort and premium finishes. Selected directly from Mona's Closet catalog."}
            </p>

            {/* Selection Options */}
            <div className="space-y-4 pt-2">
              
              {/* Sizes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 font-body uppercase">Select Size</span>
                <div className="flex flex-wrap gap-2 text-xs font-body font-semibold">
                  {uniqueSizes.map(s => {
                    const isSizeAvailable = product.variants.some(v => v.size === s && v.stock > 0);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setSelectedSize(s); setQuantity(1); }}
                        className={`w-12 h-10 border rounded flex items-center justify-center transition-all ${
                          selectedSize === s
                            ? "bg-brand-mauve border-brand-mauve text-white shadow-sm"
                            : isSizeAvailable
                              ? "border-brand-sand bg-white text-brand-charcoal hover:border-brand-mauve"
                              : "border-zinc-200 bg-zinc-50/50 text-zinc-300 cursor-not-allowed line-through"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 font-body uppercase">Select Color</span>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map(c => {
                    const isColorAvailable = product.variants.some(v => v.color.name === c.name && v.stock > 0);
                    const isSelected = selectedColorName === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => { setSelectedColorName(c.name); setQuantity(1); }}
                        disabled={!isColorAvailable}
                        className={`group relative flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
                          isSelected 
                            ? "ring-2 ring-brand-mauve border-white"
                            : "border-brand-sand/60 hover:scale-105"
                        } ${!isColorAvailable ? "opacity-30 cursor-not-allowed" : ""}`}
                        title={c.name}
                      >
                        <span className="w-6 h-6 rounded-full border border-zinc-200" style={{ backgroundColor: c.hex }} />
                        {isSelected && (
                          <Check className="absolute w-3.5 h-3.5 text-white stroke-[3] mix-blend-difference" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Variant stock feedback */}
              {selectedSize && selectedColorName && (
                <div className="text-xs font-body pt-1">
                  {isOutOfStock ? (
                    <p className="text-red-650 flex items-center gap-1 font-bold"><ShieldAlert className="w-4 h-4 shrink-0" /> Sold out in selected combination.</p>
                  ) : stockCount <= 2 ? (
                    <p className="text-amber-600 font-bold flex items-center gap-1"><ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" /> Only {stockCount} items left in stock!</p>
                  ) : (
                    <p className="text-emerald-700 flex items-center gap-1 font-semibold"><Check className="w-4 h-4 shrink-0" /> Variant in stock & ready to ship.</p>
                  )}
                </div>
              )}

            </div>

            {/* Quantity controls and Cart/Wishlist actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-brand-sand/50">
              
              {/* Qty increment */}
              <div className="flex items-center border border-brand-sand bg-white rounded-card h-12 w-32 justify-between px-3 shrink-0">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(quantity - 1)}
                  className="font-bold text-lg text-brand-charcoal/50 hover:text-brand-charcoal disabled:opacity-30"
                >
                  -
                </button>
                <span className="font-bold font-body">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= stockCount || isOutOfStock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="font-bold text-lg text-brand-charcoal/50 hover:text-brand-charcoal disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <Button
                variant="primary"
                disabled={isOutOfStock || !selectedSize || !selectedColorName}
                onClick={handleAddToCart}
                className="w-full h-12 bg-brand-mauve text-white hover:bg-brand-plum rounded-card flex justify-center items-center gap-2 font-semibold shadow-sm"
              >
                <ShoppingBag className="w-4.5 h-4.5" /> Add to Cart
              </Button>

              {/* Wishlist toggle */}
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product.id);
                  if (isFavorited) {
                    toast.success("Removed from wishlist.");
                  } else {
                    toast.success("Added to wishlist.");
                  }
                }}
                className={`h-12 w-12 flex items-center justify-center border border-brand-sand rounded-card bg-white hover:bg-zinc-50 shrink-0 transition-colors ${
                  isFavorited ? "text-brand-mauve" : "text-brand-charcoal/50"
                }`}
                title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Shipping details / highlights */}
            <div className="bg-brand-mist/50 border border-brand-sand/40 p-4 rounded-card text-xs text-brand-charcoal/80 space-y-3 font-body">
              <div className="flex gap-2.5 items-start">
                <Truck className="w-4.5 h-4.5 text-brand-plum shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-plum">Islandwide Delivery (COD)</p>
                  <p className="text-zinc-500 mt-0.5">Delivered in 2-3 business days. Flat Rs. 350 shipping, or FREE on orders over Rs. 5,000.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <Award className="w-4.5 h-4.5 text-brand-plum shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-plum">Guaranteed Customer Care</p>
                  <p className="text-zinc-500 mt-0.5">Confirm order details via WhatsApp. Easy sizing exchanges.</p>
                </div>
              </div>
            </div>

            {/* Attributes Table */}
            <div className="space-y-2 pt-2 text-xs font-body">
              <h3 className="font-bold font-display text-brand-plum">Specifications</h3>
              <div className="divide-y divide-brand-sand/40 border-t border-b border-brand-sand/40">
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Brand</span>
                  <span className="font-semibold">{product.brand || "Mona's Closet"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-zinc-400">Material</span>
                  <span className="font-semibold">{product.material || "Linen Blend"}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
