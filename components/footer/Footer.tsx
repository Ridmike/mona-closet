// components/footer/Footer.tsx
import Link from "next/link";

const SHOP_LINKS = [
  { label: "All Products",    href: "/shop" },
  { label: "New Arrivals",    href: "/shop?filter=new" },
  { label: "Sale",            href: "/shop?filter=sale" },
  { label: "Dresses",        href: "/categories/dresses" },
  { label: "Tops & T-Shirts", href: "/categories/tops" },
  { label: "Accessories",    href: "/categories/accessories" },
];

const INFO_LINKS = [
  { label: "About Us",        href: "/about" },
  { label: "Contact",         href: "/contact" },
  { label: "FAQ",             href: "/faq" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Privacy Policy",  href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-brand-plum text-white/80 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <p className="font-display text-2xl text-white mb-3 tracking-wide">
              Mona's Closet
            </p>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">
              Trendy women's fashion delivered to your door across Sri Lanka.
              Discover styles that feel as good as they look.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.facebook.com/profile.php?id=100088880144524"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mona's Closet on Facebook"
                className="p-2 rounded-full bg-white/10 hover:bg-brand-mauve transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mona's Closet on TikTok"
                className="p-2 rounded-full bg-white/10 hover:bg-brand-mauve transition-colors"
              >
                <TikTokIcon />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mona's Closet on Instagram"
                className="p-2 rounded-full bg-white/10 hover:bg-brand-mauve transition-colors"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">
              Information
            </h3>
            <ul className="space-y-2.5">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">📍</span>
                <span>Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">💬</span>
                <a href="https://wa.me/94XXXXXXXXX" className="hover:text-white transition-colors">
                  WhatsApp us
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">✉️</span>
                <a href="mailto:hello@monascloset.lk" className="hover:text-white transition-colors">
                  hello@monascloset.lk
                </a>
              </li>
            </ul>

            {/* COD badge */}
            <div className="mt-5 inline-flex items-center gap-2 bg-white/10 rounded-card px-3 py-2">
              <span className="text-brand-blush text-base">💳</span>
              <span className="text-xs text-white/80">Cash on Delivery available</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Mona's Closet. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Social Icons ──────────────────────────────────────────────────────────────

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
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
