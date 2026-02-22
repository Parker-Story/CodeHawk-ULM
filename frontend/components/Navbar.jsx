"use client";

import Link from "next/link";

export default function Navbar({ variant = "student", onMenuClick }) {
  const isStudent = variant === "student";
  const showHamburger = isStudent && typeof onMenuClick === "function";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 shadow-lg ${isStudent ? "bg-orange-600 shadow-orange-900/50" : "bg-teal-600 shadow-teal-900/50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {showHamburger && (
            <button
              type="button"
              onClick={onMenuClick}
              className="p-2 -ml-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Toggle sidebar menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <Link
            href={isStudent ? "/students" : "/faculty"}
            className="flex items-center gap-2 ml-2"
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
