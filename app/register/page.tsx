// app/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User, Phone, UserPlus, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      
      await updateProfile(currentUser, { displayName: name });
      
      await setDoc(doc(db, "users", currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: name,
        phone: phone,
        role: "Customer",
        createdAt: new Date(),
      });
      
      router.push("/");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already in use.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters long.");
      } else {
        setError("An error occurred during registration. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-brand-cream px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-card shadow-card border border-brand-sand/50">
        <div className="text-center">
          <h2 className="font-display text-3xl font-medium text-brand-plum">
            Create Account
          </h2>
          <p className="mt-2 text-sm font-body text-brand-charcoal/60">
            Sign up to shop and manage your orders
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-body p-3.5 rounded-card" role="alert">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            leftIcon={<User className="w-4 h-4 text-brand-mauve/70" />}
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            leftIcon={<Mail className="w-4 h-4 text-brand-mauve/70" />}
          />

          <Input
            label="Phone Number"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="077XXXXXXXX"
            leftIcon={<Phone className="w-4 h-4 text-brand-mauve/70" />}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4 text-brand-mauve/70" />}
          />

          <Input
            label="Confirm Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4 text-brand-mauve/70" />}
          />

          <Button variant="primary" type="submit" loading={loading} fullWidth className="flex justify-center gap-2 mt-2">
            Create Account <UserPlus className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-brand-sand/40">
          <p className="text-xs font-body text-brand-charcoal/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-brand-mauve hover:text-brand-plum transition-colors inline-flex items-center gap-0.5"
            >
              Sign in <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
