"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  User,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  /**
   * Roles:
   *  - SuperAdmin       → Full access (replaces "Owner")
   *  - InventoryManager → Products, Categories, Inventory
   *  - StaffManager     → Staff Users management
   *  - ContentManager   → Products, Categories, Site Settings/Banners
   *  - OrderManager     → Orders, Customers
   *  - CustomerSupport  → Messages, Customers (view)
   *  - Customer         → Storefront web user only
   *
   * Legacy aliases kept for backward compatibility:
   *  - Owner   → treated as SuperAdmin
   *  - Manager → treated as StaffManager (reassign ASAP)
   *  - Staff   → treated as CustomerSupport (reassign ASAP)
   */
  role:
    | "SuperAdmin"
    | "InventoryManager"
    | "StaffManager"
    | "ContentManager"
    | "OrderManager"
    | "CustomerSupport"
    | "Customer"
    // Legacy aliases — kept for backward compatibility
    | "Owner"
    | "Manager"
    | "Staff";
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  resetPassword: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: data.displayName || currentUser.displayName || "",
              phone: data.phone || "",
              role: data.role || "Customer",
              createdAt: data.createdAt?.toDate() || new Date(),
            });
          } else {
            // Fail-safe default user profile document creation
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "",
              phone: "",
              role: "Customer",
              createdAt: new Date(),
            };
            await setDoc(userDocRef, {
              uid: newProfile.uid,
              email: newProfile.email,
              displayName: newProfile.displayName,
              phone: newProfile.phone,
              role: newProfile.role,
              createdAt: new Date(),
            });
            setProfile(newProfile);
          }
        } catch (error: any) {
          // If Firestore blocked the read due to security rules, do NOT create a
          // fallback "Customer" document — the user's real document may already exist
          // with a higher-privilege role (e.g. Owner). Just set profile to null and
          // let ProtectedRoute handle the redirect.
          if (error?.code === "permission-denied") {
            console.warn("Firestore read blocked by security rules — rules may not be deployed yet.");
            setProfile(null);
          } else {
            console.error("Error fetching user profile:", error);
            setProfile(null);
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
