"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, Eye, EyeOff, Check, GraduationCap, User, ArrowLeft, AlertTriangle, X } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

const INVALID_CREDENTIALS_TITLE = "Invalid username or password";
const INVALID_CREDENTIALS_MESSAGE =
  'The entered username or password is not valid. Please try again or use the "Forgot Password". If you need further assistance, please contact the ULM IT Help Desk at (318-342-3333).';

const ULM_HELP_DESK_PHONE = "(318-342-3333)";
const ULM_HELP_DESK_TEL = "tel:+13183423333";

function DialogMessage({ text }) {
  const i = text.indexOf(ULM_HELP_DESK_PHONE);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <a
        href={ULM_HELP_DESK_TEL}
        className="font-mono text-sm font-bold tracking-tight text-yellow-600 underline-offset-2 hover:text-yellow-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-1 dark:text-yellow-400 dark:hover:text-yellow-300 dark:focus-visible:ring-offset-zinc-900"
        aria-label="Call ULM IT Help Desk at 318-342-3333"
      >
        {ULM_HELP_DESK_PHONE}
      </a>
      {text.slice(i + ULM_HELP_DESK_PHONE.length)}
    </>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [mode, setMode] = useState("login");
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cwid, setCwid] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  /** @type {{ title: string; message: string; showCreateCta: boolean } | null} */
  const [loginDialog, setLoginDialog] = useState(null);
  const [accountCreatedNotice, setAccountCreatedNotice] = useState(false);

  const isStudent = selectedRole === "student";
  const isTa = selectedRole === "ta";
  const isFaculty = selectedRole === "faculty";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginDialog(null);
    setAccountCreatedNotice(false);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setLoginDialog({
          title: "Sign-in failed",
          message: "The server returned an unexpected response. Please try again.",
          showCreateCta: false,
        });
        return;
      }
      if (!response.ok) {
        setLoginDialog({
          title: "Sign-in failed",
          message: typeof data.message === "string" ? data.message : `Something went wrong (${response.status}). Please try again.`,
          showCreateCta: false,
        });
        return;
      }

      const loginOk =
        (data.success === true || data.success === "true") &&
        data.id;

      if (loginOk) {
        setUser({
          id: data.id,
          cwid: data.cwid,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          email: data.email,
        });
        const role = data.role?.toUpperCase();
        if (role === "STUDENT") router.push("/students/dashboard");
        else if (role === "TA") router.push("/ta/dashboard");
        else if (role === "FACULTY") router.push("/faculty/dashboard");
        return;
      }

      setLoginDialog({
        title: INVALID_CREDENTIALS_TITLE,
        message: INVALID_CREDENTIALS_MESSAGE,
        showCreateCta: false,
      });
    } catch {
      setLoginDialog({
        title: "Could not reach server",
        message: "Check your internet connection and that the CodeHawk server is running, then try again.",
        showCreateCta: false,
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cwid: isFaculty ? null : cwid,
        firstName,
        lastName,
        email,
        password,
        role: isStudent ? "STUDENT" : isTa ? "TA" : "FACULTY"
      })
    });
    if (!res.ok) {
      const msg = await res.text();
      alert(msg || "Registration failed. Please try again.");
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setCwid("");
    setFirstName("");
    setLastName("");
    setSelectedRole(null);
    setMode("login");
    setAccountCreatedNotice(true);
  };

  const inputClass = "w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-xl py-3.5 pl-12 pr-4 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent transition-all duration-200";

  return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {loginDialog && (
              <div
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/70"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="login-error-title"
                  aria-describedby="login-error-desc"
                  onClick={() => setLoginDialog(null)}
              >
                <div
                    className="relative w-full max-w-md border border-zinc-300 bg-white text-zinc-900 shadow-lg dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                    onClick={(ev) => ev.stopPropagation()}
                >
                  <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/80">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" strokeWidth={2.5} aria-hidden />
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Sign-in error</span>
                    <button
                        type="button"
                        onClick={() => setLoginDialog(null)}
                        className="ml-auto rounded px-2 py-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
                        aria-label="Dismiss"
                    >
                      <X className="h-5 w-5" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="border-l-[3px] border-red-600 pl-3 pr-3 pb-3 pt-3 dark:border-red-500">
                    <h2 id="login-error-title" className="text-base font-bold text-zinc-900 dark:text-white">
                      {loginDialog.title}
                    </h2>
                    <p id="login-error-desc" className="mt-2 border border-zinc-200 bg-zinc-50 p-3 text-sm leading-snug text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200">
                      <DialogMessage text={loginDialog.message} />
                    </p>
                    <div className="mt-3 flex flex-col-reverse gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700 sm:flex-row sm:justify-end">
                      <button
                          type="button"
                          onClick={() => setLoginDialog(null)}
                          className="w-full border border-zinc-400 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 sm:w-auto dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      >
                        OK
                      </button>
                      {loginDialog.showCreateCta && (
                          <button
                              type="button"
                              onClick={() => {
                                setLoginDialog(null);
                                setMode("role-select");
                              }}
                              className="w-full border border-[#701E29] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 sm:w-auto"
                              style={{ background: "#862633" }}
                          >
                            Create account
                          </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
          )}
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8 shadow-2xl">

            {/* Header */}
            <div className="text-center mb-8">
              <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
                  style={{ background: "#862633" }}
              >
                <BookOpen className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Code<span style={{ color: "#C9A84C" }}>Hawk</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                {mode === "login" && "Sign in to continue to CodeHawk"}
                {mode === "role-select" && "Select your role to create an account"}
                {mode === "register" && `Create a ${isStudent ? "Student" : isTa ? "TA" : "Faculty"} account`}
              </p>
            </div>

            {/* LOGIN FORM */}
            {mode === "login" && (
                <>
                  {accountCreatedNotice && (
                      <div
                          className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-50"
                          role="status"
                      >
                        <Check className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} aria-hidden />
                        <p className="min-w-0 flex-1 text-sm font-bold">Account successfully created!!</p>
                        <button
                            type="button"
                            onClick={() => setAccountCreatedNotice(false)}
                            className="shrink-0 rounded p-1 text-emerald-700 hover:bg-emerald-200/80 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                            aria-label="Dismiss"
                        >
                          <X className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>
                  )}
                  <form className="space-y-5" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input
                          type="email"
                          placeholder="you@university.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClass}
                          required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-xl py-3.5 pl-12 pr-12 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent transition-all duration-200"
                          required
                      />
                      <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 transition-all duration-200 peer-checked:border-amber-600" />
                        <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">Remember me</span>
                    </label>
                    <a href="#" className="text-sm transition-colors" style={{ color: "#C9A84C" }}>Forgot password?</a>
                  </div>
                  <button
                      type="submit"
                      className="w-full py-4 text-base font-semibold text-white rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg"
                      style={{ background: "#862633" }}
                  >
                    Sign In
                  </button>
                  <p className="text-center text-zinc-500 dark:text-zinc-400">
                    Don&apos;t have an account?{" "}
                    <button
                        type="button"
                        onClick={() => {
                          setAccountCreatedNotice(false);
                          setMode("role-select");
                        }}
                        className="font-medium transition-colors hover:underline focus:outline-none"
                        style={{ color: "#C9A84C" }}
                    >
                      Create account
                    </button>
                  </p>
                  </form>
                </>
            )}

            {/* ROLE SELECTION */}
            {mode === "role-select" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { role: "student", label: "Student", desc: "Access courses & assignments", Icon: GraduationCap },
                      { role: "faculty", label: "Faculty", desc: "Manage courses & grade", Icon: BookOpen },
                    ].map(({ role, label, desc, Icon: RoleIcon }) => (
                        <div
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className="flex flex-col items-center gap-3 p-6 bg-zinc-50 dark:bg-zinc-800 border-2 rounded-xl cursor-pointer transition-all"
                            style={{
                              borderColor: selectedRole === role ? "#862633" : "#d4d4d8",
                            }}
                        >
                          <div
                              className="w-14 h-14 flex items-center justify-center rounded-xl bg-zinc-200 dark:bg-[#27272a]"
                              style={selectedRole === role ? { background: "#C9A84C1a" } : {}}
                          >
                            <RoleIcon className="w-7 h-7 text-zinc-500 dark:text-zinc-400" style={selectedRole === role ? { color: "#C9A84C" } : {}} />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-zinc-900 dark:text-white">{label}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                          </div>
                        </div>
                    ))}
                  </div>
                  <button
                      type="button"
                      onClick={() => setMode("register")}
                      disabled={!selectedRole}
                      className="w-full py-3 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                      style={{ background: selectedRole ? "#862633" : "#3f3f46" }}
                  >
                    Continue
                  </button>
                  <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setMode("login")} className="font-medium hover:underline focus:outline-none" style={{ color: "#C9A84C" }}>
                      Sign in
                    </button>
                  </p>
                </div>
            )}

            {/* REGISTER FORM */}
            {mode === "register" && (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <button
                      type="button"
                      onClick={() => setMode("role-select")}
                      className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to role selection
                  </button>

                  {!isFaculty && (
                      <div>
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">CWID</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                          </div>
                          <input type="text" placeholder="Campus-Wide ID" value={cwid} onChange={(e) => setCwid(e.target.value)} className={inputClass} required />
                        </div>
                      </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">First Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">Last Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-xl py-3.5 pl-12 pr-12 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent transition-all duration-200" required />
                      <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent transition-all duration-200" required />
                      <button type="button" onClick={() => setShowConfirmPassword((p) => !p)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  <button
                      type="submit"
                      className="w-full py-4 text-base font-semibold text-white rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg"
                      style={{ background: "#862633" }}
                  >
                    Create Account
                  </button>
                </form>
            )}

          </div>
        </div>
      </div>
  );
}