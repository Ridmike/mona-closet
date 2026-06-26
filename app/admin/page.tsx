// app/admin/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Clock 
} from "lucide-react";

export default function AdminDashboardPage() {
  const { profile } = useAuth();

  const statCards = [
    { label: "Total Revenue", value: "Rs. 148,200", change: "+12% this week", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Active Products", value: "54 Items", change: "4 Categories", icon: ShoppingBag, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Pending Orders", value: "8 Orders", change: "Requires WhatsApp confirm", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Total Customers", value: "1,240 Users", change: "From Facebook & Web", icon: Users, color: "text-purple-600 bg-purple-50 border-purple-100" },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-card shadow-sm border border-zinc-200/60 space-y-4">
          <h2 className="text-lg font-bold font-display text-zinc-900">
            Administrative Role Permissions Matrix
          </h2>
          <p className="text-sm text-zinc-500 font-body leading-relaxed">
            Role-Based Access Control (RBAC) is enforced system-wide. Depending on your assigned role, certain sections and database modifications are locked.
          </p>
          
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-sm font-body">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                  <th className="py-2.5">Feature Area</th>
                  <th className="py-2.5">Owner</th>
                  <th className="py-2.5">Manager</th>
                  <th className="py-2.5">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-600">
                <tr>
                  <td className="py-3 font-semibold text-zinc-800">Add/Edit Products</td>
                  <td className="py-3 text-emerald-600">✓ Full</td>
                  <td className="py-3 text-emerald-600">✓ Full</td>
                  <td className="py-3 text-amber-600">⚠ View Only</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-zinc-800">Inventory Tracking</td>
                  <td className="py-3 text-emerald-600">✓ Full</td>
                  <td className="py-3 text-emerald-600">✓ Full</td>
                  <td className="py-3 text-emerald-600">✓ Update Stock</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-zinc-800">Delete Products</td>
                  <td className="py-3 text-emerald-600">✓ Full</td>
                  <td className="py-3 text-red-600">✗ Blocked</td>
                  <td className="py-3 text-red-600">✗ Blocked</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-zinc-800">User Management</td>
                  <td className="py-3 text-emerald-600">✓ Full</td>
                  <td className="py-3 text-red-600">✗ Blocked</td>
                  <td className="py-3 text-red-600">✗ Blocked</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-zinc-800">Revenue Analytics</td>
                  <td className="py-3 text-emerald-600">✓ Full</td>
                  <td className="py-3 text-emerald-600">✓ Full</td>
                  <td className="py-3 text-red-600">✗ Blocked</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-brand-plum text-white p-6 rounded-card shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-display text-brand-blush">
              System Guidelines
            </h3>
            <ul className="space-y-3 text-xs font-body text-white/80 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="shrink-0 text-brand-blush">✦</span>
                <span>All changes made to products or inventory are logged to Firestore auditable streams.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 text-brand-blush">✦</span>
                <span>To promote staff users or adjust roles, contact the System Owner (<code>owner@monascloset.lk</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0 text-brand-blush">✦</span>
                <span>Always ensure you log out of the admin panel on shared devices to secure customer database info.</span>
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-white/10 text-xs text-white/50 font-body">
            Mona's Closet Management Panel v1.0
          </div>
        </div>

      </div>

    </div>
  );
}
