// app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { 
  ShoppingBag, 
  Truck, 
  MessageSquare, 
  Award, 
  ArrowRight, 
  Heart,
  ChevronRight,
  Sparkles
} from "lucide-react";
import type { ProductCardData, Product } from "@/types";
import { getProducts } from "@/lib/db/products";
import { getCategories } from "@/lib/db/categories";

const REVIEWS = [
  {
    name: "Dilini R.",
    location: "Colombo",
    rating: 5,
    comment: "Absolutely love the fabric quality of the linen top! It fits perfectly and the delivery took only 2 days. Will order again!",
  },
  {
    name: "Senuri W.",
    location: "Kandy",
    rating: 5,
    comment: "Ordered a midi dress and it was identical to the picture. Super easy checkout and love the Cash on Delivery service.",
  },
  {
    name: "Maheshi F.",
    location: "Negombo",
    rating: 5,
    comment: "Finally a professional site for Mona's Closet! Buying is so much faster now than waiting on Messenger replies.",
  },
];

const DEFAULT_CATEGORIES = [
  { name: "Dresses", count: "Explore", image: "/images/floral-midi-dress.png", href: "/shop?category=dresses", color: "bg-[#F8F0F3]" },
  { name: "Tops & Blouses", count: "Explore", image: "/images/chic-linen-top.png", href: "/shop?category=tops-blouses", color: "bg-[#FAF7F4]" },
  { name: "Accessories", count: "Explore", image: "/images/straw-handbag.png", href: "/shop?category=accessories", color: "bg-[#EDE6DE]" }
];

// Hook: adds .visible to elements with data-reveal when they enter the viewport.
// Re-runs whenever deps change so dynamically-loaded content is also observed.
function useScrollReveal(deps: any[] = []) {
  useEffect(() => {
    // Small delay lets React flush the new DOM nodes after async data arrives
    const timer = setTimeout(() => {
      const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.visible)");
      if (!els.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              const delay = parseInt(el.dataset.delay || "0", 10);
              setTimeout(() => el.classList.add("visible"), delay);
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );

      els.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "dresses" | "tops & blouses" | "accessories">("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-observe whenever async data arrives so newly rendered cards are caught
  useScrollReveal([categories, products]);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodList, catList] = await Promise.all([
          getProducts({ limitCount: 8, publishedOnly: true }),
          getCategories()
        ]);
        setProducts(prodList);

        if (catList.length > 0) {
          const list = catList.slice(0, 3).map((c, idx) => ({
            name: c.name,
            count: "Explore",
            image: c.image || (idx === 0 ? "/images/floral-midi-dress.png" : idx === 1 ? "/images/chic-linen-top.png" : "/images/straw-handbag.png"),
            href: `/shop?category=${encodeURIComponent(c.name)}`,
            color: idx === 0 ? "bg-[#F8F0F3]" : idx === 1 ? "bg-[#FAF7F4]" : "bg-[#EDE6DE]"
          }));
          setCategories(list);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const rawFiltered = activeTab === "all"
    ? products
    : products.filter(p => p.category.toLowerCase().includes(activeTab.split(" ")[0]));

  const filteredProducts: ProductCardData[] = rawFiltered.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    discount: p.discount,
    image: p.images[0] || "/images/hero.png",
    category: p.category,
    inStock: p.variants.some(v => v.stock > 0)
  }));

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream text-brand-charcoal overflow-x-hidden">
      
      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center pt-8 pb-16 lg:py-24">
        {/* Background Decorative Blobs */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-brand-blush/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-brand-mauve/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Text content */}
            <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blush/30 text-brand-plum text-xs font-semibold tracking-wide uppercase font-body animate-fade-in-up">
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Season Arrivals</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-brand-plum leading-tight animate-fade-in-up delay-150">
                Styles That <br className="hidden sm:inline" />
                <span className="underline-blush">Feel As Good</span> <br />
                As They Look
              </h1>
              
              <p className="text-base sm:text-lg font-body text-brand-charcoal/80 max-w-xl leading-relaxed animate-fade-in-up delay-300">
                Discover curated, trendy women's apparel designed for the modern Sri Lankan lifestyle. High-quality dresses, casual tops, and accessories delivered directly to your doorstep.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up delay-400">
                <Link href="/shop" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 group">
                    Shop Collection
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/categories" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    View Categories
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-brand-sand w-full max-w-md animate-fade-in-up delay-500">
                <div>
                  <h3 className="text-2xl font-display font-bold text-brand-plum">100%</h3>
                  <p className="text-xs font-body text-brand-charcoal/60">Islandwide COD</p>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-brand-plum">5k+</h3>
                  <p className="text-xs font-body text-brand-charcoal/60">Happy Clients</p>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-brand-plum">New</h3>
                  <p className="text-xs font-body text-brand-charcoal/60">Weekly Drops</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="lg:col-span-6 relative flex justify-center animate-scale-in delay-200">
              <div className="relative w-full max-w-[480px] aspect-[4/5] rounded-t-[160px] rounded-b-card overflow-hidden shadow-2xl border-4 border-white bg-brand-sand group">
                <Image
                  src="/images/hero.png"
                  alt="Mona's Closet Hero Collection"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center img-zoom"
                />
                {/* Subtle shimmer overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
              
              {/* Floating decorative badge */}
              <div className="absolute -bottom-6 -left-6 bg-white shadow-xl rounded-card p-4 flex items-center gap-3 border border-brand-sand max-w-[200px] animate-bounce-slow">
                <div className="w-10 h-10 rounded-full bg-brand-blush flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 text-brand-plum" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-brand-charcoal/40 font-body">Fast Order</p>
                  <p className="text-xs font-bold text-brand-plum font-body">Instant WhatsApp Checkout</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── VALUE PROPOSITIONS ────────────────────────────────────────── */}
      <section className="bg-brand-mist border-y border-brand-sand py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {[
              { icon: <Truck className="w-6 h-6" />, title: "Islandwide Delivery", desc: "Cash on Delivery (COD) available all over Sri Lanka.", delay: "0" },
              { icon: <MessageSquare className="w-6 h-6" />, title: "WhatsApp Shopping", desc: "Prefer chatting? Click WhatsApp button to place order manually.", delay: "150" },
              { icon: <Award className="w-6 h-6" />, title: "Premium Quality", desc: "Every item is handpicked, quality checked, and true to size.", delay: "300" },
              { icon: <Heart className="w-6 h-6" />, title: "Centralized Checkout", desc: "No back-and-forth messages. Add to cart and buy in seconds.", delay: "450" },
            ].map((item, i) => (
              <div
                key={i}
                data-reveal
                data-delay={item.delay}
                className="reveal flex items-start gap-4 group"
              >
                <div className="p-3 rounded-full bg-brand-blush/40 text-brand-plum shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-blush/70">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-brand-plum">{item.title}</h4>
                  <p className="text-sm font-body text-brand-charcoal/70 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div
            data-reveal
            className="reveal flex flex-col md:flex-row md:items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-brand-plum">
                Shop By Category
              </h2>
              <p className="text-sm font-body text-brand-charcoal/60 mt-2">
                Browse our curated categories and find the style that fits you best.
              </p>
            </div>
            <Link href="/categories" className="inline-flex items-center gap-1 text-sm font-medium text-brand-mauve hover:text-brand-plum mt-4 md:mt-0 transition-colors font-body group">
              View All Categories <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, idx) => (
              <div
                key={category.name}
                data-reveal
                data-delay={String(idx * 150)}
                className="reveal"
              >
                <Link 
                  href={category.href}
                  className="group relative h-96 rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 flex flex-col justify-end p-6 block"
                >
                  {/* Background color */}
                  <div className={`absolute inset-0 ${category.color}`} />
                  
                  {/* Category Image with zoom */}
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center img-zoom opacity-85 group-hover:opacity-95 transition-opacity duration-500"
                  />

                  {/* Gradient overlay — deepens on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/85 via-brand-charcoal/30 to-transparent pointer-events-none transition-opacity duration-500 group-hover:from-brand-charcoal/90" />

                  {/* Subtle top-shine on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 text-white flex flex-col items-start gap-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                    <span className="text-xs uppercase tracking-widest text-brand-blush font-semibold font-body opacity-80 group-hover:opacity-100 transition-opacity">
                      {category.count}
                    </span>
                    <h3 className="text-2xl font-display font-medium leading-tight">
                      {category.name}
                    </h3>
                    <span className="mt-2 text-xs font-semibold uppercase inline-flex items-center gap-1 text-white border-b border-white/60 pb-0.5 group-hover:gap-2 group-hover:border-white transition-all duration-300 font-body">
                      Explore <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Corner accent dot */}
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-blush/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-0 group-hover:scale-100" />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-brand-mist border-y border-brand-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div data-reveal className="reveal flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-brand-plum">
              Best Sellers & New Arrivals
            </h2>
            <p className="text-sm font-body text-brand-charcoal/70 mt-2">
              Browse our highest-rated items and latest collections. Handpicked pieces just for you.
            </p>
            
            {/* Tabs / Filters */}
            <div className="flex gap-2 mt-6 p-1 bg-brand-sand/55 rounded-full border border-brand-sand">
              {(["all", "dresses", "tops & blouses", "accessories"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-xs font-medium font-body rounded-full capitalize transition-all duration-200 ${
                    activeTab === tab 
                      ? "bg-brand-mauve text-white shadow-sm scale-105" 
                      : "text-brand-charcoal/70 hover:text-brand-charcoal hover:bg-white/50"
                  }`}
                >
                  {tab === "tops & blouses" ? "Tops" : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                data-reveal
                data-delay={String((idx % 4) * 100)}
                className="reveal"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div data-reveal className="reveal flex justify-center mt-12">
            <Link href="/shop">
              <Button variant="secondary" size="lg" className="group">
                View Entire Catalog
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ── HOW WE DELIVER TRUST ────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Text description */}
            <div data-reveal className="reveal-left lg:col-span-5 space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-medium text-brand-plum leading-tight">
                We Make Social Shopping Simple and Secure
              </h2>
              <p className="text-base font-body text-brand-charcoal/80 leading-relaxed">
                Mona's Closet started as a popular Facebook boutique. We built this website to make shopping faster and more reliable, while keeping the personal touch you love. 
              </p>
              
              <ul className="space-y-4">
                {[
                  { title: "Select Size & Checkout", desc: "Pick your size and fill in details. Takes under 1 minute." },
                  { title: "Order Confirmation via WhatsApp", desc: "We send an instant WhatsApp text to confirm the delivery date." },
                  { title: "Cash on Delivery (COD)", desc: "Only pay when you hold the product in your hands. No risk!" },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 group">
                    <span className="w-6 h-6 rounded-full bg-brand-blush/60 text-brand-plum flex items-center justify-center shrink-0 font-bold text-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-blush">✓</span>
                    <div>
                      <strong className="font-display text-brand-plum font-semibold block">{item.title}</strong>
                      <span className="text-sm font-body text-brand-charcoal/70">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="pt-2">
                <a 
                  href="https://www.facebook.com/profile.php?id=100088880144524" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-white bg-[#1877F2] hover:bg-[#166FE5] hover:scale-105 px-6 py-3 rounded-card transition-all duration-200 font-body shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Visit Facebook Page
                </a>
              </div>
            </div>

            {/* Testimonials/Reviews Grid */}
            <div data-reveal className="reveal-right lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-blush/35 rounded-full blur-3xl pointer-events-none -z-10" />
              
              <div className="space-y-6">
                {REVIEWS.slice(0, 2).map((review, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-card shadow-card border border-brand-sand/50 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                      {"★".repeat(review.rating)}
                    </div>
                    <p className="text-sm font-body text-brand-charcoal/80 italic leading-relaxed">
                      "{review.comment}"
                    </p>
                    <div className="mt-4 pt-3 border-t border-brand-sand/40 flex justify-between items-center text-xs">
                      <strong className="font-body text-brand-plum font-semibold">{review.name}</strong>
                      <span className="font-body text-brand-charcoal/40">{review.location}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 md:translate-y-6">
                {REVIEWS.slice(2, 3).map((review, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-card shadow-card border border-brand-sand/50 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                      {"★".repeat(review.rating)}
                    </div>
                    <p className="text-sm font-body text-brand-charcoal/80 italic leading-relaxed">
                      "{review.comment}"
                    </p>
                    <div className="mt-4 pt-3 border-t border-brand-sand/40 flex justify-between items-center text-xs">
                      <strong className="font-body text-brand-plum font-semibold">{review.name}</strong>
                      <span className="font-body text-brand-charcoal/40">{review.location}</span>
                    </div>
                  </div>
                ))}

                {/* Trust badge card */}
                <div className="bg-brand-plum text-white p-6 rounded-card shadow-card flex flex-col justify-between h-48 hover:bg-brand-mauve transition-colors duration-300">
                  <h4 className="font-display text-xl font-medium leading-snug">
                    Join thousands of fashion lovers in Sri Lanka
                  </h4>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>Authentic Designs</span>
                    <span>100% Secure Shopping</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── NEWSLETTER / FOOTER BANNER ────────────────────────────────── */}
      <section className="bg-brand-plum text-white py-16 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full pointer-events-none" />
        
        <div data-reveal className="reveal max-w-3xl mx-auto px-4 relative z-10 space-y-6">
          <h2 className="text-3xl md:text-4xl font-display font-medium">
            Stay in Style
          </h2>
          <p className="text-sm font-body text-white/70 max-w-md mx-auto leading-relaxed">
            Subscribe to our newsletter to receive updates on weekly new arrivals, private sales, and special offers.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              required
              className="flex-1 px-5 py-3 rounded-pill bg-white/10 text-white font-body text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-blush border border-white/10 transition-all hover:bg-white/15"
            />
            <Button variant="primary" type="submit" className="bg-brand-blush text-brand-plum hover:bg-white hover:text-brand-plum shrink-0 transition-all duration-200 hover:scale-105">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

    </div>
  );
}
