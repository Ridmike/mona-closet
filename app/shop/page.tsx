// app/shop/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts } from "@/lib/db/products";
import { getCategories } from "@/lib/db/categories";
import type { Product, Category, ProductCardData } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync initial params on change
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodList, catList] = await Promise.all([
          getProducts({ publishedOnly: true }),
          getCategories()
        ]);
        setProducts(prodList);
        setCategories(catList);
      } catch (err) {
        console.error("Error loading shop catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter and sort items
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.brand?.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === "" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    
    // Apply discount price if present
    const priceToCompare = p.discount ? p.price * (1 - p.discount / 100) : p.price;
    const matchesPrice = priceToCompare <= priceRange;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = a.discount ? a.price * (1 - a.discount / 100) : a.price;
    const bPrice = b.discount ? b.price * (1 - b.discount / 100) : b.price;

    if (sortBy === "price-asc") return aPrice - bPrice;
    if (sortBy === "price-desc") return bPrice - aPrice;
    
    // Newest: Date descending
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts: ProductCardData[] = sortedProducts
    .slice((page - 1) * pageSize, page * pageSize)
    .map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discount: p.discount,
      image: p.images[0] || "/images/hero.png",
      category: p.category,
      inStock: p.variants.some(v => v.stock > 0)
    }));

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setPriceRange(50000);
    setSortBy("newest");
    setPage(1);
    router.replace("/shop");
  };

  return (
    <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner/Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-brand-sand pb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-medium text-brand-plum">
              Shop Collections
            </h1>
            <p className="text-xs font-body text-brand-charcoal/60 mt-1.5">
              Showing {sortedProducts.length} premium apparel choices
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-brand-sand bg-white text-xs font-semibold rounded-card"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
             <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="shop-sort" className="text-xs text-brand-charcoal/60 font-body">Sort:</label>
                <select
                  id="shop-sort"
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                  className="px-2 py-1.5 border border-brand-sand rounded-card text-[11px] bg-white focus:outline-none focus:border-brand-mauve font-body"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low-High</option>
                  <option value="price-desc">Price: High-Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="shop-limit" className="text-xs text-brand-charcoal/60 font-body">Show:</label>
                <select
                  id="shop-limit"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="px-2 py-1.5 border border-brand-sand rounded-card text-[11px] bg-white focus:outline-none focus:border-brand-mauve font-body"
                >
                  <option value="12">12 items</option>
                  <option value="24">24 items</option>
                  <option value="48">48 items</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-card border border-brand-sand/50 shadow-sm">
            <div className="flex justify-between items-center border-b border-brand-sand pb-3">
              <h2 className="text-md font-bold font-display text-brand-plum flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </h2>
              <button onClick={handleClearFilters} className="text-[11px] text-brand-charcoal/40 hover:text-brand-mauve underline font-body">
                Reset
              </button>
            </div>

            {/* Search filter */}
            <div className="space-y-2">
              <label htmlFor="sidebar-search" className="text-xs font-bold text-zinc-400 font-body uppercase">Keyword</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  id="sidebar-search"
                  type="text"
                  placeholder="Type product name..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-1.5 border border-brand-sand rounded-card font-body text-xs focus:outline-none focus:border-brand-mauve bg-brand-cream/30"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 font-body uppercase">Category</label>
              <div className="flex flex-col gap-1.5 font-body text-xs">
                <button
                  onClick={() => { setSelectedCategory(""); setPage(1); }}
                  className={`text-left px-2 py-1.5 rounded transition-colors ${selectedCategory === "" ? "bg-brand-blush/20 text-brand-plum font-semibold" : "hover:bg-brand-mist/50 text-brand-charcoal/80"}`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCategory(c.name); setPage(1); }}
                    className={`text-left px-2 py-1.5 rounded transition-colors ${selectedCategory.toLowerCase() === c.name.toLowerCase() ? "bg-brand-blush/20 text-brand-plum font-semibold" : "hover:bg-brand-mist/50 text-brand-charcoal/80"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-2">
              <label htmlFor="price-cap" className="text-xs font-bold text-zinc-400 font-body uppercase flex justify-between">
                <span>Max Price</span>
                <span className="text-brand-plum font-bold font-display">{formatPrice(priceRange)}</span>
              </label>
              <input
                id="price-cap"
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={priceRange}
                onChange={(e) => { setPriceRange(Number(e.target.value)); setPage(1); }}
                className="w-full accent-brand-mauve"
              />
            </div>
          </aside>

          {/* Product grid area */}
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
                <p className="text-zinc-500 font-body text-xs">Loading items...</p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 font-body text-sm bg-white rounded-card border border-brand-sand/50 shadow-sm">
                No products found matching filters. <button onClick={handleClearFilters} className="text-brand-mauve underline ml-1">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
                  {paginatedProducts.map(p => (
                    <ProductCard key={p.id} product={p} className="w-full h-full" />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-brand-sand font-body text-xs text-brand-charcoal/50 gap-4">
                    <span>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedProducts.length)} of {sortedProducts.length} items</span>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="p-1.5 border border-brand-sand rounded disabled:opacity-40 hover:bg-white bg-white/50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => (
                        <button
                          key={pNum}
                          onClick={() => setPage(pNum)}
                          className={`px-3 py-1.5 rounded border ${page === pNum ? "bg-brand-mauve text-white border-brand-mauve font-semibold" : "border-brand-sand bg-white/50 hover:bg-white"}`}
                        >
                          {pNum}
                        </button>
                      ))}
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="p-1.5 border border-brand-sand rounded disabled:opacity-40 hover:bg-white bg-white/50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-100 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-brand-charcoal/30 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="relative bg-white rounded-t-card p-6 space-y-6 max-h-[85vh] overflow-y-auto w-full">
            <header className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="font-bold font-display text-brand-plum text-md">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label htmlFor="mobile-search" className="text-xs font-bold text-zinc-400 font-body uppercase">Keyword</label>
              <input
                id="mobile-search"
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-brand-sand rounded-card text-xs focus:outline-none bg-brand-cream/35"
              />
            </div>

            {/* Category select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 font-body uppercase">Category</label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => { setSelectedCategory(""); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full border transition-all ${selectedCategory === "" ? "bg-brand-mauve border-brand-mauve text-white" : "border-brand-sand bg-zinc-50 text-zinc-700"}`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCategory(c.name); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full border transition-all ${selectedCategory.toLowerCase() === c.name.toLowerCase() ? "bg-brand-mauve border-brand-mauve text-white font-semibold" : "border-brand-sand bg-zinc-50 text-zinc-700"}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label htmlFor="mobile-price" className="text-xs font-bold text-zinc-400 font-body uppercase flex justify-between">
                <span>Max Price</span>
                <span className="text-brand-plum font-bold font-display">{formatPrice(priceRange)}</span>
              </label>
              <input
                id="mobile-price"
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={priceRange}
                onChange={(e) => { setPriceRange(Number(e.target.value)); setPage(1); }}
                className="w-full accent-brand-mauve"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 mt-6">
              <Button variant="outline" onClick={handleClearFilters} className="rounded-card border-brand-sand">
                Reset All
              </Button>
              <Button variant="primary" onClick={() => setShowMobileFilters(false)} className="rounded-card bg-brand-mauve text-white">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-mauve" />
        <p className="text-zinc-500 font-body text-sm">Loading catalog items...</p>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}
