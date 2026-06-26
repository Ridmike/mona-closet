// app/admin/orders/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrders, updateOrder } from "@/lib/db/orders";
import type { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Eye, 
  Clock, 
  MapPin, 
  User, 
  CreditCard, 
  ShoppingBag,
  FileText
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

const STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "confirmed", label: "Confirmed", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "processing", label: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "shipped", label: "Shipped", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "delivered", label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200" },
  { value: "refunded", label: "Refunded", color: "bg-zinc-150 text-zinc-700 border-zinc-300" }
];

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("id");

  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Search/Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const list = await getOrders();
      setOrders(list);

      // Handle query param opening
      if (orderIdParam) {
        const ord = list.find(o => o.id === orderIdParam);
        if (ord) {
          setSelectedOrder(ord);
        }
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [orderIdParam]);

  const handleCloseModal = () => {
    setSelectedOrder(null);
    // Clear URL query param
    router.replace("/admin/orders");
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      await updateOrder(selectedOrder.id, { status: newStatus });
      
      // Update local states
      const updatedOrder = { ...selectedOrder, status: newStatus, updatedAt: new Date() };
      setSelectedOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filter & Search
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
                          o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
                          o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-800">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-card border border-zinc-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-medium text-zinc-900">Orders</h1>
          <p className="text-sm font-body text-zinc-500 mt-1">
            Fulfill and manage customer invoices, shipments, and payments.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-card border border-zinc-200/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by order number, customer email, or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-card font-body text-sm focus:outline-none focus:border-brand-mauve focus:ring-1 focus:ring-brand-mauve bg-zinc-50/50"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-zinc-200 rounded-card font-body text-sm focus:outline-none focus:border-brand-mauve bg-zinc-50/50"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-card border border-zinc-200/60 shadow-sm overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
            <p className="text-zinc-500 font-body text-xs">Loading orders...</p>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-body text-sm">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm font-body">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150 text-zinc-500 font-semibold">
                  <th className="p-4">Order No</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-600">
                {paginatedOrders.map((order) => {
                  const statusConfig = STATUSES.find(s => s.value === order.status) || STATUSES[0];
                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50">
                      <td className="p-4 font-semibold text-brand-plum">{order.orderNumber}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-zinc-800">{order.shippingAddress.fullName}</p>
                          <p className="text-[10px] text-zinc-400 font-normal">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-500">{formatDate(order.createdAt)}</td>
                      <td className="p-4 uppercase text-xs font-mono">{order.paymentMethod.replace("_", " ")}</td>
                      <td className="p-4 font-semibold text-zinc-900">{formatPrice(order.total)}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
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
            <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} items</span>
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
      {selectedOrder && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-2xl border border-zinc-200 max-w-3xl w-full max-h-[90vh] flex flex-col">
            <header className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
              <div>
                <h2 className="text-lg font-bold font-display text-zinc-900">
                  Order Details
                </h2>
                <p className="text-xs text-zinc-500 font-mono">Invoice Number: {selectedOrder.orderNumber}</p>
              </div>
              <button onClick={handleCloseModal} className="p-1 hover:bg-zinc-200 rounded text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-body text-sm">
              
              {/* Order Status & Items */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Status selection */}
                <div className="bg-zinc-50 p-4 rounded-card border border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-zinc-400" />
                    <div>
                      <p className="text-xs font-bold text-zinc-400">Order Status</p>
                      <p className="text-sm font-semibold capitalize text-zinc-800">{selectedOrder.status}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedOrder.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                      className="px-3 py-1.5 border border-zinc-300 rounded text-xs bg-white focus:outline-none"
                    >
                      {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    {updatingStatus && (
                      <div className="w-4 h-4 border-2 border-brand-mauve border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-3">
                  <h3 className="font-bold font-display text-zinc-900 border-b border-zinc-100 pb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-4.5 h-4.5 text-zinc-400" /> Cart Items ({selectedOrder.items.length})
                  </h3>
                  
                  <div className="divide-y divide-zinc-100">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-3 items-center">
                        <div className="w-12 h-16 bg-brand-sand rounded overflow-hidden shrink-0 relative border border-zinc-150">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="object-cover w-full h-full"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-850 truncate">{item.name}</p>
                          <p className="text-xs text-zinc-400">
                            Size: <span className="font-semibold">{item.size}</span> | Color: <span className="font-semibold">{item.color.name}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-zinc-900">{formatPrice(item.price)}</p>
                          <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-brand-blush/10 border border-brand-blush/30 p-4 rounded-card">
                    <p className="text-xs font-bold text-brand-plum flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Customer Notes</p>
                    <p className="text-xs text-brand-plum/80 mt-1 italic font-body">"{selectedOrder.notes}"</p>
                  </div>
                )}

              </div>

              {/* Customer & Shipping details sidebar */}
              <div className="space-y-6 bg-zinc-50/40 p-4 rounded-card border border-zinc-200/50">
                
                {/* Customer info */}
                <div className="space-y-2">
                  <h4 className="font-bold font-display text-zinc-950 flex items-center gap-1.5 border-b border-zinc-200/60 pb-2">
                    <User className="w-4 h-4 text-zinc-400" /> Customer Info
                  </h4>
                  <p className="font-semibold text-zinc-900">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-xs text-zinc-500 font-mono">{selectedOrder.customerEmail}</p>
                  <p className="text-xs text-zinc-600">{selectedOrder.shippingAddress.phone}</p>
                </div>

                {/* Shipping address */}
                <div className="space-y-2">
                  <h4 className="font-bold font-display text-zinc-950 flex items-center gap-1.5 border-b border-zinc-200/60 pb-2">
                    <MapPin className="w-4 h-4 text-zinc-400" /> Shipping Destination
                  </h4>
                  <div className="text-xs text-zinc-600 space-y-1">
                    <p>{selectedOrder.shippingAddress.line1}</p>
                    {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district}</p>
                    {selectedOrder.shippingAddress.postalCode && <p className="font-mono text-[10px] text-zinc-400">Postal: {selectedOrder.shippingAddress.postalCode}</p>}
                  </div>
                </div>

                {/* Payment info & pricing summary */}
                <div className="space-y-3">
                  <h4 className="font-bold font-display text-zinc-950 flex items-center gap-1.5 border-b border-zinc-200/60 pb-2">
                    <CreditCard className="w-4 h-4 text-zinc-400" /> Payment & Receipt
                  </h4>
                  <div className="text-xs font-body space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Method</span>
                      <span className="font-semibold uppercase font-mono">{selectedOrder.paymentMethod.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Subtotal</span>
                      <span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Shipping</span>
                      <span className="font-semibold">{formatPrice(selectedOrder.shippingFee)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount</span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-bold text-brand-plum">
                      <span>Total Invoice</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-mauve" />
        <p className="text-zinc-500 font-body text-sm">Loading orders view...</p>
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
