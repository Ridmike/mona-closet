// app/categories/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/db/categories";
import type { Category } from "@/types";
import { ChevronRight, ImageOff } from "lucide-react";

const BG_COLORS = ["bg-[#F8F0F3]", "bg-[#FAF7F4]", "bg-[#EDE6DE]", "bg-[#F2EBF5]", "bg-[#EDF2F0]"];
const ACCENTS   = [
  "from-rose-900/80",
  "from-neutral-900/80",
  "from-amber-900/80",
  "from-purple-900/80",
  "from-teal-900/80",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);

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
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-mauve font-body">
            Collections
          </span>
          <h1 className="mt-1 text-4xl font-display font-medium text-brand-plum">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c, idx) => {
              const bgColor   = BG_COLORS[idx % BG_COLORS.length];
              const accent    = ACCENTS[idx % ACCENTS.length];
              const hasHover  = !!c.hoverImage;

              return (
                <Link
                  key={c.id}
                  href={`/shop?category=${encodeURIComponent(c.name)}`}
                  className="group relative h-[440px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-end p-6 block"
                >
                  {/* Colour background */}
                  <div className={`absolute inset-0 ${bgColor}`} />

                  {c.image ? (
                    <>
                      {/* Primary image — fades out on hover */}
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className={`object-cover object-center transition-all duration-700 ease-in-out ${
                          hasHover
                            ? "group-hover:opacity-0"
                            : "group-hover:scale-105"
                        }`}
                      />

                      {/* Hover image — only rendered if set in DB */}
                      {hasHover && (
                        <Image
                          src={c.hoverImage!}
                          alt={`${c.name} alternate view`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center opacity-0 scale-105 transition-all duration-700 ease-in-out group-hover:opacity-95 group-hover:scale-100"
                        />
                      )}
                    </>
                  ) : (
                    /* No image at all — show a styled placeholder */
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-20">
                      <ImageOff className="w-12 h-12 text-brand-plum" />
                      <p className="text-xs text-brand-plum font-body font-semibold uppercase tracking-widest">
                        No Image
                      </p>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${accent} via-transparent to-transparent pointer-events-none`} />

                  {/* "New Arrivals" pill — slides in on hover */}
                  <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
                    <span className="bg-brand-blush text-brand-plum text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full font-body shadow-md">
                      New Arrivals
                    </span>
                  </div>

                  {/* Text content */}
                  <div className="relative z-10 text-white flex flex-col items-start gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                    <h2 className="text-2xl font-display font-medium drop-shadow-sm text-white">
                      {c.name}
                    </h2>
                    {c.description && (
                      <p className="text-xs text-white/70 font-body line-clamp-2 pr-6 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-white/90 border-b border-white/50 pb-0.5 group-hover:gap-2.5 group-hover:border-white transition-all duration-300 font-body mt-1">
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
