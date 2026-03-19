"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, Upload, X, CheckCircle, FlaskConical } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newAttempt, setNewAttempt] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "java" && ext !== "py") {
      setFileError("Only .java and .py files are accepted.");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext !== "java" && ext !== "py") {
      setFileError("Only .java and .py files are accepted.");
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
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
      setActiveTab("upload");
    } catch (error) {
      console.error("Error removing submission:", error);
    }
  };

  const closeModal = () => {
    setSelectedAssignment(null);
    setSelectedFile(null);
    setSubmitted(false);
    setSubmitting(false);
    setNewAttempt(false);
    setActiveTab("description");
    setTestResults([]);
    setFileError(null);
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
                                  setSubmitted(false);
                                  setNewAttempt(false);
                                  setActiveTab("description");
                                  setTestResults([]);
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
                  {["description", "upload", ...(existingSubmission ? ["results"] : []), ...(existingSubmission?.feedback ? ["feedback"] : [])].map((tab) => (
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
                        {tab === "description" ? "Description" : tab === "upload" ? "Upload Solution" : tab === "results" ? "Test Results" : "Feedback"}
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
                            <div className="text-center py-8">
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
                                  onClick={closeModal}
                                  className="mt-2 px-6 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors w-full"
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
                                  onClick={() => { setNewAttempt(true); setSelectedFile(null); }}
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
                                {selectedFile ? (
                                    <p className="text-white font-medium">{selectedFile.name}</p>
                                ) : (
                                    <>
                                      <p className="text-white font-semibold text-lg">Ready to submit?</p>
                                      <p className="text-zinc-400 text-sm mt-2">Drag and drop your file here or click to browse</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
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