"use client";

import { BookOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFacultyClasses } from "@/contexts/FacultyClassesContext";
import Dialog from "@/components/Dialog";
import { API_BASE } from "@/lib/apiBase";

const SEMESTER_ORDER = { spring: 0, summer: 1, fall: 2 };

export default function FacultyArchivedPage() {
    const { classes, setClasses } = useFacultyClasses();
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, crn: null, className: "" });

    const archivedClasses = classes.filter((c) => c.archived);

    // Group by "Spring 2026", "Fall 2025", etc.
    const grouped = archivedClasses.reduce((acc, c) => {
        const label = `${c.semester.charAt(0).toUpperCase() + c.semester.slice(1)} ${c.year}`;
        if (!acc[label]) acc[label] = { semester: c.semester, year: c.year, courses: [] };
        acc[label].courses.push(c);
        return acc;
    }, {});

    // Sort groups: newest year first, then fall > summer > spring within same year
    const sortedGroups = Object.entries(grouped).sort(([, a], [, b]) => {
        if (b.year !== a.year) return b.year - a.year;
        return (SEMESTER_ORDER[b.semester] ?? 0) - (SEMESTER_ORDER[a.semester] ?? 0);
    });

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
                    <div className="space-y-8">
                        {sortedGroups.map(([label, { courses }]) => (
                            <div key={label}>
                                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">{label}</h2>
                                <div className="bg-zinc-900 border border-zinc-700 rounded-xl divide-y divide-zinc-700/50">
                                    {courses.map((classItem) => (
                                        <div key={classItem.crn} className="flex items-center justify-between gap-4 p-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-800">
                                                    <BookOpen className="w-5 h-5 text-zinc-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-zinc-200 font-medium truncate">{classItem.courseName}</p>
                                                    <p className="text-zinc-500 text-xs mt-0.5">
                                                        {classItem.courseAbbreviation} · CRN: {classItem.crn} · Code: {classItem.code}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setDeleteConfirm({ isOpen: true, crn: classItem.crn, className: classItem.courseName })}
                                                className="shrink-0 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
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