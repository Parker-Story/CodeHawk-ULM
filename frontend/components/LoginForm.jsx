"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, Eye, EyeOff, Check, GraduationCap, User, ArrowLeft } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

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

  const isStudent = selectedRole === "student";
  const isTa = selectedRole === "ta";
  const isFaculty = selectedRole === "faculty";

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!data.success) {
      alert("Login failed: Incorrect email or password.");
      return;
    }
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
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    await fetch(`${API_BASE}/api/auth/register`, {
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
    setMode("login");
    setSelectedRole(null);
  };

  const inputClass = "w-full bg-zinc-800 border border-zinc-600 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent transition-all duration-200";

  return (
      <div className="min-h-screen bg-zinc-800 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="relative bg-zinc-900 rounded-2xl border border-zinc-700 p-8 shadow-2xl">

            {/* Header */}
            <div className="text-center mb-8">
              <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
                  style={{ background: "#7C1D2E" }}
              >
                <BookOpen className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Code<span style={{ color: "#C9A84C" }}>Hawk</span>
              </h1>
              <p className="text-zinc-400 mt-2">
                {mode === "login" && "Sign in to continue to CodeHawk"}
                {mode === "role-select" && "Select your role to create an account"}
                {mode === "register" && `Create a ${isStudent ? "Student" : isTa ? "TA" : "Faculty"} account`}
              </p>
            </div>

            {/* LOGIN FORM */}
            {mode === "login" && (
                <form className="space-y-5" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300 block">Email Address</label>
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
                    <label className="text-sm font-medium text-zinc-300 block">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-600 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent transition-all duration-200"
                          required
                      />
                      <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-zinc-600 rounded-md bg-zinc-800 transition-all duration-200 peer-checked:border-amber-600" style={{}} />
                        <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
                    </label>
                    <a href="#" className="text-sm transition-colors" style={{ color: "#C9A84C" }}>Forgot password?</a>
                  </div>
                  <button
                      type="submit"
                      className="w-full py-4 text-base font-semibold text-white rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg"
                      style={{ background: "#7C1D2E" }}
                  >
                    Sign In
                  </button>
                  <p className="text-center text-zinc-400">
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => setMode("role-select")} className="font-medium transition-colors hover:underline focus:outline-none" style={{ color: "#C9A84C" }}>
                      Create account
                    </button>
                  </p>
                </form>
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
                            className="flex flex-col items-center gap-3 p-6 bg-zinc-800 border-2 rounded-xl cursor-pointer transition-all"
                            style={{
                              borderColor: selectedRole === role ? "#7C1D2E" : "#3f3f46",
                            }}
                        >
                          <div
                              className="w-14 h-14 flex items-center justify-center rounded-xl"
                              style={{ background: selectedRole === role ? "#7C1D2E33" : "#27272a" }}
                          >
                            <RoleIcon className="w-7 h-7" style={{ color: selectedRole === role ? "#C9A84C" : "#71717a" }} />
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-white">{label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                          </div>
                        </div>
                    ))}
                  </div>
                  <button
                      type="button"
                      onClick={() => setMode("register")}
                      disabled={!selectedRole}
                      className="w-full py-3 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white"
                      style={{ background: selectedRole ? "#7C1D2E" : "#3f3f46" }}
                  >
                    Continue
                  </button>
                  <p className="text-center text-zinc-400 text-sm">
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
                      className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to role selection
                  </button>

                  {!isFaculty && (
                      <div>
                        <label className="text-sm font-medium text-zinc-300 block mb-1.5">CWID</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                          </div>
                          <input type="text" placeholder="Campus-Wide ID" value={cwid} onChange={(e) => setCwid(e.target.value)} className={inputClass} required />
                        </div>
                      </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-1.5">First Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-1.5">Last Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-1.5">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-800 border border-zinc-600 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/50 focus:border-transparent transition-all duration-200" required />
                      <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-1.5">Confirm Password</label>
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
                      style={{ background: "#7C1D2E" }}
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