// app/admin/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/db/products";
import { getCategories } from "@/lib/db/categories";
import type { Product, Category, ProductVariant, ProductSize } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Upload
} from "lucide-react";
import { formatPrice, slugify } from "@/lib/utils";
import { useToast } from "@/components/shared/Toast";

const PAGE_SIZE = 10;

const SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

export default function AdminProductsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();

  // RBAC checks
  const canModify = profile?.role === "Owner" || profile?.role === "Manager";
  const canDelete = profile?.role === "Owner";

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter/Search States
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modal / Form States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formDiscount, setFormDiscount] = useState(0);
  const [formCategory, setFormCategory] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formMaterial, setFormMaterial] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublished, setFormPublished] = useState(true);
  const [formImagesText, setFormImagesText] = useState(""); // comma separated URLs
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);

  // Split images helper
  const getImagesList = () => {
    return formImagesText
      .split(",")
      .map(url => url.trim())
      .filter(url => url.length > 0);
  };
  
  // Set images helper
  const setImagesList = (list: string[]) => {
    setFormImagesText(list.join(", "));
  };

  // Variant Builder Fields
  const [varSize, setVarSize] = useState<ProductSize>("M");
  const [varColorName, setVarColorName] = useState("");
  const [varColorHex, setVarColorHex] = useState("#000000");
  const [varStock, setVarStock] = useState(10);
  const [varSku, setVarSku] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList] = await Promise.all([
          getProducts({ publishedOnly: false }),
          getCategories()
        ]);
        setProducts(prodList);
        setCategories(catList);
      } catch (err) {
        console.error("Error loading products data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update slug when name changes
  useEffect(() => {
    if (!editingProduct) {
      setFormSlug(slugify(formName));
    }
  }, [formName, editingProduct]);

  // Actions
  const handleOpenCreate = () => {
    if (!canModify) return;
    setEditingProduct(null);
    setFormName("");
    setFormSlug("");
    setFormPrice(0);
    setFormDiscount(0);
    setFormCategory(categories[0]?.name || "");
    setFormBrand("");
    setFormMaterial("");
    setFormDescription("");
    setFormFeatured(false);
    setFormPublished(true);
    setFormImagesText("");
    setFormVariants([]);
    setShowFormModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSlug(product.slug);
    setFormPrice(product.price);
    setFormDiscount(product.discount || 0);
    setFormCategory(product.category);
    setFormBrand(product.brand || "");
    setFormMaterial(product.material || "");
    setFormDescription(product.description || "");
    setFormFeatured(product.featured);
    setFormPublished(product.published);
    setFormImagesText(product.images.join(", "));
    setFormVariants([...product.variants]);
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) return;
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert("Error deleting product.");
      }
    }
  };

  const handleAddVariant = () => {
    const sku = varSku.trim() || `MC-${formName.slice(0, 3).toUpperCase()}-${varSize}-${varColorName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newVar: ProductVariant = {
      id: Math.random().toString(36).substring(7),
      size: varSize,
      color: { name: varColorName || "Default", hex: varColorHex },
      stock: varStock,
      sku: sku
    };
    setFormVariants([...formVariants, newVar]);
    // reset builder
    setVarColorName("");
    setVarSku("");
  };

  const handleRemoveVariant = (varId: string) => {
    setFormVariants(formVariants.filter(v => v.id !== varId));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) return;

    const imageArray = formImagesText
      .split(",")
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const productPayload = {
      name: formName,
      slug: formSlug,
      description: formDescription,
      price: Number(formPrice),
      discount: Number(formDiscount),
      images: imageArray,
      category: formCategory,
      brand: formBrand,
      material: formMaterial,
      variants: formVariants,
      featured: formFeatured,
      published: formPublished
    };

    try {
      setLoading(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
        setProducts(products.map(p => p.id === editingProduct.id ? {
          ...p,
          ...productPayload,
          updatedAt: new Date()
        } : p));
      } else {
        const newId = await createProduct(productPayload);
        const newProd: Product = {
          id: newId,
          ...productPayload,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setProducts([newProd, ...products]);
      }
      setShowFormModal(false);
    } catch (err) {
      alert("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  // Client side filtering & search
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "" || p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-800">

      <div className="flex justify-between items-center bg-white p-6 rounded-card border border-zinc-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-medium text-zinc-900">Product Management</h1>
          <p className="text-sm font-body text-zinc-500 mt-1">
            Create, edit, and update the catalog listings.
          </p>
        </div>
        {canModify && (
          <Button onClick={handleOpenCreate} variant="primary" className="bg-brand-mauve hover:bg-brand-plum flex items-center gap-1.5 py-2.5 px-4 rounded-card">
            <Plus className="w-4.5 h-4.5" /> Add Product
          </Button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-card border border-zinc-200/60 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-card font-body text-sm focus:outline-none focus:border-brand-mauve focus:ring-1 focus:ring-brand-mauve bg-zinc-50/50"
          />
        </div>
        <div className="flex gap-2 min-w-[200px]">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-card font-body text-sm focus:outline-none focus:border-brand-mauve bg-zinc-50/50 appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-card border border-zinc-200/60 shadow-sm overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
            <p className="text-zinc-500 font-body text-xs">Loading products list...</p>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-body text-sm">
            No products found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm font-body">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150 text-zinc-500 font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock (Total)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-600">
                {paginatedProducts.map((p) => {
                  const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                  const isLowStock = p.variants.some(v => v.stock <= 2);
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50">
                      <td className="p-4 font-semibold text-zinc-950">
                        <div>
                          <p>{p.name}</p>
                          <p className="text-[10px] text-zinc-400 font-normal">slug: {p.slug}</p>
                        </div>
                      </td>
                      <td className="p-4">{p.category}</td>
                      <td className="p-4">
                        <span className="font-semibold text-zinc-900">{formatPrice(p.price)}</span>
                        {p.discount ? (
                          <span className="text-[10px] bg-brand-blush/20 text-brand-plum px-1.5 py-0.5 rounded-full ml-2">
                            -{p.discount}%
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${isLowStock ? "text-amber-600" : "text-zinc-700"}`}>
                          {totalStock} units
                        </span>
                        {isLowStock && (
                          <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1 rounded ml-1 uppercase">Low</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${p.published ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                          }`}>
                          {p.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title={canModify ? "Edit product" : "View product details"}
                            className="p-1.5 hover:bg-zinc-100 rounded text-zinc-600 hover:text-brand-mauve transition-colors"
                          >
                            {canModify ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id)}
                              title="Delete product"
                              className="p-1.5 hover:bg-red-50 rounded text-zinc-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-zinc-100 font-body text-xs text-zinc-500">
            <span>Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length} items</span>
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

      {/* Edit/Create Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card shadow-2xl border border-zinc-200 max-w-3xl w-full max-h-[90vh] flex flex-col">
            <header className="p-4 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-lg font-bold font-display text-zinc-900">
                {editingProduct ? (canModify ? "Edit Product" : "View Product Details") : "Create New Product"}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  required
                  disabled={!canModify}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Linen Wrap Midi Dress"
                />
                <Input
                  label="Slug (URL-friendly)"
                  required
                  disabled={!canModify}
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. linen-wrap-midi-dress"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 text-zinc-700">
                  <label className="text-xs font-semibold font-body">Category</label>
                  <select
                    disabled={!canModify}
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-sand rounded-card text-sm focus:outline-none focus:border-brand-mauve bg-white h-[42px]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Price (LKR)"
                  type="number"
                  required
                  disabled={!canModify}
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                />
                <Input
                  label="Discount (%)"
                  type="number"
                  disabled={!canModify}
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Brand"
                  disabled={!canModify}
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  placeholder="e.g. Mona's Collection"
                />
                <Input
                  label="Material"
                  disabled={!canModify}
                  value={formMaterial}
                  onChange={(e) => setFormMaterial(e.target.value)}
                  placeholder="e.g. 100% Linen"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-zinc-700">
                <label className="text-xs font-semibold font-body">Description</label>
                <textarea
                  rows={3}
                  disabled={!canModify}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the product..."
                  className="w-full px-3 py-2 border border-brand-sand rounded-card text-sm focus:outline-none focus:border-brand-mauve font-body"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-zinc-700">
                <label className="text-xs font-semibold font-body">Product Images</label>
                
                {/* Thumbnails list */}
                <div className="flex flex-wrap gap-3 mb-2">
                  {getImagesList().map((imgUrl, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-card overflow-hidden border border-brand-sand bg-brand-cream group flex items-center justify-center shrink-0">
                      <img src={imgUrl} alt={`Product ${idx + 1}`} className="object-cover w-full h-full" />
                      {canModify && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = getImagesList();
                            const newList = currentList.filter((_, i) => i !== idx);
                            setImagesList(newList);
                          }}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {canModify && (
                    <div className="w-20 h-20 shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          
                          toast(`Uploading ${files.length} image(s)...`, "info");
                          
                          try {
                            const uploadedUrls: string[] = [];
                            for (const file of files) {
                              const formData = new FormData();
                              formData.append("file", file);
                              const res = await fetch("/api/upload", {
                                method: "POST",
                                body: formData
                              });
                              const data = await res.json();
                              if (data.error) throw new Error(data.error);
                              uploadedUrls.push(data.url);
                            }
                            const newList = [...getImagesList(), ...uploadedUrls];
                            setImagesList(newList);
                            toast("Images uploaded successfully!", "success");
                          } catch (err: any) {
                            toast(err.message || "Failed to upload image(s)", "error");
                          }
                        }}
                        className="hidden"
                        id="product-images-upload"
                      />
                      <label
                        htmlFor="product-images-upload"
                        className="w-full h-full flex flex-col items-center justify-center border border-dashed border-zinc-300 hover:border-brand-mauve rounded-card cursor-pointer transition-colors bg-white hover:bg-zinc-50"
                      >
                        <Upload className="w-5 h-5 text-zinc-400" />
                        <span className="text-[10px] text-zinc-500 font-semibold mt-1 font-body">Add Image</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canModify}
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-brand-mauve focus:ring-brand-mauve"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-body cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canModify}
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-brand-mauve focus:ring-brand-mauve"
                  />
                  <span>Published (Visible to customers)</span>
                </label>
              </div>

              {/* Variants Builder Section */}
              <div className="border-t border-zinc-150 pt-4 space-y-4">
                <h3 className="text-sm font-bold font-display text-zinc-950">Product Variants</h3>

                {/* Variant List Table */}
                {formVariants.length > 0 && (
                  <table className="w-full text-left border-collapse text-xs font-body">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-150">
                        <th className="p-2">Size</th>
                        <th className="p-2">Color</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Stock</th>
                        {canModify && <th className="p-2 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {formVariants.map((v) => (
                        <tr key={v.id}>
                          <td className="p-2 font-semibold">{v.size}</td>
                          <td className="p-2">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 rounded-full border border-zinc-300" style={{ backgroundColor: v.color.hex }} />
                              {v.color.name}
                            </span>
                          </td>
                          <td className="p-2 font-mono text-zinc-500">{v.sku}</td>
                          <td className="p-2 font-semibold text-zinc-900">{v.stock} units</td>
                          {canModify && (
                            <td className="p-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(v.id)}
                                className="text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Add Variant Form */}
                {canModify && (
                  <div className="bg-zinc-50/50 p-4 rounded-card border border-zinc-200 space-y-3">
                    <p className="text-xs font-bold text-zinc-500">Add Variant Option</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400">Size</label>
                        <select
                          value={varSize}
                          onChange={(e) => setVarSize(e.target.value as ProductSize)}
                          className="px-2 py-1.5 border border-zinc-200 bg-white rounded text-xs focus:outline-none"
                        >
                          {SIZES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400">Color Name</label>
                        <input
                          type="text"
                          value={varColorName}
                          onChange={(e) => setVarColorName(e.target.value)}
                          placeholder="e.g. Sage Green"
                          className="px-2 py-1.5 border border-zinc-200 bg-white rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400">Color Color/Hex</label>
                        <input
                          type="color"
                          value={varColorHex}
                          onChange={(e) => setVarColorHex(e.target.value)}
                          className="w-full h-[29px] border border-zinc-200 bg-white rounded p-0 cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400">Stock</label>
                        <input
                          type="number"
                          value={varStock}
                          onChange={(e) => setVarStock(Number(e.target.value))}
                          className="px-2 py-1.5 border border-zinc-200 bg-white rounded text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400">SKU (Optional)</label>
                        <input
                          type="text"
                          value={varSku}
                          onChange={(e) => setVarSku(e.target.value)}
                          placeholder="Auto-generated"
                          className="px-2 py-1.5 border border-zinc-200 bg-white rounded text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="text-xs bg-zinc-800 text-white hover:bg-zinc-950 font-bold px-3.5 py-1.5 rounded transition-colors"
                    >
                      Append Variant
                    </button>
                  </div>
                )}
              </div>

              {/* Submit panel */}
              {canModify && (
                <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowFormModal(false)} className="rounded-card border-zinc-200 py-2.5 px-4 text-sm font-semibold">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="bg-brand-mauve hover:bg-brand-plum py-2.5 px-6 text-sm font-semibold rounded-card">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
