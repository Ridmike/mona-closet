// app/shipping/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getPageContent, PageContent } from "@/lib/db/content";
import { Truck } from "lucide-react";

export default function ShippingPolicyPage() {
  const [data, setData] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const pageData = await getPageContent("shipping-policy");
      setData(pageData);
      setLoading(false);
    }
    loadContent();
  }, []);

  const defaultContent = 
    "We deliver to all cities and suburbs in Sri Lanka. Our delivery times are as follows:\n- **Colombo & Suburbs**: 1-2 business days\n- **Other Districts**: 2-3 business days\n\n**Shipping Fees:**\n- We charge a flat fee of Rs. 350 on all orders.\n- Order totals above **Rs. 5,000** automatically qualify for **Free Shipping**.\n\n**Order Tracking:**\nAfter checkout, you will receive an automatic confirmation. Our sales team will also verify your details and send a WhatsApp notification with delivery confirmations. Cash on Delivery (COD) is available for all shipments.";

  const contentText = data?.content || defaultContent;
  const titleText = data?.title || "Shipping & Delivery Policy";

  return (
    <div className="min-h-screen bg-brand-cream py-16 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-brand-blush/30 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-plum">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-display font-medium text-brand-plum">
            {titleText}
          </h1>
          <div className="h-0.5 w-16 bg-brand-mauve mx-auto rounded" />
        </div>

        {/* Content body */}
        <div className="bg-white p-8 md:p-10 rounded-card border border-brand-sand/55 shadow-sm space-y-4 text-sm text-brand-charcoal/90 font-body leading-relaxed">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
              <p className="text-zinc-400 text-xs">Loading shipping details...</p>
            </div>
          ) : (
            contentText.split("\n\n").map((para, idx) => {
              // Convert basic markdown bullet lines to pretty formatting
              if (para.startsWith("- ") || para.startsWith("**")) {
                const lines = para.split("\n");
                return (
                  <div key={idx} className="space-y-2 py-1 bg-zinc-50/50 p-4 rounded border border-zinc-150">
                    {lines.map((line, lIdx) => {
                      let cleaned = line;
                      let isBullet = false;
                      if (line.startsWith("- ")) {
                        cleaned = line.substring(2);
                        isBullet = true;
                      }
                      
                      // Highlight bold markdown items
                      const boldMatch = cleaned.match(/\*\*(.*?)\*\*/g);
                      let contentElement: React.ReactNode = cleaned;
                      if (boldMatch) {
                        const parts = cleaned.split(/\*\*(.*?)\*\*/g);
                        contentElement = parts.map((part, pIdx) => 
                          pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-brand-plum">{part}</strong> : part
                        );
                      }

                      return (
                        <p key={lIdx} className={`flex gap-2 items-start ${isBullet ? "pl-2" : ""}`}>
                          {isBullet && <span className="text-brand-mauve shrink-0 mt-1">•</span>}
                          <span>{contentElement}</span>
                        </p>
                      );
                    })}
                  </div>
                );
              }
              return (
                <p key={idx} className="whitespace-pre-line">
                  {para}
                </p>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
