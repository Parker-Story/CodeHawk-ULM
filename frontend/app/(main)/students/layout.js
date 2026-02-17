"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const studentSidebarItems = [
  { href: "/students/dashboard", label: "Dashboard" },
  { href: "/students/calendar", label: "Calendar" },
  { href: "/students/account", label: "Account" },
];

export default function StudentsLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar variant="student" onMenuClick={() => setSidebarOpen((o) => !o)} />
      <Sidebar
        isOpen={sidebarOpen}
        items={studentSidebarItems}
        activeClassName="bg-orange-600 text-white"
        ariaLabel="Student navigation"
        showSignOut
      />
      <main
        className={`pt-16 transition-[margin] duration-300 ${
          sidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
