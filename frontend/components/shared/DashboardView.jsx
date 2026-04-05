"use client";

import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import EnrollCourseDialog from "@/components/students/EnrollCourseDialog";

export default function DashboardView({ title, showAddCourse = false, sidebar, variant = "student", onAddCourseClick, children }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleAddCourseClick = () => {
        if (variant === "student") setDialogOpen(true);
        else onAddCourseClick?.();
    };

    const handleJoinCourse = () => {
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
                            className="ml-auto text-white font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                            style={{ background: "#7C1D2E" }}
                        >
                            Add course
                        </button>
                    ) : null
                }
                sidebar={sidebar}
            >
                {children ?? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <p className="text-zinc-400">Welcome to your dashboard.</p>
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