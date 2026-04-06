"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/apiBase";

export default function TACourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const crn = params.id;
    const [classItem, setClassItem] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/course/${crn}`)
            .then((res) => {
                if (!res.ok) throw new Error("Course not found");
                return res.json();
            })
            .then((data) => {
                setClassItem({ ...data, days: data.days ? data.days.split(",") : [] });
                setLoading(false);
            })
            .catch((err) => { console.error(err); setLoading(false); });
    }, [crn]);

    useEffect(() => {
        fetch(`${API_BASE}/assignment/course/${crn}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch assignments");
                return res.json();
            })
            .then((data) => setAssignments(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error loading assignments:", err));
    }, [crn]);

    const handleSelectAssignment = (assignment) => {
        router.push(`/ta/courses/${crn}/assignments/${assignment.id}`);
    };

    if (loading) {
        return <div className="p-8"><p className="text-zinc-500 dark:text-zinc-400">Loading...</p></div>;
    }

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                <Link
                    href="/ta/dashboard"
                    className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {!classItem ? (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6">
                        <p className="text-zinc-500 dark:text-zinc-400">Course not found.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 mb-8 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "#C9A84C22" }}>
                                    <BookOpen className="w-8 h-8" style={{ color: "#C9A84C" }} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{classItem.courseName}</h1>
                                        <span
                                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                                            style={{ color: "#C9A84C", background: "#C9A84C22" }}
                                        >
                      TA
                    </span>
                                    </div>
                                    <p className="font-medium mt-1" style={{ color: "#C9A84C" }}>{classItem.courseAbbreviation}</p>
                                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                                        <span className="text-zinc-700 dark:text-zinc-300"><span className="text-zinc-500">CRN:</span> {classItem.crn}</span>
                                        <span className="text-zinc-700 dark:text-zinc-300"><span className="text-zinc-500">Semester:</span> {classItem.semester?.charAt(0).toUpperCase() + classItem.semester?.slice(1)} {classItem.year}</span>
                                    </div>
                                </div>
                            </div>
                            {classItem.courseDescription && (
                                <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm">{classItem.courseDescription}</p>
                            )}
                        </div>

                        <section>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Assignments</h2>
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-700/50 shadow-sm">
                                {assignments.length === 0 ? (
                                    <p className="text-zinc-500 dark:text-zinc-400 p-4">No assignments yet.</p>
                                ) : (
                                    assignments.map((a) => (
                                        <button
                                            key={a.id}
                                            type="button"
                                            onClick={() => handleSelectAssignment(a)}
                                            className="flex items-center gap-4 p-4 w-full text-left text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors rounded-lg"
                                        >
                                            <FileText className="w-5 h-5 shrink-0" style={{ color: "#C9A84C" }} />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-zinc-900 dark:text-white">{a.title}</p>
                                                {a.description && (
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{a.description}</p>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}