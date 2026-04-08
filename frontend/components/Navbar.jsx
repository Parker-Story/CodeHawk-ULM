"use client";

import Link from "next/link";

const variantConfig = {
  student: { href: "/students", label: "Student" },
  faculty: { href: "/faculty", label: "Faculty" },
  ta: { href: "/ta", label: "TA" },
};

export default function Navbar({ variant = "student", onMenuClick }) {
  const config = variantConfig[variant] ?? variantConfig.student;
  const showHamburger = typeof onMenuClick === "function";

  return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#862633] dark:bg-zinc-900 border-b border-[#701E29] dark:border-zinc-700 shadow-md">
        <div className="px-4 flex items-center h-16">
            {showHamburger && (
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="p-2 -ml-2 rounded-lg text-white/80 dark:text-zinc-400 hover:text-white dark:hover:text-white hover:bg-white/10 dark:hover:bg-zinc-700 focus:outline-none transition-colors"
                    aria-label="Toggle sidebar menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
            )}

            <Link href={config.href} className="flex items-center gap-3 ml-2">
            <span className="text-xl font-bold text-white tracking-tight">
              Code<span style={{ color: "#C9A84C" }}>Hawk</span>
            </span>
              <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: "#862633", color: "#F5E6C8" }}
              >
              {config.label}
            </span>
            </Link>
          </div>
      </nav>
  );
}