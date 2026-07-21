"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: import("@/context/AuthContext").UserProfile["role"][];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const targetRedirect = pathname.startsWith("/admin") ? "/admin/login" : redirectTo;
      router.push(targetRedirect);
      return;
    }

    // Profile is null after loading finished — Firestore read likely failed (permissions / network).
    // Treat this as an auth failure rather than silently granting or looping.
    if (allowedRoles && !profile) {
      const targetRedirect = pathname.startsWith("/admin")
        ? "/admin/login?error=profile_load_failed"
        : redirectTo;
      router.push(targetRedirect);
      return;
    }

    if (allowedRoles && profile) {
      const hasAccess = allowedRoles.includes(profile.role);
      if (!hasAccess) {
        if (pathname.startsWith("/admin")) {
          router.push("/admin/login?error=unauthorized");
        } else {
          router.push("/");
        }
      }
    }
  }, [user, profile, loading, router, allowedRoles, redirectTo, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream text-brand-plum">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-mauve" />
          <p className="font-body text-sm font-medium tracking-wide">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}
