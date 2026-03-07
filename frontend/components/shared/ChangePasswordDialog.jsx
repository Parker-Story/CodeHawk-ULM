"use client";

import { useState, useRef, useEffect } from "react";
import Dialog from "@/components/Dialog";

export default function ChangePasswordDialog({ isOpen, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); };
  }, []);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleUpdate = () => {
    onSuccess?.();
    handleClose();
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 3000);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-transparent";

  return (
      <>
        <Dialog isOpen={isOpen} onClose={handleClose} title="Change Password">
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-zinc-300 mb-1.5">Current Password</label>
              <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className={inputClass} />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
              <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" className={inputClass} />
            </div>
            <div>
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
              <input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-zinc-300 hover:text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleUpdate} className="px-4 py-2 text-white font-medium rounded-lg transition-colors hover:opacity-90" style={{ background: "#7C1D2E" }}>
              Update Password
            </button>
          </div>
        </Dialog>

        {showToast && (
            <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 px-4 py-3 rounded-lg bg-zinc-700 text-white shadow-lg border border-zinc-600">
              Password updated
            </div>
        )}
      </>
  );
}