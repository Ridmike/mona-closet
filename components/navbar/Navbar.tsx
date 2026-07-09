// components/navbar/Navbar.tsx
"use client";

import Link              from "next/link";
import { useState }      from "react";
import { usePathname, useRouter }   from "next/navigation";
import { cn }            from "@/lib/utils";
import { Button }        from "@/components/ui/Button";
import { useCartStore }     from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

const NAV_LINKS = [
  { label: "Home",       href: "/" },
  { label: "Shop",       href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "About",      href: "/about" },
  { label: "Contact",    href: "/contact" },
];

export function Navbar() {
  const pathname     = usePathname();
  const router       = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cartItems    = useCartStore((state) => state.items);
  const cartCount    = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistIds  = useWishlistStore(state => state.productIds);
  const wishlistCount = wishlistIds.length;

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur-md border-b border-brand-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="shrink-0 group">
              <span className="font-display text-2xl text-brand-plum tracking-wide group-hover:text-brand-mauve transition-colors">
                Mona's Closet
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {NAV_LINKS.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-body font-medium transition-colors duration-200",
                      isActive
                        ? "text-brand-mauve"
                        : "text-brand-charcoal hover:text-brand-mauve"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2 text-brand-charcoal hover:text-brand-mauve transition-colors rounded-full hover:bg-brand-mist"
              >
                <SearchIcon />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label={`Wishlist – ${wishlistCount} items`}
                className="relative hidden sm:flex p-2 text-brand-charcoal hover:text-brand-mauve transition-colors rounded-full hover:bg-brand-mist"
              >
                <HeartIcon filled={wishlistCount > 0} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center bg-brand-mauve text-white text-[10px] font-bold rounded-full px-1">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                href="/account"
                aria-label="My account"
                className="hidden sm:flex p-2 text-brand-charcoal hover:text-brand-mauve transition-colors rounded-full hover:bg-brand-mist"
              >
                <UserIcon />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                aria-label={`Cart – ${cartCount} items`}
                className="relative p-2 text-brand-charcoal hover:text-brand-mauve transition-colors rounded-full hover:bg-brand-mist"
              >
                <BagIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center bg-brand-mauve text-white text-[10px] font-bold rounded-full px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="md:hidden p-2 text-brand-charcoal hover:text-brand-mauve transition-colors rounded-full hover:bg-brand-mist"
              >
                {menuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-brand-ease",
            menuOpen ? "max-h-72 border-t border-brand-sand" : "max-h-0"
          )}
        >
          <nav className="px-4 py-4 flex flex-col gap-1 bg-brand-cream" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-card text-sm font-body font-medium transition-colors",
                    isActive
                      ? "bg-brand-mist text-brand-mauve"
                      : "text-brand-charcoal hover:bg-brand-mist hover:text-brand-mauve"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/wishlist"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-card text-sm font-body font-medium text-brand-charcoal hover:bg-brand-mist hover:text-brand-mauve transition-colors flex items-center justify-between"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-brand-mauve text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-card text-sm font-body font-medium text-brand-charcoal hover:bg-brand-mist hover:text-brand-mauve transition-colors"
            >
              My Account
            </Link>
          </nav>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <SearchOverlay onClose={() => setSearchOpen(false)} />
      )}
    </>
  );
}

// ── Search Overlay ────────────────────────────────────────────────────────────

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex flex-col"
      role="dialog"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-brand-cream shadow-modal px-4 py-6 max-w-2xl mx-auto w-full mt-16 rounded-card">
        <label htmlFor="site-search" className="sr-only">Search products</label>
        <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b-2 border-brand-blush pb-2">
          <SearchIcon className="text-brand-mauve shrink-0" />
          <input
            id="site-search"
            type="search"
            placeholder="Search dresses, tops, accessories…"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-brand-charcoal font-body text-base outline-none placeholder:text-brand-charcoal/40"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="text-brand-charcoal/60 hover:text-brand-charcoal">
            <CloseIcon />
          </button>
        </form>
        <p className="mt-3 text-xs text-brand-charcoal/50 font-body">
          Press Enter to search or Esc to close
        </p>
      </div>
    </div>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("w-5 h-5", className)} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
