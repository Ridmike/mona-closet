// ─────────────────────────────────────────────────────────────────────────────
// Mona's Closet – Shared TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Product ──────────────────────────────────────────────────────────────────

export type ProductSize  = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "Free Size";
export type ProductColor = { name: string; hex: string };

export interface ProductVariant {
  id: string;
  size:  ProductSize;
  color: ProductColor;
  stock: number;
  sku:   string;
}

export interface Product {
  id:          string;
  name:        string;
  slug:        string;
  description: string;
  price:       number;          // LKR
  discount?:   number;          // percentage 0-100
  images:      string[];        // Storage URLs
  category:    string;
  brand?:      string;
  material?:   string;
  variants:    ProductVariant[];
  featured:    boolean;
  published:   boolean;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface ProductCardData {
  id:       string;
  name:     string;
  slug:     string;
  price:    number;
  discount?: number;
  image:    string;
  category: string;
  inStock:  boolean;
}

// ── Category ──────────────────────────────────────────────────────────────────

export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  description?: string;
  image?:      string;
  parent?:     string;          // parent category id
  order:       number;
}

// ── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId:   string;
  variantId:   string;
  name:        string;
  image:       string;
  price:       number;
  discount?:   number;
  size:        ProductSize;
  color:       ProductColor;
  quantity:    number;
}

export interface Cart {
  items:       CartItem[];
  couponCode?: string;
  discount:    number;          // flat LKR discount from coupon
}

// ── Order ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "cod" | "card" | "bank_transfer";

export interface ShippingAddress {
  fullName:  string;
  phone:     string;
  line1:     string;
  line2?:    string;
  city:      string;
  district:  string;
  postalCode?: string;
}

export interface Order {
  id:             string;
  orderNumber:    string;
  customerId:     string;
  customerEmail:  string;
  items:          CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod:  PaymentMethod;
  subtotal:       number;
  shippingFee:    number;
  discount:       number;
  total:          number;
  status:         OrderStatus;
  notes?:         string;
  createdAt:      Date;
  updatedAt:      Date;
}

// ── Customer / User ────────────────────────────────────────────────────────────

export interface CustomerProfile {
  uid:            string;
  email:          string;
  displayName?:   string;
  phone?:         string;
  addresses:      ShippingAddress[];
  defaultAddress?: number;
  createdAt:      Date;
}

// ── Promotions ────────────────────────────────────────────────────────────────

export type DiscountType = "percentage" | "flat";

export interface Coupon {
  id:           string;
  code:         string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  usageLimit?:  number;
  usedCount:    number;
  expiresAt?:   Date;
  active:       boolean;
}

// ── UI Helpers ────────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ToastMessage {
  id:      string;
  type:    "success" | "error" | "info" | "warning";
  message: string;
}
