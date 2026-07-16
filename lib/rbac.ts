// lib/rbac.ts
// Role-Based Access Control helpers for the admin dashboard.

import type { UserProfile } from "@/context/AuthContext";

export type Role = UserProfile["role"];

// ─── Permission matrix ──────────────────────────────────────────────────────
// Maps each permission key to the roles that are allowed to perform it.
export const PERMISSIONS = {
  // Dashboard
  viewDashboard:         ["Owner", "Manager", "Staff"] as Role[],

  // Products / Categories / Inventory
  viewProducts:          ["Owner", "Manager", "Staff"] as Role[],
  manageProducts:        ["Owner", "Manager", "Staff"] as Role[],

  viewCategories:        ["Owner", "Manager", "Staff"] as Role[],
  manageCategories:      ["Owner", "Manager", "Staff"] as Role[],

  viewInventory:         ["Owner", "Manager", "Staff"] as Role[],
  manageInventory:       ["Owner", "Manager", "Staff"] as Role[],

  // Orders
  viewOrders:            ["Owner", "Manager", "Staff"] as Role[],
  manageOrders:          ["Owner", "Manager", "Staff"] as Role[],

  // Messages
  viewMessages:          ["Owner", "Manager", "Staff"] as Role[],
  manageMessages:        ["Owner", "Manager", "Staff"] as Role[],

  // Customers
  viewCustomers:         ["Owner", "Manager"] as Role[],

  // Staff / Users management
  viewStaffUsers:        ["Owner", "Manager"] as Role[],
  addStaffMember:        ["Owner", "Manager"] as Role[],    // Manager can add Staff only
  deleteStaffMember:     ["Owner"] as Role[],               // Only Owner can delete
  addManager:            ["Owner"] as Role[],               // Only Owner can add Managers
  viewOwnerAccounts:     ["Owner"] as Role[],               // Only Owner sees Owner rows

  // Settings
  viewSettings:          ["Owner", "Manager"] as Role[],
  manageSettings:        ["Owner"] as Role[],
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Returns true if the given role has the specified permission.
 */
export function hasPermission(role: Role | undefined | null, permission: PermissionKey): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as Role[]).includes(role);
}

/**
 * Returns the list of role options the current user can assign when adding a staff member.
 * - Owner can assign Staff, Manager, Owner
 * - Manager can only assign Staff
 */
export function getAssignableRoles(currentRole: Role | undefined | null): Role[] {
  if (currentRole === "Owner") return ["Staff", "Manager", "Owner"];
  if (currentRole === "Manager") return ["Staff"];
  return [];
}
