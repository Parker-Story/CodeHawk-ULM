"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, X } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/apiBase";

export default function TACourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const crn = params.id;
    const [classItem, setClassItem] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [openSolution, setOpenSolution] = useState(null);
    const [scoreInputs, setScoreInputs] = useState({});
    const [savingScore, setSavingScore] = useState({});

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
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
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

    const handleSelectAssignment = async (assignment) => {
        setSelectedAssignment(assignment);
        setLoadingSubmissions(true);
        try {
            const res = await fetch(`${API_BASE}/submission/assignment/${assignment.id}`);
            if (!res.ok) throw new Error("Failed to fetch submissions");
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setSubmissions(list);
            const inputs = {};
            list.forEach((s) => {
                inputs[s.submissionId.userId] = s.score ?? "";
            });
            setScoreInputs(inputs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleScoreSave = async (userId) => {
        const score = scoreInputs[userId];
        if (score === "" || score === null || score === undefined) return;
        setSavingScore((prev) => ({ ...prev, [userId]: true }));
        try {
            const response = await fetch(`${API_BASE}/submission/score/${selectedAssignment.id}/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score: parseInt(score) }),
            });
            if (!response.ok) throw new Error("Failed to save score");
            const updated = await response.json();
            setSubmissions((prev) =>
                prev.map((s) => (s.submissionId.userId === userId ? updated : s))
            );
        } catch (error) {
            console.error("Error saving score:", error);
        } finally {
            setSavingScore((prev) => ({ ...prev, [userId]: false }));
        }
    };

    if (loading) {
        return <div className="p-8"><p className="text-slate-400">Loading...</p></div>;
    }

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                <Link
                    href="/ta/dashboard"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {!classItem ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <p className="text-slate-400">Course not found.</p>
                    </div>
                ) : (
                    <>
                        {/* Course Header */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="shrink-0 w-16 h-16 bg-violet-600/20 rounded-xl flex items-center justify-center">
                                    <BookOpen className="w-8 h-8 text-violet-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-white">{classItem.courseName}</h1>
                                        <span className="text-xs font-medium text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full">TA</span>
                                    </div>
                                    <p className="text-violet-400 font-medium mt-1">{classItem.courseAbbreviation}</p>
                                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <span className="text-slate-300">
                      <span className="text-slate-500">CRN:</span> {classItem.crn}
                    </span>
                                        <span className="text-slate-300">
                      <span className="text-slate-500">Semester:</span> {classItem.semester?.charAt(0).toUpperCase() + classItem.semester?.slice(1)} {classItem.year}
                    </span>
                                    </div>
                                </div>
                            </div>
                            {classItem.courseDescription && (
                                <p className="mt-4 text-slate-400 text-sm">{classItem.courseDescription}</p>
                            )}
                        </div>

                        {/* Assignments */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section>
                                <h2 className="text-lg font-semibold text-white mb-4">Assignments</h2>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl divide-y divide-slate-700/50">
                                    {assignments.length === 0 ? (
                                        <p className="text-slate-400 p-4">No assignments yet.</p>
                                    ) : (
                                        assignments.map((a) => (
                                            <button
                                                key={a.id}
                                                type="button"
                                                onClick={() => handleSelectAssignment(a)}
                                                className={`flex items-center gap-4 p-4 w-full text-left transition-colors rounded-lg ${
                                                    selectedAssignment?.id === a.id
                                                        ? "bg-violet-600/10 text-white"
                                                        : "text-slate-300 hover:bg-slate-700/30"
                                                }`}
                                            >
                                                <FileText className={`w-5 h-5 shrink-0 ${selectedAssignment?.id === a.id ? "text-violet-400" : "text-violet-400"}`} />
                                                <p className="font-medium">{a.title}</p>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </section>

                            {/* Submissions */}
                            <section>
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    {selectedAssignment ? `Submissions — ${selectedAssignment.title}` : "Submissions"}
                                </h2>
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                    {!selectedAssignment ? (
                                        <p className="text-slate-400 p-4 text-sm">Select an assignment to view submissions.</p>
                                    ) : loadingSubmissions ? (
                                        <p className="text-slate-400 p-4 text-sm">Loading submissions...</p>
                                    ) : submissions.length === 0 ? (
                                        <p className="text-slate-400 p-4 text-sm">No submissions yet.</p>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead>
                                            <tr className="bg-slate-700/50 border-b border-slate-700">
                                                <th className="text-left py-3 px-4 font-semibold text-white">Student</th>
                                                <th className="text-left py-3 px-4 font-semibold text-white">Score</th>
                                                <th className="text-left py-3 px-4 font-semibold text-white">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {submissions.map((s) => {
                                                const userId = s.submissionId.userId;
                                                return (
                                                    <tr key={userId} className="border-b border-slate-700/50 last:border-0">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 bg-violet-600/20 rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-violet-400 text-xs font-medium">
                                      {s.user?.firstName?.charAt(0)}{s.user?.lastName?.charAt(0)}
                                    </span>
                                                                </div>
                                                                <span className="text-slate-300">{s.user?.firstName} {s.user?.lastName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={scoreInputs[userId] ?? ""}
                                                                    onChange={(e) => setScoreInputs((prev) => ({ ...prev, [userId]: e.target.value }))}
                                                                    placeholder="—"
                                                                    className="w-16 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleScoreSave(userId)}
                                                                    disabled={savingScore[userId]}
                                                                    className="px-3 py-1 text-xs font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50"
                                                                >
                                                                    {savingScore[userId] ? "Saving..." : "Save"}
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => setOpenSolution(s)}
                                                                className="text-violet-400 hover:text-violet-300 font-medium text-sm"
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </div>

            {/* Solution Viewer Modal */}
            {openSolution && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700 shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-white">{openSolution.fileName}</h2>
                                <p className="text-slate-400 text-sm">{openSolution.user?.firstName} {openSolution.user?.lastName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpenSolution(null)}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-auto flex-1">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-800/50 rounded-xl p-4">
                {openSolution.fileContent
                    ? atob(openSolution.fileContent)
                    : "No file content available."}
              </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}