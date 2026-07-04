// lib/db/content.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  orderBy,
  DocumentData
} from "firebase/firestore";

export interface PageContent {
  title: string;
  content: string; // Markdown or simple HTML formatted paragraphs
  lastUpdated?: Date;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface ContactMessage {
  id:        string;
  name:      string;
  email:     string;
  subject:   string;
  message:   string;
  read:      boolean;
  createdAt: Date;
}

/**
 * Fetch dynamic storefront info page content.
 */
export async function getPageContent(slug: string): Promise<PageContent | null> {
  try {
    const docRef = doc(db, "pages", slug);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return {
      title: data.title || "",
      content: data.content || "",
      lastUpdated: data.lastUpdated?.toDate() || new Date()
    };
  } catch (err) {
    console.error(`Error loading page content for ${slug}:`, err);
    return null;
  }
}

/**
 * Save/overwrite page content (admin-facing, but useful helper).
 */
export async function savePageContent(slug: string, payload: Omit<PageContent, "lastUpdated">): Promise<void> {
  const docRef = doc(db, "pages", slug);
  await setDoc(docRef, {
    ...payload,
    lastUpdated: new Date()
  });
}

/**
 * Get dynamic list of frequently asked questions.
 */
export async function getFAQs(): Promise<FAQItem[]> {
  try {
    const faqsRef = collection(db, "faqs");
    const q = query(faqsRef, orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question || "",
        answer: data.answer || "",
        order: data.order || 0
      };
    });
  } catch (err) {
    console.error("Error loading FAQs:", err);
    return [];
  }
}

/**
 * Submit contact inquiry to Firestore.
 */
export async function submitContactMessage(
  payload: Omit<ContactMessage, "id" | "createdAt" | "read">
): Promise<string> {
  const colRef = collection(db, "contact_messages");
  const docRef = await addDoc(colRef, {
    ...payload,
    read: false,
    createdAt: new Date()
  });
  return docRef.id;
}

/**
 * Fetch all contact messages for admin view (ordered newest first).
 */
export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const colRef = collection(db, "contact_messages");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data() as DocumentData;
      return {
        id:        d.id,
        name:      data.name      || "",
        email:     data.email     || "",
        subject:   data.subject   || "",
        message:   data.message   || "",
        read:      data.read      ?? false,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (err) {
    console.error("Error loading contact messages:", err);
    return [];
  }
}

/**
 * Mark a contact message as read or unread.
 */
export async function markMessageRead(id: string, read: boolean): Promise<void> {
  const docRef = doc(db, "contact_messages", id);
  await updateDoc(docRef, { read });
}

/**
 * Delete a contact message.
 */
export async function deleteContactMessage(id: string): Promise<void> {
  const docRef = doc(db, "contact_messages", id);
  await deleteDoc(docRef);
}
