// app/faq/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getFAQs, FAQItem } from "@/lib/db/content";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaqs() {
      const data = await getFAQs();
      setFaqs(data);
      setLoading(false);
    }
    loadFaqs();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const defaultFaqs: FAQItem[] = [
    { id: "df_1", question: "How long does delivery take?", answer: "Delivery takes 2-3 business days islandwide across Sri Lanka. For Colombo and suburbs, it might arrive within 24-48 hours.", order: 1 },
    { id: "df_2", question: "Do you offer Cash on Delivery (COD)?", answer: "Yes, we support Cash on Delivery islandwide, allowing you to pay in cash only when you receive your package.", order: 2 },
    { id: "df_3", question: "What is your shipping fee policy?", answer: "We charge a flat rate of Rs. 350 for shipping. However, shipping is completely free for all orders above Rs. 5,000.", order: 3 },
    { id: "df_4", question: "Can I exchange an item for a different size?", answer: "Yes, we accept exchanges for size differences within 7 days of receiving the item. Please contact our team via WhatsApp for details. Items must be unworn and in original packaging.", order: 4 }
  ];

  const faqList = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="min-h-screen bg-brand-cream py-16 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-brand-blush/30 rounded-full flex items-center justify-center mx-auto mb-2 text-brand-plum">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-display font-medium text-brand-plum">
            Frequently Asked Questions
          </h1>
          <p className="text-sm font-body text-brand-charcoal/60 max-w-md mx-auto">
            Find answers to commonly asked questions on sizing, exchanges, and COD shipping terms.
          </p>
        </div>

        {/* FAQs list accordion */}
        <div className="space-y-4">
          {loading && faqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
              <p className="text-zinc-500 font-body text-xs">Loading answers...</p>
            </div>
          ) : (
            faqList.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className="bg-white rounded-card border border-brand-sand/55 shadow-sm overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full text-left p-5 flex justify-between items-center hover:bg-zinc-50/50 gap-4"
                  >
                    <span className="font-display font-semibold text-brand-plum text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                    <span className="text-brand-mauve shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden border-brand-sand/30 ${
                      isExpanded ? "max-h-60 border-t p-5 bg-zinc-50/20" : "max-h-0"
                    }`}
                  >
                    <p className="text-sm text-brand-charcoal/80 font-body leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
