// app/admin/layout.tsx
"use client";

import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  Users, 
  LogOut, 
  Store,
  Package,
  ClipboardList
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: ShoppingBag },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Inventory", href: "/admin/inventory", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ClipboardList },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Staff Users", href: "/admin/users", icon: Users, roles: ["Owner", "Manager"] },
  ];

  return (
    <ProtectedRoute allowedRoles={["Owner", "Manager", "Staff"]}>
      <div className="flex h-screen bg-zinc-100 text-zinc-800 font-sans">
        
        {/* Sidebar */}
        <aside className="w-64 bg-zinc-900 text-white flex flex-col justify-between p-6 shrink-0 shadow-lg">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-zinc-800">
              <span className="font-display text-xl font-bold tracking-wider text-brand-blush">
                Mona's Closet
              </span>
              <span className="bg-zinc-800 text-[10px] text-zinc-400 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Admin
              </span>
            </div>

            {/* User Info */}
            {profile && (
              <div className="mb-8 p-3 bg-zinc-800/40 rounded-card border border-zinc-800">
                <p className="text-sm font-bold truncate text-white">{profile.displayName || "Admin User"}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-zinc-400 capitalize font-medium">{profile.role}</p>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                if (item.roles && profile && !item.roles.includes(profile.role)) {
                  return null;
                }
                
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-brand-mauve text-white shadow-md shadow-brand-mauve/25" 
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800">
            <Link 
              href="/" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Store className="w-4 h-4" />
              Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-card text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shadow-sm">
            <h2 className="text-lg font-bold font-display text-zinc-900 capitalize animate-fade-in">
              {pathname === "/admin" ? "Dashboard Summary" : pathname.replace("/admin/", "").replace("-", " ")}
            </h2>
            <div className="text-xs text-zinc-400 font-medium">
              System Date: {new Date().toLocaleDateString()}
            </div>
          </header>

          <div className="flex-1 overflow-auto p-8 bg-zinc-50">
            {children}
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}
