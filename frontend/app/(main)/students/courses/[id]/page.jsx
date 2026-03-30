"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, BookOpen, FileText, Upload, X, CheckCircle, FlaskConical } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

function VisibleTestCases({ assignmentId }) {
  const [testCases, setTestCases] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/testcase/assignment/${assignmentId}/visible`)
        .then((res) => res.json())
        .then((data) => setTestCases(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));
  }, [assignmentId]);

  if (testCases.length === 0) return null;

  return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">Sample Test Cases</p>
        {testCases.map((tc) => (
            <div key={tc.id} className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs space-y-1">
              <p className="font-medium text-zinc-300">{tc.label || `Test Case ${tc.id}`}</p>
              {tc.input && (
                  <p className="text-zinc-400">Input: <span className="font-mono text-zinc-300">{tc.input}</span></p>
              )}
              <p className="text-zinc-400">Expected Output: <span className="font-mono text-zinc-300">{tc.expectedOutput}</span></p>
            </div>
        ))}
      </div>
  );
}

function AssignmentRubric({ assignmentId }) {
  const [rubric, setRubric] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/rubric/assignment/${assignmentId}`)
        .then((res) => {
          if (!res.ok || res.status === 204) return null;
          return res.text().then((text) => text ? JSON.parse(text) : null);
        })
        .then((data) => { if (data?.visible) setRubric(data); })
        .catch((err) => console.error(err));
  }, [assignmentId]);

  if (!rubric) return null;

  return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">Grading Rubric</p>
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
          {(rubric.criteria || []).map((criteria) => (
              <div key={criteria.id} className="border-b border-zinc-700/50 last:border-0">
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-700/30">
                  <p className="text-white text-xs font-medium">{criteria.title}</p>
                  <p className="text-zinc-400 text-xs">
                    {(criteria.items || []).reduce((sum, i) => sum + i.maxPoints, 0)} pts
                  </p>
                </div>
                {(criteria.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2 border-t border-zinc-700/30">
                      <span className="text-zinc-300 text-xs">{item.label}</span>
                      <span className="text-zinc-400 text-xs">{item.maxPoints} pts</span>
                    </div>
                ))}
              </div>
          ))}
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-700/30 border-t border-zinc-700">
            <p className="text-white text-xs font-semibold">Total</p>
            <p className="text-white text-xs font-semibold">{rubric.totalPoints} pts</p>
          </div>
        </div>
      </div>
  );
}

function decodeBase64ToUtf8(base64) {
  if (!base64) return "";
  try {
    // atob gives a "binary string" (1 byte per char). Convert to bytes, then decode as UTF-8.
    const binary = atob(base64);
    if (typeof TextDecoder === "undefined") return binary;
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    // Fallback: last resort decode using atob directly.
    try {
      return atob(base64);
    } catch {
      return "";
    }
  }
}

function encodeUtf8ToBase64(text) {
  try {
    const bytes = new TextEncoder().encode(text || "");
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  } catch {
    // Fallback for environments without TextEncoder (rare).
    return btoa(unescape(encodeURIComponent(text || "")));
  }
}

export default function StudentCourseDetailPage() {
  const params = useParams();
  const crn = params.id;
  const { user } = useAuth();
  const [classItem, setClassItem] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newAttempt, setNewAttempt] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState(null);

  const [customTestCases, setCustomTestCases] = useState([
    { label: "", input: "", expectedOutput: "" },
  ]);
  const [customInputFile, setCustomInputFile] = useState({
    inputFileName: "",
    inputFileContentBase64: "",
  });
  const [customTestResults, setCustomTestResults] = useState([]);
  const [loadingCustomResults, setLoadingCustomResults] = useState(false);
  const [customError, setCustomError] = useState(null);

  const [editorText, setEditorText] = useState("");
  const [editorDirty, setEditorDirty] = useState(false);
  const [savingCode, setSavingCode] = useState(false);
  const [editorLanguage, setEditorLanguage] = useState("plaintext");
  const [codeSaveError, setCodeSaveError] = useState(null);

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

  useEffect(() => {
    if (!user?.id || assignments.length === 0) return;
    const fetchAll = async () => {
      const map = {};
      await Promise.all(
          assignments.map(async (a) => {
            try {
              const res = await fetch(`${API_BASE}/submission/${user.id}/${a.id}`);
              if (res.ok) {
                const data = await res.json();
                if (data) map[a.id] = data;
              }
            } catch { }
          })
      );
      setSubmissions(map);
    };
    fetchAll();
  }, [user?.id, assignments]);

  useEffect(() => {
    if (activeTab !== "results" || !selectedAssignment || !user?.id) return;
    setLoadingResults(true);
    fetch(`${API_BASE}/testcase/results/${selectedAssignment.id}/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const visible = Array.isArray(data) ? data.filter((r) => !r.testCase?.hidden) : [];
          setTestResults(visible);
          setLoadingResults(false);
        })
        .catch((err) => { console.error(err); setLoadingResults(false); });
  }, [activeTab, selectedAssignment, user?.id]);

  const existingSubmission = selectedAssignment ? submissions[selectedAssignment.id] : null;

  useEffect(() => {
    if (!existingSubmission?.fileContent) return;
    // If the student edited, we only overwrite editor contents when submission itself changes
    // (e.g., after Save Code or a new attempt).
    const decoded = decodeBase64ToUtf8(existingSubmission.fileContent);
    setEditorText(decoded);
    setEditorDirty(false);

    const fileName = existingSubmission?.fileName || "";
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "py") setEditorLanguage("python");
    else if (ext === "java") setEditorLanguage("java");
    else setEditorLanguage("plaintext");
  }, [existingSubmission?.fileContent, existingSubmission?.fileName]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowed = [];
    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "java" || ext === "py") allowed.push(file);
      else {
        setFileError("Only .java and .py files are accepted.");
        setSelectedFiles([]);
        setSelectedFile(null);
        e.target.value = "";
        return;
      }
    }

    setSelectedFiles(allowed);
    setSelectedFile(allowed[0] || null);
    setFileError(null);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const allowed = [];
    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "java" || ext === "py") allowed.push(file);
      else {
        setFileError("Only .java and .py files are accepted.");
        setSelectedFiles([]);
        setSelectedFile(null);
        return;
      }
    }

    setSelectedFiles(allowed);
    setSelectedFile(allowed[0] || null);
    setFileError(null);
  };

  const handleSaveCode = async () => {
    if (!user?.id || !selectedAssignment || !existingSubmission) return;
    if (savingCode) return;
    setSavingCode(true);
    setCodeSaveError(null);
    try {
      const base64 = encodeUtf8ToBase64(editorText);
      const response = await fetch(
        `${API_BASE}/submission/code/${selectedAssignment.id}/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: existingSubmission.fileName,
            fileContent: base64,
          }),
        }
      );

      if (!response.ok) throw new Error("Save failed");
      const updated = await response.json();
      setSubmissions((prev) => ({ ...prev, [selectedAssignment.id]: updated }));
      setEditorDirty(false);
    } catch (err) {
      console.error(err);
      setCodeSaveError("Failed to save code.");
    } finally {
      setSavingCode(false);
    }
  };

  const handleCustomInputFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64 = reader.result.split(",")[1];
        setCustomInputFile({
          inputFileName: file.name,
          inputFileContentBase64: base64,
        });
      } catch {
        setCustomError("Failed to read input file.");
      }
    };
    reader.readAsDataURL(file);
  };

  const runCustomTests = async () => {
    if (!user?.id || !selectedAssignment) return;
    if (!existingSubmission) return;

    if (editorDirty) {
      await handleSaveCode();
    }

    setLoadingCustomResults(true);
    setCustomError(null);
    setCustomTestResults([]);

    try {
      const inputMode = selectedAssignment.inputMode || "STDIN";

      const payload = {
        inputFileName: inputMode === "FILE" ? customInputFile.inputFileName : null,
        inputFileContentBase64: inputMode === "FILE" ? customInputFile.inputFileContentBase64 : null,
        testCases: customTestCases.map((tc) => ({
          label: tc.label,
          input: inputMode === "STDIN" ? tc.input : null,
          expectedOutput: tc.expectedOutput,
        })),
      };

      const response = await fetch(
        `${API_BASE}/testcase/run/custom/${selectedAssignment.id}/${user.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Custom test run failed");

      const results = await response.json();
      setCustomTestResults(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error(err);
      setCustomError("Failed to run custom tests.");
    } finally {
      setLoadingCustomResults(false);
    }
  };

  const runProfessorTests = async () => {
    if (!user?.id || !selectedAssignment) return;
    if (!existingSubmission) return;

    if (editorDirty) {
      await handleSaveCode();
    }

    setLoadingResults(true);
    try {
      const response = await fetch(
        `${API_BASE}/testcase/run/${selectedAssignment.id}/${user.id}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to run professor tests");

      // Refresh submission + visible results
      const subRes = await fetch(`${API_BASE}/submission/${user.id}/${selectedAssignment.id}`);
      if (subRes.ok) {
        const updatedSub = await subRes.json();
        setSubmissions((prev) => ({ ...prev, [selectedAssignment.id]: updatedSub }));
      }

      const res = await fetch(`${API_BASE}/testcase/results/${selectedAssignment.id}/${user.id}`);
      const data = res.ok ? await res.json() : [];
      const visible = Array.isArray(data) ? data.filter((r) => !r.testCase?.hidden) : [];
      setTestResults(visible);
      setActiveTab("results");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user?.id) return;
    setSubmitting(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(",")[1];
        const response = await fetch(`${API_BASE}/submission/submit/${selectedAssignment.id}/${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: selectedFile.name, fileContent: base64 }),
        });
        if (!response.ok) throw new Error("Submission failed");
        const updated = await response.json();
        setSubmissions((prev) => ({ ...prev, [selectedAssignment.id]: updated }));
        setSubmitted(true);
        setNewAttempt(false);
        setSubmitting(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Error submitting:", error);
      setSubmitting(false);
    }
  };

  const handleRemoveSubmission = async () => {
    if (!user?.id || !selectedAssignment) return;
    try {
      const response = await fetch(`${API_BASE}/submission/${user.id}/${selectedAssignment.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to remove submission");
      setSubmissions((prev) => { const u = { ...prev }; delete u[selectedAssignment.id]; return u; });
      setTestResults([]);
      setCustomTestResults([]);
      setCustomError(null);
      setSubmitted(false);
      setSelectedFile(null);
      setSelectedFiles([]);
      setActiveTab("upload");
      setEditorDirty(false);
      setEditorText("");
      setCodeSaveError(null);
    } catch (error) {
      console.error("Error removing submission:", error);
    }
  };

  const closeModal = () => {
    setSelectedAssignment(null);
    setSelectedFile(null);
    setSelectedFiles([]);
    setSubmitted(false);
    setSubmitting(false);
    setNewAttempt(false);
    setActiveTab("description");
    setTestResults([]);
    setFileError(null);
    setCustomTestCases([{ label: "", input: "", expectedOutput: "" }]);
    setCustomInputFile({ inputFileName: "", inputFileContentBase64: "" });
    setCustomTestResults([]);
    setLoadingCustomResults(false);
    setCustomError(null);
    setEditorDirty(false);
    setEditorText("");
    setCodeSaveError(null);
  };

  if (loading) {
    return <div className="p-8"><p className="text-zinc-400">Loading...</p></div>;
  }

  return (
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <Link
              href="/students/dashboard"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {!classItem ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6">
                <p className="text-zinc-400">Course not found.</p>
              </div>
          ) : (
              <>
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "#7C1D2E33" }}>
                      <BookOpen className="w-8 h-8" style={{ color: "#c0a080" }} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">{classItem.courseName}</h1>
                      <p className="font-medium mt-1" style={{ color: "#C9A84C" }}>{classItem.courseAbbreviation}</p>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        <span className="text-zinc-300"><span className="text-zinc-500">CRN:</span> {classItem.crn}</span>
                        <span className="text-zinc-300"><span className="text-zinc-500">Semester:</span> {classItem.semester?.charAt(0).toUpperCase() + classItem.semester?.slice(1)} {classItem.year}</span>
                      </div>
                    </div>
                  </div>
                  {classItem.courseDescription && (
                      <p className="mt-4 text-zinc-400 text-sm">{classItem.courseDescription}</p>
                  )}
                </div>

                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">Assignments</h2>
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl divide-y divide-zinc-700/50">
                    {assignments.length === 0 ? (
                        <p className="text-zinc-400 p-4">No assignments yet.</p>
                    ) : (
                        assignments.map((a) => (
                            <button
                                key={a.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAssignment(a);
                                  setSelectedFile(null);
                                  setSelectedFiles([]);
                                  setSubmitted(false);
                                  setNewAttempt(false);
                                  setActiveTab("description");
                                  setTestResults([]);
                                  setCustomTestCases([{ label: "", input: "", expectedOutput: "" }]);
                                  setCustomInputFile({ inputFileName: "", inputFileContentBase64: "" });
                                  setCustomTestResults([]);
                                  setCustomError(null);
                                }}
                                className="flex items-center gap-4 p-4 w-full text-left text-zinc-300 hover:bg-zinc-700/30 transition-colors rounded-lg"
                            >
                              <FileText className="w-5 h-5 shrink-0" style={{ color: "#C9A84C" }} />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-white">{a.title}</p>
                                {a.description && (
                                    <p className="text-sm text-zinc-400 mt-0.5 line-clamp-1">{a.description}</p>
                                )}
                              </div>
                              {submissions[a.id] && (
                                  <div className="flex items-center gap-2 shrink-0">
                                    {a.scoresVisible && submissions[a.id]?.score !== null && submissions[a.id]?.score !== undefined && (
                                        <span className="text-sm font-semibold" style={{ color: "#C9A84C" }}>
                                          {submissions[a.id].score}%
                                        </span>
                                    )}
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                  </div>
                              )}
                            </button>
                        ))
                    )}
                  </div>
                </section>
              </>
          )}
        </div>

        {/* Assignment Modal */}
        {selectedAssignment && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#7C1D2E33" }}>
                      <FileText className="w-5 h-5" style={{ color: "#C9A84C" }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{selectedAssignment.title}</h2>
                      {existingSubmission?.score !== null && existingSubmission?.score !== undefined && selectedAssignment?.scoresVisible && (
                          <p className="text-sm mt-1">
                            <span className="text-zinc-400">Score: </span>
                            <span className="font-semibold" style={{ color: "#C9A84C" }}>{existingSubmission.score} / 100</span>
                          </p>
                      )}
                    </div>
                  </div>
                  <button
                      type="button"
                      onClick={closeModal}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-700">
                  {["description", "upload", ...(existingSubmission ? ["submission", "custom", "results"] : []), ...(existingSubmission?.feedback ? ["feedback"] : [])].map((tab) => (
                      <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                              activeTab === tab
                                  ? "border-b-2 text-amber-400"
                                  : "text-zinc-400 hover:text-white"
                          }`}
                          style={activeTab === tab ? { borderColor: "#C9A84C", color: "#C9A84C" } : {}}
                      >
                        {tab === "results" && <FlaskConical className="w-3.5 h-3.5" />}
                        {tab === "description"
                            ? "Description"
                            : tab === "upload"
                              ? "Upload Solution"
                              : tab === "submission"
                                ? "My Submission"
                                : tab === "custom"
                                  ? "Run With My Data"
                                : tab === "results"
                                  ? "Test Results"
                                  : "Feedback"}
                      </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "description" && (
                      <div className="space-y-4">
                        {selectedAssignment.description ? (
                            <p className="text-zinc-300 text-sm leading-relaxed">{selectedAssignment.description}</p>
                        ) : (
                            <p className="text-zinc-400 text-sm">No description provided.</p>
                        )}
                        <AssignmentRubric assignmentId={selectedAssignment.id} />
                        <VisibleTestCases assignmentId={selectedAssignment.id} />
                        <button
                            type="button"
                            onClick={() => setActiveTab("upload")}
                            className="mt-2 w-full py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                            style={{ background: "#7C1D2E" }}
                        >
                          Go to Upload Solution
                        </button>
                      </div>
                  )}

                  {activeTab === "upload" && (
                      <div>
                        {submitted ? (
                            <div className="space-y-4">
                              <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <p className="text-green-400 font-semibold text-lg">Submitted successfully!</p>
                                <p className="text-zinc-400 text-sm mt-2">{selectedFile?.name}</p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("results")}
                                    className="mt-4 px-6 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                                    style={{ background: "#7C1D2E" }}
                                >
                                  View Test Results
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("submission")}
                                    className="mt-3 px-6 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors"
                                >
                                  View My Submission
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("custom")}
                                    className="mt-3 px-6 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                                    style={{ background: "#7C1D2E" }}
                                >
                                  Run With My Data
                                </button>
                              </div>
                              <button
                                  type="button"
                                  onClick={() => { setNewAttempt(true); setSelectedFile(null); setSelectedFiles([]); setSubmitted(false); }}
                                  className="w-full py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                                  style={{ background: "#7C1D2E" }}
                              >
                                New Attempt
                              </button>
                              <button
                                  type="button"
                                  onClick={handleRemoveSubmission}
                                  className="w-full py-3 text-sm font-medium text-red-400 bg-red-600/10 border border-red-600/20 rounded-xl hover:bg-red-600/20 transition-colors"
                              >
                                Remove Submission
                              </button>
                              <button
                                  type="button"
                                  onClick={closeModal}
                                  className="w-full py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors"
                              >
                                Close
                              </button>
                            </div>
                        ) : existingSubmission && !newAttempt ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-4 bg-green-600/10 border border-green-600/20 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-green-400 font-medium text-sm">Submitted</p>
                                  <p className="text-zinc-300 text-sm truncate">{existingSubmission.fileName}</p>
                                </div>
                              </div>
                              <button
                                  type="button"
                                  onClick={() => { setNewAttempt(true); setSelectedFile(null); setSelectedFiles([]); }}
                                  className="w-full py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                                  style={{ background: "#7C1D2E" }}
                              >
                                New Attempt
                              </button>
                              <button
                                  type="button"
                                  onClick={handleRemoveSubmission}
                                  className="w-full py-3 text-sm font-medium text-red-400 bg-red-600/10 border border-red-600/20 rounded-xl hover:bg-red-600/20 transition-colors"
                              >
                                Remove Submission
                              </button>
                            </div>
                        ) : existingSubmission && newAttempt ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between gap-3 p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                                    <div className="min-w-0">
                                      <p className="text-zinc-300 text-sm font-medium">Editing Submission</p>
                                      <p className="text-zinc-400 text-xs truncate">{existingSubmission.fileName}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                          type="button"
                                          onClick={handleSaveCode}
                                          disabled={!editorDirty || savingCode}
                                          className="px-3 py-2 text-xs font-medium rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                          style={{ background: "#7C1D2E" }}
                                      >
                                        {savingCode ? "Saving..." : editorDirty ? "Save Code" : "Saved"}
                                      </button>
                                      <button
                                          type="button"
                                          onClick={runProfessorTests}
                                          disabled={loadingResults || savingCode}
                                          className="px-3 py-2 text-xs font-medium rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      >
                                        Run Professor Tests
                                      </button>
                                    </div>
                                  </div>

                                  {codeSaveError && (
                                      <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                                        <p className="text-red-400 text-sm">{codeSaveError}</p>
                                      </div>
                                  )}

                                  <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
                                    <MonacoEditor
                                        height="28rem"
                                        language={editorLanguage}
                                        value={editorText}
                                        onChange={(val) => {
                                          setEditorText(val ?? "");
                                          setEditorDirty(true);
                                        }}
                                        options={{
                                          minimap: { enabled: false },
                                          scrollBeyondLastLine: false,
                                          fontSize: 13,
                                          automaticLayout: true,
                                        }}
                                    />
                                  </div>

                                  <div className="flex gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setNewAttempt(false)}
                                        className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("custom")}
                                        className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                                        style={{ background: "#7C1D2E" }}
                                    >
                                      Run With My Data
                                    </button>
                                  </div>
                                </div>
                            ) : (
                                <>
                                  {newAttempt && (
                                      <p className="text-zinc-400 text-sm mb-4">Submitting a new file will replace your current submission.</p>
                                  )}
                                  <div
                                      onDrop={handleDrop}
                                      onDragOver={(e) => e.preventDefault()}
                                      onClick={() => fileInputRef.current?.click()}
                                      className="border-2 border-dashed border-zinc-600 rounded-xl p-12 text-center cursor-pointer hover:border-zinc-400 transition-colors"
                                  >
                                    <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-4" />
                                    {selectedFiles.length > 0 ? (
                                        <div className="space-y-3">
                                          <p className="text-white font-medium">
                                            Selected {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}.
                                          </p>
                                          <div className="flex flex-col gap-2 items-center">
                                            <p className="text-zinc-400 text-xs">Choose main file to submit:</p>
                                            <p className="text-zinc-500 text-[11px]">
                                              Only one file is submitted.
                                            </p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                              {selectedFiles.map((f) => (
                                                  <button
                                                      key={f.name}
                                                      type="button"
                                                      onClick={(e) => { e.stopPropagation(); setSelectedFile(f); }}
                                                      className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                                                          selectedFile?.name === f.name
                                                              ? "bg-zinc-700 border-zinc-600 text-white"
                                                              : "bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
                                                      }`}
                                                  >
                                                    {f.name}
                                                  </button>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                    ) : (
                                        <>
                                          <p className="text-white font-semibold text-lg">Ready to submit?</p>
                                          <p className="text-zinc-400 text-sm mt-2">Drag and drop multiple files here or click to browse</p>
                                        </>
                                    )}
                                    <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
                                  </div>

                                  {fileError && (
                                      <div className="mt-3 p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                                        <p className="text-red-400 text-sm">{fileError}</p>
                                      </div>
                                  )}

                                  <div className="flex gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={newAttempt ? () => setNewAttempt(false) : closeModal}
                                        className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!selectedFile || submitting}
                                        className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ background: "#7C1D2E" }}
                                    >
                                      {submitting ? "Submitting..." : "Submit"}
                                    </button>
                                  </div>
                                </>
                            )} 
                      </div>
                  )}

                  {activeTab === "submission" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                          <div className="min-w-0">
                            <p className="text-zinc-300 text-sm font-medium">Submission</p>
                            <p className="text-zinc-400 text-xs truncate">{existingSubmission?.fileName || "Unnamed file"}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleSaveCode}
                                disabled={!editorDirty || savingCode}
                                className="px-3 py-2 text-xs font-medium rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ background: "#7C1D2E" }}
                            >
                              {savingCode ? "Saving..." : editorDirty ? "Save Code" : "Saved"}
                            </button>
                            <button
                                type="button"
                                onClick={runProfessorTests}
                                disabled={loadingResults || savingCode}
                                className="px-3 py-2 text-xs font-medium rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Run Professor Tests
                            </button>
                          </div>
                        </div>

                        {codeSaveError && (
                            <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                              <p className="text-red-400 text-sm">{codeSaveError}</p>
                            </div>
                        )}

                        <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
                          <MonacoEditor
                              height="32rem"
                              language={editorLanguage}
                              value={editorText}
                              onChange={(val) => {
                                setEditorText(val ?? "");
                                setEditorDirty(true);
                              }}
                              options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 13,
                                automaticLayout: true,
                              }}
                            />
                        </div>
                      </div>
                  )}

                  {activeTab === "custom" && (
                      <div className="space-y-4">
                        <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl">
                          <p className="text-sm font-medium text-white">Run With My Data</p>
                          <p className="text-zinc-400 text-xs mt-1">Custom runs won’t change your score.</p>
                        </div>

                        {selectedAssignment?.inputMode === "FILE" ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-zinc-300">Custom Input File</p>
                              <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    onChange={handleCustomInputFileChange}
                                    className="text-sm text-zinc-300"
                                />
                                {customInputFile.inputFileName && (
                                    <span className="text-xs text-zinc-400">{customInputFile.inputFileName}</span>
                                )}
                              </div>
                            </div>
                        ) : null}

                        <div className="space-y-3">
                          <p className="text-sm font-medium text-zinc-300">Testcases</p>
                          {customTestCases.map((tc, i) => (
                              <div key={i} className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl space-y-3">
                                <div className="flex items-center gap-3">
                                  <input
                                      value={tc.label}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        setCustomTestCases((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: v } : x)));
                                      }}
                                      placeholder={`Label (optional)`}
                                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40"
                                  />
                                  <button
                                      type="button"
                                      onClick={() => setCustomTestCases((prev) => prev.filter((_, idx) => idx !== i))}
                                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                      disabled={customTestCases.length <= 1}
                                  >
                                    Remove
                                  </button>
                                </div>

                                {selectedAssignment?.inputMode !== "FILE" ? (
                                    <div className="space-y-2">
                                      <p className="text-xs font-medium text-zinc-400">Input</p>
                                      <textarea
                                          rows={4}
                                          value={tc.input}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setCustomTestCases((prev) => prev.map((x, idx) => (idx === i ? { ...x, input: v } : x)));
                                          }}
                                          placeholder="stdin input"
                                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm resize-none"
                                      />
                                    </div>
                                ) : null}

                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-zinc-400">Expected Output</p>
                                  <textarea
                                      rows={4}
                                      value={tc.expectedOutput}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        setCustomTestCases((prev) => prev.map((x, idx) => (idx === i ? { ...x, expectedOutput: v } : x)));
                                      }}
                                      placeholder="expected stdout"
                                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm resize-none"
                                  />
                                </div>
                              </div>
                          ))}

                          <button
                              type="button"
                              onClick={() => setCustomTestCases((prev) => [...prev, { label: "", input: "", expectedOutput: "" }])}
                              className="w-full py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors"
                          >
                            Add Testcase
                          </button>
                        </div>

                        <div className="flex gap-3">
                          <button
                              type="button"
                              onClick={() => {
                                setCustomTestResults([]);
                                setCustomError(null);
                              }}
                              className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors"
                          >
                            Clear Results
                          </button>
                          <button
                              type="button"
                              onClick={runCustomTests}
                              disabled={loadingCustomResults || customTestCases.length === 0}
                              className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ background: "#7C1D2E" }}
                          >
                            {loadingCustomResults ? "Running..." : "Run My Tests"}
                          </button>
                        </div>

                        {customError && (
                            <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                              <p className="text-red-400 text-sm">{customError}</p>
                            </div>
                        )}

                        {customTestResults.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                                <span className="text-zinc-300 text-sm font-medium">My Results</span>
                                <span className="text-sm font-semibold">
                                  <span className="text-green-400">{customTestResults.filter((r) => r.passed).length}</span>
                                  <span className="text-zinc-500"> / </span>
                                  <span className="text-white">{customTestResults.length}</span>
                                  <span className="text-zinc-400"> passed</span>
                                </span>
                              </div>
                              {customTestResults.map((r, idx) => (
                                  <div
                                      key={idx}
                                      className={`p-4 rounded-xl border ${
                                          r.passed ? "bg-green-600/10 border-green-600/20" : "bg-red-600/10 border-red-600/20"
                                      }`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${r.passed ? "bg-green-400" : "bg-red-400"}`} />
                                      <span className={`text-sm font-medium ${r.passed ? "text-green-400" : "text-red-400"}`}>
                                        {r.label || `Test Case ${idx + 1}`} — {r.passed ? "Passed" : "Failed"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">
                                      Expected: <span className="font-mono text-zinc-300">{r.expectedOutput || ""}</span>
                                    </p>
                                    {!r.passed && (
                                        <p className="text-xs text-zinc-400 mt-1">
                                          Got: <span className="font-mono text-red-400">{r.actualOutput || "no output"}</span>
                                        </p>
                                    )}
                                  </div>
                              ))}
                            </div>
                        )}
                      </div>
                  )}

                  {activeTab === "results" && (
                      <div>
                        {loadingResults ? (
                            <p className="text-zinc-400 text-sm text-center py-8">Loading results...</p>
                        ) : testResults.length === 0 ? (
                            <div className="text-center py-8">
                              <FlaskConical className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                              <p className="text-zinc-400 text-sm">No visible test results yet.</p>
                              <p className="text-zinc-500 text-xs mt-1">Test cases may be hidden or none have been added.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl border border-zinc-700">
                                <span className="text-zinc-300 text-sm font-medium">Results</span>
                                <span className="text-sm font-semibold">
                          <span className="text-green-400">{testResults.filter(r => r.passed).length}</span>
                          <span className="text-zinc-500"> / </span>
                          <span className="text-white">{testResults.length}</span>
                          <span className="text-zinc-400"> passed</span>
                        </span>
                              </div>
                              {testResults.map((r) => (
                                  <div
                                      key={r.id}
                                      className={`p-4 rounded-xl border ${r.passed ? "bg-green-600/10 border-green-600/20" : "bg-red-600/10 border-red-600/20"}`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${r.passed ? "bg-green-400" : "bg-red-400"}`} />
                                      <span className={`text-sm font-medium ${r.passed ? "text-green-400" : "text-red-400"}`}>
                              {r.testCase?.label || `Test Case ${r.testCase?.id}`} — {r.passed ? "Passed" : "Failed"}
                            </span>
                                    </div>
                                    {r.testCase?.input && (
                                        <p className="text-xs text-zinc-400 mt-1">Input: <span className="font-mono text-zinc-300">{r.testCase.input}</span></p>
                                    )}
                                    <p className="text-xs text-zinc-400 mt-1">Expected: <span className="font-mono text-zinc-300">{r.testCase?.expectedOutput}</span></p>
                                    {!r.passed && (
                                        <p className="text-xs text-zinc-400 mt-1">Got: <span className="font-mono text-red-400">{r.actualOutput || "no output"}</span></p>
                                    )}
                                  </div>
                              ))}
                            </div>
                        )}
                      </div>
                  )}

                  {activeTab === "feedback" && (
                      <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                        <p className="text-sm font-medium text-zinc-300 mb-2">Instructor Feedback</p>
                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {existingSubmission.feedback}
                        </p>
                      </div>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
  );
}