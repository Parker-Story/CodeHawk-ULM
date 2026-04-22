"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import DashboardView from "@/components/shared/DashboardView";
import { PORTAL_CONFIG } from "@/lib/portals";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

export default function PortalDashboardPage({ variant }) {
    const config = PORTAL_CONFIG[variant];
    const { user } = useAuth();
    const router = useRouter();
    const [courseUsers, setCourseUsers] = useState([]);
    const [todoAssignments, setTodoAssignments] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        setCourseUsers([]);
        fetch(`${API_BASE}/courseUser/user/${user.id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch courses");
                return res.json();
            })
            .then((data) => setCourseUsers(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error loading courses:", err));
    }, [user?.id]);

    useEffect(() => {
        if (variant !== "student" || courseUsers.length === 0) return;
        Promise.all(
            courseUsers.filter((cu) => !cu.course.archived).map((cu) =>
                fetch(`${API_BASE}/assignment/course/${cu.course.crn}`)
                    .then((res) => (res.ok ? res.json() : []))
                    .then((data) =>
                        (Array.isArray(data) ? data : [])
                            .filter((a) => a.published)
                            .map((a) => ({ ...a, courseName: cu.course.courseAbbreviation }))
                    )
                    .catch(() => [])
            )
        ).then((results) => {
            const all = results.flat().filter((a) => a.dueDate);
            all.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            setTodoAssignments(all);
        });
    }, [courseUsers, variant]);

    if (!config?.dashboard) return null;
    const { title, showAddCourse, sidebarKey } = config.dashboard;

    const formatDueDate = (d) =>
        new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const isOverdue = (d) => new Date() > new Date(d);

    const sidebar = sidebarKey === "todo" ? (
        <>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">To-do</h2>
            {todoAssignments.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">No upcoming assignments.</p>
            ) : (
                <div className="space-y-2">
                    {todoAssignments.map((a) => (
                        <div
                            key={`${a.id}-${a.courseName}`}
                            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2.5"
                        >
                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{a.title}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{a.courseName}</p>
                            <p className={`text-xs font-medium mt-1 ${isOverdue(a.dueDate) ? "text-red-400" : "text-zinc-400 dark:text-zinc-500"}`}>
                                {isOverdue(a.dueDate) ? "Overdue — " : "Due "}{formatDueDate(a.dueDate)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </>
    ) : sidebarKey ? undefined : undefined;

    const handleCourseClick = (courseUser) => {
        if (courseUser.courseRole === "TA") {
            router.push(`/ta/courses/${courseUser.course.crn}`);
        } else {
            router.push(`/students/courses/${courseUser.course.crn}`);
        }
    };

    const visibleCourseUsers = courseUsers.filter((cu) => !cu.course.archived);

    const courseGrid = visibleCourseUsers.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-zinc-500 dark:text-zinc-400">No courses yet.</p>
        </div>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCourseUsers.map((courseUser) => {
                const course = courseUser.course;
                const isTA = courseUser.courseRole === "TA";
                return (
                    <div
                        key={course.crn}
                        onClick={() => handleCourseClick(courseUser)}
                        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 transition-all duration-200 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-500 shadow-sm group"
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: isTA ? "#C9A84C22" : "#C9A84C1a" }}
                            >
                                <BookOpen
                                    className="w-6 h-6"
                                    style={{ color: isTA ? "#C9A84C" : "#c0a080" }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate">{course.courseName}</h3>
                                    {isTA && (
                                        <span
                                            className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                                            style={{ color: "#C9A84C", background: "#C9A84C22" }}
                                        >
                      TA
                    </span>
                                    )}
                                </div>
                                <p
                                    className="font-medium text-sm"
                                    style={{ color: isTA ? "#C9A84C" : "#c0a080" }}
                                >
                                    {course.courseAbbreviation}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2">
                                {course.courseDescription || "No description provided."}
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            <p className="text-zinc-400 dark:text-zinc-500 text-xs">
                                {course.semester?.charAt(0).toUpperCase() + course.semester?.slice(1)} {course.year}
                                {" · "}CRN: {course.crn}
                            </p>
                        </div>
                    </div>
                );
            })}
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