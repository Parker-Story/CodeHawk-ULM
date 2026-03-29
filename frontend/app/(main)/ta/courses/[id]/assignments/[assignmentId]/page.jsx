"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, X, ClipboardList, ChevronDown, ChevronUp, MoreVertical, CheckCircle } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import React from "react";

export default function TAGradingWorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const { id: crn, assignmentId } = params;
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openSolution, setOpenSolution] = useState(null);
    const [scoreInputs, setScoreInputs] = useState({});
    const [savingScore, setSavingScore] = useState({});
    const [rubric, setRubric] = useState(null);
    const [feedbackInputs, setFeedbackInputs] = useState({});
    const [savingFeedback, setSavingFeedback] = useState({});
    const [testResults, setTestResults] = useState([]);
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [openMenuUserId, setOpenMenuUserId] = useState(null);
    const [gradingStudent, setGradingStudent] = useState(null);
    const [rubricScores, setRubricScores] = useState({});
    const [savingRubricScore, setSavingRubricScore] = useState(false);
    const [rubricTotals, setRubricTotals] = useState({});

    useEffect(() => {
        fetch(`${API_BASE}/assignment/${assignmentId}`)
            .then((res) => res.json())
            .then((data) => setAssignment(data))
            .catch((err) => console.error(err));

        fetch(`${API_BASE}/rubric/assignment/${assignmentId}`)
            .then((res) => {
                if (!res.ok || res.status === 204) return null;
                return res.text().then((text) => text ? JSON.parse(text) : null);
            })
            .then((data) => { if (data) setRubric(data); })
            .catch((err) => console.error("Rubric fetch error:", err));

        fetch(`${API_BASE}/submission/assignment/${assignmentId}`)
            .then((res) => { if (!res.ok) throw new Error("Failed to fetch submissions"); return res.json(); })
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setSubmissions(list);
                const inputs = {};
                const feedbacks = {};
                list.forEach((s) => {
                    inputs[s.submissionId.userId] = s.score ?? "";
                    feedbacks[s.submissionId.userId] = s.feedback ?? "";
                });
                setScoreInputs(inputs);
                setFeedbackInputs(feedbacks);
                setLoading(false);
            })
            .catch((err) => { console.error(err); setLoading(false); });

        fetch(`${API_BASE}/testcase/results/assignment/${assignmentId}`)
            .then((res) => res.json())
            .then((data) => setTestResults(Array.isArray(data) ? data : []))
            .catch((err) => console.error(err));
    }, [assignmentId]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuUserId(null);
        if (openMenuUserId) document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [openMenuUserId]);

    useEffect(() => {
        if (!gradingStudent || !rubric) return;
        fetch(`${API_BASE}/rubric/scores/${assignmentId}/${gradingStudent}`)
            .then((res) => res.json())
            .then((data) => {
                const map = {};
                if (Array.isArray(data)) { data.forEach((rs) => { map[rs.rubricItem.id] = rs.awardedPoints; }); }
                (rubric.criteria || []).flatMap((c) => c.items || []).forEach((item) => {
                    if (!item.autoGrade && map[item.id] === undefined) { map[item.id] = item.maxPoints; }
                });
                setRubricScores(map);
            })
            .catch((err) => console.error(err));

        fetch(`${API_BASE}/rubric/totalscore/${assignmentId}/${gradingStudent}`)
            .then((res) => res.json())
            .then((data) => setRubricTotals((prev) => ({ ...prev, [gradingStudent]: data })))
            .catch((err) => console.error(err));
    }, [gradingStudent, rubric, assignmentId]);

    const getResultsForStudent = (userId) => testResults.filter((r) => r.submission?.submissionId?.userId === userId);

    const handleScoreSave = async (userId) => {
        const score = scoreInputs[userId];
        if (score === "" || score === null || score === undefined) return;
        setSavingScore((prev) => ({ ...prev, [userId]: true }));
        try {
            const response = await fetch(`${API_BASE}/submission/score/${assignmentId}/${userId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: parseInt(score) }),
            });
            if (!response.ok) throw new Error("Failed to save score");
            const updated = await response.json();
            setSubmissions((prev) => prev.map((s) => (s.submissionId.userId === userId ? updated : s)));
        } catch (error) { console.error("Error saving score:", error); }
        finally { setSavingScore((prev) => ({ ...prev, [userId]: false })); }
    };

    const handleSaveFeedback = async (userId) => {
        setSavingFeedback((prev) => ({ ...prev, [userId]: true }));
        try {
            await fetch(`${API_BASE}/submission/feedback/${assignmentId}/${userId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback: feedbackInputs[userId] ?? "" }),
            });
        } catch (err) { console.error(err); }
        finally { setSavingFeedback((prev) => ({ ...prev, [userId]: false })); }
    };

    const handleRubricScoreChange = (itemId, value) => { setRubricScores((prev) => ({ ...prev, [itemId]: value })); };

    const handleSaveRubricScores = async () => {
        if (!gradingStudent || !rubric) return;
        setSavingRubricScore(true);
        try {
            const items = rubric.criteria?.flatMap((c) => c.items || []) || [];
            await Promise.all(items.map(async (item) => {
                const awarded = parseFloat(rubricScores[item.id] ?? 0);
                await fetch(`${API_BASE}/rubric/scores/${assignmentId}/${gradingStudent}`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rubricItemId: item.id, awardedPoints: awarded }),
                });
            }));
            const totalRes = await fetch(`${API_BASE}/rubric/totalscore/${assignmentId}/${gradingStudent}`);
            const totalData = await totalRes.json();
            setRubricTotals((prev) => ({ ...prev, [gradingStudent]: totalData }));
            await fetch(`${API_BASE}/submission/score/${assignmentId}/${gradingStudent}`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score: totalData.percentage }),
            });
            const subRes = await fetch(`${API_BASE}/submission/assignment/${assignmentId}`);
            const subData = await subRes.json();
            const list = Array.isArray(subData) ? subData : [];
            setSubmissions(list);
            const inputs = {};
            list.forEach((s) => { inputs[s.submissionId.userId] = s.score ?? ""; });
            setScoreInputs(inputs);
            setGradingStudent(null);
        } catch (err) { console.error(err); } finally { setSavingRubricScore(false); }
    };

    if (loading) return <div className="p-8"><p className="text-zinc-400">Loading...</p></div>;

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <button type="button" onClick={() => router.push(`/ta/courses/${crn}`)} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Course
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Grading Workspace</h1>
                    <p className="text-zinc-400 text-sm mt-1">{assignment?.title} • {submissions.length} Submission{submissions.length !== 1 ? "s" : ""}</p>
                </div>

                {/* Submissions Table */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Submissions</h2>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl" style={{ minHeight: "280px" }}>
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-zinc-700/50 border-b border-zinc-700">
                                <th className="text-left py-3 px-4 font-semibold text-white">Student</th>
                                <th className="text-left py-3 px-4 font-semibold text-white">File</th>
                                <th className="text-left py-3 px-4 font-semibold text-white">Score</th>
                                <th className="text-left py-3 px-4 font-semibold text-white">Test Results</th>
                                <th className="text-left py-3 px-4 font-semibold text-white">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {submissions.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 px-4 text-center text-zinc-400">No submissions yet.</td></tr>
                            ) : (
                                submissions.map((s) => {
                                    const userId = s.submissionId.userId;
                                    const studentResults = getResultsForStudent(userId);
                                    const isExpanded = expandedStudent === userId;
                                    const rubricTotal = rubricTotals[userId];
                                    const menuOpen = openMenuUserId === userId;
                                    return (
                                        <React.Fragment key={userId}>
                                            <tr className="border-b border-zinc-700/50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#7C1D2E33" }}>
                                                            <span className="text-xs font-medium" style={{ color: "#c0a080" }}>{s.user?.firstName?.charAt(0)}{s.user?.lastName?.charAt(0)}</span>
                                                        </div>
                                                        <span className="text-zinc-300">{s.user?.firstName} {s.user?.lastName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2 text-zinc-400">
                                                        <FileText className="w-4 h-4" />
                                                        <span>{s.fileName || "Unnamed file"}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <input type="number" min="0" max="100" value={scoreInputs[userId] ?? ""} onChange={(e) => setScoreInputs((prev) => ({ ...prev, [userId]: e.target.value }))} placeholder="—" className="w-16 bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40" />
                                                        <button type="button" onClick={() => handleScoreSave(userId)} disabled={savingScore[userId]} className="px-3 py-1 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#7C1D2E" }}>
                                                            {savingScore[userId] ? "Saving..." : "Save"}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {studentResults.length > 0 ? (
                                                        <button type="button" onClick={() => setExpandedStudent(isExpanded ? null : userId)} className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
                                                            <span className={studentResults.filter(r => r.passed).length === studentResults.length ? "text-green-400" : "text-red-400"}>
                                                                {studentResults.filter(r => r.passed).length}/{studentResults.length} passed
                                                            </span>
                                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                        </button>
                                                    ) : (
                                                        <span className="text-zinc-600 text-sm">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setOpenMenuUserId(menuOpen ? null : userId); }}
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                        {menuOpen && (
                                                            <div className="absolute right-0 top-8 z-20 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                                                                <button type="button" onClick={() => { setOpenSolution(s); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-left">
                                                                    <FileText className="w-4 h-4 shrink-0" /> Open Submission
                                                                </button>
                                                                {rubric && (
                                                                    <button type="button" onClick={() => { setGradingStudent(userId); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-left">
                                                                        <ClipboardList className="w-4 h-4 shrink-0" />
                                                                        Grade Rubric
                                                                        {rubricTotal && <span className="text-zinc-500 text-xs ml-auto">({rubricTotal.awarded}/{rubricTotal.possible})</span>}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && studentResults.length > 0 && (
                                                <tr className="border-b border-zinc-700/50 bg-zinc-900/80">
                                                    <td colSpan={5} className="px-4 py-3">
                                                        <div className="space-y-2">
                                                            {studentResults.map((r) => (
                                                                <div key={r.id} className="flex items-center gap-3 text-xs">
                                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${r.passed ? "bg-green-400" : "bg-red-400"}`} />
                                                                    <span className="text-zinc-400 w-24">{r.testCase?.label || `Test ${r.testCase?.id}`}</span>
                                                                    {r.testCase?.hidden && <span className="text-zinc-500">(hidden)</span>}
                                                                    <span className="text-zinc-500">Expected: <span className="text-zinc-300 font-mono">{r.testCase?.expectedOutput}</span></span>
                                                                    <span className="text-zinc-500">Got: <span className={`font-mono ${r.passed ? "text-green-400" : "text-red-400"}`}>{r.actualOutput || "no output"}</span></span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Solution Viewer */}
            {openSolution && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-700 shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-white">{openSolution.fileName}</h2>
                                <p className="text-zinc-400 text-sm">{openSolution.user?.firstName} {openSolution.user?.lastName}{openSolution.user?.cwid ? <span className="text-zinc-500 ml-2">CWID: {openSolution.user.cwid}</span> : null}</p>
                            </div>
                            <button type="button" onClick={() => setOpenSolution(null)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-auto flex-1">
                            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-800 rounded-xl p-4">
                                {openSolution.fileContent ? atob(openSolution.fileContent) : "No file content available."}
                            </pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Rubric Grading Panel */}
            {gradingStudent && rubric && (() => {
                const gradingSubmission = submissions.find(s => s.submissionId.userId === gradingStudent);
                return (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col">

                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-zinc-700 shrink-0">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Grade Rubric</h2>
                                    <p className="text-zinc-400 text-sm mt-0.5">
                                        {gradingSubmission?.user?.firstName} {gradingSubmission?.user?.lastName}{gradingSubmission?.user?.cwid ? <span className="text-zinc-500 ml-2">CWID: {gradingSubmission.user.cwid}</span> : null} • {rubric.name}
                                    </p>
                                </div>
                                <button type="button" onClick={() => setGradingStudent(null)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex flex-1 overflow-hidden">

                                {/* Left — Submission */}
                                <div className="flex-1 flex flex-col border-r border-zinc-700 overflow-hidden">
                                    <div className="px-5 py-3 border-b border-zinc-700/50 shrink-0">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Submission</p>
                                        <p className="text-sm text-zinc-300 mt-0.5">{gradingSubmission?.fileName || "Unnamed file"}</p>
                                    </div>
                                    <div className="flex-1 overflow-auto p-5">
                                        <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-800 rounded-xl p-4 h-full">
                                            {gradingSubmission?.fileContent ? atob(gradingSubmission.fileContent) : "No file content available."}
                                        </pre>
                                    </div>
                                </div>

                                {/* Right — Rubric */}
                                <div className="w-96 flex flex-col overflow-hidden shrink-0">
                                    <div className="px-5 py-3 border-b border-zinc-700/50 shrink-0">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Rubric</p>
                                        <p className="text-sm text-zinc-300 mt-0.5">{rubric.totalPoints} total points</p>
                                    </div>
                                    <div className="flex-1 overflow-auto p-5 space-y-5">
                                        {(rubric.criteria || []).map((criteria) => (
                                            <div key={criteria.id}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-white font-semibold text-sm">{criteria.title}</p>
                                                    <p className="text-zinc-400 text-xs">
                                                        {(criteria.items || []).reduce((sum, i) => sum + (parseFloat(rubricScores[i.id]) || 0), 0).toFixed(2)} / {(criteria.items || []).reduce((sum, i) => sum + i.maxPoints, 0)} pts
                                                    </p>
                                                </div>
                                                <div className="bg-zinc-800 border border-zinc-700 rounded-xl divide-y divide-zinc-700/50">
                                                    {(criteria.items || []).map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    {item.autoGrade && <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: "#7C1D2E33", color: "#c0a080" }}>auto</span>}
                                                                    <span className="text-zinc-300 text-sm">{item.label}</span>
                                                                </div>
                                                                <p className="text-zinc-500 text-xs mt-0.5">Max: {item.maxPoints} pts</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <input type="number" min="0" max={item.maxPoints} step="0.25" value={rubricScores[item.id] ?? ""} onChange={(e) => handleRubricScoreChange(item.id, e.target.value)} placeholder="0" disabled={item.autoGrade} className="w-16 bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40 disabled:opacity-50 disabled:cursor-not-allowed" />
                                                                <span className="text-zinc-500 text-xs">/ {item.maxPoints}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Feedback */}
                                    <div className="px-5 pb-3 border-t border-zinc-700 pt-4 shrink-0">
                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Feedback</p>
                                        <textarea
                                            rows={3}
                                            value={feedbackInputs[gradingStudent] ?? ""}
                                            onChange={(e) => setFeedbackInputs((prev) => ({ ...prev, [gradingStudent]: e.target.value }))}
                                            placeholder="Leave feedback for the student..."
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm resize-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleSaveFeedback(gradingStudent)}
                                            disabled={savingFeedback[gradingStudent]}
                                            className="mt-2 w-full py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
                                            style={{ background: "#3f3f46" }}
                                        >
                                            {savingFeedback[gradingStudent] ? "Saving..." : "Save Feedback"}
                                        </button>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-5 border-t border-zinc-700 shrink-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-zinc-300 text-sm font-medium">Total Score</p>
                                            <p className="text-white font-bold">
                                                {(rubric.criteria || []).flatMap((c) => c.items || []).reduce((sum, i) => sum + (parseFloat(rubricScores[i.id]) || 0), 0).toFixed(2)} / {rubric.totalPoints} pts
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => setGradingStudent(null)} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
                                            <button type="button" onClick={handleSaveRubricScores} disabled={savingRubricScore} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "#7C1D2E" }}>
                                                <CheckCircle className="w-4 h-4" />
                                                {savingRubricScore ? "Saving..." : "Save & Apply Score"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}