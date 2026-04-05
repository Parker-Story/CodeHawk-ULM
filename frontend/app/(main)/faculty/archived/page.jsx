"use client";

import { BookOpen, Trash2, ChevronDown, ChevronRight, Clock, Calendar, Users } from "lucide-react";
import { useState } from "react";
import { useFacultyClasses } from "@/contexts/FacultyClassesContext";
import Dialog from "@/components/Dialog";
import { API_BASE } from "@/lib/apiBase";

const SEMESTER_ORDER = { spring: 0, summer: 1, fall: 2 };
const DAY_LABELS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

function formatTime(time) {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDays(days) {
    if (!days || days.length === 0) return "No days set";
    return days.map((d) => DAY_LABELS[d] ?? d).join(" / ");
}

function RosterSection({ title, people, emptyText }) {
    return (
        <div>
            <div className="flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</p>
                <span className="text-xs text-zinc-600">({people.length})</span>
            </div>
            {people.length === 0 ? (
                <p className="text-zinc-600 text-sm">{emptyText}</p>
            ) : (
                <ul className="space-y-1">
                    {people.map((cu) => (
                        <li key={cu.courseUserId?.userId ?? cu.user?.id} className="text-sm text-zinc-300">
                            {cu.user?.firstName} {cu.user?.lastName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function FacultyArchivedPage() {
    const { classes, setClasses } = useFacultyClasses();
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, crn: null, className: "" });
    const [openGroups, setOpenGroups] = useState({});
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [enrollments, setEnrollments] = useState({});
    const [loadingCrn, setLoadingCrn] = useState(null);

    const archivedClasses = classes.filter((c) => c.archived);

    const grouped = archivedClasses.reduce((acc, c) => {
        const label = `${c.semester.charAt(0).toUpperCase() + c.semester.slice(1)} ${c.year}`;
        if (!acc[label]) acc[label] = { semester: c.semester, year: c.year, courses: [] };
        acc[label].courses.push(c);
        return acc;
    }, {});

    const sortedGroups = Object.entries(grouped).sort(([, a], [, b]) => {
        if (b.year !== a.year) return b.year - a.year;
        return (SEMESTER_ORDER[b.semester] ?? 0) - (SEMESTER_ORDER[a.semester] ?? 0);
    });

    const isGroupOpen = (label) => openGroups[label] ?? true;

    const toggleGroup = (label) =>
        setOpenGroups((prev) => ({ ...prev, [label]: !isGroupOpen(label) }));

    const toggleCourse = async (crn) => {
        if (expandedCourse === crn) {
            setExpandedCourse(null);
            return;
        }
        setExpandedCourse(crn);
        if (!enrollments[crn]) {
            setLoadingCrn(crn);
            try {
                const res = await fetch(`${API_BASE}/courseUser/roster/${crn}`);
                const data = await res.json();
                setEnrollments((prev) => ({ ...prev, [crn]: data }));
            } catch (err) {
                console.error(err);
                setEnrollments((prev) => ({ ...prev, [crn]: [] }));
            } finally {
                setLoadingCrn(null);
            }
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_BASE}/course/${deleteConfirm.crn}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete course");
            setClasses((prev) => prev.filter((c) => c.crn !== deleteConfirm.crn));
            setDeleteConfirm({ isOpen: false, crn: null, className: "" });
        } catch (err) { console.error(err); }
    };

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-8">Archived Classes</h1>

                {archivedClasses.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <p className="text-zinc-400">No archived classes.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sortedGroups.map(([label, { courses }]) => (
                            <div key={label}>
                                <button
                                    type="button"
                                    onClick={() => toggleGroup(label)}
                                    className="flex items-center gap-2 w-full text-left mb-3 group"
                                >
                                    {isGroupOpen(label)
                                        ? <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                                        : <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                                    }
                                    <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
                                        {label}
                                    </span>
                                    <span className="text-xs text-zinc-600 ml-1">({courses.length})</span>
                                </button>

                                {isGroupOpen(label) && (
                                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl divide-y divide-zinc-700/50">
                                        {courses.map((classItem) => {
                                            const isExpanded = expandedCourse === classItem.crn;
                                            const isLoading = loadingCrn === classItem.crn;
                                            const roster = enrollments[classItem.crn] ?? [];
                                            const students = roster.filter((cu) => cu.courseRole === "STUDENT");
                                            const tas = roster.filter((cu) => cu.courseRole === "TA");

                                            return (
                                                <div key={classItem.crn}>
                                                    <div className="flex items-center justify-between gap-4 p-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCourse(classItem.crn)}
                                                            className="flex items-center gap-3 min-w-0 flex-1 text-left"
                                                        >
                                                            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-800">
                                                                <BookOpen className="w-5 h-5 text-zinc-500" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-zinc-200 font-medium truncate">{classItem.courseName}</p>
                                                                <p className="text-zinc-500 text-xs mt-0.5">
                                                                    {classItem.courseAbbreviation} · CRN: {classItem.crn} · Code: {classItem.code}
                                                                </p>
                                                            </div>
                                                            <ChevronDown className={`shrink-0 w-4 h-4 text-zinc-500 transition-transform duration-200 mr-1 ${isExpanded ? "rotate-180" : ""}`} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, crn: classItem.crn, className: classItem.courseName }); }}
                                                            className="shrink-0 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 border-t border-zinc-700/50">
                                                            <div className="pt-4 space-y-4">
                                                                <div className="flex flex-wrap gap-6">
                                                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                                        <Calendar className="w-4 h-4 text-zinc-500" />
                                                                        <span>{formatDays(classItem.days)}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                                        <Clock className="w-4 h-4 text-zinc-500" />
                                                                        <span>
                                                                            {classItem.startTime && classItem.endTime
                                                                                ? `${formatTime(classItem.startTime)} – ${formatTime(classItem.endTime)}`
                                                                                : "No time set"}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {isLoading ? (
                                                                    <p className="text-zinc-500 text-sm">Loading roster...</p>
                                                                ) : (
                                                                    <div className="grid grid-cols-2 gap-6">
                                                                        <RosterSection title="Students" people={students} emptyText="No students" />
                                                                        <RosterSection title="TAs" people={tas} emptyText="No TAs" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, crn: null, className: "" })} title="Delete Class" size="sm">
                <div className="space-y-4">
                    <p className="text-zinc-300">
                        Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirm.className}</span>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setDeleteConfirm({ isOpen: false, crn: null, className: "" })} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
                        <button type="button" onClick={handleDelete} className="flex-1 py-3 text-sm font-medium text-white bg-red-800 rounded-xl hover:bg-red-700 transition-colors">Delete</button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
