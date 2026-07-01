// lib/db/customers.ts
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where,
  DocumentData
} from "firebase/firestore";
import type { UserProfile } from "@/context/AuthContext";

const COLLECTION_NAME = "users";

function docToUserProfile(docData: DocumentData, uid: string): UserProfile {
  return {
    uid,
    email: docData.email || "",
    displayName: docData.displayName || "",
    phone: docData.phone || "",
    role: docData.role || "Customer",
    createdAt: docData.createdAt?.toDate() || new Date(),
  };
}

export async function getCustomers(): Promise<UserProfile[]> {
  const usersRef = collection(db, COLLECTION_NAME);
  // We can fetch all users or filter by Customer role. For dynamic analytics,
  // we fetch all users and can display their roles, or filter on client.
  const querySnapshot = await getDocs(usersRef);
  return querySnapshot.docs.map(doc => docToUserProfile(doc.data(), doc.id));
}
