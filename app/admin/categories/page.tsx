// app/admin/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/db/categories";
import type { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, X, ChevronRight, Eye } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useToast } from "@/components/shared/Toast";

export default function AdminCategoriesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();

  // RBAC checks
  const canModify = profile?.role === "Owner" || profile?.role === "Manager";
  const canDelete = profile?.role === "Owner";

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formParent, setFormParent] = useState("");
  const [formOrder, setFormOrder] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const catList = await getCategories();
        setCategories(catList);
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update slug when name changes
  useEffect(() => {
    if (!editingCategory) {
      setFormSlug(slugify(formName));
    }
  }, [formName, editingCategory]);

  const handleOpenCreate = () => {
    if (!canModify) return;
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormImage("");
    setFormParent("");
    setFormOrder(categories.length + 1);
    setShowFormModal(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description || "");
    setFormImage(category.image || "");
    setFormParent(category.parent || "");
    setFormOrder(category.order);
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) return;
    if (confirm("Are you sure you want to delete this category? Any products referencing this category will display category label correctly but its master category record will be removed.")) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (err) {
        console.error("Error deleting category:", err);
        toast("Error deleting category. Please check permissions.", "error");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) return;

    const categoryPayload = {
      name: formName,
      slug: formSlug,
      description: formDescription || null,
      image: formImage || null,
      parent: formParent || null,
      order: Number(formOrder)
    };

    try {
      setLoading(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryPayload);
        setCategories(categories
          .map(c => c.id === editingCategory.id ? { ...c, ...categoryPayload } : c)
          .sort((a, b) => a.order - b.order)
        );
      } else {
        const newId = await createCategory(categoryPayload);
        const newCat: Category = {
          id: newId,
          ...categoryPayload
        };
        setCategories([...categories, newCat].sort((a, b) => a.order - b.order));
      }
      setShowFormModal(false);
    } catch (err) {
      console.error("Error saving category:", err);
      toast("Error saving category. Please check permissions or field values.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-800">

      <div className="flex justify-between items-center bg-white p-6 rounded-card border border-zinc-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-medium text-zinc-900">Category Management</h1>
          <p className="text-sm font-body text-zinc-500 mt-1">
            Organize catalog structures and menu sorting.
          </p>
        </div>
        {canModify && (
          <Button onClick={handleOpenCreate} variant="primary" className="bg-brand-mauve hover:bg-brand-plum flex items-center gap-1.5 py-2.5 px-4 rounded-card">
            <Plus className="w-4.5 h-4.5" /> Add Category
          </Button>
        )}
      </div>

      {/* Grid of Categories */}
      <div className="bg-white rounded-card border border-zinc-200/60 shadow-sm overflow-hidden">
        {loading && categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
            <p className="text-zinc-500 font-body text-xs">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-body text-sm">
            No categories created yet. Click Add Category to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm font-body">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150 text-zinc-500 font-semibold">
                  <th className="p-4 w-20">Order</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Parent Category</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-600">
                {categories.map((c) => {
                  const parentName = categories.find(p => p.id === c.parent)?.name || "-";
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50/50">
                      <td className="p-4">
                        <span className="font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-xs font-semibold">
                          #{c.order}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-zinc-950">{c.name}</td>
                      <td className="p-4 font-mono text-zinc-500 text-xs">{c.slug}</td>
                      <td className="p-4 max-w-[240px] truncate text-zinc-500">{c.description || "-"}</td>
                      <td className="p-4 text-zinc-500">{parentName}</td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title={canModify ? "Edit category" : "View category details"}
                            className="p-1.5 hover:bg-zinc-100 rounded text-zinc-600 hover:text-brand-mauve transition-colors"
                          >
                            {canModify ? <Edit className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(c.id)}
                              title="Delete category"
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
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-2xl border border-zinc-200 max-w-lg w-full">
            <header className="p-4 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-lg font-bold font-display text-zinc-900">
                {editingCategory ? (canModify ? "Edit Category" : "Category Details") : "Create New Category"}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </header>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Input
                label="Category Name"
                required
                disabled={!canModify}
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Linen Dresses"
              />
              <Input
                label="Slug (URL-friendly)"
                required
                disabled={!canModify}
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="e.g. linen-dresses"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Display Order (Sort weight)"
                  type="number"
                  required
                  disabled={!canModify}
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                />
                <div className="flex flex-col gap-1.5 text-zinc-700">
                  <label className="text-xs font-semibold font-body">Parent Category</label>
                  <select
                    disabled={!canModify}
                    value={formParent}
                    onChange={(e) => setFormParent(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-sand rounded-card text-sm focus:outline-none focus:border-brand-mauve bg-white h-[42px]"
                  >
                    <option value="">None (Top-Level)</option>
                    {categories
                      .filter(c => editingCategory ? c.id !== editingCategory.id : true)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              <Input
                label="Image URL"
                disabled={!canModify}
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="e.g. /images/linen-dress-cat.png"
              />
              <div className="flex flex-col gap-1.5 text-zinc-700">
                <label className="text-xs font-semibold font-body">Description</label>
                <textarea
                  rows={3}
                  disabled={!canModify}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide a brief description of the category..."
                  className="w-full px-3 py-2 border border-brand-sand rounded-card text-sm focus:outline-none focus:border-brand-mauve font-body"
                />
              </div>

              {canModify && (
                <div className="flex justify-end gap-2 border-t border-zinc-100 pt-4 mt-6">
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
