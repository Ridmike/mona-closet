// app/terms/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getPageContent, PageContent } from "@/lib/db/content";
import { Scale } from "lucide-react";

export default function TermsConditionsPage() {
  const [data, setData] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const pageData = await getPageContent("terms-conditions");
      setData(pageData);
      setLoading(false);
    }
    loadContent();
  }, []);

  const defaultContent = 
    "Welcome to Mona's Closet. By accessing this storefront and ordering our goods, you agree to comply with the following terms:\n\n- **Order Placement:** By submitting a Cash on Delivery order, you commit to accepting and paying for the delivery when it arrives at your coordinates. Refusing packages repeatedly will lead to blocklist adjustments.\n- **Pricing & Availability:** All prices displayed on our website are in LKR (Sri Lankan Rupees). We reserve the right to modify prices or mark items out of stock based on inventory levels.\n- **Exchanges & Refunds:** Sizing exchanges must be initiated within 7 days of delivery. Tags must remain attached, and the item must show no signs of usage.";

  const contentText = data?.content || defaultContent;
  const titleText = data?.title || "Terms & Conditions";

  return (
    <div className="min-h-screen bg-brand-cream py-16 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-brand-blush/30 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-plum">
            <Scale className="w-6 h-6" />
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
              <p className="text-zinc-400 text-xs">Loading terms of service...</p>
            </div>
          ) : (
            contentText.split("\n\n").map((para, idx) => {
              // Convert bullet points
              if (para.startsWith("- ")) {
                const lines = para.split("\n");
                return (
                  <div key={idx} className="space-y-3 py-1.5 pl-2">
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
                          {isBullet && <span className="text-brand-mauve shrink-0 mt-1.5">•</span>}
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
