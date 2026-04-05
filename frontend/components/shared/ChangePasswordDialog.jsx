"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Dialog from "@/components/Dialog";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/apiBase";

export default function ChangePasswordDialog({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); };
  }, []);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleUpdate = async () => {
    setError("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const userRes = await fetch(`${API_BASE}/api/users/${user.id}`);
      const userData = await userRes.json();

      if (userData.passwordHash !== currentPassword) {
        setError("Current password is incorrect.");
        setLoading(false);
        return;
      }

      const updateRes = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          passwordHash: newPassword,
        }),
      });

      if (!updateRes.ok) throw new Error("Update failed");

      onSuccess?.();
      handleClose();
      setShowToast(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputWrapClass = "relative";
  const inputClass = "w-full px-4 py-2.5 pr-10 rounded-lg bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-transparent";
  const eyeBtnClass = "absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors";

  return (
      <>
        <Dialog isOpen={isOpen} onClose={handleClose} title="Change Password">
          <div className="space-y-4 mb-2">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-zinc-300 mb-1.5">Current Password</label>
              <div className={inputWrapClass}>
                <input id="current-password" type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className={inputClass} />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className={eyeBtnClass} tabIndex={-1}>
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
              <div className={inputWrapClass}>
                <input id="new-password" type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" className={inputClass} />
                <button type="button" onClick={() => setShowNew((v) => !v)} className={eyeBtnClass} tabIndex={-1}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
              <div className={inputWrapClass}>
                <input id="confirm-new-password" type={showConfirm ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" className={inputClass} />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className={eyeBtnClass} tabIndex={-1}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-zinc-300 hover:text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleUpdate} disabled={loading} className="px-4 py-2 text-white font-medium rounded-lg transition-colors hover:opacity-90 disabled:opacity-50" style={{ background: "#7C1D2E" }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </Dialog>

        {showToast && (
            <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-lg bg-zinc-700 text-white shadow-lg border border-zinc-600">
              Password updated successfully
            </div>
        )}
      </>
  );
}
