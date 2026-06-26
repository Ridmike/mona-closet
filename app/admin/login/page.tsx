// app/admin/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, ShieldAlert, LogIn, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user && profile && (profile.role === "Owner" || profile.role === "Manager" || profile.role === "Staff")) {
      router.push("/admin");
    }
    
    const errParam = searchParams.get("error");
    if (errParam === "unauthorized") {
      setError("Access denied. Your account does not have administrative permissions.");
    } else if (errParam === "profile_load_failed") {
      setError("Could not load your profile. Firestore permissions may not be configured — please contact the system administrator.");
    }
  }, [user, profile, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const role = data.role || "Customer";
        
        if (role === "Owner" || role === "Manager" || role === "Staff") {
          router.push("/admin");
        } else {
          await signOut(auth);
          setError("Access denied. You do not have administrative access.");
        }
      } else {
        await signOut(auth);
        setError("Access denied. User profile not found.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-charcoal px-4 py-12 text-white">
      <div className="max-w-md w-full space-y-8 bg-brand-charcoal border border-white/10 p-8 rounded-card shadow-2xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-mauve/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-mauve/30">
            <ShieldAlert className="w-6 h-6 text-brand-mauve" />
          </div>
          <h2 className="font-display text-3xl font-medium tracking-wide">
            Mona's Closet
          </h2>
          <p className="mt-2 text-sm font-body text-white/50">
            Admin Portal Management Sign In
          </p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-500/30 text-red-300 text-sm font-body p-3.5 rounded-card" role="alert">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 text-brand-charcoal">
            <Input
              label="Admin Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@monascloset.lk"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-brand-mauve"
              leftIcon={<Mail className="w-4 h-4 text-zinc-500" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:ring-brand-mauve"
              leftIcon={<Lock className="w-4 h-4 text-zinc-500" />}
            />
          </div>

          <Button variant="primary" type="submit" loading={loading} fullWidth className="bg-brand-mauve text-white hover:bg-brand-plum flex justify-center gap-2 py-3">
            Enter Dashboard <LogIn className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-body text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
