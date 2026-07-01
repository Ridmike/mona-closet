// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getProducts } from "@/lib/db/products";
import { getOrders } from "@/lib/db/orders";
import { getCustomers } from "@/lib/db/customers";
import type { Product, Order } from "@/types";
import type { UserProfile } from "@/context/AuthContext";
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, ordList, custList] = await Promise.all([
          getProducts({ publishedOnly: false }),
          getOrders(),
          getCustomers(),
        ]);
        setProducts(prodList);
        setOrders(ordList);
        setCustomers(custList);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate stats
  const activeProductsCount = products.filter(p => p.published).length;
  
  // Pending orders
  const pendingOrdersCount = orders.filter(o => o.status === "pending").length;
  
  // Total Revenue (delivered or confirmed orders)
  const completedOrders = orders.filter(o => o.status === "delivered" || o.status === "confirmed" || o.status === "processing");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Total Customers (filter role == "Customer")
  const totalCustomersCount = customers.filter(c => c.role === "Customer").length;

  // Identify low stock items (any variant stock <= 2)
  const lowStockItems = products.filter(p => 
    p.variants.some(v => v.stock <= 2)
  ).slice(0, 5);

  const statCards = [
    { 
      label: "Total Revenue", 
      value: formatPrice(totalRevenue), 
      change: `${completedOrders.length} Paid Orders`, 
      icon: TrendingUp, 
      color: "text-emerald-600 bg-emerald-50 border-emerald-100" 
    },
    { 
      label: "Active Products", 
      value: `${activeProductsCount} Items`, 
      change: `${products.length} Total Registered`, 
      icon: ShoppingBag, 
      color: "text-blue-600 bg-blue-50 border-blue-100" 
    },
    { 
      label: "Pending Orders", 
      value: `${pendingOrdersCount} Orders`, 
      change: "Requires action", 
      icon: Clock, 
      color: "text-amber-600 bg-amber-50 border-amber-100" 
    },
    { 
      label: "Total Customers", 
      value: `${totalCustomersCount} Users`, 
      change: "Registered customers", 
      icon: Users, 
      color: "text-purple-600 bg-purple-50 border-purple-100" 
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-mauve" />
        <p className="text-zinc-500 font-body text-sm">Loading dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      <div className="bg-white p-6 rounded-card shadow-sm border border-zinc-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-zinc-900">
            Welcome back, {profile?.displayName || "Administrator"}!
          </h1>
          <p className="text-sm font-body text-zinc-500 mt-1">
            Here's what is happening at Mona's Closet today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blush/20 border border-brand-blush/40 text-brand-plum text-xs font-semibold uppercase tracking-wider font-body">
          Role: {profile?.role || "Staff"}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-card shadow-sm border border-zinc-200/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400 font-body">{stat.label}</span>
                <div className={`p-2.5 rounded-full border ${stat.color}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display text-zinc-900">{stat.value}</h3>
                <p className="text-xs text-zinc-400 font-body mt-1">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white p-6 rounded-card shadow-sm border border-zinc-200/60 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
            <h2 className="text-lg font-bold font-display text-zinc-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-zinc-500" /> Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand-mauve hover:text-brand-plum flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <p className="text-sm text-zinc-500 font-body py-8 text-center">No orders placed yet.</p>
            ) : (
              <table className="w-full text-left border-collapse text-sm font-body">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                    <th className="py-2.5">Order No</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-600">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 font-semibold text-brand-plum">
                        <Link href={`/admin/orders?id=${order.id}`}>{order.orderNumber}</Link>
                      </td>
                      <td className="py-3 max-w-[150px] truncate">{order.shippingAddress.fullName}</td>
                      <td className="py-3 text-zinc-500">{formatDate(order.createdAt)}</td>
                      <td className="py-3 font-semibold text-zinc-800">{formatPrice(order.total)}</td>
                      <td className="py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          order.status === "delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          order.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          order.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-200" :
                          "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Alerts & Guidelines */}
        <div className="space-y-6">
          {/* Low stock items */}
          <div className="bg-white p-6 rounded-card shadow-sm border border-zinc-200/60 space-y-4">
            <h3 className="text-md font-bold font-display text-zinc-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock Alerts
            </h3>
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-emerald-600 font-body">All product stock levels are healthy. ✓</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-xs border-b border-zinc-50 pb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-zinc-400 font-body">Category: {p.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600">
                        {p.variants.reduce((min, v) => v.stock < min ? v.stock : min, 9999)} Left
                      </span>
                      <p className="text-[10px] text-zinc-400"><Link href="/admin/inventory" className="underline hover:text-brand-mauve">Restock</Link></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-brand-plum text-white p-6 rounded-card shadow-sm flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-brand-blush">
                System Guidelines
              </h3>
              <ul className="space-y-3 text-xs font-body text-white/80 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 text-brand-blush">✦</span>
                  <span>All database modifications are tracked via security rules. Ensure admin roles are correctly assigned.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 text-brand-blush">✦</span>
                  <span>Low stock thresholds highlight any variant with 2 or fewer units in inventory.</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs text-white/50 font-body">
              Mona's Closet Management Panel v1.0
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
