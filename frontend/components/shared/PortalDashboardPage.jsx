"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import DashboardView from "@/components/shared/DashboardView";
import { PORTAL_CONFIG } from "@/lib/portals";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

const DASHBOARD_SIDEBAR = {
  todo: (
    <>
      <h2 className="text-lg font-semibold text-white mb-2">To-do</h2>
      <p className="text-slate-400 text-sm">No tasks have been assigned.</p>
    </>
  ),
};

export default function PortalDashboardPage({ variant }) {
  const config = PORTAL_CONFIG[variant];
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    setCourses([]);
    fetch(`${API_BASE}/course/user/${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading courses:", err));
  }, [user?.id]);

  if (!config?.dashboard) return null;
  const { title, showAddCourse, sidebarKey } = config.dashboard;
  const sidebar = sidebarKey ? DASHBOARD_SIDEBAR[sidebarKey] : undefined;

  const courseGrid = courses.length === 0 ? (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-slate-400">No courses yet.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div
          key={course.crn}
          onClick={() => router.push(`/students/courses/${course.crn}`)}
          className="relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{course.courseName}</h3>
              <p className="text-orange-400 font-medium text-sm">{course.courseAbbreviation}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-slate-400 text-sm line-clamp-2">
              {course.courseDescription || "No description provided."}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs">
              {course.semester?.charAt(0).toUpperCase() + course.semester?.slice(1)} {course.year}
              {" · "}CRN: {course.crn}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DashboardView
      title={title}
      showAddCourse={showAddCourse}
      sidebar={sidebar}
      variant={variant}
    >
      {courseGrid}
    </DashboardView>
  );
}