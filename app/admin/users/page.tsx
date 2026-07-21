// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { useToast } from "@/components/shared/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { db, secondaryAuth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  UserPlus,
  Trash2,
  Search,
  X,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  hasPermission,
  getAssignableRoles,
  getRoleBadgeClass,
  ROLE_LABELS,
  ROLE_COLORS,
} from "@/lib/rbac";

export default function AdminStaffUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["SuperAdmin", "StaffManager", "Owner", "Manager"]}>
      <StaffUsersDashboard />
    </ProtectedRoute>
  );
}

// ─── Role descriptions shown in the dropdown ────────────────────────────────
const ROLE_DESCRIPTIONS: Partial<Record<UserProfile["role"], string>> = {
  SuperAdmin:       "Full access to all modules and permission management",
  InventoryManager: "Products, Categories, Inventory & stock management",
  StaffManager:     "Staff accounts management & employee records",
  ContentManager:   "Banners, categories, website content & media",
  OrderManager:     "Orders, order status updates & customer order management",
  CustomerSupport:  "Customer inquiries, messages & review management",
};

// ─── Role overview rows for the legend table ────────────────────────────────
const ROLE_OVERVIEW: { role: UserProfile["role"]; modules: string }[] = [
  { role: "SuperAdmin",       modules: "All modules + user/permission management" },
  { role: "InventoryManager", modules: "Dashboard, Products, Categories, Inventory" },
  { role: "StaffManager",     modules: "Dashboard, Customers, Staff Users (add only)" },
  { role: "ContentManager",   modules: "Dashboard, Products, Categories, Settings (view)" },
  { role: "OrderManager",     modules: "Dashboard, Orders, Customers" },
  { role: "CustomerSupport",  modules: "Dashboard, Messages, Customers (view)" },
];

function StaffUsersDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showLegend, setShowLegend] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState<UserProfile["role"]>("InventoryManager");

  // Permissions for the logged-in user
  const canAddStaff  = hasPermission(profile?.role, "addStaffMember");
  const canDelete    = hasPermission(profile?.role, "deleteStaffMember");
  const assignableRoles = getAssignableRoles(profile?.role);

  // Default new role to first assignable
  useEffect(() => {
    if (assignableRoles.length > 0) setNewRole(assignableRoles[0]);
  }, [profile?.role]);

  const loadStaffUsers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "users"));
      const staffList = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            uid: d.id,
            email: data.email || "",
            displayName: data.displayName || "",
            phone: data.phone || "",
            role: (data.role || "Customer") as UserProfile["role"],
            createdAt: data.createdAt?.toDate() || new Date(),
          } as UserProfile;
        })
        .filter((u) => u.role !== "Customer");
      setUsers(staffList);
    } catch (err) {
      console.error("Error loading staff users:", err);
      toast("Failed to load staff list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffUsers();
  }, []);

  const resetForm = () => {
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewPassword("");
    setShowPassword(false);
    setNewRole(assignableRoles[0] ?? "InventoryManager");
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      toast("Please enter a name and email.", "error");
      return;
    }

    // StaffManager cannot assign SuperAdmin or StaffManager
    if (
      (profile?.role === "StaffManager" || profile?.role === "Manager") &&
      (newRole === "SuperAdmin" || newRole === "StaffManager" || newRole === "Owner")
    ) {
      toast("Staff Managers can only assign specialist roles (not SuperAdmin or StaffManager).", "error");
      return;
    }

    try {
      setSubmitting(true);
      const emailLower = newEmail.trim().toLowerCase();

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailLower));
      const snap = await getDocs(q);

      if (!snap.empty) {
        // Existing user — promote their role
        const existingDoc = snap.docs[0];
        const existingRole = existingDoc.data().role as UserProfile["role"];

        if (
          (profile?.role === "StaffManager" || profile?.role === "Manager") &&
          (existingRole === "SuperAdmin" || existingRole === "Owner" || existingRole === "StaffManager")
        ) {
          toast("You cannot modify accounts with higher or equal privileges.", "error");
          return;
        }

        await updateDoc(doc(db, "users", existingDoc.id), {
          role: newRole,
          displayName: newName || existingDoc.data().displayName,
          phone: newPhone || existingDoc.data().phone,
        });
        toast(`Promoted ${emailLower} to ${ROLE_LABELS[newRole]} successfully!`, "success");
      } else if (newPassword) {
        // New user — create via secondary auth (never signs out the current admin)
        if (newPassword.length < 6) {
          toast("Password must be at least 6 characters.", "error");
          setSubmitting(false);
          return;
        }

        const credential = await createUserWithEmailAndPassword(
          secondaryAuth,
          emailLower,
          newPassword
        );
        const newUser = credential.user;
        await updateProfile(newUser, { displayName: newName });

        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email: emailLower,
          displayName: newName,
          phone: newPhone,
          role: newRole,
          createdAt: new Date(),
        });

        await signOut(secondaryAuth);

        toast(
          `✅ Account created! ${emailLower} can log in at /admin/login immediately.`,
          "success"
        );
      } else {
        // Invitation placeholder — role activates on first sign-up
        const tempId = "temp_" + Math.random().toString(36).substring(2, 11);
        await setDoc(doc(db, "users", tempId), {
          uid: tempId,
          email: emailLower,
          displayName: newName,
          phone: newPhone,
          role: newRole,
          createdAt: new Date(),
        });
        toast(
          `Invitation created for ${emailLower}. Their ${ROLE_LABELS[newRole]} role activates when they sign up at /register.`,
          "success"
        );
      }

      resetForm();
      setShowAddModal(false);
      loadStaffUsers();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        toast("This email already has an account. Try upgrading their role instead.", "error");
      } else {
        toast("Failed to add staff member: " + (err.message || "Unknown error"), "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoteStaff = async (staffUser: UserProfile) => {
    if (!canDelete) {
      toast("Only Super Admins can remove staff members.", "error");
      return;
    }

    const isSelf = profile?.uid === staffUser.uid || profile?.email === staffUser.email;
    if (isSelf) {
      toast("You cannot demote your own account.", "error");
      return;
    }

    if (
      !confirm(
        `Remove ${staffUser.displayName || staffUser.email} from staff?\nTheir account will be demoted to Customer.`
      )
    ) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, "users", staffUser.uid), { role: "Customer" });
      toast("Staff member demoted to Customer.", "success");
      loadStaffUsers();
    } catch (err) {
      console.error(err);
      toast("Failed to demote staff member.", "error");
      setLoading(false);
    }
  };

  const filteredStaff = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (ROLE_LABELS[u.role] ?? u.role).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-zinc-800">

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-card border border-zinc-200/60 shadow-sm flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-zinc-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-mauve" /> Staff Accounts
          </h1>
          <p className="text-sm font-body text-zinc-500 mt-1">
            {profile?.role === "StaffManager" || profile?.role === "Manager"
              ? "As a Staff Manager, you can add specialist roles but cannot remove or promote to SuperAdmin."
              : "Manage staff accounts — create, assign roles, and control access across the admin panel."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="p-2 text-zinc-400 hover:text-brand-mauve border border-zinc-200 rounded-card transition-colors"
            title="Role overview"
          >
            <Info className="w-4 h-4" />
          </button>
          {canAddStaff && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-brand-mauve text-white hover:bg-brand-plum flex items-center gap-2 rounded-card"
            >
              <UserPlus className="w-4 h-4" /> Add Staff Member
            </Button>
          )}
        </div>
      </div>

      {/* Role legend (toggleable) */}
      {showLegend && (
        <div className="bg-white rounded-card border border-zinc-200/60 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role Permissions Overview</p>
            <button onClick={() => setShowLegend(false)} className="text-zinc-400 hover:text-zinc-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-zinc-50">
            {ROLE_OVERVIEW.map(({ role, modules }) => {
              const colors = ROLE_COLORS[role];
              return (
                <div key={role} className="flex items-start gap-4 px-5 py-3">
                  <span className={`${colors.bg} ${colors.text} border ${colors.border} px-2.5 py-1 rounded text-xs font-semibold shrink-0 min-w-[140px] text-center`}>
                    {ROLE_LABELS[role]}
                  </span>
                  <p className="text-xs text-zinc-600 font-body leading-relaxed pt-0.5">{modules}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative bg-white p-4 rounded-card border border-zinc-200/60 shadow-sm">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-card font-body text-sm focus:outline-none focus:border-brand-mauve focus:ring-1 focus:ring-brand-mauve bg-zinc-50/50"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-card border border-zinc-200/60 shadow-sm overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-mauve" />
            <p className="text-zinc-500 font-body text-xs">Loading staff...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-body text-sm">
            {search ? "No staff members match your search." : "No staff members added yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm font-body">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Access Modules</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredStaff.map((u) => {
                  const isSelf = profile?.uid === u.uid || profile?.email === u.email;
                  const isHigherRole = u.role === "SuperAdmin" || u.role === "Owner";
                  const canDeleteThis =
                    canDelete && !isSelf && !(profile?.role !== "SuperAdmin" && profile?.role !== "Owner" && isHigherRole);

                  return (
                    <tr key={u.uid} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-zinc-950">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-blush/20 text-brand-plum font-bold flex items-center justify-center text-xs shrink-0">
                            {(u.displayName || u.email).substring(0, 2).toUpperCase()}
                          </div>
                          <span>
                            {u.displayName || "Invited User"}
                            {isSelf && (
                              <span className="ml-1.5 text-[10px] bg-brand-blush/20 text-brand-plum px-1.5 py-0.5 rounded font-semibold">You</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-600 font-mono text-xs">{u.email}</td>
                      <td className="px-5 py-4 text-zinc-600">{u.phone || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={getRoleBadgeClass(u.role)}>{ROLE_LABELS[u.role] ?? u.role}</span>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-xs max-w-[220px] leading-relaxed">
                        {ROLE_DESCRIPTIONS[u.role] ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        {canDeleteThis ? (
                          <button
                            onClick={() => handleDemoteStaff(u)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-card transition-colors"
                            title="Demote to Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : !isSelf ? (
                          <span className="p-2 text-zinc-300 cursor-not-allowed inline-flex" title="Insufficient permissions">
                            <Lock className="w-4 h-4" />
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-lg w-full border border-zinc-200 shadow-2xl overflow-hidden animate-scale-in">
            <header className="px-6 py-4 bg-zinc-50 border-b border-zinc-150 flex justify-between items-center">
              <h3 className="font-display font-semibold text-lg text-zinc-900 flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-brand-mauve" /> Add Staff Member
              </h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-1 hover:bg-zinc-200 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </header>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4 font-body text-sm">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Dilini Rajapaksa" />
                <Input label="Phone (Optional)" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="e.g., 0771234567" />
              </div>

              <Input label="Email Address" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="e.g., staff@example.com" />

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Password <span className="text-zinc-400 font-normal">(leave blank to send invitation)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Set a secure login password..."
                    className="w-full px-3 py-2.5 pr-10 border border-zinc-200 rounded-card text-sm focus:outline-none focus:border-brand-mauve focus:ring-1 focus:ring-brand-mauve bg-white"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && newPassword.length < 6 && <p className="text-xs text-red-500">Password must be at least 6 characters.</p>}
              </div>

              {/* Role selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Assign Role
                  {(profile?.role === "StaffManager" || profile?.role === "Manager") && (
                    <span className="ml-2 text-amber-600 font-normal text-[11px]">(Staff Managers cannot assign SuperAdmin or StaffManager)</span>
                  )}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserProfile["role"])}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-card focus:outline-none focus:border-brand-mauve bg-white h-[42px]"
                >
                  {assignableRoles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]} — {ROLE_DESCRIPTIONS[r] ?? ""}
                    </option>
                  ))}
                </select>

                {/* Role description preview */}
                {newRole && ROLE_DESCRIPTIONS[newRole] && (
                  <div className={`mt-1 p-2.5 rounded-card text-xs border ${ROLE_COLORS[newRole]?.bg ?? "bg-zinc-50"} ${ROLE_COLORS[newRole]?.border ?? "border-zinc-200"} ${ROLE_COLORS[newRole]?.text ?? "text-zinc-700"}`}>
                    <strong>{ROLE_LABELS[newRole]}:</strong> {ROLE_DESCRIPTIONS[newRole]}
                  </div>
                )}
              </div>

              {/* Info banner */}
              <div className={`p-3.5 rounded-card text-xs leading-relaxed border ${newPassword ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                {newPassword ? (
                  <><p className="font-bold mb-1">✅ Account created immediately</p><p>Staff can log in right away at <strong>/admin/login</strong> using their email and this password.</p></>
                ) : (
                  <><p className="font-bold mb-1">💡 Invitation mode</p><p>No Auth account is created. Staff must sign up at <strong>/register</strong> with this email to activate their role.</p></>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</Button>
                <Button type="submit" variant="primary" loading={submitting} className="bg-brand-mauve text-white hover:bg-brand-plum">
                  {newPassword ? "Create Account" : "Send Invitation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
