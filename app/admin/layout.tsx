// app/admin/layout.tsx
"use client";

import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  Users, 
  LogOut, 
  Store,
  Package,
  ClipboardList,
  MessageSquare,
  Settings,
  Bell,
  CheckSquare
} from "lucide-react";
import { getContactMessages } from "@/lib/db/content";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { hasPermission, type PermissionKey, ADMIN_ROLES, ROLE_LABELS } from "@/lib/rbac";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    getContactMessages()
      .then(msgs => setUnreadMessages(msgs.filter(m => !m.read).length))
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    const ordersCol = collection(db, "orders");
    const q = query(ordersCol, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orderNumber: data.orderNumber || "",
          customerEmail: data.customerEmail || "",
          total: data.total || 0,
          status: data.status || "pending",
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      // Filter unread notifications using localStorage
      const readOrderIds = JSON.parse(localStorage.getItem("admin_read_orders") || "[]");
      const unread = orderList.filter(o => !readOrderIds.includes(o.id));
      setNotifications(unread);
    }, (err) => {
      console.error("Error listening to real-time orders snapshot:", err);
    });

    return () => unsubscribe();
  }, [pathname]);

  const handleMarkAsRead = (orderId: string) => {
    const readOrderIds = JSON.parse(localStorage.getItem("admin_read_orders") || "[]");
    if (!readOrderIds.includes(orderId)) {
      readOrderIds.push(orderId);
      localStorage.setItem("admin_read_orders", JSON.stringify(readOrderIds));
    }
    setNotifications(prev => prev.filter(n => n.id !== orderId));
    setShowNotifMenu(false);
    router.push(`/admin/orders?id=${orderId}`);
  };

  const handleMarkAllAsRead = () => {
    const readOrderIds = JSON.parse(localStorage.getItem("admin_read_orders") || "[]");
    notifications.forEach(n => {
      if (!readOrderIds.includes(n.id)) {
        readOrderIds.push(n.id);
      }
    });
    localStorage.setItem("admin_read_orders", JSON.stringify(readOrderIds));
    setNotifications([]);
    setShowNotifMenu(false);
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Dashboard",   href: "/admin",            icon: LayoutDashboard, permission: "viewDashboard"  },
    { label: "Products",    href: "/admin/products",   icon: ShoppingBag,     permission: "viewProducts"   },
    { label: "Categories",  href: "/admin/categories", icon: FolderTree,      permission: "viewCategories" },
    { label: "Inventory",   href: "/admin/inventory",  icon: Package,         permission: "viewInventory"  },
    { label: "Orders",      href: "/admin/orders",     icon: ClipboardList,   permission: "viewOrders"     },
    { label: "Customers",   href: "/admin/customers",  icon: Users,           permission: "viewCustomers"  },
    { label: "Messages",    href: "/admin/messages",   icon: MessageSquare,   permission: "viewMessages",  badge: unreadMessages },
    { label: "Staff Users", href: "/admin/users",      icon: Users,           permission: "viewStaffUsers" },
    { label: "Settings",    href: "/admin/settings",   icon: Settings,        permission: "viewSettings"   },
  ] as const;

  return (
    <ProtectedRoute allowedRoles={ADMIN_ROLES}>
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
                  <p className="text-xs text-zinc-400 font-medium">{ROLE_LABELS[profile.role] ?? profile.role}</p>
                </div>
              </div>
            )}

            {/* Navigation links */}
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                // Gate each nav link by the role-based permission
                if (!hasPermission(profile?.role, item.permission as PermissionKey)) {
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
                    <span className="flex-1">{item.label}</span>
                    {"badge" in item && (item as any).badge > 0 && (
                      <span className="bg-brand-mauve text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {(item as any).badge > 99 ? "99+" : (item as any).badge}
                      </span>
                    )}
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
          <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shadow-sm relative z-30">
            <h2 className="text-lg font-bold font-display text-zinc-900 capitalize animate-fade-in">
              {pathname === "/admin" ? "Dashboard Summary" : pathname.replace("/admin/", "").replace("-", " ")}
            </h2>

            <div className="flex items-center gap-6">
              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  aria-label="View notifications"
                  className="p-2 text-zinc-650 hover:text-brand-mauve transition-colors rounded-full hover:bg-zinc-50 relative focus:outline-none"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
                      {notifications.length > 99 ? "99+" : notifications.length}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-card shadow-xl border border-zinc-150 overflow-hidden text-sm z-50 animate-scale-in">
                    <header className="px-4 py-3 bg-zinc-50 border-b border-zinc-150 flex items-center justify-between">
                      <span className="font-semibold text-zinc-800">Order Alerts ({notifications.length})</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] text-brand-mauve hover:text-brand-plum font-semibold flex items-center gap-1 transition-colors"
                        >
                          <CheckSquare className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </header>

                    <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-zinc-400 text-xs font-body leading-relaxed">
                          No new notifications.<br />We'll alert you here when new orders arrive.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className="p-3.5 hover:bg-zinc-50/75 cursor-pointer transition-colors space-y-1 font-body text-xs text-zinc-600"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-zinc-950">New Order Placed</span>
                              <span className="text-[10px] bg-amber-55 border border-amber-100 text-amber-750 px-1.5 py-0.5 rounded font-mono font-medium capitalize">
                                {n.status}
                              </span>
                            </div>
                            <p className="text-zinc-550">Order #{n.orderNumber} • Rs. {n.total.toLocaleString()}</p>
                            <p className="text-[10px] text-zinc-400 pt-0.5">{n.customerEmail}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-zinc-400 font-medium hidden sm:block">
                System Date: {new Date().toLocaleDateString()}
              </div>
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
