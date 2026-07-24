// app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBag, Truck, MessageSquare, Award, ArrowRight,
  Heart, ChevronRight, Sparkles, Star, X, Tag, Zap
} from "lucide-react";
import type { ProductCardData, Product } from "@/types";
import { getProducts } from "@/lib/db/products";
import { getCategories } from "@/lib/db/categories";
import { getSiteSettings } from "@/lib/db/content";

// ─── Static data ──────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "🌸 New Season Arrivals — Shop Now",
  "✨ Up to 50% Off Selected Styles",
  "🚚 Free COD Delivery Islandwide",
  "💎 Premium Quality, Honest Prices",
  "🛍️ New Drops Every Week",
  "🎀 Limited Time Sale — Don't Miss Out",
];

const REVIEWS = [
  { name: "Dilini R.", location: "Colombo", rating: 5, comment: "Absolutely love the fabric quality of the linen top! Fits perfectly and delivery took only 2 days. Will order again!" },
  { name: "Senuri W.", location: "Kandy", rating: 5, comment: "Ordered a midi dress and it was identical to the picture. Super easy checkout and love the COD service." },
  { name: "Maheshi F.", location: "Negombo", rating: 5, comment: "Finally a professional site for Mona's Closet! Buying is so much faster now than waiting on Messenger replies." },
];

const DEFAULT_CATEGORIES = [
  { name: "Dresses", count: "Explore", image: "/images/floral-midi-dress.png", hoverImage: "/images/pastel-wrap-dress.png", href: "/shop?category=dresses", color: "bg-[#F8F0F3]", accent: "from-rose-900/80" },
  { name: "Tops & Blouses", count: "Explore", image: "/images/chic-linen-top.png", hoverImage: "/images/hero.png", href: "/shop?category=tops-blouses", color: "bg-[#FAF7F4]", accent: "from-neutral-900/80" },
  { name: "Accessories", count: "Explore", image: "/images/straw-handbag.png", hoverImage: "/images/floral-midi-dress.png", href: "/shop?category=accessories", color: "bg-[#EDE6DE]", accent: "from-amber-900/80" },
];

const FEATURES = [
  { icon: <Truck className="w-5 h-5" />, title: "Islandwide COD", desc: "Cash on Delivery available all over Sri Lanka" },
  { icon: <MessageSquare className="w-5 h-5" />, title: "WhatsApp Orders", desc: "Place orders instantly via WhatsApp chat" },
  { icon: <Award className="w-5 h-5" />, title: "Premium Quality", desc: "Handpicked, quality-checked pieces only" },
  { icon: <Heart className="w-5 h-5" />, title: "Easy Checkout", desc: "Add to cart and buy in under 60 seconds" },
];

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────
function useScrollReveal(deps: any[] = []) {
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
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── Component ────────────────────────────────────────────────────────────────
function LoginSuccessBannerDetector({ onTrigger }: { onTrigger: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("login") === "success") {
      onTrigger();
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams, onTrigger]);
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "dresses" | "tops & blouses" | "accessories">("all");
  const [activeStep, setActiveStep] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showPromoTicker, setShowPromoTicker] = useState(true);
  const [showSaleBanner, setShowSaleBanner] = useState(true);

  useScrollReveal([categories, products, activeTab]);

  // Auto dismiss success banner after 5s
  useEffect(() => {
    if (showSuccessBanner) {
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessBanner]);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList, siteConfig] = await Promise.all([
          getProducts({ limitCount: 8, publishedOnly: true }),
          getCategories(),
          getSiteSettings(),
        ]);
        setProducts(prodList);
        setShowPromoTicker(siteConfig.showPromoTicker);
        setShowSaleBanner(siteConfig.showSaleBanner);

        if (catList.length > 0) {
          setCategories(catList.slice(0, 3).map((c, idx) => ({
            name: c.name,
            count: "Explore",
            image: c.image || DEFAULT_CATEGORIES[idx]?.image || "/images/hero.png",
            hoverImage: c.hoverImage || DEFAULT_CATEGORIES[idx]?.hoverImage || "/images/hero.png",
            href: `/shop?category=${encodeURIComponent(c.name)}`,
            color: DEFAULT_CATEGORIES[idx]?.color || "bg-[#F8F0F3]",
            accent: DEFAULT_CATEGORIES[idx]?.accent || "from-brand-charcoal/80",
          })));
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setCategories(DEFAULT_CATEGORIES);
      }
    }
    loadData();
  }, []);

  const rawFiltered = activeTab === "all"
    ? products
    : products.filter(p => p.category.toLowerCase().includes(activeTab.split(" ")[0]));

  const filteredProducts: ProductCardData[] = rawFiltered.map(p => ({
    id: p.id, name: p.name, slug: p.slug, price: p.price, discount: p.discount,
    image: p.images[0] || "/images/hero.png", category: p.category,
    inStock: p.variants.some(v => v.stock > 0),
  }));

  const tickerText = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream text-brand-charcoal overflow-x-hidden">
      <Suspense fallback={null}>
        <LoginSuccessBannerDetector onTrigger={() => setShowSuccessBanner(true)} />
      </Suspense>

      {/* ── SUCCESS LOGIN BANNER ─────────────────────────────────────────── */}
      {showSuccessBanner && (
        <div className="bg-emerald-600 text-white py-3.5 px-4 text-center font-body text-sm font-semibold flex items-center justify-center gap-2 relative z-50 animate-fade-in-up">
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0 font-sans">✓</span>
          <span>Welcome back! You have logged in successfully.</span>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── PROMO TICKER BAR ──────────────────────────────────────────────── */}
      {showPromoTicker && bannerVisible && (
        <div className="relative bg-gradient-to-r from-brand-plum via-brand-mauve to-brand-plum text-white overflow-hidden py-2.5">
          <div className="overflow-hidden">
            <div className="flex flex-row whitespace-nowrap animate-marquee gap-12 items-center">
              {tickerText.map((item, i) => (
                <span key={i} className="whitespace-nowrap text-xs font-semibold font-body tracking-wide px-8 flex items-center gap-2 shrink-0">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setBannerVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── SALE PROMO BANNER ─────────────────────────────────────────────── */}
      {showSaleBanner && (
        <section className="relative overflow-hidden h-[72px] md:h-[88px] flex items-center">
          <Image
            src="/images/promo-banner.png"
            alt="Sale promotion banner"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-plum/85 via-brand-plum/60 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 bg-brand-blush text-brand-plum text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full font-body shrink-0 animate-bounce-slow">
                <Zap className="w-3 h-3" /> Limited Sale
              </div>
              <p className="text-white font-display text-xl md:text-2xl font-medium leading-none">
                🎀 Up to <span className="text-brand-blush font-bold">50% Off</span> — New Season Styles
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden sm:inline-flex shrink-0 items-center gap-1.5 bg-white text-brand-plum text-xs font-bold font-body px-5 py-2.5 rounded-full hover:bg-brand-blush transition-colors duration-200 group shadow-md"
            >
              Shop Sale <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      )}

      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Full-bleed hero image background */}
        <Image
          src="/images/hero-lifestyle.png"
          alt="Mona's Closet lifestyle"
          fill
          priority
          loading="eager"
          sizes="100vw"
          className="object-cover object-top scale-105 transition-transform duration-[12s] ease-out hover:scale-100"
        />
        {/* Dual gradient overlay — left dark for text, right lighter */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal/90 via-brand-charcoal/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/50 via-transparent to-transparent" />

        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-blush/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-brand-mauve/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-xl space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blush/20 backdrop-blur-sm border border-brand-blush/40 text-brand-blush text-xs font-semibold uppercase tracking-widest font-body animate-fade-in-up">
              <Sparkles className="w-3.5 h-3.5" />
              New Season 2025 Arrivals
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-medium text-white leading-[1.05] animate-fade-in-up delay-150">
              Style That{" "}
              <span className="italic text-brand-blush">Feels</span>
              <br />as Good as
              <br />It <span className="underline-blush text-brand-blush">Looks</span>
            </h1>

            {/* Sub */}
            <p className="text-base sm:text-lg font-body text-white/75 max-w-md leading-relaxed animate-fade-in-up delay-300">
              Curated, trendy women's apparel for the modern Sri Lankan lifestyle — delivered to your door with Cash on Delivery.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-400">
              <Link href="/shop">
                <Button variant="primary" size="lg" className="flex items-center gap-2 group shadow-xl hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                  Shop Collection
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" className="bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/25 transition-all font-body flex items-center gap-2">
                  View Categories
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-8 pt-6 border-t border-white/15 animate-fade-in-up delay-500">
              {[
                { val: "5k+", label: "Happy Shoppers" },
                { val: "100%", label: "COD Islandwide" },
                { val: "50%", label: "Off Sale Items" },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-3xl font-display font-bold text-brand-blush">{s.val}</p>
                  <p className="text-xs font-body text-white/60 mt-0.5 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating social proof card */}
        <div className="hidden lg:flex absolute right-12 bottom-16 animate-float">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 flex items-center gap-3 border border-brand-sand max-w-[220px]">
            <div className="w-11 h-11 rounded-xl bg-brand-blush flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-brand-plum fill-brand-plum" />
            </div>
            <div>
              <div className="text-amber-400 text-sm leading-none">★★★★★</div>
              <p className="text-xs font-bold text-brand-plum font-body mt-0.5">Loved by 5,000+</p>
              <p className="text-[10px] text-brand-charcoal/50 font-body">Sri Lankan women</p>
            </div>
          </div>
        </div>

        {/* Floating COD badge */}
        <div className="hidden lg:flex absolute right-12 top-1/3 animate-float" style={{ animationDelay: "2s" }}>
          <div className="bg-brand-plum/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-brand-mauve/30 max-w-[200px]">
            <div className="w-9 h-9 rounded-xl bg-brand-blush/20 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-brand-blush" />
            </div>
            <div>
              <p className="text-xs font-bold text-white font-body">Free COD</p>
              <p className="text-[10px] text-white/60 font-body">Islandwide Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIP ─────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-brand-sand/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                data-reveal data-delay={String(i * 100)}
                className="reveal flex items-center gap-3 group"
              >
                <div className="p-2.5 rounded-xl bg-brand-blush/25 text-brand-plum shrink-0 group-hover:bg-brand-blush/50 group-hover:scale-110 transition-all duration-300">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-charcoal font-body">{f.title}</p>
                  <p className="text-[11px] text-brand-charcoal/55 font-body leading-tight mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="reveal flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-mauve font-body">Collections</span>
              <h2 className="mt-1 text-3xl md:text-4xl font-display font-medium text-brand-plum">Shop By Category</h2>
              <p className="text-sm font-body text-brand-charcoal/60 mt-2">Curated styles for every occasion.</p>
            </div>
            <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-mauve hover:text-brand-plum mt-4 md:mt-0 transition-colors font-body group">
              All Categories <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category, idx) => (
              <div key={category.name} data-reveal data-delay={String(idx * 150)} className="reveal">
                <Link
                  href={category.href}
                  className="group relative h-[440px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-end p-6 block"
                >
                  <div className={`absolute inset-0 ${category.color}`} />
                  {/* Primary image */}
                  <Image src={category.image} alt={category.name} fill sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center transition-opacity duration-700 ease-in-out group-hover:opacity-0" />
                  {/* Hover image */}
                  <Image src={category.hoverImage} alt={`${category.name} hover`} fill sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center opacity-0 scale-105 transition-all duration-700 ease-in-out group-hover:opacity-95 group-hover:scale-100" />
                  {/* Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.accent} via-transparent to-transparent pointer-events-none`} />
                  {/* New arrivals pill */}
                  <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0">
                    <span className="bg-brand-blush text-brand-plum text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full font-body shadow-md">
                      New Arrivals
                    </span>
                  </div>
                  {/* Content */}
                  <div className="relative z-10 text-white flex flex-col items-start gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                    <h3 className="text-2xl font-display font-medium drop-shadow-sm text-white">{category.name}</h3>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-white/90 border-b border-white/50 pb-0.5 group-hover:gap-2.5 group-hover:border-white transition-all duration-300 font-body">
                      Shop Now <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH SALE STRIP ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-plum via-[#8B3A62] to-brand-mauve py-12 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-blush rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div data-reveal className="reveal relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-brand-blush/20 border border-brand-blush/40 text-brand-blush text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full font-body">
              <Tag className="w-3.5 h-3.5" /> Flash Sale
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white">
              Up to <span className="text-brand-blush">50% Off</span> — This Week Only
            </h2>
            <p className="text-sm font-body text-white/70 max-w-lg">
              Dresses, tops, and accessories on sale. Limited stock — grab yours before it's gone.
            </p>
          </div>
          <Link href="/shop" className="shrink-0">
            <Button size="lg" className="bg-brand-blush text-brand-plum hover:bg-white font-bold shadow-xl group flex items-center gap-2 hover:scale-105 transition-transform">
              Shop the Sale
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-brand-mist border-y border-brand-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="reveal flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-mauve font-body">Handpicked For You</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-display font-medium text-brand-plum">Best Sellers & New Arrivals</h2>
            <p className="text-sm font-body text-brand-charcoal/65 mt-2">Our highest-rated items and latest collections.</p>

            {/* Filter tabs */}
            <div className="flex gap-2 mt-6 p-1 bg-brand-sand/60 rounded-full border border-brand-sand/80 flex-wrap justify-center">
              {(["all", "dresses", "tops & blouses", "accessories"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-xs font-semibold font-body rounded-full capitalize transition-all duration-200 ${activeTab === tab
                    ? "bg-brand-mauve text-white shadow-sm scale-105"
                    : "text-brand-charcoal/65 hover:text-brand-charcoal hover:bg-white/60"
                    }`}
                >
                  {tab === "tops & blouses" ? "Tops" : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, idx) => (
              <div key={product.id} data-reveal data-delay={String((idx % 4) * 100)} className="reveal flex">
                <ProductCard product={product} className="w-full h-full" />
              </div>
            ))}
          </div>

          <div data-reveal className="reveal flex justify-center mt-12">
            <Link href="/shop">
              <Button variant="secondary" size="lg" className="group flex items-center gap-2 hover:scale-105 transition-transform">
                View Full Catalog
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white border-b border-brand-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-mauve font-body">Seamless Experience</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-display font-medium text-brand-plum">How It Works</h2>
            <p className="text-sm font-body text-brand-charcoal/65 mt-2">
              Born as a Facebook boutique, we built this website to make shopping instant while keeping the personal touch our community loves.
            </p>
          </div>

          {/* Stepper container with progress bar */}
          <div className="relative max-w-5xl mx-auto">
            {/* Desktop progress bar connecting step nodes */}
            <div className="absolute top-[52px] left-[16.6%] right-[16.6%] h-[3px] bg-brand-sand/30 hidden md:block z-0 rounded-full">
              <div className="w-full h-full bg-brand-blush via-brand-mauve to-brand-plum rounded-full shadow-[0_0_12px_rgba(197,118,138,0.4)]" />
            </div>

            {/* Mobile progress bar connecting step nodes */}
            <div className="absolute top-[48px] bottom-[48px] left-1/2 w-[3px] -translate-x-1/2 bg-brand-sand/30 md:hidden z-0 rounded-full">
              <div className="w-full h-full bg-gradient-to-b from-brand-blush via-brand-mauve to-brand-plum rounded-full shadow-[0_0_12px_rgba(197,118,138,0.4)]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative z-10">
              {[
                {
                  n: "01",
                  title: "Choose & Add to Cart",
                  desc: "Browse our collections, select your perfect size & color, and add to cart in under 60 seconds.",
                  icon: (
                    <svg className="w-5 h-5 text-brand-plum shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )
                },
                {
                  n: "02",
                  title: "WhatsApp Confirmation",
                  desc: "We verify your details directly on WhatsApp to ensure correct sizing and address before shipping.",
                  icon: (
                    <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 2.17.76 4.19 2.04 5.79L3 22l4.41-1.35C8.89 21.41 10.4 21.8 12 21.8c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.75 14.25c-.24.68-1.2 1.25-1.9 1.34-.62.08-1.44.13-3.79-.84-3-1.23-4.9-4.27-5.05-4.47-.15-.2-1.22-1.63-1.22-3.11 0-1.48.77-2.2 1.04-2.5.24-.26.63-.37.98-.37h.54c.24 0 .49-.03.7.46.24.57.84 2.06.92 2.22.08.16.14.35.03.57-.11.22-.16.35-.33.54-.16.19-.35.43-.5.58-.16.19-.35.43-.5.58-.16.16-.33.34-.14.67.19.33.85 1.39 1.83 2.26.82.73 1.5 1.17 1.83 1.34.33.16.52.14.7-.08.19-.24.81-.95 1.03-1.27.22-.32.43-.27.73-.16.3.11 1.9.9 2.23 1.06.33.16.54.24.62.38.08.14.08.82-.16 1.5z" clipRule="evenodd" />
                    </svg>
                  )
                },
                {
                  n: "03",
                  title: "Cash on Delivery",
                  desc: "Pay in cash only when your order is safely delivered to your doorstep. Free delivery islandwide.",
                  icon: (
                    <svg className="w-5 h-5 text-brand-plum shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
              ].map((step, index) => {
                return (
                  <div
                    key={index}
                    className="relative flex flex-col items-center group"
                  >
                    {/* Card wrapper */}
                    <div className="w-full max-w-[320px] h-[320px] flex flex-col items-center text-center justify-center gap-4 p-6 md:p-8 bg-white rounded-3xl border border-brand-mauve shadow-lg transition-all duration-350 relative z-10 mx-auto hover:-translate-y-1.5">

                      {/* Number Badge Circle */}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-300 relative bg-gradient-to-br from-brand-mauve to-brand-plum text-brand-blush scale-110 shadow-[0_0_12px_rgba(125,53,80,0.4)]">
                        {step.n}
                        <div className="absolute -inset-1 rounded-full border-2 border-brand-mauve animate-ping opacity-75 pointer-events-none" />
                      </div>

                      {/* Content text */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 justify-center mb-1">
                          <span className="p-1.5 rounded-lg bg-brand-blush/20 text-brand-plum">
                            {step.icon}
                          </span>
                          <h3 className="font-display font-semibold text-lg md:text-xl text-brand-plum">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-xs md:text-sm font-body text-brand-charcoal/65 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Proof CTA */}
          <div className="flex flex-col items-center gap-4 mt-16">
            <p className="text-xs font-semibold text-brand-charcoal/50 font-body uppercase tracking-wider">
              Need assistance? We are active daily on Facebook
            </p>
            <a
              href="https://www.facebook.com/profile.php?id=100088880144524"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] hover:scale-105 px-6 py-3 rounded-xl transition-all duration-200 font-body shadow-md"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Visit Our Facebook Page
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-brand-mist">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-mauve font-body">Our Community</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-display font-medium text-brand-plum">Loved by Sri Lankan Women</h2>
            <p className="text-sm font-body text-brand-charcoal/65 mt-2">
              Don't just take our word for it — read reviews from our happy customers across the island.
            </p>
          </div>

          {/* Testimonial grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Background design blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blush/20 rounded-full blur-3xl pointer-events-none -z-10" />

            {REVIEWS.map((r, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-3xl shadow-sm border border-brand-sand/40 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm font-body text-brand-charcoal/80 italic leading-relaxed">
                    "{r.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-sand/35 flex justify-between items-center text-xs">
                  <strong className="font-body text-brand-plum font-semibold text-sm">
                    {r.name}
                  </strong>
                  <span className="font-body text-brand-charcoal/40 font-medium">
                    {r.location}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Join CTA Brand strip */}
          <div className="mt-16 max-w-4xl mx-auto bg-brand-plum text-white p-8 md:p-10 rounded-3xl shadow-xl hover:bg-brand-mauve transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-blush" />
                <h4 className="font-display text-white text-2xl font-medium leading-snug">
                  Join the Mona's Closet Family
                </h4>
              </div>
              <p className="text-sm font-body text-white/70 max-w-lg">
                Join thousands of fashion lovers across Sri Lanka who choose us for premium quality linen, dresses, and prompt islandwide COD.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-body font-semibold tracking-wider uppercase text-brand-blush whitespace-nowrap">
              <span>✓ Authentic</span>
              <span>·</span>
              <span>✓ Secure COD</span>
              <span>·</span>
              <span>✓ Weekly Drops</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER / CTA FOOTER BANNER ───────────────────────────────── */}
      <section className="bg-brand-plum text-white py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-mauve/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blush/15 border border-brand-blush/30 text-brand-blush text-xs font-semibold uppercase tracking-widest font-body">
            <Heart className="w-3.5 h-3.5" /> Stay Connected
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-white">Stay in Style, Every Week</h2>
          <p className="text-sm font-body text-white/65 max-w-md mx-auto leading-relaxed">
            Subscribe for weekly new arrivals, private sales, and exclusive style tips delivered straight to your inbox.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email" placeholder="Your email address" required
              className="flex-1 px-5 py-3 rounded-xl bg-white/10 text-white font-body text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-blush border border-white/15 transition-all hover:bg-white/15"
            />
            <Button variant="primary" type="submit" className="bg-brand-blush text-brand-plum hover:bg-white hover:text-brand-plum shrink-0 hover:scale-105 transition-all duration-200 font-bold">
              Subscribe
            </Button>
          </form>
          <p className="text-[11px] font-body text-white/40">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>

    </div>
  );
}
