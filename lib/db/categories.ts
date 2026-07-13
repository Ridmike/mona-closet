// lib/db/categories.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  DocumentData
} from "firebase/firestore";
import type { Category } from "@/types";

const COLLECTION_NAME = "categories";

function docToCategory(docData: DocumentData, id: string): Category {
  return {
    id,
    name: docData.name || "",
    slug: docData.slug || "",
    description: docData.description,
    image: docData.image,
    hoverImage: docData.hoverImage,
    parent: docData.parent,
    order: docData.order || 0,
  };
}

export async function createCategory(categoryData: Omit<Category, "id">): Promise<string> {
  const categoriesRef = collection(db, COLLECTION_NAME);
  const newDocRef = doc(categoriesRef);
  
  await setDoc(newDocRef, {
    ...categoryData,
  });
  
  return newDocRef.id;
}

export async function updateCategory(id: string, categoryData: Partial<Omit<Category, "id">>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, categoryData);
}

export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function getCategories(): Promise<Category[]> {
  const categoriesRef = collection(db, COLLECTION_NAME);
  const querySnapshot = await getDocs(categoriesRef);
  const categories = querySnapshot.docs.map(doc => docToCategory(doc.data(), doc.id));
  
  // Sort by order ascending
  return categories.sort((a, b) => a.order - b.order);
}
