// app/about/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getPageContent, PageContent } from "@/lib/db/content";
import { Award, Heart, ShieldCheck, Sparkles, Star } from "lucide-react";

export default function AboutPage() {
  const [data, setData] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const pageData = await getPageContent("about");
      setData(pageData);
      setLoading(false);
    }
    loadContent();
  }, []);

  const defaultContent = 
    "Mona's Closet was founded with a simple vision: to bring stylish, premium-quality women's apparel to fashion lovers across Sri Lanka without the heavy boutique price tag. Starting as a beloved Facebook community shop, we grew rapidly thanks to our loyal customers who appreciate handpicked fabrics, accurate sizing, and real pictures.\n\nOur design philosophy revolves around minimalist elegance and daily wearability. From our staple linen midi dresses to lightweight casual tops, every item is quality checked and sourced carefully. We believe in transparency, premium customer care, and easy shopping.";

  const contentText = data?.content || defaultContent;
  const titleText = data?.title || "About Mona's Closet";

  return (
    <div className="min-h-screen bg-brand-cream py-16 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Banner header */}
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-brand-blush/30 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-plum">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-brand-plum">
            {titleText}
          </h1>
          <div className="h-0.5 w-20 bg-brand-mauve mx-auto rounded" />
        </div>

        {/* Narrative text block */}
        <div className="bg-white p-8 md:p-12 rounded-card border border-brand-sand/55 shadow-sm space-y-6 leading-relaxed text-sm text-brand-charcoal/90 font-body">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
              <p className="text-zinc-400 text-xs">Loading brand story...</p>
            </div>
          ) : (
            contentText.split("\n\n").map((para, idx) => (
              <p key={idx} className="first-letter:text-2xl first-letter:font-display first-letter:text-brand-plum">
                {para}
              </p>
            ))
          )}
        </div>

        {/* Brand Values / Highlight Deck */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-medium text-brand-plum text-center uppercase tracking-wide">
            Our Core Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-card border border-brand-sand/50 shadow-sm space-y-3">
              <div className="p-3 bg-brand-blush/30 text-brand-plum w-fit rounded-full">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-brand-plum text-md">Premium Finishes</h3>
              <p className="text-xs font-body text-brand-charcoal/70 leading-relaxed">
                We handpick all fabrics and run checks on seams, zippers, and buttons so you only hold retail-perfect choices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-brand-sand/50 shadow-sm space-y-3">
              <div className="p-3 bg-brand-blush/30 text-brand-plum w-fit rounded-full">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-brand-plum text-md">Customer Sincerity</h3>
              <p className="text-xs font-body text-brand-charcoal/70 leading-relaxed">
                No filters or heavily doctored shots. Our catalogs depict actual products so you get exactly what you inspect.
              </p>
            </div>

            <div className="bg-white p-6 rounded-card border border-brand-sand/50 shadow-sm space-y-3">
              <div className="p-3 bg-brand-blush/30 text-brand-plum w-fit rounded-full">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-brand-plum text-md">COD Security</h3>
              <p className="text-xs font-body text-brand-charcoal/70 leading-relaxed">
                Pay in cash only at your door. We ensure zero transaction risks for our buyers islandwide.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
