"use client";

import DashboardView from "@/components/shared/DashboardView";
import { PORTAL_CONFIG } from "@/lib/portals";

const DASHBOARD_SIDEBAR = {
  todo: (
    <>
      <h2 className="text-lg font-semibold text-white mb-2">To-do</h2>
      <p className="text-slate-400 text-sm">No tasks have been assigned.</p>
    </>
  ),
};

/**
 * Shared dashboard page for student and TA (simple case).
 * Faculty dashboard uses custom content and stays in faculty/dashboard/page.jsx.
 */
export default function PortalDashboardPage({ variant }) {
  const config = PORTAL_CONFIG[variant];
  if (!config?.dashboard) return null;
  const { title, showAddCourse, sidebarKey } = config.dashboard;
  const sidebar = sidebarKey ? DASHBOARD_SIDEBAR[sidebarKey] : undefined;
  return (
    <DashboardView
      title={title}
      showAddCourse={showAddCourse}
      sidebar={sidebar}
      variant={variant}
    />
  );
}
