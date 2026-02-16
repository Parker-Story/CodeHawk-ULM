"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen } from "lucide-react";
import Dialog from "@/components/Dialog";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const router = useRouter();

  const handleContinue = () => {
    if (selectedRole === "student") {
      router.push("/students/login");
    } else if (selectedRole === "faculty") {
      router.push("/faculty/login");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
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

      <main className="flex items-center justify-center h-[calc(100vh-73px)]">
        <h1 className="text-4xl font-bold text-white/80">Hello World</h1>
      </main>

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} size="lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Login as</h2>
          <p className="text-slate-400">Select your role to continue</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setSelectedRole("student")}
            className={`flex flex-col items-center gap-4 p-6 bg-slate-900/80 border-2 rounded-xl cursor-pointer transition-all group ${
              selectedRole === "student"
                ? "border-orange-500 bg-slate-800"
                : "border-slate-700 hover:border-orange-500/50 hover:bg-slate-800"
            }`}
          >
            <div className={`w-16 h-16 flex items-center justify-center rounded-xl transition-colors ${
              selectedRole === "student" ? "bg-orange-600/40" : "bg-orange-600/20 group-hover:bg-orange-600/30"
            }`}>
              <GraduationCap className="w-8 h-8 text-orange-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-white text-lg">Student</h3>
              <p className="text-sm text-slate-400 mt-1">Access your courses & assignments</p>
            </div>
          </div>

          <div
            onClick={() => setSelectedRole("faculty")}
            className={`flex flex-col items-center gap-4 p-6 bg-slate-900/80 border-2 rounded-xl cursor-pointer transition-all group ${
              selectedRole === "faculty"
                ? "border-teal-500 bg-slate-800"
                : "border-slate-700 hover:border-teal-500/50 hover:bg-slate-800"
            }`}
          >
            <div className={`w-16 h-16 flex items-center justify-center rounded-xl transition-colors ${
              selectedRole === "faculty" ? "bg-teal-600/40" : "bg-teal-600/20 group-hover:bg-teal-600/30"
            }`}>
              <BookOpen className="w-8 h-8 text-teal-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-white text-lg">Faculty</h3>
              <p className="text-sm text-slate-400 mt-1">Manage courses & grade students</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-full mt-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            selectedRole
              ? "text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30"
              : "text-slate-500 bg-slate-700 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </Dialog>
    </div>
  );
}
