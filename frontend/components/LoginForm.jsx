"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, Eye, EyeOff, Check, GraduationCap, User, UserCog } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cwid, setCwid] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");

  const isStudent = selectedRole === "student";
  const isTa = selectedRole === "ta";
  const Icon = isStudent ? GraduationCap : isTa ? UserCog : BookOpen;
  const theme = isStudent ? "orange" : isTa ? "violet" : "teal";
  const focusRing = theme === "orange" ? "focus:ring-orange-500" : theme === "violet" ? "focus:ring-violet-500" : "focus:ring-teal-500";
  const linkClass = theme === "orange" ? "text-orange-400 hover:text-orange-300" : theme === "violet" ? "text-violet-400 hover:text-violet-300" : "text-teal-400 hover:text-teal-300";
  const buttonClass = theme === "orange"
    ? "from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-600/30"
    : theme === "violet"
      ? "from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-violet-600/30"
      : "from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-teal-600/30";
  const glowClass = theme === "orange" ? "from-orange-600 to-orange-400" : theme === "violet" ? "from-violet-600 to-violet-400" : "from-teal-600 to-teal-400";
  const logoClass = theme === "orange" ? "from-orange-600 to-orange-500 shadow-orange-600/30" : theme === "violet" ? "from-violet-600 to-violet-500 shadow-violet-600/30" : "from-teal-600 to-teal-500 shadow-teal-600/30";
  const portalTitle = isStudent ? "Student Portal" : isTa ? "TA Portal" : "Faculty Portal";
  const checkboxClass = theme === "orange" ? "peer-checked:bg-orange-600 peer-checked:border-orange-600" : theme === "violet" ? "peer-checked:bg-violet-600 peer-checked:border-violet-600" : "peer-checked:bg-teal-600 peer-checked:border-teal-600";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cwid,
          firstName,
          lastName,
          email,
          password,
          role: isStudent ? "STUDENT" : isTa ? "TA" : "FACULTY"
        })
      });
      setIsSignUp(false);
      return;
    }

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
      cwid: data.cwid,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    });

    // Route based on role from backend
    const role = data.role?.toUpperCase();
    if (role === "STUDENT") {
      router.push("/students/dashboard");
    } else if (role === "TA") {
      router.push("/ta/dashboard");
    } else if (role === "FACULTY") {
      router.push("/faculty/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className={`absolute -inset-1 bg-linear-to-r rounded-2xl blur opacity-20 ${glowClass}`} />
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br shadow-lg mb-4 ${logoClass}`}>
              <Icon className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">CodeHawk</h1>
            <p className="text-slate-400 mt-2">
              {isSignUp ? "Create an account to get started" : "Sign in to continue to CodeHawk"}
            </p>
          </div>

          {/* Role selector - only shown on sign up */}
          {isSignUp && (
            <div className="flex gap-2 mb-6">
              {["student", "faculty", "ta"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                    selectedRole === role
                      ? "border-violet-500 bg-violet-600/20 text-white"
                      : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                  }`}
                >
                  {role === "ta" ? "TA" : role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">CWID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    placeholder="Campus-Wide ID"
                    onChange={(e) => setCwid(e.target.value)}
                    className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${focusRing}`}
                  />
                </div>
                <label className="text-sm font-medium text-slate-300 block">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${focusRing}`}
                  />
                </div>
                <label className="text-sm font-medium text-slate-300 block">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${focusRing}`}
                  />
                </div>
              </div>
            )}

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
                  className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${focusRing}`}
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
                  className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${focusRing}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${focusRing}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="peer sr-only" />
                    <div className={`w-5 h-5 border-2 border-slate-600 rounded-md bg-slate-800/50 transition-all duration-200 ${checkboxClass}`} />
                    <Check className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                </label>
                <a href="#" className={`text-sm transition-colors ${linkClass}`}>Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-4 text-base font-semibold text-white bg-linear-to-r rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${buttonClass}`}
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-8">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => setIsSignUp(false)} className={`font-medium transition-colors hover:underline focus:outline-none ${linkClass}`}>
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setIsSignUp(true)} className={`font-medium transition-colors hover:underline focus:outline-none ${linkClass}`}>
                  Create account
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}