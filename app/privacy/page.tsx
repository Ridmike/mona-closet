// app/privacy/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getPageContent, PageContent } from "@/lib/db/content";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [data, setData] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const pageData = await getPageContent("privacy-policy");
      setData(pageData);
      setLoading(false);
    }
    loadContent();
  }, []);

  const defaultContent = 
    "At Mona's Closet, we respect your privacy and protect your personal information. This policy details how we collect and manage your data:\n\n1. **Information We Collect:** We collect your name, email address, delivery address, phone number, and purchase records to fulfill orders and update your user profile.\n2. **How We Use It:** Your phone number is used solely to verify coordinates and send delivery updates. We do not sell or lease customer database sheets to third parties.\n3. **Cookie Settings:** We use local session stores and cookies to persist your shopping cart bag and wishlist across browser restarts.";

  const contentText = data?.content || defaultContent;
  const titleText = data?.title || "Privacy & Data Protection Policy";

  return (
    <div className="min-h-screen bg-brand-cream py-16 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-brand-blush/30 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-plum">
            <ShieldCheck className="w-6 h-6" />
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
              <p className="text-zinc-400 text-xs">Loading privacy policy...</p>
            </div>
          ) : (
            contentText.split("\n\n").map((para, idx) => {
              // Convert dynamic numbered points
              if (para.match(/^\d+\./)) {
                const lines = para.split("\n");
                return (
                  <div key={idx} className="space-y-3 py-1 pl-2">
                    {lines.map((line, lIdx) => {
                      // Highlight bold markdown items
                      const boldMatch = line.match(/\*\*(.*?)\*\*/g);
                      let contentElement: React.ReactNode = line;
                      if (boldMatch) {
                        const parts = line.split(/\*\*(.*?)\*\*/g);
                        contentElement = parts.map((part, pIdx) => 
                          pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-brand-plum">{part}</strong> : part
                        );
                      }

                      return (
                        <p key={lIdx} className="leading-relaxed">
                          {contentElement}
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
