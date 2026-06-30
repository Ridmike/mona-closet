// lib/db/content.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
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
  name: string;
  email: string;
  subject: string;
  message: string;
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
  payload: Omit<ContactMessage, "createdAt">
): Promise<string> {
  const colRef = collection(db, "contact_messages");
  const docRef = await addDoc(colRef, {
    ...payload,
    createdAt: new Date()
  });
  return docRef.id;
}
