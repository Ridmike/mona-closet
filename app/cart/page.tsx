// app/cart/page.tsx
"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/Button";
import { formatPrice, discountedPrice, cartSubtotal, computeShipping } from "@/lib/utils";
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CartPage() {
  const cartItems = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  // Subtotal, shipping, total
  const subtotal = cartSubtotal(cartItems);
  const shippingFee = computeShipping(subtotal);
  const total = subtotal + shippingFee;

  const handleQtyChange = (productId: string, variantId: string, val: number, maxStock: number) => {
    if (val < 1) return;
    updateQuantity(productId, variantId, val);
  };

  const handleRemove = (productId: string, variantId: string, name: string) => {
    removeItem(productId, variantId);
    toast.success(`${name} removed from cart.`);
  };

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-4xl font-display font-medium text-brand-plum flex items-center justify-center gap-2">
            <ShoppingBag className="w-8 h-8 text-brand-mauve" /> Shopping Bag
          </h1>
          <p className="text-sm font-body text-brand-charcoal/60 mt-2">
            Manage your selected apparel items and proceed to cash on delivery checkout.
          </p>
        </div>

        {/* Layout */}
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-card border border-brand-sand/50 shadow-sm max-w-md mx-auto p-8 space-y-4">
            <p className="text-sm text-brand-charcoal/60 font-body">Your cart is currently empty.</p>
            <Link href="/shop" className="block">
              <Button variant="primary" className="bg-brand-mauve text-white w-full">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items list */}
            <div className="lg:col-span-8 bg-white p-6 rounded-card border border-brand-sand/50 shadow-sm space-y-4">
              <h2 className="text-md font-bold font-display text-brand-plum border-b border-brand-sand/50 pb-3">
                Items In Bag ({cartItems.length})
              </h2>

              <div className="divide-y divide-zinc-100">
                {cartItems.map((item, idx) => {
                  const finalPrice = discountedPrice(item.price, item.discount);
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 py-4 items-start sm:items-center">
                      {/* Image */}
                      <div className="w-20 aspect-[3/4] bg-brand-sand rounded overflow-hidden shrink-0 relative border border-zinc-150">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      
                      {/* Title & variant */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.productId}`} className="font-semibold text-zinc-950 hover:text-brand-mauve transition-colors truncate block">
                          {item.name}
                        </Link>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Size: <span className="font-semibold">{item.size}</span> | Color: <span className="font-semibold">{item.color.name}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-xs font-semibold text-zinc-800">{formatPrice(finalPrice)}</span>
                          {item.discount ? (
                            <span className="text-[10px] text-brand-plum bg-brand-blush/30 px-1.5 py-0.5 rounded-full">
                              -{item.discount}%
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-4 shrink-0 justify-between w-full sm:w-auto">
                        <div className="flex items-center border border-zinc-200 bg-white rounded h-8 justify-between w-24 px-2">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() => handleQtyChange(item.productId, item.variantId, item.quantity - 1, 99)}
                            className="font-bold text-zinc-400 hover:text-zinc-700 text-sm"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold font-body">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.productId, item.variantId, item.quantity + 1, 99)}
                            className="font-bold text-zinc-400 hover:text-zinc-700 text-sm"
                          >
                            +
                          </button>
                        </div>

                        {/* Price summary */}
                        <div className="text-right min-w-[80px]">
                          <span className="font-bold text-sm text-brand-plum font-display">{formatPrice(finalPrice * item.quantity)}</span>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item.productId, item.variantId, item.name)}
                          className="text-zinc-300 hover:text-red-600 transition-colors p-1.5 hover:bg-zinc-50 rounded"
                          title="Remove item"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-brand-sand/50 flex justify-between items-center text-xs">
                <Link href="/shop" className="inline-flex items-center gap-1.5 font-semibold text-brand-mauve hover:text-brand-plum transition-colors font-body">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back To Shop
                </Link>
              </div>
            </div>

            {/* Summary card */}
            <div className="lg:col-span-4 bg-white p-6 rounded-card border border-brand-sand/50 shadow-sm space-y-6">
              <h2 className="text-md font-bold font-display text-brand-plum border-b border-brand-sand/50 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-xs text-brand-charcoal/80 font-body">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-zinc-900">{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
                </div>
                
                {shippingFee > 0 && (
                  <div className="bg-brand-blush/10 border border-brand-blush/20 p-2.5 rounded text-[11px] text-brand-plum leading-normal">
                    💡 Add <span className="font-bold">{formatPrice(5000 - subtotal)}</span> more to unlock **FREE SHIPPING**!
                  </div>
                )}

                <div className="flex justify-between border-t border-brand-sand/50 pt-3 text-sm font-bold text-brand-plum">
                  <span>Grand Total</span>
                  <span className="font-display">{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button variant="primary" className="bg-brand-mauve text-white hover:bg-brand-plum rounded-card w-full py-3 flex items-center justify-center gap-2 font-semibold">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
