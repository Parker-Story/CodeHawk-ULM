"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/apiBase";

export default function AccountView({
                                      displayName,
                                      subtitle,
                                      academicInfo = {},
                                      onEditProfile,
                                    }) {
  const { user } = useAuth();
  const { institution = "", cwid, email = "" } = academicInfo;
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fetchedPassword, setFetchedPassword] = useState(null);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleTogglePassword = async () => {
    if (showPassword) {
      setShowPassword(false);
      return;
    }
    if (fetchedPassword !== null) {
      setShowPassword(true);
      return;
    }
    setLoadingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id}`);
      const data = await res.json();
      setFetchedPassword(data.passwordHash ?? "");
      setShowPassword(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPassword(false);
    }
  };

  // When password is changed, clear cached value so it re-fetches next time
  const handlePasswordChanged = () => {
    setFetchedPassword(null);
    setShowPassword(false);
  };

  return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">{displayName}</h1>
          {subtitle != null && subtitle !== "" && (
              <p className="text-zinc-400 mb-8">{subtitle}</p>
          )}
          {subtitle == null || subtitle === "" ? <div className="mb-8" /> : null}

          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
              <button
                  type="button"
                  onClick={() => onEditProfile?.()}
                  className="text-white font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                  style={{ background: "#7C1D2E" }}
              >
                Edit Profile
              </button>
            </div>
          </section>

          <section className="mb-8 rounded-xl bg-zinc-900 border border-zinc-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Academic Info</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-zinc-400">Institution</dt>
                <dd className="mt-1 text-white">{institution}</dd>
              </div>
              {cwid !== undefined && (
                  <div>
                    <dt className="text-sm font-medium text-zinc-400">CWID</dt>
                    <dd className="mt-1 text-white font-mono">{cwid}</dd>
                  </div>
              )}
              <div>
                <dt className="text-sm font-medium text-zinc-400">Email</dt>
                <dd className="mt-1 text-white">{email}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl bg-zinc-900 border border-zinc-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Security</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-zinc-300">Password</span>
                <span className="font-mono text-zinc-300 text-sm tracking-widest min-w-[8ch]">
                  {showPassword && fetchedPassword !== null ? fetchedPassword : "••••••••"}
                </span>
                <button
                    type="button"
                    onClick={handleTogglePassword}
                    disabled={loadingPassword}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 shrink-0"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                  type="button"
                  onClick={() => setChangePasswordOpen(true)}
                  className="text-white font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                  style={{ background: "#7C1D2E" }}
              >
                Change Password
              </button>
            </div>
          </section>
        </div>

        <ChangePasswordDialog
            isOpen={changePasswordOpen}
            onClose={() => setChangePasswordOpen(false)}
            onSuccess={handlePasswordChanged}
        />
      </div>
  );
}
