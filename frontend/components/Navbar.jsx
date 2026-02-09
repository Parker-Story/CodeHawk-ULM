"use client";

import Link from "next/link";

export default function Navbar({ variant = "student" }) {
  const isStudent = variant === "student";

  return (
    <nav className={`shadow-lg ${isStudent ? "bg-orange-600 shadow-orange-900/50" : "bg-teal-600 shadow-teal-900/50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link
            href={isStudent ? "/students" : "/faculty"}
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-bold text-white tracking-tight">
              CodeHawk
            </span>
            <span className="text-xs font-medium text-white/70 bg-white/10 px-2 py-0.5 rounded">
              {isStudent ? "Student" : "Faculty"}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
