// app/admin/inventory/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getProducts, updateProduct } from "@/lib/db/products";
import type { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const PAGE_SIZE = 15;

interface FlatVariantItem {
  productId: string;
  productName: string;
  category: string;
  variantId: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  stock: number;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [flatVariants, setFlatVariants] = useState<FlatVariantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null); // flat variant key

  // Search/Filters
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all, low, out
  const [page, setPage] = useState(1);

  // Buffer state to keep track of edited stock inputs
  const [stockBuffer, setStockBuffer] = useState<Record<string, number>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const prodList = await getProducts({ publishedOnly: false });
      setProducts(prodList);

      // Flatten products to variants
      const list: FlatVariantItem[] = [];
      prodList.forEach(p => {
        p.variants.forEach(v => {
          list.push({
            productId: p.id,
            productName: p.name,
            category: p.category,
            variantId: v.id,
            sku: v.sku,
            size: v.size,
            colorName: v.color.name,
            colorHex: v.color.hex,
            stock: v.stock
          });
        });
      });
      setFlatVariants(list);

      // Seed stock inputs
      const buffer: Record<string, number> = {};
      list.forEach(item => {
        buffer[`${item.productId}_${item.variantId}`] = item.stock;
      });
      setStockBuffer(buffer);
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (productId: string, variantId: string, val: number) => {
    const key = `${productId}_${variantId}`;
    setStockBuffer(prev => ({
      ...prev,
      [key]: Math.max(0, val)
    }));
  };

  const handleSaveStock = async (productId: string, variantId: string) => {
    const key = `${productId}_${variantId}`;
    const newStock = stockBuffer[key];

    // Find the product
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Update variants
    const updatedVariants = product.variants.map(v =>
      v.id === variantId ? { ...v, stock: newStock } : v
    );

    try {
      setUpdatingId(key);
      await updateProduct(productId, { variants: updatedVariants });

      // Update local states
      setProducts(prevProducts => prevProducts.map(p =>
        p.id === productId ? { ...p, variants: updatedVariants } : p
      ));

      setFlatVariants(prevFlat => prevFlat.map(item =>
        (item.productId === productId && item.variantId === variantId)
          ? { ...item, stock: newStock }
          : item
      ));

    } catch (err) {
      alert("Failed to update stock in database.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickAdjust = (productId: string, variantId: string, diff: number) => {
    const key = `${productId}_${variantId}`;
    const currentVal = stockBuffer[key] ?? 0;
    handleInputChange(productId, variantId, currentVal + diff);
  };

  // Filtering
  const filteredVariants = flatVariants.filter(v => {
    const matchesSearch = v.productName.toLowerCase().includes(search.toLowerCase()) ||
      v.sku.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase());

    if (stockFilter === "low") {
      return matchesSearch && v.stock > 0 && v.stock <= 2;
    }
    if (stockFilter === "out") {
      return matchesSearch && v.stock === 0;
    }
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVariants.length / PAGE_SIZE);
  const paginatedVariants = filteredVariants.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-800">

      <div className="flex justify-between items-center bg-white p-6 rounded-card border border-zinc-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-medium text-zinc-900">Inventory Tracking</h1>
          <p className="text-sm font-body text-zinc-500 mt-1">
            Monitor and adjust variant stock levels across the catalog.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" className="border-zinc-200 flex items-center gap-1.5 py-2 px-3 rounded-card text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Reload Stock
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-card border border-zinc-200/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or category..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-card font-body text-sm focus:outline-none focus:border-brand-mauve focus:ring-1 focus:ring-brand-mauve bg-zinc-50/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-zinc-200 rounded-card font-body text-sm focus:outline-none focus:border-brand-mauve bg-zinc-50/50"
          >
            <option value="all">All Levels</option>
            <option value="low">Low Stock (1-2 units)</option>
            <option value="out">Out of Stock (0 units)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-card border border-zinc-200/60 shadow-sm overflow-hidden">
        {loading && flatVariants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
            <p className="text-zinc-500 font-body text-xs">Loading stock levels...</p>
          </div>
        ) : paginatedVariants.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-body text-sm">
            No variants found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm font-body">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150 text-zinc-500 font-semibold">
                  <th className="p-4">SKU</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Color</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 w-[280px]">Adjust Stock</th>
                  <th className="p-4 text-center w-20">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-600">
                {paginatedVariants.map((item) => {
                  const key = `${item.productId}_${item.variantId}`;
                  const currentBufferVal = stockBuffer[key] ?? item.stock;
                  const isModified = currentBufferVal !== item.stock;
                  const isLow = item.stock > 0 && item.stock <= 2;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={key} className="hover:bg-zinc-50/50">
                      <td className="p-4 font-mono text-xs text-zinc-500">{item.sku}</td>
                      <td className="p-4 font-semibold text-zinc-950">
                        <div>
                          <p>{item.productName}</p>
                          <p className="text-[10px] text-zinc-400 font-normal">{item.category}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-zinc-700">{item.size}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full border border-zinc-200" style={{ backgroundColor: item.colorHex }} />
                          {item.colorName}
                        </span>
                      </td>
                      <td className="p-4">
                        {isOut ? (
                          <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Out of Stock</span>
                        ) : isLow ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" /> Low Stock</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Healthy</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.productId, item.variantId, -5)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-250 rounded text-xs hover:bg-zinc-100 font-semibold"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.productId, item.variantId, -1)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-250 rounded text-xs hover:bg-zinc-100 font-semibold"
                          >
                            -1
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={currentBufferVal}
                            onChange={(e) => handleInputChange(item.productId, item.variantId, Number(e.target.value))}
                            className="w-16 py-1 border border-zinc-200 rounded text-center font-bold text-zinc-950 focus:outline-none focus:border-brand-mauve h-8"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.productId, item.variantId, 1)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-250 rounded text-xs hover:bg-zinc-100 font-semibold"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(item.productId, item.variantId, 5)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-250 rounded text-xs hover:bg-zinc-100 font-semibold"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          disabled={!isModified || updatingId === key}
                          onClick={() => handleSaveStock(item.productId, item.variantId)}
                          className={`w-8 h-8 rounded flex items-center justify-center border transition-all ${isModified
                              ? "bg-brand-mauve hover:bg-brand-plum  border-brand-mauve shadow-sm"
                              : "bg-zinc-50 border-zinc-150 text-zinc-300 pointer-events-none"
                            }`}
                        >
                          {updatingId === key ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
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
            <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredVariants.length)} of {filteredVariants.length} items</span>
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

    </div>
  );
}
