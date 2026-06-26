// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("No account was found with this email address.");
      } else {
        setError("An error occurred. Please double-check the email address and try again.");
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
            Reset Password
          </h2>
          <p className="mt-2 text-sm font-body text-brand-charcoal/60">
            We will send a password reset link to your email address
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-body p-3.5 rounded-card" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center py-4">
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-body p-4 rounded-card">
              ✅ A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and spam folders.
            </div>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm font-body font-medium text-brand-mauve hover:text-brand-plum transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4 text-brand-mauve/70" />}
            />

            <div className="space-y-4">
              <Button variant="primary" type="submit" loading={loading} fullWidth className="flex justify-center gap-2">
                Send Reset Link <Send className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-body font-medium text-brand-mauve hover:text-brand-plum transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
