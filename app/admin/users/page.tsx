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
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { hasPermission, getAssignableRoles } from "@/lib/rbac";

export default function AdminStaffUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["Owner", "Manager"]}>
      <StaffUsersDashboard />
    </ProtectedRoute>
  );
}

function StaffUsersDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState<UserProfile["role"]>("Staff");

  const canAddStaff   = hasPermission(profile?.role, "addStaffMember");
  const canDelete     = hasPermission(profile?.role, "deleteStaffMember");
  const assignableRoles = getAssignableRoles(profile?.role);

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
    setNewRole("Staff");
    setShowPassword(false);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName || !newEmail) {
      toast("Please enter a name and email.", "error");
      return;
    }

    if (profile?.role === "Manager" && newRole !== "Staff") {
      toast("Managers can only add Staff-level accounts.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const emailLower = newEmail.trim().toLowerCase();

      // Check if user already exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", emailLower));
      const snap = await getDocs(q);

      if (!snap.empty) {
        // ── Existing user ── upgrade their role
        const existingDoc = snap.docs[0];
        const existingRole = existingDoc.data().role as UserProfile["role"];

        if (
          profile?.role === "Manager" &&
          existingRole !== "Customer" &&
          existingRole !== "Staff"
        ) {
          toast("You can only promote Customers to Staff.", "error");
          return;
        }

        await updateDoc(doc(db, "users", existingDoc.id), {
          role: newRole,
          displayName: newName || existingDoc.data().displayName,
          phone: newPhone || existingDoc.data().phone,
        });
        toast(`Promoted ${emailLower} to ${newRole} successfully!`, "success");
      } else if (newPassword) {
        // ── New user with password ── create via secondary auth (does NOT sign out admin)
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

        // Sign out the secondary auth session immediately — keeps admin logged in
        await signOut(secondaryAuth);

        toast(
          `✅ Staff account created! ${emailLower} can now log in at /admin/login with their password.`,
          "success"
        );
      } else {
        // ── No password provided ── create invitation placeholder
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
          `Invitation placeholder created for ${emailLower}. They must sign up at /register to activate.`,
          "success"
        );
      }

      resetForm();
      setShowAddModal(false);
      loadStaffUsers();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        toast("This email already has a Firebase Auth account. Promoting their role instead.", "error");
      } else {
        toast("Failed to add staff member: " + (err.message || "Unknown error"), "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoteStaff = async (staffUser: UserProfile) => {
    if (!canDelete) {
      toast("You do not have permission to remove staff members.", "error");
      return;
    }

    const isSelf = profile?.uid === staffUser.uid || profile?.email === staffUser.email;
    if (isSelf) {
      toast("You cannot demote your own account.", "error");
      return;
    }

    if (
      profile?.role !== "Owner" &&
      (staffUser.role === "Owner" || staffUser.role === "Manager")
    ) {
      toast("Only the Owner can demote Managers or Owners.", "error");
      return;
    }

    if (
      !confirm(
        `Remove ${staffUser.displayName || staffUser.email} from staff? Their account will be demoted to Customer.`
      )
    )
      return;

    try {
      setLoading(true);
      await updateDoc(doc(db, "users", staffUser.uid), { role: "Customer" });
      toast("Staff member demoted successfully.", "success");
      loadStaffUsers();
    } catch (err) {
      console.error(err);
      toast("Failed to demote staff member.", "error");
      setLoading(false);
    }
  };

  const roleBadge = (role: UserProfile["role"]) => {
    const map: Record<UserProfile["role"], string> = {
      Owner:    "bg-purple-50 text-purple-700 border-purple-200",
      Manager:  "bg-blue-50 text-blue-700 border-blue-200",
      Staff:    "bg-zinc-100 text-zinc-700 border-zinc-200",
      Customer: "bg-green-50 text-green-700 border-green-200",
    };
    return `px-2.5 py-1 rounded text-xs font-semibold border ${map[role]}`;
  };

  const filteredStaff = users.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
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
            {profile?.role === "Manager"
              ? "As a Manager, you can add Staff-level members only."
              : "Manage team members — create accounts with passwords so staff can log in immediately."}
          </p>
        </div>
        {canAddStaff && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-brand-mauve text-white hover:bg-brand-plum flex items-center gap-2 rounded-card"
          >
            <UserPlus className="w-4 h-4" /> Add Staff Member
          </Button>
        )}
      </div>

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
            No staff members found.
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
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredStaff.map((u) => {
                  const isSelf = profile?.uid === u.uid || profile?.email === u.email;
                  const canDeleteThis =
                    canDelete &&
                    !isSelf &&
                    !(profile?.role === "Manager" && (u.role === "Owner" || u.role === "Manager"));

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
                              <span className="ml-1.5 text-[10px] bg-brand-blush/20 text-brand-plum px-1.5 py-0.5 rounded font-semibold">
                                You
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-600 font-mono text-xs">{u.email}</td>
                      <td className="px-5 py-4 text-zinc-600">{u.phone || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={roleBadge(u.role)}>{u.role}</span>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-xs">{formatDate(u.createdAt)}</td>
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

      {/* Role permissions legend */}
      <div className="bg-white rounded-card border border-zinc-200/60 shadow-sm p-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Role Permissions Overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-body">
          {[
            { role: "Owner",   color: "purple", perms: "Full access — manage all staff, settings, and data" },
            { role: "Manager", color: "blue",   perms: "Add Staff members only — no delete access for staff/managers" },
            { role: "Staff",   color: "zinc",   perms: "Products, Categories, Orders & Messages only" },
          ].map(({ role, color, perms }) => (
            <div key={role} className={`p-3 rounded-card border border-${color}-100 bg-${color}-50/50 space-y-1`}>
              <span className={`font-bold text-${color}-700`}>{role}</span>
              <p className={`text-${color}-600/80 leading-relaxed`}>{perms}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Staff Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-card max-w-md w-full border border-zinc-200 shadow-2xl overflow-hidden animate-scale-in">
            <header className="px-6 py-4 bg-zinc-50 border-b border-zinc-150 flex justify-between items-center">
              <h3 className="font-display font-semibold text-lg text-zinc-900 flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-brand-mauve" /> Add Staff Member
              </h3>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="p-1 hover:bg-zinc-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <form onSubmit={handleAddStaff} className="p-6 space-y-4 font-body text-sm">
              <Input
                label="Full Name"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Dilini Rajapaksa"
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g., staff@example.com"
              />
              <Input
                label="Phone Number (Optional)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="e.g., 0771234567"
              />

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Password <span className="text-zinc-400 font-normal">(leave blank to send invitation instead)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Set a secure login password..."
                    className="w-full px-3 py-2.5 pr-10 border border-zinc-200 rounded-card font-body text-sm focus:outline-none focus:border-brand-mauve focus:ring-1 focus:ring-brand-mauve bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs text-red-500">Password must be at least 6 characters.</p>
                )}
              </div>

              {/* Role selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Assign Role
                  {profile?.role === "Manager" && (
                    <span className="ml-2 text-amber-600 font-normal">(Managers can only assign Staff)</span>
                  )}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserProfile["role"])}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-card focus:outline-none focus:border-brand-mauve bg-white h-[42px]"
                  disabled={profile?.role === "Manager"}
                >
                  {assignableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r === "Staff"   ? "Staff — Products, Orders, Messages"          : ""}
                      {r === "Manager" ? "Manager — Inventory, Settings, Staff adds"   : ""}
                      {r === "Owner"   ? "Owner — Full administrative access"          : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info box — changes depending on whether password is entered */}
              <div className={`p-3.5 rounded-card text-xs leading-relaxed border ${newPassword ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                {newPassword ? (
                  <>
                    <p className="font-bold mb-1">✅ Account will be created immediately</p>
                    <p>A Firebase Auth account will be created for <strong>{newEmail || "this email"}</strong>. They can log in right away at <strong>/admin/login</strong> using their email and password above — no sign-up step needed.</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold mb-1">💡 Invitation mode</p>
                    <p>No account will be created yet. A placeholder is saved. The staff member must go to <strong>/register</strong> and sign up with this email to activate their role.</p>
                  </>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  className="bg-brand-mauve text-white hover:bg-brand-plum"
                >
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
