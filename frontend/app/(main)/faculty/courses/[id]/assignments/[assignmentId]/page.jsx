"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, X, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, FlaskConical, ClipboardList, CheckCircle, Link, MoreVertical, FileInput } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Dialog from "@/components/Dialog";


export default function GradingWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { id: crn, assignmentId } = params;
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSolution, setOpenSolution] = useState(null);
  const [scoreInputs, setScoreInputs] = useState({});
  const [savingScore, setSavingScore] = useState({});
  const [testCases, setTestCases] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [newTestCase, setNewTestCase] = useState({ input: "", expectedOutput: "", hidden: false, label: "" });
  const [addingTestCase, setAddingTestCase] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [importSuiteOpen, setImportSuiteOpen] = useState(false);
  const [availableSuites, setAvailableSuites] = useState([]);
  const [assignedRubric, setAssignedRubric] = useState(null);
  const [attachRubricOpen, setAttachRubricOpen] = useState(false);
  const [availableRubrics, setAvailableRubrics] = useState([]);
  const [gradingStudent, setGradingStudent] = useState(null);
  const [rubricScores, setRubricScores] = useState({});
  const [savingRubricScore, setSavingRubricScore] = useState(false);
  const [rubricTotals, setRubricTotals] = useState({});
  const [linkingItem, setLinkingItem] = useState(null);
  const [linkedTestCaseIds, setLinkedTestCaseIds] = useState([]);
  const [savingLinks, setSavingLinks] = useState(false);
  const [itemLinkMap, setItemLinkMap] = useState({});
  const [plagiarismResults, setPlagiarismResults] = useState(null);
  const [plagiarismOpen, setPlagiarismOpen] = useState(false);
  const [runningPlagiarism, setRunningPlagiarism] = useState(false);
  const [expandedPair, setExpandedPair] = useState(null);
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [savingFeedback, setSavingFeedback] = useState({});

  const isFileMode = assignment?.inputMode === "FILE";

  useEffect(() => {
    fetch(`${API_BASE}/assignment/${assignmentId}`)
        .then((res) => res.json())
        .then((data) => setAssignment(data))
        .catch((err) => console.error(err));

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

    fetch(`${API_BASE}/testcase/assignment/${assignmentId}`)
        .then((res) => res.json())
        .then((data) => setTestCases(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));

    fetch(`${API_BASE}/testcase/results/assignment/${assignmentId}`)
        .then((res) => res.json())
        .then((data) => setTestResults(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));

    fetch(`${API_BASE}/rubric/assignment/${assignmentId}`)
        .then((res) => { if (!res.ok || res.status === 204) return null; return res.text().then((text) => text ? JSON.parse(text) : null); })
        .then((data) => { if (data) setAssignedRubric(data); })
        .catch((err) => console.error(err));
  }, [assignmentId]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuUserId(null);
    if (openMenuUserId) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuUserId]);

  useEffect(() => {
    if (!assignedRubric) return;
    const autoItems = (assignedRubric.criteria || []).flatMap((c) => c.items || []).filter((i) => i.autoGrade);
    autoItems.forEach((item) => {
      fetch(`${API_BASE}/rubric/item-testcases/${item.id}/${assignmentId}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setItemLinkMap((prev) => ({ ...prev, [item.id]: data.map((l) => l.testCase.id) }));
            }
          })
          .catch((err) => console.error(err));
    });
  }, [assignedRubric, assignmentId]);

  useEffect(() => {
    if (!importSuiteOpen || !user?.id) return;
    fetch(`${API_BASE}/testsuite/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => setAvailableSuites(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));
  }, [importSuiteOpen, user?.id]);

  useEffect(() => {
    if (!attachRubricOpen || !user?.id) return;
    fetch(`${API_BASE}/rubric/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => setAvailableRubrics(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));
  }, [attachRubricOpen, user?.id]);

  useEffect(() => {
    if (!gradingStudent || !assignedRubric) return;
    fetch(`${API_BASE}/rubric/scores/${assignmentId}/${gradingStudent}`)
        .then((res) => res.json())
        .then((data) => {
          const map = {};
          if (Array.isArray(data)) { data.forEach((rs) => { map[rs.rubricItem.id] = rs.awardedPoints; }); }
          (assignedRubric.criteria || []).flatMap((c) => c.items || []).forEach((item) => {
            if (!item.autoGrade && map[item.id] === undefined) { map[item.id] = item.maxPoints; }
          });
          setRubricScores(map);
        })
        .catch((err) => console.error(err));

    fetch(`${API_BASE}/rubric/totalscore/${assignmentId}/${gradingStudent}`)
        .then((res) => res.json())
        .then((data) => setRubricTotals((prev) => ({ ...prev, [gradingStudent]: data })))
        .catch((err) => console.error(err));
  }, [gradingStudent, assignedRubric, assignmentId]);

  const handleOpenLinkDialog = (item) => { setLinkingItem(item); setLinkedTestCaseIds(itemLinkMap[item.id] || []); };
  const handleToggleTestCaseLink = (tcId) => { setLinkedTestCaseIds((prev) => prev.includes(tcId) ? prev.filter((id) => id !== tcId) : [...prev, tcId]); };

  const handleSaveLinks = async () => {
    if (!linkingItem) return;
    setSavingLinks(true);
    try {
      const res = await fetch(`${API_BASE}/rubric/item-testcases/${linkingItem.id}/${assignmentId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(linkedTestCaseIds),
      });
      if (!res.ok) throw new Error("Failed to save links");
      setItemLinkMap((prev) => ({ ...prev, [linkingItem.id]: linkedTestCaseIds }));
      setLinkingItem(null);
    } catch (err) { console.error(err); } finally { setSavingLinks(false); }
  };

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
    } catch (error) { console.error("Error saving score:", error); } finally { setSavingScore((prev) => ({ ...prev, [userId]: false })); }
  };

  const handleDeleteSubmission = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/submission/${userId}/${assignmentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete submission");
      setSubmissions((prev) => prev.filter((s) => s.submissionId.userId !== userId));
      setTestResults((prev) => prev.filter((r) => r.submission?.submissionId?.userId !== userId));
      setConfirmDeleteUserId(null);
    } catch (err) { console.error(err); }
  };

  const handleAddTestCase = async () => {
    if (!newTestCase.expectedOutput) return;
    try {
      const response = await fetch(`${API_BASE}/testcase/assignment/${assignmentId}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newTestCase),
      });
      if (!response.ok) throw new Error("Failed to create test case");
      const created = await response.json();
      setTestCases((prev) => [...prev, created]);
      setNewTestCase({ input: "", expectedOutput: "", hidden: false, label: "" });
      setAddingTestCase(false);
    } catch (error) { console.error("Error creating test case:", error); }
  };

  const handleDeleteTestCase = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/testcase/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete test case");
      setTestCases((prev) => prev.filter((tc) => tc.id !== id));
    } catch (error) { console.error("Error deleting test case:", error); }
  };

  const handleRerunTests = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/testcase/run/${assignmentId}/${userId}`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to run tests");
      const results = await response.json();
      setTestResults((prev) => [...prev.filter((r) => r.submission?.submissionId?.userId !== userId), ...results]);
      const subRes = await fetch(`${API_BASE}/submission/assignment/${assignmentId}`);
      const subData = await subRes.json();
      const list = Array.isArray(subData) ? subData : [];
      setSubmissions(list);
      const inputs = {};
      list.forEach((s) => { inputs[s.submissionId.userId] = s.score ?? ""; });
      setScoreInputs(inputs);
    } catch (error) { console.error("Error running tests:", error); }
  };

  const handleImportSuite = async (suiteId) => {
    try {
      const res = await fetch(`${API_BASE}/testsuite/${suiteId}/import/${assignmentId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to import suite");
      const tcRes = await fetch(`${API_BASE}/testcase/assignment/${assignmentId}`);
      const tcData = await tcRes.json();
      setTestCases(Array.isArray(tcData) ? tcData : []);
      setImportSuiteOpen(false);
    } catch (err) { console.error(err); }
  };

  const handleAttachRubric = async (rubricId) => {
    try {
      const res = await fetch(`${API_BASE}/rubric/assign/${rubricId}/assignment/${assignmentId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to attach rubric");
      const rubricRes = await fetch(`${API_BASE}/rubric/assignment/${assignmentId}`);
      const data = await rubricRes.json();
      setAssignedRubric(data);
      setAttachRubricOpen(false);
    } catch (err) { console.error(err); }
  };

  const handleDetachRubric = async () => {
    try {
      const res = await fetch(`${API_BASE}/rubric/assign/assignment/${assignmentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to detach rubric");
      setAssignedRubric(null);
      setItemLinkMap({});
    } catch (err) { console.error(err); }
  };

  const handleRubricScoreChange = (itemId, value) => { setRubricScores((prev) => ({ ...prev, [itemId]: value })); };

  const handleSaveRubricScores = async () => {
    if (!gradingStudent || !assignedRubric) return;
    setSavingRubricScore(true);
    try {
      const items = assignedRubric.criteria?.flatMap((c) => c.items || []) || [];
      await Promise.all(items.map(async (item) => {
        const awarded = parseFloat(rubricScores[item.id] ?? 0);
        await fetch(`${API_BASE}/rubric/scores/${assignmentId}/${gradingStudent}`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rubricItemId: item.id, awardedPoints: awarded }),
        });
      }));
      // Save feedback alongside score
      await fetch(`${API_BASE}/submission/feedback/${assignmentId}/${gradingStudent}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbackInputs[gradingStudent] ?? "" }),
      });
      const totalRes = await fetch(`${API_BASE}/rubric/totalscore/${assignmentId}/${gradingStudent}`);
      const totalData = await totalRes.json();
      setRubricTotals((prev) => ({ ...prev, [gradingStudent]: totalData }));
      await fetch(`${API_BASE}/submission/score/${assignmentId}/${gradingStudent}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: totalData.percentage }),
      });
      const subRes = await fetch(`${API_BASE}/submission/assignment/${assignmentId}`);
      const subData = await subRes.json();
      const list = Array.isArray(subData) ? subData : [];
      setSubmissions(list);
      const inputs = {};
      list.forEach((s) => { inputs[s.submissionId.userId] = s.score ?? ""; });
      setScoreInputs(inputs);
      // Stay open — do NOT call setGradingStudent(null)
    } catch (err) { console.error(err); } finally { setSavingRubricScore(false); }
  };

  const handleCheckPlagiarism = async () => {
    setRunningPlagiarism(true);
    try {
      const res = await fetch(`${API_BASE}/plagiarism/check/${assignmentId}`);
      if (!res.ok) throw new Error("Failed to run plagiarism check");
      setPlagiarismResults(await res.json());
    } catch (err) { console.error(err); } finally { setRunningPlagiarism(false); }
  };

  const handleToggleScoresVisible = async () => {
    try {
      const res = await fetch(`${API_BASE}/assignment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...assignment, scoresVisible: !assignment.scoresVisible }),
      });
      if (!res.ok) throw new Error("Failed to update assignment");
      const updated = await res.json();
      setAssignment(updated);
    } catch (err) { console.error(err); }
  };

  const handleDownloadPlagiarismCSV = () => {
    if (!plagiarismResults) return;
    const rows = [["Student A", "Student B", "Similarity %", "Flagged"], ...plagiarismResults.map((r) => [r.studentAName, r.studentBName, r.similarity, r.similarity >= 70 ? "Yes" : "No"])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `plagiarism_${assignmentId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveFeedback = async (userId) => {
    setSavingFeedback((prev) => ({ ...prev, [userId]: true }));
    try {
      await fetch(`${API_BASE}/submission/feedback/${assignmentId}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    }
  };

  const navigateSolutionStudent = (direction) => {
    const currentIndex = submissions.findIndex(s => s.submissionId.userId === openSolution?.submissionId?.userId);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < submissions.length) {
      setOpenSolution(submissions[nextIndex]);
    }
  };

  const getResultsForStudent = (userId) => testResults.filter((r) => r.submission?.submissionId?.userId === userId);

  if (loading) return <div className="p-8"><p className="text-zinc-400">Loading...</p></div>;

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm";

  return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <button type="button" onClick={() => router.push(`/faculty/courses/${crn}`)} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Course
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Grading Workspace</h1>
              {isFileMode && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "#C9A84C22", color: "#C9A84C" }}>
                  <FileInput className="w-3.5 h-3.5" /> File Input — {assignment.inputFileName}
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-sm mt-1">{assignment?.title} • {submissions.length} Submission{submissions.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Submissions Table */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Submissions</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">Show scores to students</span>
                  <button
                      type="button"
                      onClick={handleToggleScoresVisible}
                      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                      style={assignment?.scoresVisible ? { background: "#7C1D2E" } : { background: "#52525b" }}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${assignment?.scoresVisible ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="w-px h-5 bg-zinc-700" />
                {plagiarismResults && (
                    <button type="button" onClick={() => setPlagiarismOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors" style={{ color: "#C9A84C", borderColor: "#C9A84C44", background: "#C9A84C11" }}>
                      View Results
                    </button>
                )}
                <button type="button" onClick={handleCheckPlagiarism} disabled={runningPlagiarism || submissions.length < 2} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#7C1D2E" }}>
                  {runningPlagiarism ? "Running..." : plagiarismResults ? "Re-run Check" : "Check Plagiarism"}
                </button>
              </div>
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
                                      onClick={() => setOpenMenuUserId(menuOpen ? null : userId)}
                                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  {menuOpen && (
                                      <div className="absolute right-0 top-8 z-20 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                                        <button type="button" onClick={() => { setOpenSolution(s); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-left">
                                          <FileText className="w-4 h-4 shrink-0" /> Open Submission
                                        </button>
                                        {assignedRubric && (
                                            <button type="button" onClick={() => { setGradingStudent(userId); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-left">
                                              <ClipboardList className="w-4 h-4 shrink-0" />
                                              Grade Rubric
                                              {rubricTotal && <span className="text-zinc-500 text-xs ml-auto">({rubricTotal.awarded}/{rubricTotal.possible})</span>}
                                            </button>
                                        )}
                                        <div className="border-t border-zinc-700 mt-1" />
                                        <button type="button" onClick={() => { setConfirmDeleteUserId(userId); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                                          <Trash2 className="w-4 h-4 shrink-0" /> Remove Submission
                                        </button>
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

          {/* Rubric Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Rubric</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Attach a rubric to enable structured grading for this assignment.</p>
              </div>
              {assignedRubric ? (
                  <button type="button" onClick={handleDetachRubric} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-600/10 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-colors">
                    <Trash2 className="w-4 h-4" /> Remove Rubric
                  </button>
              ) : (
                  <button type="button" onClick={() => setAttachRubricOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>
                    <ClipboardList className="w-4 h-4" /> Attach Rubric
                  </button>
              )}
            </div>

            {assignedRubric ? (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#7C1D2E33" }}>
                        <ClipboardList className="w-4 h-4" style={{ color: "#c0a080" }} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{assignedRubric.name}</p>
                        <p className="text-zinc-400 text-xs mt-0.5">{assignedRubric.totalPoints} total points</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignedRubric.visible
                          ? <span className="text-xs text-green-400 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Visible to students</span>
                          : <span className="text-xs text-zinc-500 flex items-center gap-1"><EyeOff className="w-3.5 h-3.5" /> Hidden from students</span>
                      }
                    </div>
                  </div>
                  {(assignedRubric.criteria || []).map((criteria) => (
                      <div key={criteria.id} className="border-b border-zinc-700/50 last:border-0">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-700/20">
                          <p className="text-white text-sm font-medium">{criteria.title}</p>
                          <p className="text-zinc-400 text-xs">{(criteria.items || []).reduce((sum, i) => sum + i.maxPoints, 0)} pts</p>
                        </div>
                        {(criteria.items || []).map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-700/30">
                              <div className="flex items-center gap-2 min-w-0">
                                {item.autoGrade && <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: "#7C1D2E33", color: "#c0a080" }}>auto</span>}
                                <span className="text-zinc-300 text-sm">{item.label}</span>
                                {item.autoGrade && itemLinkMap[item.id]?.length > 0 && (
                                    <span className="text-xs text-zinc-500">({itemLinkMap[item.id].length} test{itemLinkMap[item.id].length !== 1 ? "s" : ""} linked)</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-zinc-400 text-xs">{item.maxPoints} pts</span>
                                {item.autoGrade && testCases.length > 0 && (
                                    <button type="button" onClick={() => handleOpenLinkDialog(item)} className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition-colors hover:opacity-80" style={{ color: "#C9A84C", borderColor: "#C9A84C44", background: "#C9A84C11" }}>
                                      <Link className="w-3 h-3" /> Link Tests
                                    </button>
                                )}
                              </div>
                            </div>
                        ))}
                      </div>
                  ))}
                </div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-center">
                  <ClipboardList className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">No rubric attached. Attach one to enable structured grading.</p>
                </div>
            )}
          </section>

          {/* Test Cases Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Test Cases</h2>
                <p className="text-zinc-400 text-xs mt-0.5">
                  {isFileMode
                      ? `Test cases check output only — input is read from ${assignment.inputFileName}.`
                      : "Test cases run automatically when a student submits."
                  }
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setImportSuiteOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors hover:opacity-80" style={{ color: "#C9A84C", borderColor: "#C9A84C44", background: "#C9A84C11" }}>
                  <FlaskConical className="w-4 h-4" /> Import Suite
                </button>
                <button type="button" onClick={() => setAddingTestCase(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>
                  <Plus className="w-4 h-4" /> Add Test Case
                </button>
              </div>
            </div>

            {addingTestCase && (
                <div className="bg-zinc-900 border rounded-xl p-4 mb-4 space-y-3" style={{ borderColor: "#7C1D2E66" }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-400 block mb-1">Label</label>
                      <input type="text" value={newTestCase.label} onChange={(e) => setNewTestCase((prev) => ({ ...prev, label: e.target.value }))} placeholder="e.g. Test 1" className={inputClass} />
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <input type="checkbox" checked={newTestCase.hidden} onChange={(e) => setNewTestCase((prev) => ({ ...prev, hidden: e.target.checked }))} className="w-4 h-4 shrink-0" />
                        <span className="text-sm text-zinc-300 flex items-center gap-1"><EyeOff className="w-4 h-4" /> Hidden from students</span>
                      </label>
                    </div>
                  </div>
                  {!isFileMode && (
                      <div>
                        <label className="text-xs font-medium text-zinc-400 block mb-1">Input (stdin)</label>
                        <textarea rows={2} value={newTestCase.input} onChange={(e) => setNewTestCase((prev) => ({ ...prev, input: e.target.value }))} placeholder="Leave blank if program takes no input" className={inputClass} />
                      </div>
                  )}
                  {isFileMode && (
                      <div className="flex items-center gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                        <FileInput className="w-4 h-4 shrink-0" style={{ color: "#C9A84C" }} />
                        <p className="text-zinc-400 text-xs">Input will be read from <span className="text-zinc-300 font-medium">{assignment.inputFileName}</span> at runtime.</p>
                      </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1">Expected Output</label>
                    <textarea rows={2} value={newTestCase.expectedOutput} onChange={(e) => setNewTestCase((prev) => ({ ...prev, expectedOutput: e.target.value }))} placeholder="Expected stdout output" className={inputClass} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => { setAddingTestCase(false); setNewTestCase({ input: "", expectedOutput: "", hidden: false, label: "" }); }} className="flex-1 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors">Cancel</button>
                    <button type="button" onClick={handleAddTestCase} disabled={!newTestCase.expectedOutput} className="flex-1 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#7C1D2E" }}>Save Test Case</button>
                  </div>
                </div>
            )}

            <div className="bg-zinc-900 border border-zinc-700 rounded-xl divide-y divide-zinc-700/50">
              {testCases.length === 0 ? (
                  <p className="text-zinc-400 text-sm p-4">No test cases yet. Add one to enable auto-grading.</p>
              ) : (
                  testCases.map((tc) => (
                      <div key={tc.id} className="flex items-start justify-between gap-4 p-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex items-center gap-2 shrink-0 mt-0.5">
                            {tc.hidden ? <EyeOff className="w-4 h-4 text-zinc-500" /> : <Eye className="w-4 h-4" style={{ color: "#C9A84C" }} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium">{tc.label || `Test Case ${tc.id}`}{tc.hidden && <span className="ml-2 text-xs text-zinc-500">(hidden)</span>}</p>
                            {!isFileMode && (
                                <p className="text-zinc-400 text-xs mt-1">Input: <span className="font-mono text-zinc-300">{tc.input || "(none)"}</span></p>
                            )}
                            <p className="text-zinc-400 text-xs mt-0.5">Expected: <span className="font-mono text-zinc-300">{tc.expectedOutput}</span></p>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleDeleteTestCase(tc.id)} className="shrink-0 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                  ))
              )}
            </div>
          </section>
        </div>

        {/* Solution Viewer */}
        {openSolution && (() => {
          const solutionIndex = submissions.findIndex(s => s.submissionId.userId === openSolution?.submissionId?.userId);
          const solutionUserId = openSolution.submissionId.userId;
          return (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-zinc-700 shrink-0">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{openSolution.fileName}</h2>
                      <p className="text-zinc-400 text-sm">{openSolution.user?.firstName} {openSolution.user?.lastName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-3">
                        <input type="number" min="0" max="100" value={scoreInputs[solutionUserId] ?? ""} onChange={(e) => setScoreInputs((prev) => ({ ...prev, [solutionUserId]: e.target.value }))} placeholder="Score" className="w-20 bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40" />
                        <button type="button" onClick={() => handleScoreSave(solutionUserId)} disabled={savingScore[solutionUserId]} className="px-4 py-1.5 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#7C1D2E" }}>
                          {savingScore[solutionUserId] ? "Saving..." : "Save Score"}
                        </button>
                      </div>
                      <div className="w-px h-5 bg-zinc-700" />
                      <button type="button" onClick={() => navigateSolutionStudent(-1)} disabled={solutionIndex <= 0} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30">
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <span className="text-zinc-500 text-xs">{solutionIndex + 1} / {submissions.length}</span>
                      <button type="button" onClick={() => navigateSolutionStudent(1)} disabled={solutionIndex >= submissions.length - 1} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30">
                        <ChevronDown className="w-5 h-5" />
                      </button>
                      <div className="w-px h-5 bg-zinc-700 mx-1" />
                      <button type="button" onClick={() => setOpenSolution(null)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="p-6 overflow-auto flex-1">
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-800 rounded-xl p-4">
            {openSolution.fileContent ? atob(openSolution.fileContent) : "No file content available."}
          </pre>
                  </div>
                </div>
              </div>
          );
        })()}

        {/* Confirm Delete Submission */}
        {confirmDeleteUserId && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold text-white mb-2">Remove Submission?</h2>
                <p className="text-zinc-400 text-sm mb-6">
                  This will permanently delete{" "}
                  <span className="text-white font-medium">
                    {submissions.find(s => s.submissionId.userId === confirmDeleteUserId)?.user?.firstName}{" "}
                    {submissions.find(s => s.submissionId.userId === confirmDeleteUserId)?.user?.lastName}
                  </span>
                  's submission, test results, and rubric scores. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setConfirmDeleteUserId(null)} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
                  <button type="button" onClick={() => handleDeleteSubmission(confirmDeleteUserId)} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>
                    Yes, Remove
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Rubric Grading Panel */}
        {gradingStudent && assignedRubric && (() => {
          const gradingSubmission = submissions.find(s => s.submissionId.userId === gradingStudent);
          const gradingIndex = submissions.findIndex(s => s.submissionId.userId === gradingStudent);
          return (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col">
                  <div className="flex items-center justify-between p-5 border-b border-zinc-700 shrink-0">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Grade Rubric</h2>
                      <p className="text-zinc-400 text-sm mt-0.5">
                        {gradingSubmission?.user?.firstName} {gradingSubmission?.user?.lastName} • {assignedRubric.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => navigateStudent(-1)} disabled={gradingIndex <= 0} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30">
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <span className="text-zinc-500 text-xs">{gradingIndex + 1} / {submissions.length}</span>
                      <button type="button" onClick={() => navigateStudent(1)} disabled={gradingIndex >= submissions.length - 1} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30">
                        <ChevronDown className="w-5 h-5" />
                      </button>
                      <div className="w-px h-5 bg-zinc-700 mx-1" />
                      <button type="button" onClick={() => setGradingStudent(null)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-1 overflow-hidden">
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
                    <div className="w-96 flex flex-col overflow-hidden shrink-0">
                      <div className="px-5 py-3 border-b border-zinc-700/50 shrink-0">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Rubric</p>
                        <p className="text-sm text-zinc-300 mt-0.5">{assignedRubric.totalPoints} total points</p>
                      </div>
                      <div className="flex-1 overflow-auto p-5 space-y-5">
                        {(assignedRubric.criteria || []).map((criteria) => (
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
                      <div className="px-5 pb-3 border-t border-zinc-700 pt-4 shrink-0">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Feedback</p>
                        <textarea
                            rows={3}
                            value={feedbackInputs[gradingStudent] ?? ""}
                            onChange={(e) => setFeedbackInputs((prev) => ({ ...prev, [gradingStudent]: e.target.value }))}
                            placeholder="Leave feedback for the student..."
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm resize-none"
                        />
                      </div>
                      <div className="p-5 border-t border-zinc-700 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-zinc-300 text-sm font-medium">Total Score</p>
                          <p className="text-white font-bold">
                            {(assignedRubric.criteria || []).flatMap((c) => c.items || []).reduce((sum, i) => sum + (parseFloat(rubricScores[i.id]) || 0), 0).toFixed(2)} / {assignedRubric.totalPoints} pts
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setGradingStudent(null)} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Close</button>
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

        {/* Link Test Cases Dialog */}
        <Dialog isOpen={!!linkingItem} onClose={() => setLinkingItem(null)} title={`Link Test Cases — ${linkingItem?.label}`}>
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm">Select which test cases count toward this rubric item. The score will be calculated as (passed / total) × max points.</p>
            {testCases.length === 0 ? (
                <p className="text-zinc-400 text-sm">No test cases on this assignment yet.</p>
            ) : (
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl divide-y divide-zinc-700/50">
                  {testCases.map((tc) => (
                      <label key={tc.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-700/30 transition-colors">
                        <input type="checkbox" checked={linkedTestCaseIds.includes(tc.id)} onChange={() => handleToggleTestCaseLink(tc.id)} className="w-4 h-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-zinc-300 text-sm font-medium">{tc.label || `Test Case ${tc.id}`}</p>
                          <p className="text-zinc-500 text-xs font-mono truncate">{tc.input ? `in: ${tc.input}` : "no input"} → {tc.expectedOutput}</p>
                        </div>
                        {tc.hidden && <span className="text-xs text-zinc-500 shrink-0">(hidden)</span>}
                      </label>
                  ))}
                </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setLinkingItem(null)} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
              <button type="button" onClick={handleSaveLinks} disabled={savingLinks} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#7C1D2E" }}>
                {savingLinks ? "Saving..." : "Save Links"}
              </button>
            </div>
          </div>
        </Dialog>

        {/* Plagiarism Results Modal */}
        {plagiarismOpen && plagiarismResults && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-zinc-700 shrink-0">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Plagiarism Check Results</h2>
                    <p className="text-zinc-400 text-sm mt-0.5">{plagiarismResults.length} pair{plagiarismResults.length !== 1 ? "s" : ""} compared • {plagiarismResults.filter(r => r.similarity >= 70).length} flagged</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleDownloadPlagiarismCSV} className="px-3 py-2 text-sm font-medium rounded-lg border transition-colors hover:opacity-80" style={{ color: "#C9A84C", borderColor: "#C9A84C44", background: "#C9A84C11" }}>Download CSV</button>
                    <button type="button" onClick={() => { setPlagiarismOpen(false); setExpandedPair(null); }} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="overflow-auto flex-1">
                  {plagiarismResults.length === 0 ? (
                      <div className="p-8 text-center text-zinc-400">Not enough submissions to compare.</div>
                  ) : (
                      plagiarismResults.map((r, idx) => {
                        const isExpanded = expandedPair === idx;
                        const color = r.similarity >= 70 ? "text-red-400" : r.similarity >= 50 ? "text-yellow-400" : "text-green-400";
                        const bg = r.similarity >= 70 ? "bg-red-500/10 border-red-500/20" : r.similarity >= 50 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-zinc-800 border-zinc-700";
                        return (
                            <div key={idx} className="border-b border-zinc-700/50 last:border-0">
                              <button type="button" onClick={() => setExpandedPair(isExpanded ? null : idx)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-800/50 transition-colors text-left">
                                <div className="flex items-center gap-4">
                                  <div className={`text-2xl font-bold ${color}`}>{r.similarity}%</div>
                                  <div>
                                    <p className="text-white text-sm font-medium">{r.studentAName} &amp; {r.studentBName}</p>
                                    {r.similarity >= 70 && <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Flagged</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-zinc-400 text-sm">{isExpanded ? "Hide" : "Compare"}</span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                                </div>
                              </button>
                              {isExpanded && (
                                  <div className="px-6 pb-5">
                                    <div className={`border rounded-xl overflow-hidden ${bg}`}>
                                      <div className="grid grid-cols-2 divide-x divide-zinc-700">
                                        <div>
                                          <div className="px-4 py-2 border-b border-zinc-700 bg-zinc-800/50"><p className="text-sm font-semibold text-white">{r.studentAName}</p></div>
                                          <pre className="text-xs text-zinc-300 font-mono p-4 overflow-auto max-h-96 whitespace-pre-wrap">{r.fileContentA || "No content"}</pre>
                                        </div>
                                        <div>
                                          <div className="px-4 py-2 border-b border-zinc-700 bg-zinc-800/50"><p className="text-sm font-semibold text-white">{r.studentBName}</p></div>
                                          <pre className="text-xs text-zinc-300 font-mono p-4 overflow-auto max-h-96 whitespace-pre-wrap">{r.fileContentB || "No content"}</pre>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                              )}
                            </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Attach Rubric Dialog */}
        <Dialog isOpen={attachRubricOpen} onClose={() => setAttachRubricOpen(false)} title="Attach Rubric">
          <div className="space-y-3">
            {availableRubrics.length === 0 ? (
                <p className="text-zinc-400 text-sm">No rubrics available. Create one from the Rubrics page.</p>
            ) : (
                availableRubrics.map((rubric) => (
                    <button key={rubric.id} type="button" onClick={() => handleAttachRubric(rubric.id)} className="w-full flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-zinc-500 hover:bg-zinc-700/50 transition-colors text-left">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#7C1D2E33" }}>
                        <ClipboardList className="w-4 h-4" style={{ color: "#c0a080" }} />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{rubric.name}</p>
                        <p className="text-zinc-400 text-xs mt-0.5">{rubric.totalPoints} pts{rubric.description && ` • ${rubric.description}`}</p>
                      </div>
                    </button>
                ))
            )}
            <button type="button" onClick={() => setAttachRubricOpen(false)} className="w-full py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
          </div>
        </Dialog>

        {/* Import Suite Dialog */}
        <Dialog isOpen={importSuiteOpen} onClose={() => setImportSuiteOpen(false)} title="Import from Suite">
          <div className="space-y-3">
            {availableSuites.length === 0 ? (
                <p className="text-zinc-400 text-sm">No suites available. Create one from the Test Suites page.</p>
            ) : (
                availableSuites.map((suite) => (
                    <button key={suite.id} type="button" onClick={() => handleImportSuite(suite.id)} className="w-full flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-zinc-500 hover:bg-zinc-700/50 transition-colors text-left">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#C9A84C22" }}>
                        <FlaskConical className="w-4 h-4" style={{ color: "#C9A84C" }} />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{suite.name}</p>
                        {suite.description && <p className="text-zinc-400 text-xs mt-0.5">{suite.description}</p>}
                      </div>
                    </button>
                ))
            )}
            <button type="button" onClick={() => setImportSuiteOpen(false)} className="w-full py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
          </div>
        </Dialog>
      </div>
  );
}