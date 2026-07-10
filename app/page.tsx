// app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBag, Truck, MessageSquare, Award, ArrowRight,
  Heart, ChevronRight, Sparkles, Star, X, Tag, Zap
} from "lucide-react";
import type { ProductCardData, Product } from "@/types";
import { getProducts } from "@/lib/db/products";
import { getCategories } from "@/lib/db/categories";

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
  { name: "Senuri W.", location: "Kandy",   rating: 5, comment: "Ordered a midi dress and it was identical to the picture. Super easy checkout and love the COD service." },
  { name: "Maheshi F.", location: "Negombo", rating: 5, comment: "Finally a professional site for Mona's Closet! Buying is so much faster now than waiting on Messenger replies." },
];

const DEFAULT_CATEGORIES = [
  { name: "Dresses",       count: "Explore", image: "/images/floral-midi-dress.png", hoverImage: "/images/pastel-wrap-dress.png", href: "/shop?category=dresses",      color: "bg-[#F8F0F3]", accent: "from-rose-900/80" },
  { name: "Tops & Blouses", count: "Explore", image: "/images/chic-linen-top.png",   hoverImage: "/images/hero.png",             href: "/shop?category=tops-blouses", color: "bg-[#FAF7F4]", accent: "from-neutral-900/80" },
  { name: "Accessories",   count: "Explore", image: "/images/straw-handbag.png",     hoverImage: "/images/floral-midi-dress.png", href: "/shop?category=accessories",  color: "bg-[#EDE6DE]", accent: "from-amber-900/80" },
];

const FEATURES = [
  { icon: <Truck className="w-5 h-5" />,        title: "Islandwide COD",     desc: "Cash on Delivery available all over Sri Lanka" },
  { icon: <MessageSquare className="w-5 h-5" />, title: "WhatsApp Orders",    desc: "Place orders instantly via WhatsApp chat" },
  { icon: <Award className="w-5 h-5" />,         title: "Premium Quality",    desc: "Handpicked, quality-checked pieces only" },
  { icon: <Heart className="w-5 h-5" />,         title: "Easy Checkout",      desc: "Add to cart and buy in under 60 seconds" },
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
export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "dresses" | "tops & blouses" | "accessories">("all");
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [bannerVisible, setBannerVisible] = useState(true);

  useScrollReveal([categories, products]);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList] = await Promise.all([
          getProducts({ limitCount: 8, publishedOnly: true }),
          getCategories(),
        ]);
        setProducts(prodList);
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

      {/* ── PROMO TICKER BAR ──────────────────────────────────────────────── */}
      {bannerVisible && (
        <div className="relative bg-gradient-to-r from-brand-plum via-brand-mauve to-brand-plum text-white overflow-hidden py-2.5">
          <div className="overflow-hidden">
            <div className="animate-marquee gap-12 items-center">
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
          className="object-cover object-center scale-105 transition-transform duration-[12s] ease-out hover:scale-100"
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
                { val: "5k+",  label: "Happy Shoppers" },
                { val: "100%", label: "COD Islandwide" },
                { val: "50%",  label: "Off Sale Items" },
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
                    <h3 className="text-2xl font-display font-medium drop-shadow-sm">{category.name}</h3>
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
            <h2 className="text-3xl md:text-4xl font-display font-medium">
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
                  className={`px-5 py-2 text-xs font-semibold font-body rounded-full capitalize transition-all duration-200 ${
                    activeTab === tab
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
              <div key={product.id} data-reveal data-delay={String((idx % 4) * 100)} className="reveal">
                <ProductCard product={product} />
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

      {/* ── LIFESTYLE / BRAND STRIP ───────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: How it works */}
            <div data-reveal className="reveal-left lg:col-span-5 space-y-7">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-mauve font-body">How It Works</span>
                <h2 className="mt-2 text-3xl md:text-4xl font-display font-medium text-brand-plum leading-tight">
                  Social Shopping, Now Faster & More Reliable
                </h2>
                <p className="mt-3 text-base font-body text-brand-charcoal/75 leading-relaxed">
                  Born as a Facebook boutique, we built this website to make shopping instant — while keeping the personal touch our community loves.
                </p>
              </div>
              <ul className="space-y-5">
                {[
                  { n: "01", title: "Choose & Add to Cart",          desc: "Pick size, colour, and add to cart in seconds." },
                  { n: "02", title: "WhatsApp Confirmation",         desc: "We confirm your order instantly on WhatsApp." },
                  { n: "03", title: "Cash on Delivery",              desc: "Pay only when your parcel is in your hands." },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 group">
                    <span className="w-9 h-9 rounded-xl bg-brand-blush/30 text-brand-plum flex items-center justify-center shrink-0 font-bold text-sm font-body group-hover:bg-brand-blush group-hover:scale-110 transition-all duration-300">
                      {step.n}
                    </span>
                    <div>
                      <strong className="font-display text-brand-plum font-semibold text-base block">{step.title}</strong>
                      <span className="text-sm font-body text-brand-charcoal/65">{step.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href="https://www.facebook.com/profile.php?id=100088880144524"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] hover:scale-105 px-6 py-3 rounded-xl transition-all duration-200 font-body shadow-md"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Visit Facebook Page
              </a>
            </div>

            {/* Right: Reviews */}
            <div data-reveal className="reveal-right lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-blush/25 rounded-full blur-3xl pointer-events-none -z-10" />

              <div className="space-y-5">
                {REVIEWS.slice(0, 2).map((r, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl shadow-md border border-brand-sand/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-amber-400 text-sm mb-2">{"★".repeat(r.rating)}</div>
                    <p className="text-sm font-body text-brand-charcoal/80 italic leading-relaxed">"{r.comment}"</p>
                    <div className="mt-4 pt-3 border-t border-brand-sand/30 flex justify-between items-center text-xs">
                      <strong className="font-body text-brand-plum font-semibold">{r.name}</strong>
                      <span className="font-body text-brand-charcoal/40">{r.location}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-5 md:mt-8">
                {REVIEWS.slice(2).map((r, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl shadow-md border border-brand-sand/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-amber-400 text-sm mb-2">{"★".repeat(r.rating)}</div>
                    <p className="text-sm font-body text-brand-charcoal/80 italic leading-relaxed">"{r.comment}"</p>
                    <div className="mt-4 pt-3 border-t border-brand-sand/30 flex justify-between items-center text-xs">
                      <strong className="font-body text-brand-plum font-semibold">{r.name}</strong>
                      <span className="font-body text-brand-charcoal/40">{r.location}</span>
                    </div>
                  </div>
                ))}
                {/* Brand card */}
                <div className="bg-brand-plum text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between h-44 hover:bg-brand-mauve transition-colors duration-300 group">
                  <Sparkles className="w-6 h-6 text-brand-blush" />
                  <div>
                    <h4 className="font-display text-xl font-medium leading-snug">Join thousands of fashion lovers across Sri Lanka</h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-white/60 font-body">
                      <span>✓ Authentic</span>
                      <span>·</span>
                      <span>✓ Secure COD</span>
                      <span>·</span>
                      <span>✓ Weekly Drops</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER / CTA FOOTER BANNER ───────────────────────────────── */}
      <section className="bg-brand-plum text-white py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-mauve/40 rounded-full blur-3xl pointer-events-none" />

        <div data-reveal className="reveal relative z-10 max-w-2xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blush/15 border border-brand-blush/30 text-brand-blush text-xs font-semibold uppercase tracking-widest font-body">
            <Heart className="w-3.5 h-3.5" /> Stay Connected
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-medium">Stay in Style, Every Week</h2>
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
