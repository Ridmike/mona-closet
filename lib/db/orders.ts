// lib/db/orders.ts
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
  orderBy,
  where,
  DocumentData
} from "firebase/firestore";
import type { Order } from "@/types";

const COLLECTION_NAME = "orders";

function docToOrder(docData: DocumentData, id: string): Order {
  return {
    id,
    orderNumber: docData.orderNumber || "",
    customerId: docData.customerId || "",
    customerEmail: docData.customerEmail || "",
    items: docData.items || [],
    shippingAddress: docData.shippingAddress || {
      fullName: "",
      phone: "",
      line1: "",
      city: "",
      district: ""
    },
    paymentMethod: docData.paymentMethod || "cod",
    subtotal: docData.subtotal || 0,
    shippingFee: docData.shippingFee || 0,
    discount: docData.discount || 0,
    total: docData.total || 0,
    status: docData.status || "pending",
    notes: docData.notes || "",
    createdAt: docData.createdAt?.toDate() || new Date(),
    updatedAt: docData.updatedAt?.toDate() || new Date(),
  };
}

export async function createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ordersRef = collection(db, COLLECTION_NAME);
  const newDocRef = doc(ordersRef);
  const now = new Date();
  
  await setDoc(newDocRef, {
    ...orderData,
    createdAt: now,
    updatedAt: now,
  });
  
  return newDocRef.id;
}

export async function updateOrder(id: string, orderData: Partial<Omit<Order, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...orderData,
    updatedAt: new Date(),
  });
}

export async function deleteOrder(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function getOrder(id: string): Promise<Order | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToOrder(docSnap.data(), docSnap.id);
}

export async function getOrders(): Promise<Order[]> {
  const ordersRef = collection(db, COLLECTION_NAME);
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => docToOrder(doc.data(), doc.id));
}

// Fetches only orders for a specific customer UID (safe for non-admin users).
// Also queries by email to catch orders placed during guest checkout where
// the customerId may differ from the current Firebase Auth UID.
// NOTE: No orderBy() here to avoid requiring a Firestore composite index.
//       Sorting is done client-side since a customer's order count is small.
export async function getOrdersByCustomer(customerId: string, email?: string): Promise<Order[]> {
  const ordersRef = collection(db, COLLECTION_NAME);

  // Query 1: by customerId (for authenticated checkout orders)
  const q1 = query(ordersRef, where("customerId", "==", customerId));
  const snap1 = await getDocs(q1);
  const orderMap = new Map<string, Order>();
  snap1.docs.forEach(d => orderMap.set(d.id, docToOrder(d.data(), d.id)));

  // Query 2: by customerEmail (for guest / legacy orders with different customerId)
  if (email) {
    const q2 = query(ordersRef, where("customerEmail", "==", email.toLowerCase()));
    const snap2 = await getDocs(q2);
    snap2.docs.forEach(d => {
      if (!orderMap.has(d.id)) orderMap.set(d.id, docToOrder(d.data(), d.id));
    });
  }

  // Sort merged results newest first (client-side)
  return Array.from(orderMap.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}
