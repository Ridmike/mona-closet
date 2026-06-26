import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Load .env file manually
try {
  const envPath = resolve(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;
    const key = trimmed.substring(0, separatorIndex).trim();
    const value = trimmed.substring(separatorIndex + 1).trim();
    process.env[key] = value;
  });
  console.log("Loaded .env variables successfully.");
} catch (error) {
  console.error("Error reading .env file:", error);
}

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const MOCK_CATEGORIES = [
  { id: "cat_1", name: "Dresses", slug: "dresses", description: "Elegant dresses for all occasions", order: 1 },
  { id: "cat_2", name: "Tops & Blouses", slug: "tops-blouses", description: "Casual and formal tops", order: 2 },
  { id: "cat_3", name: "Accessories", slug: "accessories", description: "Bags, jewelry, and more", order: 3 },
  { id: "cat_4", name: "Skirts", slug: "skirts", description: "Trendy and classic skirts", order: 4 },
];

const MOCK_PRODUCTS = [
  {
    id: "prod_1",
    name: "Floral Pastel Midi Dress",
    slug: "floral-pastel-midi-dress",
    description: "A beautiful floral midi dress featuring lightweight pastel linen fabric, a flattering wrap design, and delicate short sleeves. Perfect for daytime gatherings and sunny walks.",
    price: 4200,
    discount: 15,
    images: ["/images/floral-midi-dress.png"],
    category: "Dresses",
    brand: "Mona's Collection",
    material: "Linen Blend",
    featured: true,
    published: true,
    variants: [
      { id: "v_1_s_pink", size: "S", color: { name: "Pastel Pink", hex: "#F8F0F3" }, stock: 12, sku: "MC-DRES-FLOR-S-PNK" },
      { id: "v_1_m_pink", size: "M", color: { name: "Pastel Pink", hex: "#F8F0F3" }, stock: 8, sku: "MC-DRES-FLOR-M-PNK" },
      { id: "v_1_l_pink", size: "L", color: { name: "Pastel Pink", hex: "#F8F0F3" }, stock: 0, sku: "MC-DRES-FLOR-L-PNK" } // out of stock
    ]
  },
  {
    id: "prod_2",
    name: "Chic Cream Linen Top",
    slug: "chic-cream-linen-top",
    description: "Breathable and refined linen top in cream white. Classic neckline with shell button detailing and relaxed fit.",
    price: 2900,
    discount: 0,
    images: ["/images/chic-linen-top.png"],
    category: "Tops & Blouses",
    brand: "Mona's Collection",
    material: "100% Linen",
    featured: true,
    published: true,
    variants: [
      { id: "v_2_s_cream", size: "S", color: { name: "Cream", hex: "#FAF7F4" }, stock: 2, sku: "MC-TOPS-CHIC-S-CRM" }, // low stock
      { id: "v_2_m_cream", size: "M", color: { name: "Cream", hex: "#FAF7F4" }, stock: 15, sku: "MC-TOPS-CHIC-M-CRM" },
      { id: "v_2_l_cream", size: "L", color: { name: "Cream", hex: "#FAF7F4" }, stock: 20, sku: "MC-TOPS-CHIC-L-CRM" }
    ]
  },
  {
    id: "prod_3",
    name: "Elegant Woven Straw Handbag",
    slug: "elegant-woven-straw-handbag",
    description: "Handcrafted woven straw handbag featuring durable top handles and a roomy canvas-lined interior. Adds a touch of summer chic to any outfit.",
    price: 3500,
    discount: 10,
    images: ["/images/straw-handbag.png"],
    category: "Accessories",
    brand: "Artisanal Mona",
    material: "Straw & Canvas",
    featured: true,
    published: true,
    variants: [
      { id: "v_3_free_straw", size: "Free Size", color: { name: "Straw", hex: "#EDE6DE" }, stock: 25, sku: "MC-ACCS-BAG-FREE-STR" }
    ]
  },
  {
    id: "prod_4",
    name: "Pastel Blush Wrap Dress",
    slug: "pastel-blush-wrap-dress",
    description: "A soft wrap dress made of premium georgette fabric. Beautiful drape, long self-tie belt, and gorgeous pastel blush hue.",
    price: 4800,
    discount: 20,
    images: ["/images/pastel-wrap-dress.png"],
    category: "Dresses",
    brand: "Mona's Collection",
    material: "Georgette",
    featured: false,
    published: true,
    variants: [
      { id: "v_4_s_blush", size: "S", color: { name: "Blush Pink", hex: "#E8D3D8" }, stock: 0, sku: "MC-DRES-WRAP-S-BLSH" }, // sold out
      { id: "v_4_m_blush", size: "M", color: { name: "Blush Pink", hex: "#E8D3D8" }, stock: 0, sku: "MC-DRES-WRAP-M-BLSH" }  // sold out
    ]
  },
  {
    id: "prod_5",
    name: "Pleated Sage Midi Skirt",
    slug: "pleated-sage-midi-skirt",
    description: "Sophisticated pleated midi skirt in beautiful sage green. High-waisted elastic band with fluid micro-pleats.",
    price: 3200,
    discount: 5,
    images: [],
    category: "Skirts",
    brand: "Mona's Collection",
    material: "Polyester Satin",
    featured: false,
    published: true,
    variants: [
      { id: "v_5_m_sage", size: "M", color: { name: "Sage Green", hex: "#C7D0C1" }, stock: 14, sku: "MC-SKRT-PLEAT-M-SGE" },
      { id: "v_5_l_sage", size: "L", color: { name: "Sage Green", hex: "#C7D0C1" }, stock: 10, sku: "MC-SKRT-PLEAT-L-SGE" }
    ]
  }
];

const MOCK_CUSTOMERS = [
  {
    uid: "cust_1",
    email: "dilini@example.com",
    displayName: "Dilini Rajapaksa",
    phone: "0771112222",
    role: "Customer",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  },
  {
    uid: "cust_2",
    email: "senuri@example.com",
    displayName: "Senuri Wijetunge",
    phone: "0773334444",
    role: "Customer",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  },
  {
    uid: "cust_3",
    email: "fathima@example.com",
    displayName: "Fathima Shabnam",
    phone: "0775556666",
    role: "Customer",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    uid: "cust_4",
    email: "kamal@example.com",
    displayName: "Kamal Perera",
    phone: "0777778888",
    role: "Customer",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  }
];

const MOCK_ORDERS = [
  {
    id: "ord_1",
    orderNumber: "MC-20260624-9123",
    customerId: "cust_1",
    customerEmail: "dilini@example.com",
    items: [
      {
        productId: "prod_1",
        variantId: "v_1_s_pink",
        name: "Floral Pastel Midi Dress",
        image: "/images/floral-midi-dress.png",
        price: 4200,
        discount: 15,
        size: "S",
        color: { name: "Pastel Pink", hex: "#F8F0F3" },
        quantity: 1
      },
      {
        productId: "prod_2",
        variantId: "v_2_m_cream",
        name: "Chic Cream Linen Top",
        image: "/images/chic-linen-top.png",
        price: 2900,
        discount: 0,
        size: "M",
        color: { name: "Cream", hex: "#FAF7F4" },
        quantity: 2
      }
    ],
    shippingAddress: {
      fullName: "Dilini Rajapaksa",
      phone: "0771112222",
      line1: "123 Galle Road",
      line2: "Apt 4B",
      city: "Colombo 03",
      district: "Colombo",
      postalCode: "00300"
    },
    paymentMethod: "card",
    subtotal: 9370, // 3570 (4200 - 15%) + 5800 (2900 * 2)
    shippingFee: 0,
    discount: 0,
    total: 9370,
    status: "delivered",
    notes: "Leave with security guard",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: "ord_2",
    orderNumber: "MC-20260625-1049",
    customerId: "cust_2",
    customerEmail: "senuri@example.com",
    items: [
      {
        productId: "prod_3",
        variantId: "v_3_free_straw",
        name: "Elegant Woven Straw Handbag",
        image: "/images/straw-handbag.png",
        price: 3500,
        discount: 10,
        size: "Free Size",
        color: { name: "Straw", hex: "#EDE6DE" },
        quantity: 1
      }
    ],
    shippingAddress: {
      fullName: "Senuri Wijetunge",
      phone: "0773334444",
      line1: "45 Peradeniya Road",
      city: "Kandy",
      district: "Kandy",
      postalCode: "20000"
    },
    paymentMethod: "cod",
    subtotal: 3150, // 3500 - 10%
    shippingFee: 350,
    discount: 0,
    total: 3500,
    status: "pending",
    notes: "Please call before delivery",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: "ord_3",
    orderNumber: "MC-20260626-8802",
    customerId: "cust_3",
    customerEmail: "fathima@example.com",
    items: [
      {
        productId: "prod_1",
        variantId: "v_1_m_pink",
        name: "Floral Pastel Midi Dress",
        image: "/images/floral-midi-dress.png",
        price: 4200,
        discount: 15,
        size: "M",
        color: { name: "Pastel Pink", hex: "#F8F0F3" },
        quantity: 1
      }
    ],
    shippingAddress: {
      fullName: "Fathima Shabnam",
      phone: "0775556666",
      line1: "88/2 Negombo Road",
      city: "Kurunegala",
      district: "Kurunegala",
      postalCode: "60000"
    },
    paymentMethod: "bank_transfer",
    subtotal: 3570,
    shippingFee: 350,
    discount: 500, // Coupon code discount
    total: 3420, // 3570 + 350 - 500
    status: "confirmed",
    notes: "Receipt emailed already",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
  },
  {
    id: "ord_4",
    orderNumber: "MC-20260626-4401",
    customerId: "cust_4",
    customerEmail: "kamal@example.com",
    items: [
      {
        productId: "prod_2",
        variantId: "v_2_m_cream",
        name: "Chic Cream Linen Top",
        image: "/images/chic-linen-top.png",
        price: 2900,
        discount: 0,
        size: "M",
        color: { name: "Cream", hex: "#FAF7F4" },
        quantity: 1
      }
    ],
    shippingAddress: {
      fullName: "Kamal Perera",
      phone: "0777778888",
      line1: "12 Beach Road",
      city: "Negombo",
      district: "Gampaha",
      postalCode: "11500"
    },
    paymentMethod: "cod",
    subtotal: 2900,
    shippingFee: 350,
    discount: 0,
    total: 3250,
    status: "processing",
    notes: "",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  }
];

async function seedData() {
  console.log("Authenticating as admin...");
  try {
    await signInWithEmailAndPassword(auth, "admin@monascloset.lk", "MonaAdmin2026!");
    console.log("Authenticated successfully.");
  } catch (authError) {
    console.error("❌ Authentication failed. Make sure seed-admin.ts was run and rules are deployed.", authError);
    process.exit(1);
  }

  console.log("Starting mock data seeding...");

  // Seed Categories
  console.log("Seeding Categories...");
  for (const cat of MOCK_CATEGORIES) {
    await setDoc(doc(db, "categories", cat.id), cat);
  }
  console.log(`Seeded ${MOCK_CATEGORIES.length} categories.`);

  // Seed Products
  console.log("Seeding Products...");
  const now = new Date();
  for (const prod of MOCK_PRODUCTS) {
    await setDoc(doc(db, "products", prod.id), {
      ...prod,
      createdAt: now,
      updatedAt: now
    });
  }
  console.log(`Seeded ${MOCK_PRODUCTS.length} products.`);

  // Seed Customer Profiles
  console.log("Seeding Customers...");
  for (const cust of MOCK_CUSTOMERS) {
    await setDoc(doc(db, "users", cust.uid), cust);
  }
  console.log(`Seeded ${MOCK_CUSTOMERS.length} customer profiles.`);

  // Seed Orders
  console.log("Seeding Orders...");
  for (const ord of MOCK_ORDERS) {
    await setDoc(doc(db, "orders", ord.id), ord);
  }
  console.log(`Seeded ${MOCK_ORDERS.length} orders.`);

  console.log("🎉 Mock data seeding completed successfully!");
  process.exit(0);
}

seedData().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
