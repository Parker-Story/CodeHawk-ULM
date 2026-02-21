/**
 * Portal config for student, faculty, and TA.
 * Sidebar icons are Lucide icon names (string); resolved in PortalLayout.
 */
export const PORTAL_VARIANTS = ["student", "faculty", "ta"];

export const PORTAL_CONFIG = {
  student: {
    basePath: "/students",
    activeClassName: "bg-orange-600 text-white",
    ariaLabel: "Student navigation",
    sidebarItems: [
      { href: "/students/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
      { href: "/students/calendar", label: "Calendar", icon: "Calendar" },
      { href: "/students/account", label: "Account", icon: "User" },
    ],
    dashboard: {
      title: "Student Dashboard",
      showAddCourse: true,
      sidebarKey: "todo",
    },
    calendar: {
      title: "Calendar",
      events: [
        { title: "Assignment due", start: [2025, 1, 17, 14, 0], end: [2025, 1, 17, 15, 0] },
        { title: "Lab session", start: [2025, 1, 19, 10, 0], end: [2025, 1, 19, 11, 30] },
        { title: "Office hours", start: [2025, 1, 20, 9, 0], end: [2025, 1, 20, 10, 0] },
      ],
    },
    account: {
      displayName: "Jane Student",
      subtitle: "Computer Science Major",
      academicInfo: {
        institution: "University of Louisiana at Monroe",
        universityId: "8842-9912",
        email: "j.student@warhawks.ulm.edu",
      },
    },
  },
  faculty: {
    basePath: "/faculty",
    activeClassName: "bg-teal-600 text-white",
    ariaLabel: "Faculty navigation",
    sidebarItems: [
      { href: "/faculty/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
      { href: "/faculty/archived", label: "Archived", icon: "Archive" },
      { href: "/faculty/calendar", label: "Calendar", icon: "Calendar" },
      { href: "/faculty/account", label: "Account", icon: "User" },
    ],
    calendar: {
      title: "Calendar",
      events: [
        { title: "CS 402 Lecture", start: [2025, 1, 18, 10, 0], end: [2025, 1, 18, 11, 0] },
        { title: "Office hours", start: [2025, 1, 20, 14, 0], end: [2025, 1, 20, 16, 0] },
      ],
    },
    account: {
      displayName: "Dr. Jane Faculty",
      subtitle: "Computer Science",
      academicInfo: {
        institution: "University of Louisiana at Monroe",
        universityId: "8821-5500",
        email: "j.faculty@ulm.edu",
      },
    },
  },
  ta: {
    basePath: "/ta",
    activeClassName: "bg-violet-600 text-white",
    ariaLabel: "TA navigation",
    sidebarItems: [
      { href: "/ta/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
      { href: "/ta/calendar", label: "Calendar", icon: "Calendar" },
      { href: "/ta/account", label: "Account", icon: "User" },
    ],
    dashboard: {
      title: "TA Dashboard",
      showAddCourse: false,
      sidebarKey: null,
    },
    calendar: {
      title: "Calendar",
      events: [
        { title: "Office hours", start: [2025, 1, 18, 14, 0], end: [2025, 1, 18, 16, 0] },
        { title: "Grading session", start: [2025, 1, 20, 10, 0], end: [2025, 1, 20, 12, 0] },
      ],
    },
    account: {
      displayName: "Alex TA",
      subtitle: "Teaching Assistant • Computer Science",
      academicInfo: {
        institution: "University of Louisiana at Monroe",
        universityId: "8833-5544",
        email: "a.ta@warhawks.ulm.edu",
      },
    },
  },
};

/** Normalize calendar event: config uses [y,m,d,h,min], component needs Date. */
export function eventsFromConfig(events) {
  if (!events || !Array.isArray(events)) return [];
  return events.map(({ title, start: s, end: e }) => ({
    title,
    start: new Date(...s),
    end: new Date(...e),
  }));
}
