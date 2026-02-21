"use client";

/**
 * Shared dashboard layout for students and faculty.
 * Same design: main content area with optional header action + optional sidebar.
 */
export default function DashboardLayout({ title, headerAction, sidebar, children }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] p-8 gap-10">
      <div className="flex-1 min-w-0 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {headerAction}
        </div>
        {children}
      </div>
      {sidebar != null && (
        <aside className="w-72 shrink-0 pl-6 border-l border-slate-700/50">
          {sidebar}
        </aside>
      )}
    </div>
  );
}
