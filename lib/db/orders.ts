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
