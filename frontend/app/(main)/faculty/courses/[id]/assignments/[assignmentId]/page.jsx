"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, X, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";
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

  useEffect(() => {
    fetch(`${API_BASE}/assignment/${assignmentId}`)
        .then((res) => res.json())
        .then((data) => setAssignment(data))
        .catch((err) => console.error(err));

    fetch(`${API_BASE}/submission/assignment/${assignmentId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch submissions");
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setSubmissions(list);
          const inputs = {};
          list.forEach((s) => {
            inputs[s.submissionId.userId] = s.score ?? "";
          });
          setScoreInputs(inputs);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });

    fetch(`${API_BASE}/testcase/assignment/${assignmentId}`)
        .then((res) => res.json())
        .then((data) => setTestCases(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));

    fetch(`${API_BASE}/testcase/results/assignment/${assignmentId}`)
        .then((res) => res.json())
        .then((data) => setTestResults(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));
  }, [assignmentId]);

  useEffect(() => {
    if (!importSuiteOpen || !user?.id) return;
    fetch(`${API_BASE}/testsuite/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => setAvailableSuites(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));
  }, [importSuiteOpen, user?.id]);

  const handleScoreSave = async (userId) => {
    const score = scoreInputs[userId];
    if (score === "" || score === null || score === undefined) return;
    setSavingScore((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(`${API_BASE}/submission/score/${assignmentId}/${userId}`, {
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

  const handleAddTestCase = async () => {
    if (!newTestCase.expectedOutput) return;
    try {
      const response = await fetch(`${API_BASE}/testcase/assignment/${assignmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTestCase),
      });
      if (!response.ok) throw new Error("Failed to create test case");
      const created = await response.json();
      setTestCases((prev) => [...prev, created]);
      setNewTestCase({ input: "", expectedOutput: "", hidden: false, label: "" });
      setAddingTestCase(false);
    } catch (error) {
      console.error("Error creating test case:", error);
    }
  };

  const handleDeleteTestCase = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/testcase/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete test case");
      setTestCases((prev) => prev.filter((tc) => tc.id !== id));
    } catch (error) {
      console.error("Error deleting test case:", error);
    }
  };

  const handleRerunTests = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/testcase/run/${assignmentId}/${userId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to run tests");
      const results = await response.json();
      setTestResults((prev) => [
        ...prev.filter((r) => r.submission?.submissionId?.userId !== userId),
        ...results,
      ]);
      // Refresh score
      const subRes = await fetch(`${API_BASE}/submission/assignment/${assignmentId}`);
      const subData = await subRes.json();
      const list = Array.isArray(subData) ? subData : [];
      setSubmissions(list);
      const inputs = {};
      list.forEach((s) => {
        inputs[s.submissionId.userId] = s.score ?? "";
      });
      setScoreInputs(inputs);
    } catch (error) {
      console.error("Error running tests:", error);
    }
  };

  const handleImportSuite = async (suiteId) => {
    try {
      const res = await fetch(`${API_BASE}/testsuite/${suiteId}/import/${assignmentId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to import suite");
      // Refresh test cases
      const tcRes = await fetch(`${API_BASE}/testcase/assignment/${assignmentId}`);
      const tcData = await tcRes.json();
      setTestCases(Array.isArray(tcData) ? tcData : []);
      setImportSuiteOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getResultsForStudent = (userId) =>
      testResults.filter((r) => r.submission?.submissionId?.userId === userId);

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Loading...</p></div>;
  }

  const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm";

  return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <button
              type="button"
              onClick={() => router.push(`/faculty/courses/${crn}`)}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Grading Workspace</h1>
            <p className="text-slate-400 text-sm mt-1">
              {assignment?.title} • {submissions.length} Submission{submissions.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Submissions Table */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Submissions</h2>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                <tr className="bg-slate-700/50 border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-white">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">File</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Actions</th>
                </tr>
                </thead>
                <tbody>
                {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-slate-400">
                        No submissions yet.
                      </td>
                    </tr>
                ) : (
                    submissions.map((s) => {
                      const userId = s.submissionId.userId;
                      const studentResults = getResultsForStudent(userId);
                      const isExpanded = expandedStudent === userId;
                      return (
                          <React.Fragment key={userId}>
                            <tr className="border-b border-slate-700/50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-teal-600/20 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-teal-400 text-xs font-medium">
                                  {s.user?.firstName?.charAt(0)}{s.user?.lastName?.charAt(0)}
                                </span>
                                  </div>
                                  <span className="text-slate-300">{s.user?.firstName} {s.user?.lastName}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <FileText className="w-4 h-4" />
                                  <span>{s.fileName || "Unnamed file"}</span>
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
                                      className="w-16 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                  />
                                  <button
                                      type="button"
                                      onClick={() => handleScoreSave(userId)}
                                      disabled={savingScore[userId]}
                                      className="px-3 py-1 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors disabled:opacity-50"
                                  >
                                    {savingScore[userId] ? "Saving..." : "Save"}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                      type="button"
                                      onClick={() => setOpenSolution(s)}
                                      className="text-teal-400 hover:text-teal-300 font-medium text-sm"
                                  >
                                    Open Solution
                                  </button>
                                  {testCases.length > 0 && (
                                      <>
                                        <span className="text-slate-600">|</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRerunTests(userId)}
                                            className="text-teal-400 hover:text-teal-300 font-medium text-sm"
                                        >
                                          Run Tests
                                        </button>
                                        {studentResults.length > 0 && (
                                            <>
                                              <span className="text-slate-600">|</span>
                                              <button
                                                  type="button"
                                                  onClick={() => setExpandedStudent(isExpanded ? null : userId)}
                                                  className="flex items-center gap-1 text-slate-400 hover:text-white text-sm"
                                              >
                                                {studentResults.filter(r => r.passed).length}/{studentResults.length} passed
                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                              </button>
                                            </>
                                        )}
                                      </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {isExpanded && studentResults.length > 0 && (
                                <tr key={`${userId}-results`} className="border-b border-slate-700/50 bg-slate-900/50">
                                  <td colSpan={4} className="px-4 py-3">
                                    <div className="space-y-2">
                                      {studentResults.map((r) => (
                                          <div key={r.id} className="flex items-center gap-3 text-xs">
                                            <span className={`w-2 h-2 rounded-full shrink-0 ${r.passed ? "bg-green-400" : "bg-red-400"}`} />
                                            <span className="text-slate-400 w-24">{r.testCase?.label || `Test ${r.testCase?.id}`}</span>
                                            {r.testCase?.hidden && (
                                                <span className="text-slate-500 text-xs">(hidden)</span>
                                            )}
                                            <span className="text-slate-500">Expected: <span className="text-slate-300 font-mono">{r.testCase?.expectedOutput}</span></span>
                                            <span className="text-slate-500">Got: <span className={`font-mono ${r.passed ? "text-green-400" : "text-red-400"}`}>{r.actualOutput || "no output"}</span></span>
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

          {/* Test Cases Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Test Cases</h2>
                <p className="text-slate-400 text-xs mt-0.5">Test cases run automatically when a student submits.</p>
              </div>
              <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setImportSuiteOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-teal-400 bg-teal-600/10 border border-teal-600/20 rounded-lg hover:bg-teal-600/20 transition-colors"
                >
                  <FlaskConical className="w-4 h-4" />
                  Import Suite
                </button>
                <button
                    type="button"
                    onClick={() => setAddingTestCase(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Test Case
                </button>
              </div>
            </div>

            {/* Add test case form */}
            {addingTestCase && (
                <div className="bg-slate-800/50 border border-teal-600/30 rounded-xl p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-400 block mb-1">Label</label>
                      <input
                          type="text"
                          value={newTestCase.label}
                          onChange={(e) => setNewTestCase((prev) => ({ ...prev, label: e.target.value }))}
                          placeholder="e.g. Test 1"
                          className={inputClass}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <input
                            type="checkbox"
                            checked={newTestCase.hidden}
                            onChange={(e) => setNewTestCase((prev) => ({ ...prev, hidden: e.target.checked }))}
                            className="w-4 h-4 accent-teal-500"
                        />
                        <span className="text-sm text-slate-300 flex items-center gap-1">
                      <EyeOff className="w-4 h-4" /> Hidden from students
                    </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Input (stdin)</label>
                    <textarea
                        rows={2}
                        value={newTestCase.input}
                        onChange={(e) => setNewTestCase((prev) => ({ ...prev, input: e.target.value }))}
                        placeholder="Leave blank if program takes no input"
                        className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1">Expected Output</label>
                    <textarea
                        rows={2}
                        value={newTestCase.expectedOutput}
                        onChange={(e) => setNewTestCase((prev) => ({ ...prev, expectedOutput: e.target.value }))}
                        placeholder="Expected stdout output"
                        className={inputClass}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => { setAddingTestCase(false); setNewTestCase({ input: "", expectedOutput: "", hidden: false, label: "" }); }}
                        className="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAddTestCase}
                        disabled={!newTestCase.expectedOutput}
                        className="flex-1 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors disabled:opacity-50"
                    >
                      Save Test Case
                    </button>
                  </div>
                </div>
            )}

            {/* Test cases list */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl divide-y divide-slate-700/50">
              {testCases.length === 0 ? (
                  <p className="text-slate-400 text-sm p-4">No test cases yet. Add one to enable auto-grading.</p>
              ) : (
                  testCases.map((tc) => (
                      <div key={tc.id} className="flex items-start justify-between gap-4 p-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex items-center gap-2 shrink-0 mt-0.5">
                            {tc.hidden
                                ? <EyeOff className="w-4 h-4 text-slate-500" />
                                : <Eye className="w-4 h-4 text-teal-400" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium">
                              {tc.label || `Test Case ${tc.id}`}
                              {tc.hidden && <span className="ml-2 text-xs text-slate-500">(hidden)</span>}
                            </p>
                            <p className="text-slate-400 text-xs mt-1">
                              Input: <span className="font-mono text-slate-300">{tc.input || "(none)"}</span>
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5">
                              Expected: <span className="font-mono text-slate-300">{tc.expectedOutput}</span>
                            </p>
                          </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleDeleteTestCase(tc.id)}
                            className="shrink-0 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                  ))
              )}
            </div>
          </section>
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

        <Dialog isOpen={importSuiteOpen} onClose={() => setImportSuiteOpen(false)} title="Import from Suite">
          <div className="space-y-3">
            {availableSuites.length === 0 ? (
                <p className="text-slate-400 text-sm">No suites available. Create one from the Test Suites page.</p>
            ) : (
                availableSuites.map((suite) => (
                    <button
                        key={suite.id}
                        type="button"
                        onClick={() => handleImportSuite(suite.id)}
                        className="w-full flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-teal-500/50 hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <div className="w-9 h-9 bg-teal-600/20 rounded-xl flex items-center justify-center shrink-0">
                        <FlaskConical className="w-4 h-4 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{suite.name}</p>
                        {suite.description && (
                            <p className="text-slate-400 text-xs mt-0.5">{suite.description}</p>
                        )}
                      </div>
                    </button>
                ))
            )}
            <button
                type="button"
                onClick={() => setImportSuiteOpen(false)}
                className="w-full py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Dialog>
      </div>
  );
}