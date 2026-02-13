"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Mail, Lock, Eye, EyeOff, Check, GraduationCap, User } from "lucide-react";

export default function LoginForm({ variant = "student" }) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isStudent = variant === "student";
  const Icon = isStudent ? GraduationCap : BookOpen;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Handle sign up logic here if needed
      // Switch back to login form after account creation
      setIsSignUp(false);
      return;
    }

    // Call backend API for login
    await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password
      })
    });

    // Navigate based on variant
    if (isStudent) {
      router.push("/students");
    } else {
      router.push("/faculty");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glow effect behind card */}
        <div className={`absolute -inset-1 bg-linear-to-r rounded-2xl blur opacity-20 ${isStudent ? "from-orange-600 to-orange-400" : "from-teal-600 to-teal-400"}`} />
        
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br shadow-lg mb-4 ${isStudent ? "from-orange-600 to-orange-500 shadow-orange-600/30" : "from-teal-600 to-teal-500 shadow-teal-600/30"}`}>
              <Icon className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isStudent ? "Student Portal" : "Faculty Portal"}
            </h1>
            <p className="text-slate-400 mt-2">
              {isSignUp ? "Create an account to get started" : "Sign in to continue to CodeHawk"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignUp && (
              /* Name Field (sign up only) */
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${isStudent ? "focus:ring-orange-500" : "focus:ring-teal-500"}`}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${isStudent ? "focus:ring-orange-500" : "focus:ring-teal-500"}`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${isStudent ? "focus:ring-orange-500" : "focus:ring-teal-500"}`}
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
              /* Confirm Password (sign up only) */
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${isStudent ? "focus:ring-orange-500" : "focus:ring-teal-500"}`}
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
              /* Remember Me & Forgot Password (login only) */
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <div className={`w-5 h-5 border-2 border-slate-600 rounded-md bg-slate-800/50 transition-all duration-200 ${isStudent ? "peer-checked:bg-orange-600 peer-checked:border-orange-600" : "peer-checked:bg-teal-600 peer-checked:border-teal-600"}`} />
                    <Check 
                      className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                      strokeWidth={2.5} 
                    />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className={`text-sm transition-colors ${isStudent ? "text-orange-400 hover:text-orange-300" : "text-teal-400 hover:text-teal-300"}`}
                >
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-4 text-base font-semibold text-white bg-linear-to-r rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${isStudent ? "from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-600/30" : "from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-teal-600/30"}`}
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle Login / Sign Up */}
          <p className="text-center text-slate-400 mt-8">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`font-medium transition-colors hover:underline focus:outline-none ${isStudent ? "text-orange-400 hover:text-orange-300" : "text-teal-400 hover:text-teal-300"}`}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`font-medium transition-colors hover:underline focus:outline-none ${isStudent ? "text-orange-400 hover:text-orange-300" : "text-teal-400 hover:text-teal-300"}`}
                >
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
