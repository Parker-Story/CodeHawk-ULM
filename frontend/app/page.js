"use client";

import { useState } from "react";
import { X, BookOpen, Building2 } from "lucide-react";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Code<span className="text-violet-400">Hawk</span>
        </h1>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="px-5 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-500 transition-colors duration-200 shadow-lg shadow-violet-600/30"
        >
          Login
        </button>
      </nav>

      {/* Main content */}
      <main className="flex items-center justify-center h-[calc(100vh-73px)]">
        <h1 className="text-4xl font-bold text-white/80">Hello World</h1>
      </main>

      {/* Login Role Selection Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDialogOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-xl p-10 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl shadow-violet-900/20">
            {/* Close button */}
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-3 text-center">Login as</h2>
            <p className="text-slate-400 mb-8 text-center">Select your role to continue</p>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedRole("student")}
                className={`flex flex-col items-center gap-4 p-6 bg-slate-900 border-2 rounded-xl cursor-pointer transition-all group ${
                  selectedRole === "student"
                    ? "border-cyan-500 bg-slate-800"
                    : "border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800"
                }`}
              >
                <div className={`w-16 h-16 flex items-center justify-center rounded-xl transition-colors ${
                  selectedRole === "student" ? "bg-cyan-600/40" : "bg-cyan-600/20 group-hover:bg-cyan-600/30"
                }`}>
                  <BookOpen className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-white text-lg">Student</h3>
                  <p className="text-sm text-slate-400 mt-1">Access your courses & assignments</p>
                </div>
              </div>

              <div
                onClick={() => setSelectedRole("faculty")}
                className={`flex flex-col items-center gap-4 p-6 bg-slate-900 border-2 rounded-xl cursor-pointer transition-all group ${
                  selectedRole === "faculty"
                    ? "border-amber-500 bg-slate-800"
                    : "border-slate-700 hover:border-amber-500/50 hover:bg-slate-800"
                }`}
              >
                <div className={`w-16 h-16 flex items-center justify-center rounded-xl transition-colors ${
                  selectedRole === "faculty" ? "bg-amber-600/40" : "bg-amber-600/20 group-hover:bg-amber-600/30"
                }`}>
                  <Building2 className="w-8 h-8 text-amber-400" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-white text-lg">Faculty</h3>
                  <p className="text-sm text-slate-400 mt-1">Manage courses & grade students</p>
                </div>
              </div>
            </div>

            <button
              disabled={!selectedRole}
              className={`w-full mt-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedRole
                  ? "text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30"
                  : "text-slate-500 bg-slate-700 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
