"use client";

import { useState, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";
import Dialog from "@/components/Dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { API_BASE } from "@/lib/apiBase";

export default function AccountView({
                                      displayName,
                                      subtitle,
                                      academicInfo = {},
                                    }) {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { institution = "", cwid, email = "" } = academicInfo;

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  const openEdit = () => {
    setEditForm({ firstName: user.firstName ?? "", lastName: user.lastName ?? "", email: user.email ?? "" });
    setEditError("");
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    setEditError("");
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      setEditError("All fields are required.");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim(),
        }),
      });
      if (!res.ok) throw new Error("Update failed");

      setUser({ ...user, firstName: editForm.firstName.trim(), lastName: editForm.lastName.trim(), email: editForm.email.trim() });
      setEditOpen(false);
      setShowToast(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setEditError("Something went wrong. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const currentDisplayName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const currentEmail = user?.email ?? email;

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1.5";
  const cardClass = "rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6";

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{currentDisplayName || displayName}</h1>
        {subtitle != null && subtitle !== "" && (
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">{subtitle}</p>
        )}
        {(subtitle == null || subtitle === "") && <div className="mb-8" />}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Edit Profile</h2>
            <button
              type="button"
              onClick={openEdit}
              className="text-white font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90"
              style={{ background: "#862633" }}
            >
              Edit Profile
            </button>
          </div>
        </section>

        <section className={`mb-8 ${cardClass}`}>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Academic Info</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Institution</dt>
              <dd className="mt-1 text-zinc-900 dark:text-white">{institution}</dd>
            </div>
            {cwid !== undefined && (
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">CWID</dt>
                <dd className="mt-1 text-zinc-900 dark:text-white font-mono">{cwid}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</dt>
              <dd className="mt-1 text-zinc-900 dark:text-white">{currentEmail}</dd>
            </div>
          </dl>
        </section>

        <section className={`mb-8 ${cardClass}`}>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Security</h2>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-300">Password</span>
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className="text-white font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90"
              style={{ background: "#862633" }}
            >
              Change Password
            </button>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Personalization</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark"
                ? <Moon className="w-4 h-4 text-zinc-400" />
                : <Sun className="w-4 h-4 text-zinc-500" />
              }
              <span className="text-zinc-600 dark:text-zinc-300">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`relative w-11 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-zinc-600" : "bg-zinc-300"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </section>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-4 mb-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              className={inputClass}
            />
          </div>
          {editError && <p className="text-sm text-red-400">{editError}</p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleEditSave} disabled={editLoading} className="px-4 py-2 text-white font-medium rounded-lg transition-colors hover:opacity-90 disabled:opacity-50" style={{ background: "#862633" }}>
            {editLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Dialog>

      <ChangePasswordDialog
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSuccess={() => {}}
      />

      {showToast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-lg border border-zinc-200 dark:border-zinc-600">
          Profile updated successfully
        </div>
      )}
    </div>
  );
}
