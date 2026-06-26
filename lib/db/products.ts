// lib/db/products.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit,
  DocumentData
} from "firebase/firestore";
import type { Product } from "@/types";

const COLLECTION_NAME = "products";

function docToProduct(docData: DocumentData, id: string): Product {
  return {
    id,
    name: docData.name || "",
    slug: docData.slug || "",
    description: docData.description || "",
    price: docData.price || 0,
    discount: docData.discount,
    images: docData.images || [],
    category: docData.category || "",
    brand: docData.brand || "",
    material: docData.material || "",
    variants: docData.variants || [],
    featured: !!docData.featured,
    published: !!docData.published,
    createdAt: docData.createdAt?.toDate() || new Date(),
    updatedAt: docData.updatedAt?.toDate() || new Date(),
  };
}

export async function createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const productsRef = collection(db, COLLECTION_NAME);
  const newDocRef = doc(productsRef);
  const now = new Date();
  
  await setDoc(newDocRef, {
    ...productData,
    createdAt: now,
    updatedAt: now,
  });
  
  return newDocRef.id;
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...productData,
    updatedAt: new Date(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function getProduct(id: string): Promise<Product | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToProduct(docSnap.data(), docSnap.id);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const docSnap = querySnapshot.docs[0];
  return docToProduct(docSnap.data(), docSnap.id);
}

export async function getProducts(filters?: { 
  category?: string; 
  featuredOnly?: boolean;
  publishedOnly?: boolean;
  limitCount?: number;
}): Promise<Product[]> {
  const productsRef = collection(db, COLLECTION_NAME);
  const querySnapshot = await getDocs(productsRef);
  let products = querySnapshot.docs.map(doc => docToProduct(doc.data(), doc.id));
  
  // Safe client-side filtering to avoid Firestore Composite Index requirements
  if (filters?.category) {
    products = products.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.featuredOnly) {
    products = products.filter(p => p.featured);
  }
  if (filters?.publishedOnly !== false) {
    products = products.filter(p => p.published);
  }
  
  // Sort descending by creation date
  products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  if (filters?.limitCount) {
    products = products.slice(0, filters.limitCount);
  }
  
  return products;
}
