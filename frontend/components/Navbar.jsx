"use client";

import Link from "next/link";

const navConfig = {
  faculty: {
    bgColor: "bg-teal-600",
    shadowColor: "shadow-teal-900/50",
    basePath: "/faculty",
    label: "Faculty",
  },
  student: {
    bgColor: "bg-orange-600",
    shadowColor: "shadow-orange-900/50",
    basePath: "/students",
    label: "Student",
  },
};

export default function Navbar({ variant = "student" }) {
  const config = navConfig[variant];

  return (
    <nav className={`${config.bgColor} ${config.shadowColor} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link 
            href={config.basePath} 
            className="flex items-center gap-2"
          >
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
