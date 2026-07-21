// app/admin/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ADMIN_ROLES } from "@/lib/rbac";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, ShieldAlert, LogIn, ArrowLeft, CheckCircle2, XCircle, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type ToastType = "success" | "error";
function AdminToast({ type, message, onClose }: { type: ToastType; message: string; onClose: () => void }) {
  const ok = type === "success";
  return (
    <div className={`fixed top-6 right-6 z-[999] flex items-start gap-3 max-w-sm w-full px-4 py-3.5 rounded-card shadow-xl border animate-fade-in-up ${ok ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200" : "bg-red-950/80 border-red-500/30 text-red-200"}`} role="alert">
      {ok ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" /> : <XCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />}
      <p className="flex-1 text-sm font-body font-medium">{message}</p>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    if (user && profile && ADMIN_ROLES.includes(profile.role)) {
      router.push("/admin");
    }
    const errParam = searchParams.get("error");
    if (errParam === "unauthorized") {
      showToast("error", "Access denied. Your account does not have administrative permissions.");
    } else if (errParam === "profile_load_failed") {
      showToast("error", "Could not load your profile. Firestore permissions may not be configured.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const role = data.role || "Customer";
        if (ADMIN_ROLES.includes(role)) {
          showToast("success", "Welcome back! Redirecting to dashboard…");
          setTimeout(() => router.push("/admin"), 1200);
        } else {
          await signOut(auth);
          showToast("error", "Access denied. You do not have administrative access.");
        }
      } else {
        await signOut(auth);
        showToast("error", "Access denied. User profile not found.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        showToast("error", "Invalid email or password. Please try again.");
      } else {
        showToast("error", "An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <AdminToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
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
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-charcoal text-white font-sans">
        <div className="w-16 h-16 rounded-full border-4 border-zinc-800 animate-spin border-t-brand-mauve" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
