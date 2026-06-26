// app/admin/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "@/lib/db/customers";
import { getOrders } from "@/lib/db/orders";
import type { UserProfile } from "@/context/AuthContext";
import type { Order } from "@/types";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Eye, 
  Mail, 
  Phone, 
  Calendar,
  ShoppingBag,
  MapPin,
  ClipboardList
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

const PAGE_SIZE = 10;

interface CustomerStats {
  orderCount: number;
  totalSpent: number;
  recentOrders: Order[];
}

export default function AdminCustomersPage() {
  // Data States
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Search / Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Details Modal
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [selectedCustomerStats, setSelectedCustomerStats] = useState<CustomerStats | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [custList, ordList] = await Promise.all([
        getCustomers(),
        getOrders()
      ]);
      // Filter out admin users, keeping only Customers
      const onlyCustomers = custList.filter(c => c.role === "Customer");
      setCustomers(onlyCustomers);
      setOrders(ordList);
    } catch (err) {
      console.error("Error loading customers page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetails = (customer: UserProfile) => {
    // Calculate customer metrics
    const customerOrders = orders.filter(o => o.customerId === customer.uid);
    const orderCount = customerOrders.length;
    const totalSpent = customerOrders
      .filter(o => o.status !== "cancelled" && o.status !== "refunded")
      .reduce((sum, o) => sum + o.total, 0);

    setSelectedCustomer(customer);
    setSelectedCustomerStats({
      orderCount,
      totalSpent,
      recentOrders: customerOrders.slice(0, 5)
    });
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
    setSelectedCustomerStats(null);
  };

  // Filter list
  const filteredCustomers = customers.filter(c => {
    return c.displayName?.toLowerCase().includes(search.toLowerCase()) || 
           c.email.toLowerCase().includes(search.toLowerCase()) ||
           c.phone?.toLowerCase().includes(search.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-800">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-card border border-zinc-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-medium text-zinc-900">Customers</h1>
          <p className="text-sm font-body text-zinc-500 mt-1">
            Browse registered customer accounts and order history analytics.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex bg-white p-4 rounded-card border border-zinc-200/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-card font-body text-sm focus:outline-none focus:border-brand-mauve focus:ring-1 focus:ring-brand-mauve bg-zinc-50/50"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-card border border-zinc-200/60 shadow-sm overflow-hidden">
        {loading && customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
            <p className="text-zinc-500 font-body text-xs">Loading customers list...</p>
          </div>
        ) : paginatedCustomers.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-body text-sm">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm font-body">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150 text-zinc-500 font-semibold">
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Orders Placed</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-600">
                {paginatedCustomers.map((cust) => {
                  const customerOrders = orders.filter(o => o.customerId === cust.uid);
                  return (
                    <tr key={cust.uid} className="hover:bg-zinc-50/50">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-zinc-950">{cust.displayName || "Customer"}</p>
                          <p className="text-xs text-zinc-400 font-mono">{cust.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-600">{cust.phone || "-"}</td>
                      <td className="p-4 text-zinc-500">{formatDate(cust.createdAt)}</td>
                      <td className="p-4 font-semibold text-zinc-800">{customerOrders.length} Orders</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(cust)}
                          className="p-1.5 hover:bg-zinc-100 rounded text-zinc-600 hover:text-brand-mauve transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-zinc-100 font-body text-xs text-zinc-500">
            <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredCustomers.length)} of {filteredCustomers.length} items</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 border border-zinc-200 rounded disabled:opacity-40 hover:bg-zinc-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`px-3 py-1.5 rounded border ${page === pNum ? "bg-brand-mauve text-white border-brand-mauve" : "border-zinc-200 hover:bg-zinc-50"}`}
                >
                  {pNum}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 border border-zinc-200 rounded disabled:opacity-40 hover:bg-zinc-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedCustomer && selectedCustomerStats && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-2xl border border-zinc-200 max-w-2xl w-full max-h-[90vh] flex flex-col">
            <header className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <div>
                <h2 className="text-lg font-bold font-display text-zinc-900">
                  Customer Profile
                </h2>
                <p className="text-xs text-zinc-400 font-mono">UID: {selectedCustomer.uid}</p>
              </div>
              <button onClick={handleCloseModal} className="p-1 hover:bg-zinc-200 rounded text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-body text-sm">
              
              {/* Account summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-card">
                  <span className="text-xs font-bold text-zinc-400 font-body uppercase">Total Revenue Contribution</span>
                  <p className="text-xl font-bold font-display text-brand-plum mt-1">{formatPrice(selectedCustomerStats.totalSpent)}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Excludes cancelled and refunded invoices</p>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-card">
                  <span className="text-xs font-bold text-zinc-400 font-body uppercase">Total Orders</span>
                  <p className="text-xl font-bold font-display text-zinc-900 mt-1">{selectedCustomerStats.orderCount} Orders</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Total transaction counts</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-3">
                <h3 className="font-bold font-display text-zinc-950 border-b border-zinc-100 pb-2">Account Details</h3>
                <div className="space-y-2 text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <span>Email: <span className="font-semibold text-zinc-900">{selectedCustomer.email}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span>Phone: <span className="font-semibold text-zinc-900">{selectedCustomer.phone || "Not provided"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Member Since: <span className="font-semibold text-zinc-900">{formatDate(selectedCustomer.createdAt)}</span></span>
                  </div>
                </div>
              </div>

              {/* Address lists or shipping logs if any */}
              {/* Note: Stored address lists would be linked in a larger app, 
                  but showing the shipping destinations from their actual orders is highly representative! */}
              <div className="space-y-3">
                <h3 className="font-bold font-display text-zinc-950 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                  <MapPin className="w-4.5 h-4.5 text-zinc-400" /> Known Delivery Addresses
                </h3>
                {selectedCustomerStats.recentOrders.length === 0 ? (
                  <p className="text-xs text-zinc-400">No registered delivery addresses found.</p>
                ) : (
                  <div className="space-y-2">
                    {Array.from(new Set(selectedCustomerStats.recentOrders.map(o => 
                      `${o.shippingAddress.line1}, ${o.shippingAddress.line2 || ""}, ${o.shippingAddress.city}, ${o.shippingAddress.district}`.replace(/,\s*,/g, ",")
                    ))).map((addr, idx) => (
                      <div key={idx} className="bg-zinc-50 border border-zinc-150 p-3 rounded-card text-xs text-zinc-600 flex items-start gap-2">
                        <span className="bg-zinc-200 text-zinc-600 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">{idx+1}</span>
                        <p>{addr}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders List */}
              <div className="space-y-3">
                <h3 className="font-bold font-display text-zinc-950 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                  <ClipboardList className="w-4.5 h-4.5 text-zinc-400" /> Recent Purchase Logs
                </h3>
                {selectedCustomerStats.recentOrders.length === 0 ? (
                  <p className="text-xs text-zinc-400">No transactions recorded.</p>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {selectedCustomerStats.recentOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center py-2 text-xs">
                        <div>
                          <p className="font-semibold text-brand-plum">{order.orderNumber}</p>
                          <p className="text-zinc-400">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-zinc-800">{formatPrice(order.total)}</p>
                          <span className={`text-[9px] font-bold uppercase ${
                            order.status === "delivered" ? "text-emerald-600" :
                            order.status === "pending" ? "text-amber-600" :
                            order.status === "cancelled" ? "text-red-650" : "text-blue-600"
                          }`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
