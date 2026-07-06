// app/account/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOrdersByCustomer } from "@/lib/db/orders";
import type { Order } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
  LogOut,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function AccountPage() {
  return (
    <ProtectedRoute allowedRoles={["Owner", "Manager", "Staff", "Customer"]} redirectTo="/login">
      <AccountDashboard />
    </ProtectedRoute>
  );
}

function AccountDashboard() {
  const { user, profile, logout } = useAuth();

  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit fields
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    async function loadOrders() {
      if (!user) return;
      try {
        setLoadingOrders(true);
        const userOrders = await getOrdersByCustomer(user.uid, user.email ?? undefined);
        setOrders(userOrders);
      } catch (err) {
        console.error("Error loading user orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSavingProfile(true);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName,
        phone
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile details.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
  };

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-card border border-brand-sand/55 shadow-sm gap-4">
          <div>
            <h1 className="text-3xl font-display font-medium text-brand-plum">
              My Account
            </h1>
            <p className="text-xs font-body text-brand-charcoal/60 mt-1">
              Manage your credentials, billing profiles, and order tracking streams.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-brand-sand flex items-center gap-1.5 py-2 px-3 rounded-card text-xs text-red-650 hover:bg-red-50 hover:border-red-200"
          >
            <LogOut className="w-4.5 h-4.5" /> Sign Out
          </Button>
        </div>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Profile Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-card border border-brand-sand/55 shadow-sm space-y-4">
              <h2 className="text-md font-bold font-display text-brand-plum border-b border-brand-sand/50 pb-3 flex items-center gap-1.5">
                <User className="w-5 h-5 text-zinc-400" /> Profile Information
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4 font-body text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 font-bold flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email Address</span>
                  <p className="font-semibold text-zinc-700 select-all font-mono text-xs">{profile?.email}</p>
                </div>

                <Input
                  label="Display Name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Dilini Rajapaksa"
                />

                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0771234567"
                />

                <Button
                  variant="primary"
                  type="submit"
                  loading={savingProfile}
                  className="bg-brand-mauve text-white hover:bg-brand-plum w-full rounded-card py-2 text-xs"
                >
                  Save Profile Changes
                </Button>
              </form>
            </div>

            <div className="bg-brand-plum text-white p-6 rounded-card shadow-sm space-y-4">
              <h3 className="text-lg font-bold font-display text-brand-blush">Help & Support</h3>
              <p className="text-xs leading-relaxed font-body text-white/80">
                Have questions regarding a pending invoice or sizing exchange? Get in touch with our team via WhatsApp for instant assistance.
              </p>
              <a
                href="https://wa.me/94XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex bg-white/10 hover:bg-white/20 transition-all font-semibold font-body text-xs px-4 py-2 rounded-card text-brand-blush"
              >
                Chat on WhatsApp 💬
              </a>
            </div>
          </div>

          {/* Orders History Ledger */}
          <div className="lg:col-span-2 bg-white p-6 rounded-card border border-brand-sand/55 shadow-sm space-y-4">
            <h2 className="text-md font-bold font-display text-brand-plum border-b border-brand-sand/50 pb-3 flex items-center gap-1.5">
              <ClipboardList className="w-5 h-5 text-zinc-400" /> Order History & Logs
            </h2>

            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
                <p className="text-zinc-500 font-body text-xs">Retrieving transactions...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 font-body text-sm">
                No orders placed yet. <Link href="/shop" className="text-brand-mauve underline ml-1">Explore Catalog</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-brand-sand/50 rounded-card p-4 space-y-4 bg-brand-cream/10 hover:bg-brand-cream/20 transition-colors"
                  >
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-brand-sand/30 pb-2 text-xs font-body">
                      <div>
                        <span className="text-zinc-400">Order Number</span>
                        <p className="font-semibold text-brand-plum font-mono text-sm">{order.orderNumber}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-right block sm:inline mr-1">Date:</span>
                        <span className="font-semibold text-zinc-700">{formatDate(order.createdAt)}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${order.status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            order.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              order.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" :
                                "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order items details */}
                    <div className="divide-y divide-zinc-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 py-2.5 items-center text-xs">
                          <div className="w-10 h-14 bg-brand-sand rounded overflow-hidden shrink-0 relative border border-zinc-150">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-zinc-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-zinc-400">
                              Size: {item.size} | Color: {item.color.name}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-zinc-800">{formatPrice(item.price * item.quantity)}</p>
                            <p className="text-[10px] text-zinc-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer invoice details */}
                    <div className="flex justify-between items-center pt-2 border-t border-brand-sand/30 text-xs font-body">
                      <div className="flex items-center gap-1 text-zinc-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{order.shippingAddress.city}, {order.shippingAddress.district}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-400 mr-1">Total Paid:</span>
                        <span className="font-bold text-brand-plum text-sm font-display">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
