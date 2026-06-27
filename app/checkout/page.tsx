// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCartStore } from "@/store/useCartStore";
import { getProduct, updateProduct } from "@/lib/db/products";
import { createOrder } from "@/lib/db/orders";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { 
  formatPrice, 
  cartSubtotal, 
  computeShipping, 
  generateOrderNumber, 
  isValidSLPhone 
} from "@/lib/utils";
import { CheckCircle2, Lock, ShieldCheck, Truck, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const cartItems = useCartStore(state => state.items);
  const clearCart = useCartStore(state => state.clearCart);
  const router = useRouter();

  // Shipping form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null); // success order number

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to place an order.");
      router.push("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-brand-cream text-brand-plum">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-mauve" />
        <p className="font-body text-sm">Verifying session...</p>
      </div>
    );
  }

  if (!user) return null;

  const subtotal = cartSubtotal(cartItems);
  const shippingFee = computeShipping(subtotal);
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!isValidSLPhone(phone)) {
      toast.error("Please enter a valid Sri Lankan mobile number (e.g. 0771234567).");
      return;
    }

    try {
      setLoading(true);
      const orderNumber = generateOrderNumber();

      const orderPayload = {
        orderNumber,
        customerId: user.uid,
        customerEmail: user.email || "",
        items: cartItems,
        shippingAddress: {
          fullName,
          phone,
          line1,
          line2: line2 || undefined,
          city,
          district,
          postalCode: postalCode || undefined
        },
        paymentMethod: "cod" as const,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        status: "pending" as const,
        notes: notes || undefined
      };

      // 1. Write the order to the database
      await createOrder(orderPayload);

      // 2. Decrement inventory stock levels
      for (const item of cartItems) {
        const product = await getProduct(item.productId);
        if (product) {
          const updatedVariants = product.variants.map(v => {
            if (v.id === item.variantId) {
              return {
                ...v,
                stock: Math.max(0, v.stock - item.quantity)
              };
            }
            return v;
          });
          await updateProduct(product.id, { variants: updatedVariants });
        }
      }

      // 3. Clear shopping cart
      clearCart();

      // 4. Trigger success screen
      setOrderSuccess(orderNumber);
      toast.success("Order placed successfully!");
      
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while placing the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success view
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-brand-cream py-16 px-4 flex items-center justify-center font-sans text-brand-charcoal">
        <div className="max-w-md w-full bg-white p-8 rounded-card border border-brand-sand/55 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-display font-medium text-brand-plum">Order Placed!</h1>
            <p className="text-xs font-body text-zinc-500">
              Thank you for shopping at Mona's Closet. Your order has been registered in our database.
            </p>
          </div>

          <div className="bg-zinc-50 p-4 rounded-card border border-zinc-150 space-y-2 text-sm font-body">
            <div className="flex justify-between border-b border-zinc-200/50 pb-2">
              <span className="text-zinc-400">Order Number</span>
              <span className="font-semibold text-brand-plum font-mono">{orderSuccess}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-zinc-400">Payment Mode</span>
              <span className="font-semibold text-emerald-700 uppercase">Cash on Delivery</span>
            </div>
          </div>

          <div className="bg-brand-blush/10 border border-brand-blush/30 p-4 rounded-card text-xs text-brand-plum leading-relaxed text-left font-body space-y-2">
            <p className="font-bold flex items-center gap-1">💬 What happens next?</p>
            <p>Our sales agents will verify your shipping coordinates and dispatch an automated **WhatsApp text** to confirm the final delivery date.</p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/account">
              <Button variant="primary" className="bg-brand-mauve text-white hover:bg-brand-plum w-full rounded-card">
                Track in My Account
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" className="border-brand-sand w-full rounded-card">
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-4xl font-display font-medium text-brand-plum flex items-center justify-center gap-2">
            <Lock className="w-8 h-8 text-brand-mauve" /> Secured Checkout
          </h1>
          <p className="text-sm font-body text-brand-charcoal/60 mt-2">
            Complete your delivery details below to finalize your Cash on Delivery transaction.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-card border border-brand-sand/50 shadow-sm max-w-md mx-auto p-8 space-y-4">
            <p className="text-sm text-brand-charcoal/60 font-body">Your bag is empty.</p>
            <Link href="/shop" className="block">
              <Button variant="primary" className="bg-brand-mauve text-white w-full">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Delivery address details Form */}
            <div className="lg:col-span-7 bg-white p-6 rounded-card border border-brand-sand/50 shadow-sm space-y-6">
              <h2 className="text-md font-bold font-display text-brand-plum border-b border-brand-sand/50 pb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-zinc-500" /> Delivery Destination Details
              </h2>

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dilini Rajapaksa"
                />

                <Input
                  label="Phone Number (Sri Lankan mobile, e.g. 0771234567)"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07xxxxxxxx"
                />

                <Input
                  label="Address Line 1"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="e.g. 123 Galle Road, Apt 4B"
                />

                <Input
                  label="Address Line 2 (Optional)"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="e.g. Floor 2"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Colombo 03"
                  />
                  
                  <div className="flex flex-col gap-1.5 text-zinc-700">
                    <label className="text-xs font-semibold font-body">District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-brand-sand rounded-card text-sm focus:outline-none focus:border-brand-mauve bg-white h-[42px]"
                    >
                      {["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Monaragala", "Ratnapura", "Kegalle"].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Postal Code (Optional)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 00300"
                />

                <div className="flex flex-col gap-1.5 text-zinc-700">
                  <label className="text-xs font-semibold font-body">Delivery Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Leave with security guard, call before coming..."
                    className="w-full px-3 py-2 border border-brand-sand rounded-card text-sm focus:outline-none focus:border-brand-mauve font-body"
                  />
                </div>
              </div>
            </div>

            {/* Shopping bag details sidebar summary */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Receipt Summary */}
              <div className="bg-white p-6 rounded-card border border-brand-sand/50 shadow-sm space-y-4">
                <h2 className="text-md font-bold font-display text-brand-plum border-b border-brand-sand/50 pb-3 flex items-center gap-1.5">
                  <ShoppingBag className="w-5 h-5 text-zinc-500" /> Review Items
                </h2>

                <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 py-2.5 items-center text-xs">
                      <div className="w-10 h-14 bg-brand-sand rounded overflow-hidden shrink-0 relative border border-zinc-150">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-850 truncate">{item.name}</p>
                        <p className="text-[10px] text-zinc-400">
                          Size: {item.size} | Color: {item.color.name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-zinc-850">{formatPrice(discountedPrice(item.price, item.discount) * item.quantity)}</p>
                        <p className="text-[10px] text-zinc-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-brand-sand/50 pt-4 space-y-2 text-xs font-body">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Shipping Fee</span>
                    <span className="font-semibold text-zinc-900">{shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-brand-sand/50 pt-2 text-sm font-bold text-brand-plum">
                    <span>Total Amount</span>
                    <span className="font-display">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Secure COD Card confirmation */}
              <div className="bg-white p-6 rounded-card border border-brand-sand/50 shadow-sm space-y-4">
                <div className="flex gap-2.5 items-start">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-brand-plum">Cash on Delivery checkout</h3>
                    <p className="text-xs text-zinc-500 font-body leading-relaxed mt-0.5">
                      No online payment required. Pay safely at your door when the package arrives. Flat Rs. 350 shipping applies, free on orders above Rs. 5,000.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  loading={loading}
                  className="w-full bg-brand-mauve text-white hover:bg-brand-plum py-3 text-sm font-semibold rounded-card flex justify-center shadow-sm"
                >
                  Place COD Order ({formatPrice(total)})
                </Button>
                
                <Link href="/cart" className="flex justify-center items-center gap-1 text-xs text-brand-charcoal/50 hover:text-brand-mauve transition-colors font-body font-semibold">
                  <ArrowLeft className="w-3.5 h-3.5" /> Modify Cart
                </Link>
              </div>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}
