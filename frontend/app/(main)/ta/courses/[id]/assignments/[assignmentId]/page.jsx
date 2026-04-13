"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, X, ClipboardList, ChevronDown, ChevronUp, MoreVertical, CheckCircle } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import React from "react";
import AiDetectionBadge from "@/components/AiDetectionBadge";  // ← new
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

function decodeBase64ToUtf8(base64) {
    if (!base64) return "";
    try {
        const binary = atob(base64);
        if (typeof TextDecoder === "undefined") return binary;
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        return new TextDecoder("utf-8").decode(bytes);
    } catch {
        try { return atob(base64); } catch { return ""; }
    }
}

function encodeUtf8ToBase64(text) {
    try {
        const bytes = new TextEncoder().encode(text || "");
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    } catch {
        return btoa(unescape(encodeURIComponent(text || "")));
    }
}

function detectLanguage(fileName = "") {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "java") return "java";
    if (ext === "py") return "python";
    return "plaintext";
}

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
    const [gradingFiles, setGradingFiles] = useState([]);
    const [activeGradingFile, setActiveGradingFile] = useState(0);
    const [solutionFiles, setSolutionFiles] = useState([]);
    const [activeSolutionFile, setActiveSolutionFile] = useState(0);
    const [testCases, setTestCases] = useState([]);

    const isFileMode = assignment?.inputMode === "FILE";

    // Open Submission execution state
    const [solutionEditMode, setSolutionEditMode] = useState(false);
    const [solutionEdits, setSolutionEdits] = useState({});
    const [solutionRunResults, setSolutionRunResults] = useState(null);
    const [solutionRunning, setSolutionRunning] = useState(false);
    const [solutionRunError, setSolutionRunError] = useState(null);
    const [solutionCustomInput, setSolutionCustomInput] = useState("");
    const [solutionCustomRunning, setSolutionCustomRunning] = useState(false);
    const [solutionCustomResult, setSolutionCustomResult] = useState(null);
    const [solutionCustomError, setSolutionCustomError] = useState(null);
    const [solutionCustomInputFile, setSolutionCustomInputFile] = useState({ inputFileName: "", inputFileContentBase64: "" });
    const [solutionRunTab, setSolutionRunTab] = useState("saved");

    // Grade Rubric execution state
    const [gradingEditMode, setGradingEditMode] = useState(false);
    const [gradingEdits, setGradingEdits] = useState({});
    const [gradingRunResults, setGradingRunResults] = useState(null);
    const [gradingRunning, setGradingRunning] = useState(false);
    const [gradingRunError, setGradingRunError] = useState(null);
    const [gradingCustomInput, setGradingCustomInput] = useState("");
    const [gradingCustomRunning, setGradingCustomRunning] = useState(false);
    const [gradingCustomResult, setGradingCustomResult] = useState(null);
    const [gradingCustomError, setGradingCustomError] = useState(null);
    const [gradingCustomInputFile, setGradingCustomInputFile] = useState({ inputFileName: "", inputFileContentBase64: "" });
    const [gradingRunTab, setGradingRunTab] = useState("saved");

    useEffect(() => {
        fetch(`${API_BASE}/assignment/${assignmentId}`)
            .then((res) => res.json())
            .then((data) => setAssignment(data))
            .catch((err) => console.error(err));

        fetch(`${API_BASE}/rubric/assignment/${assignmentId}`)
            .then((res) => { if (!res.ok || res.status === 204) return null; return res.text().then((text) => text ? JSON.parse(text) : null); })
            .then((data) => { if (data) setRubric(data); })
            .catch((err) => console.error("Rubric fetch error:", err));

        fetch(`${API_BASE}/submission/assignment/${assignmentId}`)
            .then((res) => { if (!res.ok) throw new Error("Failed to fetch submissions"); return res.json(); })
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setSubmissions(list);
                const inputs = {};
                const feedbacks = {};
                const totalPts = assignment?.totalPoints ?? 100;
                list.forEach((s) => {
                    inputs[s.submissionId.userId] = s.score != null ? Math.round(s.score / 100 * totalPts) : "";
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

        fetch(`${API_BASE}/testcase/assignment/${assignmentId}`)
            .then((res) => res.json())
            .then((data) => setTestCases(Array.isArray(data) ? data : []))
            .catch((err) => console.error(err));
    }, [assignmentId]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuUserId(null);
        if (openMenuUserId) document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [openMenuUserId]);

    useEffect(() => {
        if (!openSolution) { setSolutionFiles([]); setActiveSolutionFile(0); resetSolutionExecState(); return; }
        resetSolutionExecState();
        const userId = openSolution.submissionId.userId;
        fetch(`${API_BASE}/submission/files/${assignmentId}/${userId}`)
            .then((res) => res.json())
            .then((data) => { setSolutionFiles(Array.isArray(data) ? data : []); setActiveSolutionFile(0); })
            .catch(() => { setSolutionFiles([]); setActiveSolutionFile(0); });
    }, [openSolution?.submissionId?.userId, assignmentId]);

    useEffect(() => {
        if (!gradingStudent) { setGradingFiles([]); setActiveGradingFile(0); resetGradingExecState(); return; }
        resetGradingExecState();
        fetch(`${API_BASE}/submission/files/${assignmentId}/${gradingStudent}`)
            .then((res) => res.json())
            .then((data) => { setGradingFiles(Array.isArray(data) ? data : []); setActiveGradingFile(0); })
            .catch(() => { setGradingFiles([]); setActiveGradingFile(0); });
    }, [gradingStudent, assignmentId]);

    useEffect(() => {
        if (!gradingStudent || !rubric) return;
        fetch(`${API_BASE}/rubric/scores/${assignmentId}/${gradingStudent}`)
            .then((res) => res.json())
            .then((data) => {
                const map = {};
                if (Array.isArray(data)) { data.forEach((rs) => { map[rs.rubricItem.id] = rs.awardedPoints; }); }
                if (!rubric.weighted) {
                    (rubric.criteria || []).flatMap((c) => c.items || []).forEach((item) => {
                        if (!item.autoGrade && map[item.id] === undefined) { map[item.id] = item.maxPoints; }
                    });
                }
                setRubricScores(map);
            })
            .catch((err) => console.error(err));

        fetch(`${API_BASE}/rubric/totalscore/${assignmentId}/${gradingStudent}`)
            .then((res) => res.json())
            .then((data) => setRubricTotals((prev) => ({ ...prev, [gradingStudent]: data })))
            .catch((err) => console.error(err));
    }, [gradingStudent, rubric, assignmentId]);

    const getResultsForStudent = (userId) => testResults.filter((r) => r.submission?.submissionId?.userId === userId);

    const resetSolutionExecState = () => {
        setSolutionEditMode(false); setSolutionEdits({}); setSolutionRunResults(null);
        setSolutionRunError(null); setSolutionCustomInput(""); setSolutionCustomResult(null);
        setSolutionCustomError(null); setSolutionCustomInputFile({ inputFileName: "", inputFileContentBase64: "" });
        setSolutionRunTab("saved");
    };

    const resetGradingExecState = () => {
        setGradingEditMode(false); setGradingEdits({}); setGradingRunResults(null);
        setGradingRunError(null); setGradingCustomInput(""); setGradingCustomResult(null);
        setGradingCustomError(null); setGradingCustomInputFile({ inputFileName: "", inputFileContentBase64: "" });
        setGradingRunTab("saved");
    };

    const buildFilesPayload = (files, edits) =>
        files.map((f, i) => ({
            fileName: f.fileName,
            fileContent: edits[i] !== undefined ? encodeUtf8ToBase64(edits[i]) : f.fileContent,
        }));

    const getEffectiveSolutionFiles = () => {
        if (solutionFiles.length > 0) return solutionFiles;
        if (openSolution?.fileContent) return [{ fileName: openSolution.fileName || "solution", fileContent: openSolution.fileContent }];
        return [];
    };

    const getEffectiveGradingFiles = (gradingSubmission) => {
        if (gradingFiles.length > 0) return gradingFiles;
        if (gradingSubmission?.fileContent) return [{ fileName: gradingSubmission.fileName || "solution", fileContent: gradingSubmission.fileContent }];
        return [];
    };

    const handleSolutionRunSaved = async () => {
        const userId = openSolution.submissionId.userId;
        const effectiveFiles = getEffectiveSolutionFiles();
        setSolutionRunning(true); setSolutionRunResults(null); setSolutionRunError(null);
        try {
            if (Object.keys(solutionEdits).length > 0) {
                const res = await fetch(`${API_BASE}/testcase/preview/${assignmentId}`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ files: buildFilesPayload(effectiveFiles, solutionEdits), testCases: testCases.map(tc => ({ label: tc.label, input: tc.input, expectedOutput: tc.expectedOutput })) }),
                });
                if (!res.ok) throw new Error();
                setSolutionRunResults(await res.json());
            } else {
                const res = await fetch(`${API_BASE}/testcase/run/${assignmentId}/${userId}`, { method: "POST" });
                if (!res.ok) throw new Error();
                const raw = await res.json();
                setSolutionRunResults(raw.map(r => ({ label: r.testCase?.label ?? `Test ${r.id}`, passed: r.passed, actualOutput: r.actualOutput })));
            }
        } catch { setSolutionRunError("Failed to run tests."); }
        finally { setSolutionRunning(false); }
    };

    const handleSolutionRunCustom = async () => {
        const userId = openSolution.submissionId.userId;
        const effectiveFiles = getEffectiveSolutionFiles();
        setSolutionCustomRunning(true); setSolutionCustomResult(null); setSolutionCustomError(null);
        try {
            const fileArgs = solutionCustomInputFile.inputFileName ? { inputFileName: solutionCustomInputFile.inputFileName, inputFileContentBase64: solutionCustomInputFile.inputFileContentBase64 } : {};
            const tc = [{ label: "Custom", input: solutionCustomInput || null, expectedOutput: "" }];
            const edited = Object.keys(solutionEdits).length > 0;
            const res = await fetch(
                edited ? `${API_BASE}/testcase/preview/${assignmentId}` : `${API_BASE}/testcase/run/custom/${assignmentId}/${userId}`,
                { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(edited ? { files: buildFilesPayload(effectiveFiles, solutionEdits), testCases: tc, ...fileArgs } : { testCases: tc, ...fileArgs }) }
            );
            if (!res.ok) throw new Error();
            const results = await res.json();
            setSolutionCustomResult(results[0] ?? null);
        } catch { setSolutionCustomError("Failed to run."); }
        finally { setSolutionCustomRunning(false); }
    };

    const handleGradingRunSaved = async () => {
        const gradingSubmission = submissions.find(s => s.submissionId.userId === gradingStudent);
        const effectiveFiles = getEffectiveGradingFiles(gradingSubmission);
        setGradingRunning(true); setGradingRunResults(null); setGradingRunError(null);
        try {
            if (Object.keys(gradingEdits).length > 0) {
                const res = await fetch(`${API_BASE}/testcase/preview/${assignmentId}`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ files: buildFilesPayload(effectiveFiles, gradingEdits), testCases: testCases.map(tc => ({ label: tc.label, input: tc.input, expectedOutput: tc.expectedOutput })) }),
                });
                if (!res.ok) throw new Error();
                setGradingRunResults(await res.json());
            } else {
                const res = await fetch(`${API_BASE}/testcase/run/${assignmentId}/${gradingStudent}`, { method: "POST" });
                if (!res.ok) throw new Error();
                const raw = await res.json();
                setGradingRunResults(raw.map(r => ({ label: r.testCase?.label ?? `Test ${r.id}`, passed: r.passed, actualOutput: r.actualOutput })));
            }
        } catch { setGradingRunError("Failed to run tests."); }
        finally { setGradingRunning(false); }
    };

    const handleGradingRunCustom = async () => {
        const gradingSubmission = submissions.find(s => s.submissionId.userId === gradingStudent);
        const effectiveFiles = getEffectiveGradingFiles(gradingSubmission);
        setGradingCustomRunning(true); setGradingCustomResult(null); setGradingCustomError(null);
        try {
            const fileArgs = gradingCustomInputFile.inputFileName ? { inputFileName: gradingCustomInputFile.inputFileName, inputFileContentBase64: gradingCustomInputFile.inputFileContentBase64 } : {};
            const tc = [{ label: "Custom", input: gradingCustomInput || null, expectedOutput: "" }];
            const edited = Object.keys(gradingEdits).length > 0;
            const res = await fetch(
                edited ? `${API_BASE}/testcase/preview/${assignmentId}` : `${API_BASE}/testcase/run/custom/${assignmentId}/${gradingStudent}`,
                { method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(edited ? { files: buildFilesPayload(effectiveFiles, gradingEdits), testCases: tc, ...fileArgs } : { testCases: tc, ...fileArgs }) }
            );
            if (!res.ok) throw new Error();
            const results = await res.json();
            setGradingCustomResult(results[0] ?? null);
        } catch { setGradingCustomError("Failed to run."); }
        finally { setGradingCustomRunning(false); }
    };

    const isSubmissionLate = (submission) => {
        if (!submission?.submittedAt || !assignment?.dueDate) return false;
        return new Date(submission.submittedAt) > new Date(assignment.dueDate);
    };

    const formatTimestamp = (ts) => {
        if (!ts) return null;
        return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const handleScoreSave = async (userId) => {
        const score = scoreInputs[userId];
        if (score === "" || score === null || score === undefined) return;
        setSavingScore((prev) => ({ ...prev, [userId]: true }));
        try {
            const response = await fetch(`${API_BASE}/submission/score/${assignmentId}/${userId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: Math.round(parseInt(score) / (assignment?.totalPoints ?? 100) * 100) }),
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

    const navigateStudent = (direction) => {
        const currentIndex = submissions.findIndex(s => s.submissionId.userId === gradingStudent);
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < submissions.length) {
            setGradingStudent(submissions[nextIndex].submissionId.userId);
            setRubricScores({});
            resetGradingExecState();
        }
    };

    const navigateSolutionStudent = (direction) => {
        const currentIndex = submissions.findIndex(s => s.submissionId.userId === openSolution?.submissionId?.userId);
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < submissions.length) {
            setOpenSolution(submissions[nextIndex]);
            resetSolutionExecState();
        }
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
            const totalPts = assignment?.totalPoints ?? 100;
            list.forEach((s) => { inputs[s.submissionId.userId] = s.score != null ? Math.round(s.score / 100 * totalPts) : ""; });
            setScoreInputs(inputs);
            // Stay open — do NOT close the panel
        } catch (err) { console.error(err); } finally { setSavingRubricScore(false); }
    };

    if (loading) return <div className="p-8"><p className="text-zinc-500 dark:text-zinc-400">Loading...</p></div>;

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <button type="button" onClick={() => router.push(`/ta/courses/${crn}`)} className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to Course
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Grading Workspace</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{assignment?.title} • {submissions.length} Submission{submissions.length !== 1 ? "s" : ""}</p>
                </div>

                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Submissions</h2>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm" style={{ minHeight: "280px" }}>
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-zinc-100 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700">
                                <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white">Student</th>
                                <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white">Score</th>
                                <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white">Test Results</th>
                                <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {submissions.length === 0 ? (
                                <tr><td colSpan={4} className="py-8 px-4 text-center text-zinc-500 dark:text-zinc-400">No submissions yet.</td></tr>
                            ) : (
                                submissions.map((s) => {
                                    const userId = s.submissionId.userId;
                                    const studentResults = getResultsForStudent(userId);
                                    const isExpanded = expandedStudent === userId;
                                    const rubricTotal = rubricTotals[userId];
                                    const menuOpen = openMenuUserId === userId;
                                    return (
                                        <React.Fragment key={userId}>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-700/50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#C9A84C1a" }}>
                                                            <span className="text-xs font-medium" style={{ color: "#c0a080" }}>{s.user?.firstName?.charAt(0)}{s.user?.lastName?.charAt(0)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-zinc-700 dark:text-zinc-300">{s.user?.firstName} {s.user?.lastName}</span>
                                                            {isSubmissionLate(s) && (
                                                                <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-600/15 text-red-400 border border-red-600/25">Late</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <input type="number" min="0" max="100" value={scoreInputs[userId] ?? ""} onChange={(e) => setScoreInputs((prev) => ({ ...prev, [userId]: e.target.value }))} placeholder="—" className="w-16 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40" />
                                                        <span className="text-zinc-500 text-xs">/ {assignment?.totalPoints ?? 100}</span>
                                                        <button type="button" onClick={() => handleScoreSave(userId)} disabled={savingScore[userId]} className="px-3 py-1 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#862633" }}>
                                                            {savingScore[userId] ? "Saving..." : "Save"}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {studentResults.length > 0 ? (
                                                        <button type="button" onClick={() => setExpandedStudent(isExpanded ? null : userId)} className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                                            <span className={studentResults.filter(r => r.passed).length === studentResults.length ? "text-green-400" : "text-red-400"}>
                                                                {studentResults.filter(r => r.passed).length}/{studentResults.length} passed
                                                            </span>
                                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                        </button>
                                                    ) : (
                                                        <span className="text-zinc-600 text-sm">—</span>
                                                    )}
                                                </td>
                                                {/* ── NEW: AI Detection cell ── */}
                                                <td className="py-3 px-4">
                                                    <AiDetectionBadge submission={s} />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setOpenMenuUserId(menuOpen ? null : userId); }}
                                                            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                        {menuOpen && (
                                                            <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                                                                <button type="button" onClick={() => { setOpenSolution(s); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors text-left">
                                                                    <FileText className="w-4 h-4 shrink-0" /> Open Submission
                                                                </button>
                                                                {rubric && (
                                                                    <button type="button" onClick={() => { setGradingStudent(userId); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors text-left">
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
                                                <tr className="border-b border-zinc-200 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-900/80">
                                                    <td colSpan={4} className="px-4 py-3">
                                                        <div className="space-y-2">
                                                            {studentResults.map((r) => (
                                                                <div key={r.id} className="flex items-center gap-3 text-xs">
                                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${r.passed ? "bg-green-400" : "bg-red-400"}`} />
                                                                    <span className="text-zinc-500 dark:text-zinc-400 w-24">{r.testCase?.label || `Test ${r.testCase?.id}`}</span>
                                                                    {r.testCase?.hidden && <span className="text-zinc-500">(hidden)</span>}
                                                                    <span className="text-zinc-500">Expected: <span className="text-zinc-700 dark:text-zinc-300 font-mono">{r.testCase?.expectedOutput}</span></span>
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
            {openSolution && (() => {
                const solutionIndex = submissions.findIndex(s => s.submissionId.userId === openSolution?.submissionId?.userId);
                const solutionUserId = openSolution.submissionId.userId;
                return (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{openSolution.user?.firstName} {openSolution.user?.lastName}</h2>
                                        {isSubmissionLate(openSolution) && (
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600/15 text-red-400 border border-red-600/25">Late</span>
                                        )}
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        {openSolution.user?.cwid ? `(${openSolution.user.cwid})` : ""}
                                        {openSolution.submittedAt && (
                                            <span className="ml-2">Submitted {formatTimestamp(openSolution.submittedAt)}</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 mr-3">
                                        <input type="number" min="0" max="100" value={scoreInputs[solutionUserId] ?? ""} onChange={(e) => setScoreInputs((prev) => ({ ...prev, [solutionUserId]: e.target.value }))} placeholder="Score" className="w-20 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1.5 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40" />
                                        <span className="text-zinc-500 text-xs">/ {assignment?.totalPoints ?? 100}</span>
                                        <button type="button" onClick={() => handleScoreSave(solutionUserId)} disabled={savingScore[solutionUserId]} className="px-4 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#862633" }}>
                                            {savingScore[solutionUserId] ? "Saving..." : "Save Score"}
                                        </button>
                                    </div>
                                    <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700" />
                                    <button type="button" onClick={() => navigateSolutionStudent(-1)} disabled={solutionIndex <= 0} className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-30">
                                        <ChevronUp className="w-5 h-5" />
                                    </button>
                                    <span className="text-zinc-500 text-xs">{solutionIndex + 1} / {submissions.length}</span>
                                    <button type="button" onClick={() => navigateSolutionStudent(1)} disabled={solutionIndex >= submissions.length - 1} className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-30">
                                        <ChevronDown className="w-5 h-5" />
                                    </button>
                                    <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                                    <button type="button" onClick={() => setOpenSolution(null)} className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"><X className="w-5 h-5" /></button>
                                </div>
                            </div>
                            {solutionFiles.length > 1 && (
                                <div className="flex border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto shrink-0">
                                    {solutionFiles.map((f, i) => (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setActiveSolutionFile(i)}
                                            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                                                activeSolutionFile === i
                                                    ? "text-white border-[#862633]"
                                                    : "text-zinc-500 dark:text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-200"
                                            }`}
                                        >
                                            {f.fileName}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                {/* Toolbar */}
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 shrink-0 bg-zinc-50 dark:bg-zinc-800/60">
                                    <button
                                        type="button"
                                        onClick={() => setSolutionEditMode(m => !m)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${solutionEditMode ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"}`}
                                    >
                                        {solutionEditMode ? "Exit Edit" : "Edit"}
                                    </button>
                                    {solutionEditMode && <span className="text-xs text-amber-400 font-medium">Edit Mode — changes are temporary</span>}
                                    <div className="flex-1" />
                                    <button type="button" onClick={() => setSolutionRunTab("saved")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${solutionRunTab === "saved" ? "text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"}`} style={solutionRunTab === "saved" ? { background: "#862633" } : {}}>Run Tests</button>
                                    <button type="button" onClick={() => setSolutionRunTab("custom")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${solutionRunTab === "custom" ? "text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"}`} style={solutionRunTab === "custom" ? { background: "#862633" } : {}}>Custom Input</button>
                                </div>
                                {/* Monaco */}
                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <MonacoEditor
                                        height="100%"
                                        language={detectLanguage(solutionFiles[activeSolutionFile]?.fileName || openSolution?.fileName)}
                                        theme="vs-dark"
                                        value={solutionEdits[activeSolutionFile] !== undefined ? solutionEdits[activeSolutionFile] : decodeBase64ToUtf8(solutionFiles.length > 0 ? solutionFiles[activeSolutionFile]?.fileContent : openSolution?.fileContent)}
                                        onChange={(val) => {
                                            if (!solutionEditMode) return;
                                            setSolutionEdits(prev => ({ ...prev, [activeSolutionFile]: val ?? "" }));
                                        }}
                                        options={{ readOnly: !solutionEditMode, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13, automaticLayout: true }}
                                    />
                                </div>
                                {/* Run panel */}
                                <div className="shrink-0 border-t border-zinc-700 bg-zinc-950" style={{ height: "220px" }}>
                                    {solutionRunTab === "saved" ? (
                                        <div className="h-full flex flex-col overflow-hidden">
                                            <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b border-zinc-800">
                                                <span className="text-xs text-zinc-400 uppercase tracking-wider">Test Cases ({testCases.length}){Object.keys(solutionEdits).length > 0 && <span className="ml-2 text-amber-400 normal-case">· edited code</span>}</span>
                                                <button type="button" onClick={handleSolutionRunSaved} disabled={solutionRunning || testCases.length === 0} className="px-3 py-1 text-xs font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-colors" style={{ background: "#862633" }}>
                                                    {solutionRunning ? "Running..." : "Run All"}
                                                </button>
                                            </div>
                                            {solutionRunError && <p className="text-red-400 text-xs px-4 py-1">{solutionRunError}</p>}
                                            <div className="flex-1 overflow-auto px-4 py-2 space-y-1">
                                                {solutionRunResults === null && !solutionRunning && <p className="text-xs text-zinc-500">Click Run All to execute tests against this submission.</p>}
                                                {solutionRunResults?.map((r, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-xs">
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${r.passed ? "bg-green-400" : "bg-red-400"}`} />
                                                        <span className="text-zinc-400 w-32 truncate shrink-0">{r.label || `Test ${i + 1}`}</span>
                                                        <span className={`shrink-0 font-medium ${r.passed ? "text-green-400" : "text-red-400"}`}>{r.passed ? "PASS" : "FAIL"}</span>
                                                        {!r.passed && <span className="text-zinc-500 font-mono truncate">got: {r.actualOutput || "(no output)"}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col overflow-hidden p-3 gap-2">
                                            <textarea
                                                value={solutionCustomInput}
                                                onChange={(e) => setSolutionCustomInput(e.target.value)}
                                                placeholder="Enter stdin input..."
                                                className="flex-1 min-h-0 resize-none bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-600"
                                            />
                                            {isFileMode && (
                                                <div className="flex items-center gap-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg shrink-0">
                                                    <span className="text-xs text-zinc-400 shrink-0">Input file (optional):</span>
                                                    <input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { const b64 = ev.target.result.split(",")[1] ?? ""; setSolutionCustomInputFile({ inputFileName: f.name, inputFileContentBase64: b64 }); }; r.readAsDataURL(f); }} className="text-xs text-zinc-300 flex-1" />
                                                    {solutionCustomInputFile.inputFileName && <span className="text-xs text-zinc-500 shrink-0">{solutionCustomInputFile.inputFileName}</span>}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button type="button" onClick={handleSolutionRunCustom} disabled={solutionCustomRunning} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-colors" style={{ background: "#862633" }}>
                                                    {solutionCustomRunning ? "Running..." : "Run"}
                                                </button>
                                                {solutionCustomError && <span className="text-red-400 text-xs">{solutionCustomError}</span>}
                                            </div>
                                            {solutionCustomResult && (
                                                <div className="flex-1 min-h-0 overflow-auto">
                                                    <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap bg-zinc-800 rounded-lg p-2 h-full">{solutionCustomResult.actualOutput || "(no output)"}</pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Rubric Grading Panel */}
            {gradingStudent && rubric && (() => {
                const gradingSubmission = submissions.find(s => s.submissionId.userId === gradingStudent);
                const gradingIndex = submissions.findIndex(s => s.submissionId.userId === gradingStudent);
                return (
                    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl w-full max-w-[1600px] h-[95vh] flex flex-col">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Grade Rubric</h2>
                                        {isSubmissionLate(gradingSubmission) && (
                                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-600/15 text-red-400 border border-red-600/25">Late</span>
                                        )}
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                                        {gradingSubmission?.user?.firstName} {gradingSubmission?.user?.lastName}{gradingSubmission?.user?.cwid ? ` (${gradingSubmission.user.cwid})` : ""} • {rubric.name}
                                        {gradingSubmission?.submittedAt && (
                                            <span className="ml-2">• Submitted {formatTimestamp(gradingSubmission.submittedAt)}</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => navigateStudent(-1)} disabled={gradingIndex <= 0} className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-30">
                                        <ChevronUp className="w-5 h-5" />
                                    </button>
                                    <span className="text-zinc-500 text-sm">{gradingIndex + 1} / {submissions.length}</span>
                                    <button type="button" onClick={() => navigateStudent(1)} disabled={gradingIndex >= submissions.length - 1} className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-30">
                                        <ChevronDown className="w-5 h-5" />
                                    </button>
                                    <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                                    <button type="button" onClick={() => setGradingStudent(null)} className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-1 overflow-hidden">

                                {/* Left — Submission */}
                                <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    {gradingFiles.length > 1 ? (
                                        <div className="flex border-b border-zinc-200 dark:border-zinc-700 shrink-0 overflow-x-auto">
                                            {gradingFiles.map((f, i) => (
                                                <button
                                                    key={f.id}
                                                    type="button"
                                                    onClick={() => setActiveGradingFile(i)}
                                                    className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                                                        activeGradingFile === i
                                                            ? "text-white border-[#862633]"
                                                            : "text-zinc-500 dark:text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-200"
                                                    }`}
                                                >
                                                    {f.fileName}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-700/50 shrink-0">
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Submission</p>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-0.5">
                                                {gradingFiles[0]?.fileName || gradingSubmission?.fileName || "Unnamed file"}
                                            </p>
                                        </div>
                                    )}
                                    {/* Toolbar */}
                                    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 shrink-0 bg-zinc-50 dark:bg-zinc-800/60">
                                        <button
                                            type="button"
                                            onClick={() => setGradingEditMode(m => !m)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${gradingEditMode ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"}`}
                                        >
                                            {gradingEditMode ? "Exit Edit" : "Edit"}
                                        </button>
                                        {gradingEditMode && <span className="text-xs text-amber-400 font-medium">Edit Mode — temporary</span>}
                                        <div className="flex-1" />
                                        <button type="button" onClick={() => setGradingRunTab("saved")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${gradingRunTab === "saved" ? "text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"}`} style={gradingRunTab === "saved" ? { background: "#862633" } : {}}>Run Tests</button>
                                        <button type="button" onClick={() => setGradingRunTab("custom")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${gradingRunTab === "custom" ? "text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"}`} style={gradingRunTab === "custom" ? { background: "#862633" } : {}}>Custom Input</button>
                                    </div>
                                    {/* Monaco */}
                                    <div className="flex-1 min-h-0 overflow-hidden">
                                        <MonacoEditor
                                            height="100%"
                                            language={detectLanguage(gradingFiles[activeGradingFile]?.fileName || gradingSubmission?.fileName)}
                                            theme="vs-dark"
                                            value={gradingEdits[activeGradingFile] !== undefined ? gradingEdits[activeGradingFile] : decodeBase64ToUtf8(gradingFiles.length > 0 ? gradingFiles[activeGradingFile]?.fileContent : gradingSubmission?.fileContent)}
                                            onChange={(val) => {
                                                if (!gradingEditMode) return;
                                                setGradingEdits(prev => ({ ...prev, [activeGradingFile]: val ?? "" }));
                                            }}
                                            options={{ readOnly: !gradingEditMode, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13, automaticLayout: true }}
                                        />
                                    </div>
                                    {/* Run panel */}
                                    <div className="shrink-0 border-t border-zinc-700 bg-zinc-950" style={{ height: "200px" }}>
                                        {gradingRunTab === "saved" ? (
                                            <div className="h-full flex flex-col overflow-hidden">
                                                <div className="flex items-center justify-between px-4 py-2 shrink-0 border-b border-zinc-800">
                                                    <span className="text-xs text-zinc-400 uppercase tracking-wider">Test Cases ({testCases.length}){Object.keys(gradingEdits).length > 0 && <span className="ml-2 text-amber-400 normal-case">· edited code</span>}</span>
                                                    <button type="button" onClick={handleGradingRunSaved} disabled={gradingRunning || testCases.length === 0} className="px-3 py-1 text-xs font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-colors" style={{ background: "#862633" }}>
                                                        {gradingRunning ? "Running..." : "Run All"}
                                                    </button>
                                                </div>
                                                {gradingRunError && <p className="text-red-400 text-xs px-4 py-1">{gradingRunError}</p>}
                                                <div className="flex-1 overflow-auto px-4 py-2 space-y-1">
                                                    {gradingRunResults === null && !gradingRunning && <p className="text-xs text-zinc-500">Click Run All to execute tests against this submission.</p>}
                                                    {gradingRunResults?.map((r, i) => (
                                                        <div key={i} className="flex items-start gap-2 text-xs">
                                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${r.passed ? "bg-green-400" : "bg-red-400"}`} />
                                                            <span className="text-zinc-400 w-32 truncate shrink-0">{r.label || `Test ${i + 1}`}</span>
                                                            <span className={`shrink-0 font-medium ${r.passed ? "text-green-400" : "text-red-400"}`}>{r.passed ? "PASS" : "FAIL"}</span>
                                                            {!r.passed && <span className="text-zinc-500 font-mono truncate">got: {r.actualOutput || "(no output)"}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col overflow-hidden p-3 gap-2">
                                                <textarea
                                                    value={gradingCustomInput}
                                                    onChange={(e) => setGradingCustomInput(e.target.value)}
                                                    placeholder="Enter stdin input..."
                                                    className="flex-1 min-h-0 resize-none bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-600"
                                                />
                                                {isFileMode && (
                                                    <div className="flex items-center gap-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg shrink-0">
                                                        <span className="text-xs text-zinc-400 shrink-0">Input file (optional):</span>
                                                        <input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { const b64 = ev.target.result.split(",")[1] ?? ""; setGradingCustomInputFile({ inputFileName: f.name, inputFileContentBase64: b64 }); }; r.readAsDataURL(f); }} className="text-xs text-zinc-300 flex-1" />
                                                        {gradingCustomInputFile.inputFileName && <span className="text-xs text-zinc-500 shrink-0">{gradingCustomInputFile.inputFileName}</span>}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button type="button" onClick={handleGradingRunCustom} disabled={gradingCustomRunning} className="px-3 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-40 transition-colors" style={{ background: "#862633" }}>
                                                        {gradingCustomRunning ? "Running..." : "Run"}
                                                    </button>
                                                    {gradingCustomError && <span className="text-red-400 text-xs">{gradingCustomError}</span>}
                                                </div>
                                                {gradingCustomResult && (
                                                    <div className="flex-1 min-h-0 overflow-auto">
                                                        <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap bg-zinc-800 rounded-lg p-2 h-full">{gradingCustomResult.actualOutput || "(no output)"}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right — Rubric */}
                                <div className="w-[520px] flex flex-col overflow-hidden shrink-0">
                                    <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-700/50 shrink-0">
                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Rubric</p>
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-0.5">{rubric.weighted ? "Weighted — score each item 0 to 5" : `${rubric.totalPoints} total points`}</p>
                                    </div>

                                    <div className="flex-1 overflow-auto p-5 space-y-6">
                                        {(rubric.criteria || []).map((criteria) => (
                                            <div key={criteria.id} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-700/60" style={{ background: "#86263314" }}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1 h-3.5 rounded-full shrink-0" style={{ background: "#862633" }} />
                                                        <p className="text-zinc-900 dark:text-white font-semibold text-sm">{criteria.title}</p>
                                                    </div>
                                                    {rubric.weighted ? (
                                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">{(criteria.items || []).reduce((sum, i) => sum + (i.weight || 0), 0)}% weight</p>
                                                    ) : (
                                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                                                            {(criteria.items || []).reduce((sum, i) => sum + (parseFloat(rubricScores[i.id]) || 0), 0).toFixed(2)} / {(criteria.items || []).reduce((sum, i) => sum + i.maxPoints, 0)} pts
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                                                    {(criteria.items || []).map((item) => (
                                                        <div key={item.id} className="px-4 py-3">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="text-zinc-400 dark:text-zinc-600 text-xs shrink-0 select-none">›</span>
                                                                    {item.autoGrade && <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: "#C9A84C1a", color: "#c0a080" }}>auto</span>}
                                                                    <span className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">{item.label}</span>
                                                                </div>
                                                                <span className="text-zinc-500 text-xs shrink-0 ml-3">
                                                                    {rubric.weighted ? `${item.weight}%` : `${item.maxPoints} pts`}
                                                                </span>
                                                            </div>

                                                            {/* Non-weighted: number input */}
                                                            {!rubric.weighted && (
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <input type="number" min="0" max={item.maxPoints} step="0.25" value={rubricScores[item.id] ?? ""} onChange={(e) => handleRubricScoreChange(item.id, e.target.value)} placeholder="0" disabled={item.autoGrade} className="w-16 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40 disabled:opacity-50 disabled:cursor-not-allowed" />
                                                                    <span className="text-zinc-500 text-xs">/ {item.maxPoints}</span>
                                                                </div>
                                                            )}

                                                            {/* Weighted: 0-5 score buttons with labels */}
                                                            {rubric.weighted && (
                                                                <div className="flex flex-col gap-1 mt-1">
                                                                    {[5, 4, 3, 2, 1, 0].map((score) => {
                                                                        const scoreLabel = item.scoreLabels?.find(sl => sl.score === score);
                                                                        const isSelected = parseInt(rubricScores[item.id]) === score;
                                                                        return (
                                                                            <button key={score} type="button" disabled={item.autoGrade}
                                                                                onClick={() => handleRubricScoreChange(item.id, score)}
                                                                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left w-full disabled:opacity-50 disabled:cursor-not-allowed border"
                                                                                style={isSelected
                                                                                    ? { background: "#86263322", borderColor: "#862633", color: "white" }
                                                                                    : { background: "transparent", borderColor: "#3f3f46", color: "#a1a1aa" }}>
                                                                                <span className="text-base font-bold w-5 shrink-0 text-center tabular-nums"
                                                                                    style={{ color: isSelected ? "#f87171" : "#52525b" }}>
                                                                                    {score}
                                                                                </span>
                                                                                <span className="flex-1 leading-snug">
                                                                                    {scoreLabel?.label || <span className="italic opacity-40">No descriptor</span>}
                                                                                </span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Feedback */}
                                    <div className="px-5 pb-3 border-t border-zinc-200 dark:border-zinc-700 pt-4 shrink-0">
                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Feedback</p>
                                        <textarea
                                            rows={3}
                                            value={feedbackInputs[gradingStudent] ?? ""}
                                            onChange={(e) => setFeedbackInputs((prev) => ({ ...prev, [gradingStudent]: e.target.value }))}
                                            placeholder="Leave feedback for the student..."
                                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl py-2 px-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm resize-none"
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
                                    <div className="p-5 border-t border-zinc-200 dark:border-zinc-700 shrink-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Total Score</p>
                                            {rubric.weighted ? (
                                                <p className="text-zinc-900 dark:text-white font-bold">
                                                    {(() => {
                                                        const allItems = (rubric.criteria || []).flatMap((c) => c.items || []);
                                                        const anyScored = allItems.some((i) => rubricScores[i.id] !== undefined && rubricScores[i.id] !== null && rubricScores[i.id] !== "");
                                                        if (!anyScored) return "—";
                                                        return allItems.reduce((sum, i) => {
                                                            const score = parseFloat(rubricScores[i.id]) || 0;
                                                            return sum + (score / 5) * (i.weight || 0);
                                                        }, 0).toFixed(1) + "%";
                                                    })()}
                                                </p>
                                            ) : (
                                                <p className="text-zinc-900 dark:text-white font-bold">
                                                    {(rubric.criteria || []).flatMap((c) => c.items || []).reduce((sum, i) => sum + (parseFloat(rubricScores[i.id]) || 0), 0).toFixed(2)} / {rubric.totalPoints} pts
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => setGradingStudent(null)} className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Close</button>
                                            <button type="button" onClick={handleSaveRubricScores} disabled={savingRubricScore} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "#862633" }}>
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
