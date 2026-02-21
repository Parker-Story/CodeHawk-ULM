"use client";

import { useState, useRef, useEffect } from "react";
import Dialog from "@/components/Dialog";

const primaryBtnClass = (variant) =>
  variant === "faculty" ? "bg-teal-600 hover:bg-teal-500" : variant === "ta" ? "bg-violet-600 hover:bg-violet-500" : "bg-orange-600 hover:bg-orange-500";
const focusRingClass = (variant) =>
  variant === "faculty" ? "focus:ring-teal-500" : variant === "ta" ? "focus:ring-violet-500" : "focus:ring-orange-500";

export default function ChangePasswordDialog({ isOpen, onClose, variant = "student", onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
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

  return (
    <>
      <Dialog isOpen={isOpen} onClose={handleClose} title="Change Password">
        <div className="space-y-4 mb-6">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${focusRingClass(variant)} focus:border-transparent`}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${focusRingClass(variant)} focus:border-transparent`}
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${focusRingClass(variant)} focus:border-transparent`}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-slate-300 hover:text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className={`px-4 py-2 ${primaryBtnClass(variant)} text-white font-medium rounded-lg transition-colors`}
          >
            Update Password
          </button>
        </div>
      </Dialog>

      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 px-4 py-3 rounded-lg bg-slate-700 text-white shadow-lg border border-slate-600"
        >
          Password updated
        </div>
      )}
    </>
  );
}
