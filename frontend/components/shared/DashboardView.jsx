"use client";

import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import EnrollCourseDialog from "@/components/students/EnrollCourseDialog";

const primaryBtnClass = (variant) =>
  variant === "faculty"
    ? "bg-teal-600 hover:bg-teal-500"
    : variant === "ta"
      ? "bg-violet-600 hover:bg-violet-500"
      : "bg-orange-600 hover:bg-orange-500";

/**
 * Shared dashboard page for students and faculty.
 * Students get Add course button + EnrollCourseDialog; faculty use onAddCourseClick.
 * variant: "student" (orange) | "faculty" (teal)
 */
export default function DashboardView({ title, showAddCourse = false, sidebar, variant = "student", onAddCourseClick, children }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddCourseClick = () => {
    if (variant === "student") setDialogOpen(true);
    else onAddCourseClick?.();
  };

  const handleJoinCourse = () => {
    // TODO: call API to enroll with registrationCode
    setDialogOpen(false);
  };

  return (
    <>
      <DashboardLayout
        title={title}
        headerAction={
          showAddCourse ? (
            <button
              type="button"
              onClick={handleAddCourseClick}
              className={`${primaryBtnClass(variant)} text-white font-medium px-4 py-2 rounded-lg transition-colors`}
            >
              Add course
            </button>
          ) : null
        }
        sidebar={sidebar}
      >
        {children ?? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-slate-400">Welcome to your dashboard.</p>
          </div>
        )}
      </DashboardLayout>

      {variant === "student" && (
        <EnrollCourseDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onJoinCourse={handleJoinCourse}
          variant={variant}
        />
      )}
    </>
  );
}
