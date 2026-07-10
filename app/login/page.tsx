// app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, LogIn, ArrowRight, CheckCircle2, XCircle, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ── Inline toast notification ─────────────────────────────────────────────────
type ToastType = "success" | "error";
interface ToastProps { type: ToastType; message: string; onClose: () => void; }

function Toast({ type, message, onClose }: ToastProps) {
  const isSuccess = type === "success";
  return (
    <div
      className={`fixed top-6 right-6 z-[999] flex items-start gap-3 max-w-sm w-full px-4 py-3.5 rounded-card shadow-xl border animate-fade-in-up
        ${isSuccess
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-700"
        }`}
      role="alert"
    >
      {isSuccess
        ? <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" />
        : <XCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
      }
      <p className="flex-1 text-sm font-body font-medium">{message}</p>
      <button onClick={onClose} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState<{ type: ToastType; message: string } | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.push("/");
    return null;
  }

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("success", "Welcome back! You are now signed in.");
      // Brief pause so user sees success toast before navigation
      setTimeout(() => router.push("/"), 1200);
    } catch (err: any) {
      console.error(err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        showToast("error", "Invalid email or password. Please check your credentials and try again.");
      } else if (err.code === "auth/too-many-requests") {
        showToast("error", "Too many failed attempts. Your account is temporarily locked. Try again later.");
      } else {
        showToast("error", "Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      <div className="min-h-[80vh] flex items-center justify-center bg-brand-cream px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-card shadow-card border border-brand-sand/50">
          <div className="text-center">
            <h2 className="font-display text-3xl font-medium text-brand-plum">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm font-body text-brand-charcoal/60">
              Sign in to access your profile and track orders
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4 text-brand-mauve/70" />}
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4 text-brand-mauve/70" />}
                />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-body font-medium text-brand-mauve hover:text-brand-plum transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            <Button variant="primary" type="submit" loading={loading} fullWidth className="flex justify-center gap-2">
              Sign In <LogIn className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-brand-sand/40">
            <p className="text-xs font-body text-brand-charcoal/60">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-brand-mauve hover:text-brand-plum transition-colors inline-flex items-center gap-0.5"
              >
                Sign up now <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
