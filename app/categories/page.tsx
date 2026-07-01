// app/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/db/categories";
import type { Category } from "@/types";
import { ChevronRight } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await getCategories();
        setCategories(list);
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-4xl font-display font-medium text-brand-plum">
            Our Collections
          </h1>
          <p className="text-sm font-body text-brand-charcoal/60 mt-2">
            Explore carefully selected wardrobes and styles categorized for ease of browsing.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
            <p className="text-zinc-500 font-body text-xs">Loading collections...</p>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-zinc-500 font-body py-20 text-sm">No collections created yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((c, idx) => {
              const bgColors = ["bg-[#F8F0F3]", "bg-[#FAF7F4]", "bg-[#EDE6DE]"];
              const bgColor = bgColors[idx % bgColors.length];
              const defaultImg = idx === 0 ? "/images/floral-midi-dress.png" : idx === 1 ? "/images/chic-linen-top.png" : "/images/straw-handbag.png";

              return (
                <Link
                  key={c.id}
                  href={`/shop?category=${encodeURIComponent(c.name)}`}
                  className="group relative h-96 rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-350 flex flex-col justify-end p-6 border border-brand-sand/30"
                >
                  {/* Background placeholder */}
                  <div className={`absolute inset-0 ${bgColor} transition-transform duration-500 group-hover:scale-105`} />
                  
                  {/* Image */}
                  <Image
                    src={c.image || defaultImg}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center opacity-85 group-hover:opacity-95 transition-opacity duration-300"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-brand-charcoal/20 to-transparent pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 text-white space-y-1">
                    <h2 className="text-2xl font-display font-medium">
                      {c.name}
                    </h2>
                    {c.description && (
                      <p className="text-xs text-white/70 font-body line-clamp-2 pr-6 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                    <span className="mt-3 text-xs font-semibold uppercase inline-flex items-center gap-1 text-brand-blush group-hover:gap-2 transition-all font-body">
                      Explore Collection <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
