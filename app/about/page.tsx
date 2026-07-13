// app/about/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPageContent, PageContent } from "@/lib/db/content";
import { Award, Heart, ShieldCheck, Sparkles, Star, ArrowRight, Truck, Users } from "lucide-react";

// ── Scroll-reveal hook (self-contained) ──────────────────────────
function useReveal() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.visible)");
      if (!els.length) return;
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            setTimeout(() => el.classList.add("visible"), parseInt(el.dataset.delay || "0", 10));
            obs.unobserve(el);
          }
        }),
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 80);
    return () => clearTimeout(timer);
  }, []);
}

const VALUES = [
  {
    icon: <Award className="w-5 h-5" />,
    title: "Premium Craftsmanship",
    desc: "Every fabric is handpicked and quality-checked — seams, zippers, buttons. Only retail-perfect pieces reach you.",
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Honest & Transparent",
    desc: "No filters, no deception. Our catalogs show real products so you receive exactly what you see.",
    color: "bg-pink-50 text-pink-600 border-pink-100",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Risk-Free COD",
    desc: "Pay cash only when your parcel arrives. Zero transaction risk for every buyer across Sri Lanka.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: "Islandwide Delivery",
    desc: "We deliver to every corner of Sri Lanka — fast, reliable, and tracked from our hands to yours.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community-First",
    desc: "Born on Facebook, grown through trust. Our 5,000+ happy customers are the heart of Mona's Closet.",
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Curated Style",
    desc: "Minimalist elegance meets daily wearability. We source trends that last beyond the season.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
];

const MILESTONES = [
  { year: "2019", label: "Founded on Facebook", desc: "Mona's Closet began as a boutique Facebook page." },
  { year: "2021", label: "5,000+ Customers", desc: "Grew to a loyal islandwide community." },
  { year: "2023", label: "Website Launch", desc: "Moved online for faster, easier shopping." },
  { year: "2024", label: "New Collections", desc: "Weekly drops keeping Sri Lanka in style." },
];

export default function AboutPage() {
  const [data, setData]     = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useReveal();

  useEffect(() => {
    getPageContent("about").then((d) => { setData(d); setLoading(false); });
  }, []);

  const defaultContent =
    "Mona's Closet was founded with a simple vision: to bring stylish, premium-quality women's apparel to fashion lovers across Sri Lanka without the heavy boutique price tag. Starting as a beloved Facebook community shop, we grew rapidly thanks to our loyal customers who appreciate handpicked fabrics, accurate sizing, and real pictures.\n\nOur design philosophy revolves around minimalist elegance and daily wearability. From our staple linen midi dresses to lightweight casual tops, every item is quality checked and sourced carefully. We believe in transparency, premium customer care, and easy shopping.";

  const contentText = data?.content || defaultContent;
  const titleText   = data?.title   || "About Mona's Closet";

  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal overflow-x-hidden">

      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[480px] flex items-end overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/about-hero.png"
          alt="Mona's Closet boutique"
          fill
          priority
          className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-[8s] ease-out"
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-brand-charcoal/30 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blush/25 backdrop-blur-sm border border-brand-blush/30 text-brand-blush text-xs font-semibold uppercase tracking-widest font-body mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Our Story
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-white leading-tight drop-shadow-lg">
              {titleText}
            </h1>
            <p className="mt-4 text-base font-body text-white/80 max-w-lg leading-relaxed">
              Premium fashion born in Sri Lanka, curated for the modern woman.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────── */}
      <section className="bg-brand-plum text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5,000+", label: "Happy Customers" },
              { value: "100%",   label: "Islandwide COD" },
              { value: "3+",     label: "Years of Trust" },
              { value: "Weekly", label: "New Arrivals" },
            ].map((s, i) => (
              <div key={i}
                data-reveal data-delay={String(i * 100)}
                className="reveal"
              >
                <p className="text-3xl font-display font-bold text-brand-blush">{s.value}</p>
                <p className="text-xs font-body text-white/70 mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Image */}
            <div data-reveal className="reveal-left relative">
              <div className="relative h-[520px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/about-story.png"
                  alt="Mona's Closet brand story"
                  fill
                  className="object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-plum/20 to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl p-4 border border-brand-sand/50 flex items-center gap-3 max-w-[200px]">
                <div className="w-10 h-10 rounded-xl bg-brand-blush/30 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-brand-mauve" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-brand-plum font-body">Loved by</p>
                  <p className="text-base font-bold text-brand-plum font-display">5,000+ Women</p>
                </div>
              </div>
            </div>

            {/* Text */}
            <div data-reveal className="reveal-right space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-mauve font-body">Our Journey</span>
                <h2 className="mt-2 text-3xl md:text-4xl font-display font-medium text-brand-plum leading-tight">
                  From a Facebook Page to Sri Lanka's Favourite Online Boutique
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-brand-mauve" />
                  <p className="text-sm font-body text-brand-charcoal/50">Loading story…</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contentText.split("\n\n").map((para, idx) => (
                    <p key={idx} className="text-base font-body text-brand-charcoal/80 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-brand-plum text-white px-6 py-3 rounded-xl font-body text-sm font-semibold hover:bg-brand-mauve transition-all duration-200 hover:scale-105 shadow-md group"
              >
                Shop the Collection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ────────────────────────────────────────────────── */}
      <section className="py-16 bg-brand-mist border-y border-brand-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="reveal text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-mauve font-body">Milestones</span>
            <h2 className="mt-2 text-3xl font-display font-medium text-brand-plum">Our Growth Story</h2>
          </div>

          <div className="relative">
            {/* Centre line */}
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-brand-sand hidden md:block" />

            <div className="space-y-8 md:space-y-0">
              {MILESTONES.map((m, i) => (
                <div
                  key={i}
                  data-reveal
                  data-delay={String(i * 120)}
                  className={`reveal md:grid md:grid-cols-2 md:gap-8 items-center ${i % 2 === 0 ? "" : "md:[direction:rtl]"}`}
                >
                  <div className={`bg-white p-6 rounded-2xl border border-brand-sand/50 shadow-sm hover:shadow-md transition-shadow duration-300 ${i % 2 !== 0 ? "md:[direction:ltr]" : ""}`}>
                    <span className="text-xs font-bold text-brand-mauve font-body uppercase tracking-widest">{m.year}</span>
                    <h3 className="mt-1 text-lg font-display font-semibold text-brand-plum">{m.label}</h3>
                    <p className="mt-1 text-sm font-body text-brand-charcoal/70">{m.desc}</p>
                  </div>
                  {/* Spacer for alternating layout */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-brand-mauve border-4 border-brand-cream shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES GRID ────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="reveal text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-mauve font-body">Why Choose Us</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-display font-medium text-brand-plum">The Mona's Closet Promise</h2>
            <p className="mt-3 text-sm font-body text-brand-charcoal/60 max-w-xl mx-auto">
              Six core beliefs guide every piece we source, every order we pack, and every delivery we send.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <div
                key={i}
                data-reveal
                data-delay={String((i % 3) * 120)}
                className="reveal group bg-white rounded-2xl p-6 border border-brand-sand/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl border ${v.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  {v.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-brand-plum mb-2">{v.title}</h3>
                <p className="text-sm font-body text-brand-charcoal/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HERO IMAGE COLLAGE ──────────────────────────────────────── */}
      <section className="py-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="reveal grid grid-cols-2 md:grid-cols-4 gap-4 h-[280px]">
            {[
              { src: "/images/floral-midi-dress.png", span: "col-span-2 row-span-2" },
              { src: "/images/chic-linen-top.png",    span: "" },
              { src: "/images/straw-handbag.png",     span: "" },
              { src: "/images/pastel-wrap-dress.png", span: "col-span-2" },
            ].map((img, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden group ${img.span}`}>
                <Image
                  src={img.src}
                  alt="Mona's Closet collection"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-brand-plum/0 group-hover:bg-brand-plum/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────── */}
      <section className="bg-brand-plum text-white py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blush rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-mauve rounded-full blur-3xl" />
        </div>
        <div data-reveal className="reveal relative z-10 max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl md:text-4xl font-display font-medium">
            Ready to Find Your Style?
          </h2>
          <p className="text-sm font-body text-white/70 max-w-md mx-auto leading-relaxed">
            Explore our curated collection of dresses, tops, and accessories — new drops every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-brand-blush text-brand-plum px-8 py-3.5 rounded-xl font-body font-semibold text-sm hover:bg-white transition-all duration-200 hover:scale-105 shadow-lg group"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-xl font-body font-semibold text-sm hover:bg-white/20 transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
