"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, Eye, EyeOff, Check, GraduationCap, User, UserCog, ArrowLeft } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "role-select" | "register"
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

  const theme = isStudent ? "orange" : isTa ? "violet" : "teal";
  const focusRing = theme === "orange" ? "focus:ring-orange-500" : theme === "violet" ? "focus:ring-violet-500" : "focus:ring-teal-500";
  const linkClass = theme === "orange" ? "text-orange-400 hover:text-orange-300" : theme === "violet" ? "text-violet-400 hover:text-violet-300" : "text-teal-400 hover:text-teal-300";
  const buttonClass = theme === "orange"
    ? "from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-600/30"
    : theme === "violet"
      ? "from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-violet-600/30"
      : "from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-teal-600/30";
  const glowClass = mode === "login" ? "from-violet-600 to-violet-400" : theme === "orange" ? "from-orange-600 to-orange-400" : theme === "violet" ? "from-violet-600 to-violet-400" : "from-teal-600 to-teal-400";
  const logoClass = mode === "login" ? "from-violet-600 to-violet-500 shadow-violet-600/30" : theme === "orange" ? "from-orange-600 to-orange-500 shadow-orange-600/30" : theme === "violet" ? "from-violet-600 to-violet-500 shadow-violet-600/30" : "from-teal-600 to-teal-500 shadow-teal-600/30";
  const checkboxClass = theme === "orange" ? "peer-checked:bg-orange-600 peer-checked:border-orange-600" : theme === "violet" ? "peer-checked:bg-violet-600 peer-checked:border-violet-600" : "peer-checked:bg-teal-600 peer-checked:border-teal-600";
  const Icon = mode === "login" ? BookOpen : isStudent ? GraduationCap : isTa ? UserCog : BookOpen;

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

  const inputClass = `w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${focusRing}`;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className={`absolute -inset-1 bg-linear-to-r rounded-2xl blur opacity-20 ${glowClass}`} />
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br shadow-lg mb-4 ${logoClass}`}>
              <Icon className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">CodeHawk</h1>
            <p className="text-slate-400 mt-2">
              {mode === "login" && "Sign in to continue to CodeHawk"}
              {mode === "role-select" && "Select your role to create an account"}
              {mode === "register" && `Create a ${isStudent ? "Student" : isTa ? "TA" : "Faculty"} account`}
            </p>
          </div>

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-slate-600 rounded-md bg-slate-800/50 transition-all duration-200 peer-checked:bg-violet-600 peer-checked:border-violet-600" />
                    <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                </label>
                <a href="#" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</a>
              </div>
              <button type="submit" className="w-full py-4 text-base font-semibold text-white bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-600/30">
                Sign In
              </button>
              <p className="text-center text-slate-400">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setMode("role-select")} className="text-violet-400 hover:text-violet-300 font-medium transition-colors hover:underline focus:outline-none">
                  Create account
                </button>
              </p>
            </form>
          )}

          {/* ROLE SELECTION */}
          {mode === "role-select" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { role: "student", label: "Student", desc: "Access courses & assignments", Icon: GraduationCap, color: "orange" },
                  { role: "faculty", label: "Faculty", desc: "Manage courses & grade", Icon: BookOpen, color: "teal" },
                  { role: "ta", label: "TA", desc: "Assist with grading", Icon: UserCog, color: "violet" },
                ].map(({ role, label, desc, Icon: RoleIcon, color }) => (
                  <div
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`flex flex-col items-center gap-3 p-4 bg-slate-900/80 border-2 rounded-xl cursor-pointer transition-all group ${
                      selectedRole === role
                        ? `border-${color}-500 bg-slate-800`
                        : `border-slate-700 hover:border-${color}-500/50 hover:bg-slate-800`
                    }`}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-${color}-600/20`}>
                      <RoleIcon className={`w-6 h-6 text-${color}-400`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-white text-sm">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMode("register")}
                disabled={!selectedRole}
                className={`w-full py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  selectedRole
                    ? "text-white bg-violet-600 hover:bg-violet-500"
                    : "text-slate-500 bg-slate-700 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
              <p className="text-center text-slate-400 text-sm">
                Already have an account?{" "}
                <button type="button" onClick={() => setMode("login")} className="text-violet-400 hover:text-violet-300 font-medium hover:underline focus:outline-none">
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
                className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to role selection
              </button>

              {/* CWID only for students and TAs */}
              {!isFaculty && (
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">CWID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                    </div>
                    <input type="text" placeholder="Campus-Wide ID" value={cwid} onChange={(e) => setCwid(e.target.value)} className={inputClass} required />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${focusRing}`} required />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${focusRing}`} required />
                  <button type="button" onClick={() => setShowConfirmPassword((p) => !p)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <button type="submit" className={`w-full py-4 text-base font-semibold text-white bg-linear-to-r rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${buttonClass}`}>
                Create Account
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}