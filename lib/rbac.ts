// lib/rbac.ts
// Role-Based Access Control — 6 specialist roles for the admin dashboard.

import type { UserProfile } from "@/context/AuthContext";

export type Role = UserProfile["role"];

// ─── All roles that grant admin dashboard access ─────────────────────────────
export const ADMIN_ROLES: Role[] = [
  "SuperAdmin",
  "InventoryManager",
  "StaffManager",
  "ContentManager",
  "OrderManager",
  "CustomerSupport",
  // Legacy aliases — accepted for backward compatibility
  "Owner",
  "Manager",
  "Staff",
];

// ─── Role display labels ─────────────────────────────────────────────────────
export const ROLE_LABELS: Record<Role, string> = {
  SuperAdmin:       "Super Admin",
  InventoryManager: "Inventory Manager",
  StaffManager:     "Staff Manager",
  ContentManager:   "Content Manager",
  OrderManager:     "Order Manager",
  CustomerSupport:  "Customer Support",
  Customer:         "Customer",
  // Legacy
  Owner:   "Owner (Legacy → SuperAdmin)",
  Manager: "Manager (Legacy → StaffManager)",
  Staff:   "Staff (Legacy → CustomerSupport)",
};

// ─── Role badge colours (Tailwind classes) ───────────────────────────────────
export const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
  SuperAdmin:       { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200"  },
  InventoryManager: { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200"    },
  StaffManager:     { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200"  },
  ContentManager:   { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200"    },
  OrderManager:     { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200"   },
  CustomerSupport:  { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200"    },
  Customer:         { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200"   },
  // Legacy
  Owner:   { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Manager: { bg: "bg-zinc-50",   text: "text-zinc-700",   border: "border-zinc-200"   },
  Staff:   { bg: "bg-zinc-50",   text: "text-zinc-700",   border: "border-zinc-200"   },
};

// ─── Permission matrix ───────────────────────────────────────────────────────
// Each key maps to the roles allowed to perform that action.
// Legacy role aliases are included so existing accounts keep working.
export const PERMISSIONS = {

  // ── Dashboard ──────────────────────────────────────────────────────────────
  viewDashboard: [
    "SuperAdmin", "InventoryManager", "StaffManager", "ContentManager",
    "OrderManager", "CustomerSupport",
    "Owner", "Manager", "Staff", // legacy
  ] as Role[],

  // ── Products ───────────────────────────────────────────────────────────────
  viewProducts:   ["SuperAdmin", "InventoryManager", "ContentManager", "Owner", "Manager", "Staff"] as Role[],
  manageProducts: ["SuperAdmin", "InventoryManager", "ContentManager", "Owner", "Manager", "Staff"] as Role[],

  // ── Categories ─────────────────────────────────────────────────────────────
  viewCategories:   ["SuperAdmin", "InventoryManager", "ContentManager", "Owner", "Manager", "Staff"] as Role[],
  manageCategories: ["SuperAdmin", "InventoryManager", "ContentManager", "Owner", "Manager", "Staff"] as Role[],

  // ── Inventory / Stock ──────────────────────────────────────────────────────
  viewInventory:   ["SuperAdmin", "InventoryManager", "Owner", "Manager"] as Role[],
  manageInventory: ["SuperAdmin", "InventoryManager", "Owner", "Manager"] as Role[],

  // ── Orders ─────────────────────────────────────────────────────────────────
  viewOrders:   ["SuperAdmin", "OrderManager", "CustomerSupport", "Owner", "Manager", "Staff"] as Role[],
  manageOrders: ["SuperAdmin", "OrderManager", "Owner", "Manager", "Staff"] as Role[],

  // ── Customers ──────────────────────────────────────────────────────────────
  viewCustomers: ["SuperAdmin", "StaffManager", "OrderManager", "CustomerSupport", "Owner", "Manager"] as Role[],

  // ── Messages / Inquiries ───────────────────────────────────────────────────
  viewMessages:   ["SuperAdmin", "CustomerSupport", "Owner", "Manager", "Staff"] as Role[],
  manageMessages: ["SuperAdmin", "CustomerSupport", "Owner", "Manager", "Staff"] as Role[],

  // ── Staff / User Management ────────────────────────────────────────────────
  viewStaffUsers:    ["SuperAdmin", "StaffManager", "Owner", "Manager"] as Role[],
  /** StaffManager can add specialist roles, SuperAdmin can add any role */
  addStaffMember:    ["SuperAdmin", "StaffManager", "Owner", "Manager"] as Role[],
  /** Only SuperAdmin can remove/demote */
  deleteStaffMember: ["SuperAdmin", "Owner"] as Role[],
  /** Only SuperAdmin can add another SuperAdmin */
  addSuperAdmin:     ["SuperAdmin", "Owner"] as Role[],

  // ── Site Settings / Banners / Content ─────────────────────────────────────
  viewSettings:   ["SuperAdmin", "ContentManager", "Owner", "Manager"] as Role[],
  /** Only SuperAdmin can save settings changes */
  manageSettings: ["SuperAdmin", "Owner"] as Role[],

} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the given role has the specified permission.
 */
export function hasPermission(role: Role | undefined | null, permission: PermissionKey): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as Role[]).includes(role);
}

/**
 * Returns true if the role has any admin panel access at all.
 */
export function isAdminRole(role: Role | undefined | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}

/**
 * Returns the roles that the current user is allowed to assign
 * when creating a new staff member.
 *
 * - SuperAdmin → can assign all 6 specialist roles
 * - StaffManager → can assign InventoryManager, ContentManager, OrderManager, CustomerSupport
 * - All others → no assignment allowed
 */
export function getAssignableRoles(currentRole: Role | undefined | null): Role[] {
  if (currentRole === "SuperAdmin" || currentRole === "Owner") {
    return [
      "SuperAdmin",
      "InventoryManager",
      "StaffManager",
      "ContentManager",
      "OrderManager",
      "CustomerSupport",
    ];
  }
  if (currentRole === "StaffManager" || currentRole === "Manager") {
    return ["InventoryManager", "ContentManager", "OrderManager", "CustomerSupport"];
  }
  return [];
}

/**
 * Returns a CSS class string for a role badge.
 */
export function getRoleBadgeClass(role: Role): string {
  const c = ROLE_COLORS[role] ?? ROLE_COLORS["Customer"];
  return `${c.bg} ${c.text} border ${c.border} px-2.5 py-1 rounded text-xs font-semibold`;
}
