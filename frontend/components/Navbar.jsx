"use client";

import Link from "next/link";

const variantConfig = {
  student: { bg: "bg-orange-600", shadow: "shadow-orange-900/50", href: "/students", label: "Student" },
  faculty: { bg: "bg-teal-600", shadow: "shadow-teal-900/50", href: "/faculty", label: "Faculty" },
  ta: { bg: "bg-violet-600", shadow: "shadow-violet-900/50", href: "/ta", label: "TA" },
};

export default function Navbar({ variant = "student", onMenuClick }) {
  const config = variantConfig[variant] ?? variantConfig.student;
  const showHamburger = typeof onMenuClick === "function";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 shadow-lg ${config.bg} ${config.shadow}`}>
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

          <Link href={config.href} className="flex items-center gap-2 ml-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              CodeHawk
            </span>
            <span className="text-xs font-medium text-white/70 bg-white/10 px-2 py-0.5 rounded">
              {config.label}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
