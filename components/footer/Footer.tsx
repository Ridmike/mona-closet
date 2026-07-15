// components/footer/Footer.tsx
"use client";

import Link from "next/link";
import { 
  Mail, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ChevronRight, 
  CreditCard,
  Truck,
  ShieldCheck,
  Heart
} from "lucide-react";

const QUICK_LINKS = [
  { label: "All Products",    href: "/shop" },
  { label: "New Arrivals",    href: "/shop?filter=new" },
  { label: "Promotions & Sale",href: "/shop?filter=sale" },
  { label: "Frequently Asked", href: "/faq" },
  { label: "Contact Us",       href: "/contact" },
];

const CATEGORIES_LINKS = [
  { label: "Dresses",        href: "/shop?category=Dresses" },
  { label: "Tops & Blouses", href: "/shop?category=Tops" },
  { label: "Accessories",    href: "/shop?category=Accessories" },
  { label: "Denim & Skirts",  href: "/shop?category=Skirts" },
];

const LEGAL_LINKS = [
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Privacy Policy",  href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-[#2B0E1A] text-white/80 font-body relative overflow-hidden border-t-2 border-[#1E0711]">
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-mauve/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-blush/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Links Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        
        {/* Layout Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8 border-b border-white/10 pb-16">
          
          {/* Column 1: About Us / Branding */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block group">
              <span className="font-display text-2xl font-semibold tracking-wide text-brand-blush group-hover:text-white transition-colors duration-300">
                Mona's Closet
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed font-body max-w-xs pt-2">
              Trendy, premium women's fashion curated directly for you. We deliver modern, elegant designs across Sri Lanka, ensuring you look and feel your absolute best.
            </p>
            {/* Quick trust metrics */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs text-brand-blush/80">
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span>Fast Islandwide COD</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-blush/80">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>100% Quality Guaranteed</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white font-display border-b border-white/10 pb-2 max-w-[120px]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href} className="group">
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 hover:text-brand-blush flex items-center gap-1 transition-all duration-200 group-hover:translate-x-1"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white font-display border-b border-white/10 pb-2 max-w-[120px]">
              Categories
            </h3>
            <ul className="space-y-3">
              {CATEGORIES_LINKS.map((link) => (
                <li key={link.href} className="group">
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 hover:text-brand-blush flex items-center gap-1 transition-all duration-200 group-hover:translate-x-1"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white font-display border-b border-white/10 pb-2 max-w-[120px]">
              Contact Info
            </h3>
            <ul className="space-y-3.5 text-sm text-white/65">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-blush shrink-0 mt-0.5" />
                <span>Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 text-brand-blush shrink-0 mt-0.5" />
                <a 
                  href="https://wa.me/94770000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-brand-blush underline decoration-white/20 hover:decoration-brand-blush transition-colors"
                >
                  WhatsApp Support
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-blush shrink-0 mt-0.5" />
                <a 
                  href="mailto:hello@monascloset.lk"
                  className="hover:text-brand-blush underline decoration-white/20 hover:decoration-brand-blush transition-colors break-all"
                >
                  hello@monascloset.lk
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Social Media & Payments */}
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white font-display border-b border-white/10 pb-2 max-w-[120px]">
                Follow Us
              </h3>
              <p className="text-xs text-white/50 leading-relaxed font-body">
                Connect with us on social media for daily outfits inspiration and drops alerts.
              </p>
              {/* Social links */}
              <div className="flex gap-2.5 pt-1">
                <a
                  href="https://www.facebook.com/profile.php?id=100088880144524"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Profile"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/15 hover:border-brand-blush flex items-center justify-center text-white hover:text-brand-plum hover:bg-brand-blush transition-all duration-350 hover:-translate-y-0.5"
                >
                  <FacebookIcon />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/15 hover:border-brand-blush flex items-center justify-center text-white hover:text-brand-plum hover:bg-brand-blush transition-all duration-350 hover:-translate-y-0.5"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok Profile"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/15 hover:border-brand-blush flex items-center justify-center text-white hover:text-brand-plum hover:bg-brand-blush transition-all duration-350 hover:-translate-y-0.5"
                >
                  <TikTokIcon />
                </a>
              </div>
            </div>

            {/* Payment security info */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 w-full">
                <CreditCard className="w-4 h-4 text-brand-blush shrink-0" />
                <span className="text-[10px] text-white/70 leading-snug font-medium font-body">
                  Cards & Cash on Delivery Accepted
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright / legal bar */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/45">
          <p className="font-body text-center md:text-left">
            © {new Date().getFullYear()} Mona's Closet. All rights reserved. Crafted with <Heart className="w-3 h-3 text-brand-blush fill-current inline-block mx-0.5" /> in Sri Lanka.
          </p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="hover:text-brand-blush transition-colors hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}

// ── Social Icons (Visual SVGs) ──────────────────────────────────────────────────

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.54V6.78a4.85 4.85 0 0 1-1.02-.09z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
