"use client";

import { useState } from "react";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";

const primaryBtnClass = (variant) =>
  variant === "faculty"
    ? "bg-teal-600 hover:bg-teal-500"
    : variant === "ta"
      ? "bg-violet-600 hover:bg-violet-500"
      : "bg-orange-600 hover:bg-orange-500";

/**
 * Shared account page view for students and faculty.
 * variant: "student" (orange) | "faculty" (teal)
 */
export default function AccountView({
  displayName,
  subtitle,
  academicInfo = {},
  onEditProfile,
  variant = "student",
}) {
  const { institution = "", universityId = "", email = "" } = academicInfo;
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);


  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-1">{displayName}</h1>
        {subtitle != null && subtitle !== "" && (
          <p className="text-slate-400 mb-8">{subtitle}</p>
        )}
        {subtitle == null || subtitle === "" ? <div className="mb-8" /> : null}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
            <button
              type="button"
              onClick={() => onEditProfile?.()}
              className={`${primaryBtnClass(variant)} text-white font-medium px-4 py-2 rounded-lg transition-colors`}
            >
              Edit Profile
            </button>
          </div>
        </section>

        <section className="mb-8 rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Academic Info</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-slate-400">Institution</dt>
              <dd className="mt-1 text-white">{institution}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-400">University ID</dt>
              <dd className="mt-1 text-white font-mono">{universityId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-400">Email</dt>
              <dd className="mt-1 text-white">{email}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Security</h2>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Password</span>
            <button
              type="button"
              onClick={() => setChangePasswordOpen(true)}
              className={`${primaryBtnClass(variant)} text-white font-medium px-4 py-2 rounded-lg transition-colors`}
            >
              Change Password
            </button>
          </div>
        </section>
      </div>

      <ChangePasswordDialog
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        variant={variant}
      />
    </div>
  );
}
