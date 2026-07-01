// lib/utils.ts

/**
 * Format a number as Sri Lankan Rupees.
 * e.g. 3500 → "Rs. 3,500"
 */
export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-LK")}`;
}

/**
 * Calculate discounted price.
 * Returns the final price after applying a percentage discount.
 */
export function discountedPrice(price: number, discount?: number): number {
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100));
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Truncate a string to a max length, appending "…" if needed.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

/**
 * Join class names, filtering out falsy values.
 * Lightweight replacement for `clsx` / `classnames`.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Generate a unique order number.
 * Format: MC-YYYYMMDD-XXXX (e.g. MC-20240615-4729)
 */
export function generateOrderNumber(): string {
  const date   = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MC-${date}-${random}`;
}

/**
 * Convert a Firebase Timestamp or Date to a readable string.
 * e.g. "15 Jun 2024"
 */
export function formatDate(date: Date | { toDate: () => Date }): string {
  const d = date instanceof Date ? date : date.toDate();
  return d.toLocaleDateString("en-LK", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

/**
 * Validate a Sri Lankan mobile number (07XXXXXXXX).
 */
export function isValidSLPhone(phone: string): boolean {
  return /^07[0-9]{8}$/.test(phone.replace(/\s/g, ""));
}

/**
 * Calculate the cart subtotal from cart items.
 */
export function cartSubtotal(
  items: { price: number; discount?: number; quantity: number }[]
): number {
  return items.reduce((sum, item) => {
    const unitPrice = discountedPrice(item.price, item.discount);
    return sum + unitPrice * item.quantity;
  }, 0);
}

/**
 * Compute shipping fee (free above threshold).
 * Mona's Closet: free shipping above Rs. 5,000; else Rs. 350.
 */
export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE            = 350;

export function computeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
