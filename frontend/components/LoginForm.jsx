import { BookOpen, Mail, Lock, Eye, Check, GraduationCap } from "lucide-react";

export default function LoginForm({ variant = "student" }) {
  const isStudent = variant === "student";

  // Theme colors based on variant
  const theme = isStudent
    ? {
        cardGlow: "from-orange-600 to-orange-400",
        iconBg: "from-orange-600 to-orange-500",
        iconShadow: "shadow-orange-600/30",
        focusRing: "focus:ring-orange-500",
        checkboxChecked: "peer-checked:bg-orange-600 peer-checked:border-orange-600",
        link: "text-orange-400 hover:text-orange-300",
        button: "from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-600/30",
        title: "Student Portal",
      }
    : {
        cardGlow: "from-teal-600 to-teal-400",
        iconBg: "from-teal-600 to-teal-500",
        iconShadow: "shadow-teal-600/30",
        focusRing: "focus:ring-teal-500",
        checkboxChecked: "peer-checked:bg-teal-600 peer-checked:border-teal-600",
        link: "text-teal-400 hover:text-teal-300",
        button: "from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-teal-600/30",
        title: "Faculty Portal",
      };

  const Icon = isStudent ? GraduationCap : BookOpen;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glow effect behind card */}
        <div className={`absolute -inset-1 bg-linear-to-r ${theme.cardGlow} rounded-2xl blur opacity-20`} />
        
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br ${theme.iconBg} shadow-lg ${theme.iconShadow} mb-4`}>
              <Icon className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {theme.title}
            </h1>
            <p className="text-slate-400 mt-2">
              Sign in to continue to CodeHawk
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">
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
                  className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent transition-all duration-200`}
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
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent transition-all duration-200`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Eye className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                  />
                  <div className={`w-5 h-5 border-2 border-slate-600 rounded-md bg-slate-800/50 ${theme.checkboxChecked} transition-all duration-200`} />
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
                className={`text-sm ${theme.link} transition-colors`}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-4 text-base font-semibold text-white bg-linear-to-r ${theme.button} rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              Sign In
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-slate-400 mt-8">
            Don&apos;t have an account?{" "}
            <a
              href="#"
              className={`${theme.link} font-medium transition-colors`}
            >
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
