"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, BookOpen, FileText, Upload, X, CheckCircle, FlaskConical, Users } from "lucide-react";
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
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sample Test Cases</p>
        {testCases.map((tc) => (
            <div key={tc.id} className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs space-y-1">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">{tc.label || `Test Case ${tc.id}`}</p>
              {tc.input && (
                  <p className="text-zinc-500 dark:text-zinc-400">Input: <span className="font-mono text-zinc-700 dark:text-zinc-300">{tc.input}</span></p>
              )}
              <p className="text-zinc-500 dark:text-zinc-400">Expected Output: <span className="font-mono text-zinc-700 dark:text-zinc-300">{tc.expectedOutput}</span></p>
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
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Grading Rubric</p>
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
          {(rubric.criteria || []).map((criteria) => (
              <div key={criteria.id} className="border-b border-zinc-200 dark:border-zinc-700/50 last:border-b-0">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700/40" style={{ background: "#86263314" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-3 rounded-full shrink-0" style={{ background: "#862633" }} />
                    <p className="text-zinc-900 dark:text-white text-xs font-semibold">{criteria.title}</p>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                    {rubric.weighted
                      ? `${(criteria.items || []).reduce((sum, i) => sum + (i.weight || 0), 0)}% weight`
                      : `${(criteria.items || []).reduce((sum, i) => sum + i.maxPoints, 0)} pts`}
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                  {(criteria.items || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-400 dark:text-zinc-600 text-xs shrink-0 select-none">›</span>
                          <span className="text-zinc-700 dark:text-zinc-300 text-xs">{item.label}</span>
                        </div>
                        <span className="text-zinc-500 text-xs shrink-0 ml-2">
                          {rubric.weighted ? `${item.weight}%` : `${item.maxPoints} pts`}
                        </span>
                      </div>
                  ))}
                </div>
              </div>
          ))}
          <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
            <p className="text-zinc-900 dark:text-white text-xs font-semibold">Total</p>
            <p className="text-zinc-900 dark:text-white text-xs font-semibold">
              {rubric.weighted
                ? `${(rubric.criteria || []).flatMap((c) => c.items || []).reduce((sum, i) => sum + (i.weight || 0), 0)}%`
                : `${rubric.totalPoints} pts`}
            </p>
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
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [activeSubmissionFile, setActiveSubmissionFile] = useState(0);
  const [myGroup, setMyGroup] = useState(null);

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

  const [suitePickerOpen, setSuitePickerOpen] = useState(false);
  const [suitePickerList, setSuitePickerList] = useState(null);
  const [loadingSuitePicker, setLoadingSuitePicker] = useState(false);
  const [previewResults, setPreviewResults] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);

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
        .then((data) => setAssignments(Array.isArray(data) ? data.filter((a) => a.published) : []))
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

  useEffect(() => {
    if (!existingSubmission || !user?.id || !selectedAssignment) {
      setSubmissionFiles([]);
      setActiveSubmissionFile(0);
      return;
    }
    fetch(`${API_BASE}/submission/files/${selectedAssignment.id}/${user.id}`)
        .then((res) => res.json())
        .then((data) => { setSubmissionFiles(Array.isArray(data) ? data : []); setActiveSubmissionFile(0); })
        .catch(() => { setSubmissionFiles([]); setActiveSubmissionFile(0); });
  }, [existingSubmission?.submissionId?.userId, selectedAssignment?.id, user?.id]);

  useEffect(() => {
    if (!selectedAssignment?.groupAssignment || !user?.id) { setMyGroup(null); return; }
    fetch(`${API_BASE}/assignment/${selectedAssignment.id}/groups/user/${user.id}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => setMyGroup(data || null))
        .catch(() => setMyGroup(null));
  }, [selectedAssignment?.id, selectedAssignment?.groupAssignment, user?.id]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 10) {
      setFileError("You can submit a maximum of 10 files at once.");
      setSelectedFiles([]);
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

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

    if (files.length > 10) {
      setFileError("You can submit a maximum of 10 files at once.");
      setSelectedFiles([]);
      setSelectedFile(null);
      return;
    }

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

  const readFilesToBase64 = (files) =>
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ fileName: file.name, fileContent: reader.result.split(",")[1] });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

  const runSampleTests = async () => {
    if (!selectedAssignment || selectedFiles.length === 0) return;
    setLoadingPreview(true);
    setPreviewError(null);
    setPreviewResults([]);
    try {
      // Check for visible test cases before running
      const tcRes = await fetch(`${API_BASE}/testcase/assignment/${selectedAssignment.id}/visible`);
      const visibleCases = tcRes.ok ? await tcRes.json() : [];
      if (!Array.isArray(visibleCases) || visibleCases.length === 0) {
        setPreviewError("The instructor hasn't added any visible test cases for this assignment yet.");
        return;
      }

      const entries = await readFilesToBase64(selectedFiles);
      const payload = {
        files: entries,
        inputFileName: selectedAssignment.inputMode === "FILE" ? customInputFile.inputFileName : null,
        inputFileContentBase64: selectedAssignment.inputMode === "FILE" ? customInputFile.inputFileContentBase64 : null,
      };
      const res = await fetch(`${API_BASE}/testcase/preview/${selectedAssignment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const results = await res.json();
      setPreviewResults(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error("runSampleTests error:", err.message);
      setPreviewError("Failed to run tests. Please try again.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleOpenSuitePicker = async () => {
    if (!user?.id) return;
    setSuitePickerOpen(true);
    if (suitePickerList === null) {
      setLoadingSuitePicker(true);
      try {
        const res = await fetch(`${API_BASE}/testsuite/user/${user.id}`);
        const data = await res.json();
        setSuitePickerList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setSuitePickerList([]);
      } finally {
        setLoadingSuitePicker(false);
      }
    }
  };

  const handleLoadSuite = async (suiteId) => {
    setSuitePickerOpen(false);
    try {
      const res = await fetch(`${API_BASE}/testsuite/${suiteId}/cases`);
      const data = await res.json();
      const cases = (Array.isArray(data) ? data : []).map((tc) => ({
        label: tc.label || "",
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
      }));
      setCustomTestCases((prev) => [...prev, ...cases]);
    } catch (err) {
      console.error(err);
    }
  };

  const runCustomTests = async () => {
    if (!selectedAssignment) return;

    const incomplete = customTestCases.some((tc) => !tc.expectedOutput.trim());
    if (incomplete) {
      setCustomError("Please fill in the expected output for each test case before running.");
      return;
    }

    setLoadingCustomResults(true);
    setCustomError(null);
    setCustomTestResults([]);

    try {
      const inputMode = selectedAssignment.inputMode || "STDIN";
      const testCases = customTestCases.map((tc) => ({
        label: tc.label,
        input: inputMode === "STDIN" ? tc.input : null,
        expectedOutput: tc.expectedOutput,
      }));

      if (selectedFiles.length > 0) {
        // Pre-submission: run against staged files via preview endpoint
        const entries = await readFilesToBase64(selectedFiles);
        const payload = {
          files: entries,
          testCases,
          inputFileName: inputMode === "FILE" ? customInputFile.inputFileName : null,
          inputFileContentBase64: inputMode === "FILE" ? customInputFile.inputFileContentBase64 : null,
        };
        const response = await fetch(`${API_BASE}/testcase/preview/${selectedAssignment.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const results = await response.json();
        setCustomTestResults(Array.isArray(results) ? results : []);
      } else {
        // Post-submission: run against existing submission
        if (!user?.id || !existingSubmission) return;
        if (editorDirty) await handleSaveCode();
        const payload = {
          inputFileName: inputMode === "FILE" ? customInputFile.inputFileName : null,
          inputFileContentBase64: inputMode === "FILE" ? customInputFile.inputFileContentBase64 : null,
          testCases,
        };
        const response = await fetch(
          `${API_BASE}/testcase/run/custom/${selectedAssignment.id}/${user.id}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
        );
        if (!response.ok) throw new Error("Custom test run failed");
        const results = await response.json();
        setCustomTestResults(Array.isArray(results) ? results : []);
      }
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
    if (selectedFiles.length === 0 || !user?.id) return;
    setSubmitting(true);
    try {
      const fileEntries = await Promise.all(
        selectedFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result.split(",")[1];
                resolve({ fileName: file.name, fileContent: base64 });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      const response = await fetch(
        `${API_BASE}/submission/submit-files/${selectedAssignment.id}/${user.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: fileEntries }),
        }
      );
      if (!response.ok) throw new Error("Submission failed");
      const updated = await response.json();
      setSubmissions((prev) => ({ ...prev, [selectedAssignment.id]: updated }));
      setSubmitted(true);
      setNewAttempt(false);
      setSubmitting(false);
      setPreviewResults([]);
      setPreviewError(null);
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
    setSuitePickerOpen(false);
    setPreviewResults([]);
    setPreviewError(null);
    setEditorDirty(false);
    setEditorText("");
    setCodeSaveError(null);
    setSubmissionFiles([]);
    setActiveSubmissionFile(0);
    setMyGroup(null);
  };

  if (loading) {
    return <div className="p-8"><p className="text-zinc-500 dark:text-zinc-400">Loading...</p></div>;
  }

  return (
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <Link
              href="/students/dashboard"
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
                    <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "#C9A84C1a" }}>
                      <BookOpen className="w-8 h-8" style={{ color: "#c0a080" }} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{classItem.courseName}</h1>
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
                                className="flex items-center gap-4 p-4 w-full text-left text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors rounded-lg"
                            >
                              <FileText className="w-5 h-5 shrink-0" style={{ color: "#C9A84C" }} />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-zinc-900 dark:text-white">{a.title}</p>
                                {a.description && (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{a.description}</p>
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
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#C9A84C1a" }}>
                      <FileText className="w-5 h-5" style={{ color: "#C9A84C" }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{selectedAssignment.title}</h2>
                      {existingSubmission?.score !== null && existingSubmission?.score !== undefined && selectedAssignment?.scoresVisible && (
                          <p className="text-sm mt-1">
                            <span className="text-zinc-500 dark:text-zinc-400">Score: </span>
                            <span className="font-semibold" style={{ color: "#C9A84C" }}>{existingSubmission.score} / 100</span>
                          </p>
                      )}
                    </div>
                  </div>
                  <button
                      type="button"
                      onClick={closeModal}
                      className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                  {["description", "upload", ...(selectedFiles.length > 0 || existingSubmission ? ["custom"] : []), ...(existingSubmission ? ["submission", "results"] : []), ...(existingSubmission?.feedback ? ["feedback"] : [])].map((tab) => (
                      <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                              activeTab === tab
                                  ? "border-b-2 text-amber-400"
                                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
                <div className="p-6 overflow-y-auto flex-1">
                  {activeTab === "description" && (
                      <div className="space-y-4">
                        {selectedAssignment.description ? (
                            <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">{selectedAssignment.description}</p>
                        ) : (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No description provided.</p>
                        )}
                        {selectedAssignment.groupAssignment && (
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 shrink-0" style={{ color: "#C9A84C" }} />
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">Your Group</p>
                              </div>
                              {myGroup ? (
                                  <>
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">{myGroup.name}</p>
                                    <div className="space-y-1 mb-3">
                                      {(myGroup.members || []).map((m) => (
                                          <div key={m.user?.id} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium" style={{ background: "#C9A84C1a", color: "#c0a080" }}>
                                              {m.user?.firstName?.charAt(0)}{m.user?.lastName?.charAt(0)}
                                            </div>
                                            {m.user?.firstName} {m.user?.lastName}
                                            {m.user?.id === user?.id && <span className="text-zinc-400">(you)</span>}
                                          </div>
                                      ))}
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Any member may submit on behalf of the group.</p>
                                  </>
                              ) : (
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">You have not been assigned to a group yet. Contact your instructor.</p>
                              )}
                            </div>
                        )}
                        <AssignmentRubric assignmentId={selectedAssignment.id} />
                        <VisibleTestCases assignmentId={selectedAssignment.id} />
                        <button
                            type="button"
                            onClick={() => setActiveTab("upload")}
                            className="mt-2 w-full py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                            style={{ background: "#862633" }}
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
                                <p className="text-zinc-400 text-sm mt-2">
                                  {selectedFiles.length > 0
                                    ? selectedFiles.map((f) => f.name).join(", ")
                                    : existingSubmission?.fileName}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("results")}
                                    className="mt-4 px-6 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                                    style={{ background: "#862633" }}
                                >
                                  View Test Results
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("submission")}
                                    className="mt-3 px-6 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                >
                                  View My Submission
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("custom")}
                                    className="mt-3 px-6 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                                    style={{ background: "#862633" }}
                                >
                                  Run With My Data
                                </button>
                              </div>
                              <button
                                  type="button"
                                  onClick={() => { setNewAttempt(true); setSelectedFile(null); setSelectedFiles([]); setSubmitted(false); }}
                                  className="w-full py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                                  style={{ background: "#862633" }}
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
                                  className="w-full py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
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
                                  style={{ background: "#862633" }}
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
                                  <div className="flex items-center justify-between gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                                    <div className="min-w-0">
                                      <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Editing Submission</p>
                                      <p className="text-zinc-500 dark:text-zinc-400 text-xs truncate">{existingSubmission.fileName}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                          type="button"
                                          onClick={handleSaveCode}
                                          disabled={!editorDirty || savingCode}
                                          className="px-3 py-2 text-xs font-medium rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                          style={{ background: "#862633" }}
                                      >
                                        {savingCode ? "Saving..." : editorDirty ? "Save Code" : "Saved"}
                                      </button>
                                      <button
                                          type="button"
                                          onClick={runProfessorTests}
                                          disabled={loadingResults || savingCode}
                                          className="px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                                  <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
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
                                        className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("custom")}
                                        className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                                        style={{ background: "#862633" }}
                                    >
                                      Run With My Data
                                    </button>
                                  </div>
                                </div>
                            ) : (
                                <>
                                  {newAttempt && (
                                      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">Submitting a new file will replace your current submission.</p>
                                  )}
                                  <div
                                      onDrop={handleDrop}
                                      onDragOver={(e) => e.preventDefault()}
                                      onClick={() => fileInputRef.current?.click()}
                                      className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-12 text-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-400 transition-colors"
                                  >
                                    <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-500 mx-auto mb-4" />
                                    {selectedFiles.length > 0 ? (
                                        <div className="space-y-3">
                                          <p className="text-zinc-900 dark:text-white font-medium">
                                            {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                                          </p>
                                          <div className="flex flex-wrap gap-2 justify-center">
                                            {selectedFiles.map((f) => (
                                                <span
                                                    key={f.name}
                                                    className="px-3 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200"
                                                >
                                                  {f.name}
                                                </span>
                                            ))}
                                          </div>
                                          <p className="text-zinc-500 text-xs">Click or drop to change selection</p>
                                        </div>
                                    ) : (
                                        <>
                                          <p className="text-zinc-900 dark:text-white font-semibold text-lg">Ready to submit?</p>
                                          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">Drag and drop up to 10 files here or click to browse</p>
                                        </>
                                    )}
                                    <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
                                  </div>

                                  {fileError && (
                                      <div className="mt-3 p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                                        <p className="text-red-400 text-sm">{fileError}</p>
                                      </div>
                                  )}

                                  {selectedFiles.length > 0 && (
                                      <div className="mt-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                          <button
                                              type="button"
                                              onClick={runSampleTests}
                                              disabled={loadingPreview}
                                              className="flex-1 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {loadingPreview ? "Running..." : "Run Professor Tests"}
                                          </button>
                                          <button
                                              type="button"
                                              onClick={() => setActiveTab("custom")}
                                              className="flex-1 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                          >
                                            Run My Tests
                                          </button>
                                        </div>

                                        {previewError && (
                                            <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                                              <p className="text-red-400 text-sm">{previewError}</p>
                                            </div>
                                        )}

                                        {previewResults.length > 0 && (
                                            <div className="space-y-2">
                                              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                                <span className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Sample Test Results</span>
                                                <span className="text-sm font-semibold">
                                                  <span className="text-green-400">{previewResults.filter((r) => r.passed).length}</span>
                                                  <span className="text-zinc-400 dark:text-zinc-500"> / </span>
                                                  <span className="text-zinc-900 dark:text-white">{previewResults.length}</span>
                                                  <span className="text-zinc-500 dark:text-zinc-400"> passed</span>
                                                </span>
                                              </div>
                                              {previewResults.map((r, idx) => (
                                                  <div
                                                      key={idx}
                                                      className={`p-3 rounded-xl border ${r.passed ? "bg-green-600/10 border-green-600/20" : "bg-red-600/10 border-red-600/20"}`}
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <span className={`w-2 h-2 rounded-full shrink-0 ${r.passed ? "bg-green-400" : "bg-red-400"}`} />
                                                      <span className={`text-sm font-medium ${r.passed ? "text-green-400" : "text-red-400"}`}>
                                                        {r.label || `Test ${idx + 1}`} — {r.passed ? "Passed" : "Failed"}
                                                      </span>
                                                    </div>
                                                    {!r.passed && (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 ml-4">
                                                          Got: <span className="font-mono text-red-400">{r.actualOutput || "no output"}</span>
                                                        </p>
                                                    )}
                                                  </div>
                                              ))}
                                            </div>
                                        )}

                                        {!loadingPreview && previewResults.length === 0 && !previewError && (
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">Test your code before submitting — results are not recorded.</p>
                                        )}
                                      </div>
                                  )}

                                  <div className="flex gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={newAttempt ? () => setNewAttempt(false) : closeModal}
                                        className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={selectedFiles.length === 0 || submitting}
                                        className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ background: "#862633" }}
                                    >
                                      {submitting ? "Submitting..." : "Submit for Grading"}
                                    </button>
                                  </div>
                                </>
                            )} 
                      </div>
                  )}

                  {activeTab === "submission" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                          <div className="min-w-0">
                            <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Submission</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs truncate">
                              {submissionFiles.length > 1
                                ? `${submissionFiles.length} files`
                                : existingSubmission?.fileName || "Unnamed file"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {submissionFiles.length <= 1 && (
                              <button
                                  type="button"
                                  onClick={handleSaveCode}
                                  disabled={!editorDirty || savingCode}
                                  className="px-3 py-2 text-xs font-medium rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ background: "#862633" }}
                              >
                                {savingCode ? "Saving..." : editorDirty ? "Save Code" : "Saved"}
                              </button>
                            )}
                            <button
                                type="button"
                                onClick={runProfessorTests}
                                disabled={loadingResults || savingCode}
                                className="px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                        {submissionFiles.length > 1 ? (
                            <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                              <div className="flex border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto">
                                {submissionFiles.map((f, i) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => setActiveSubmissionFile(i)}
                                        className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 shrink-0 ${
                                            activeSubmissionFile === i
                                                ? "text-white border-[#862633]"
                                                : "text-zinc-500 dark:text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-200"
                                        }`}
                                    >
                                      {f.fileName}
                                    </button>
                                ))}
                              </div>
                              <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono p-4 overflow-auto max-h-[32rem]">
                                {submissionFiles[activeSubmissionFile]?.fileContent
                                    ? decodeBase64ToUtf8(submissionFiles[activeSubmissionFile].fileContent)
                                    : "No file content available."}
                              </pre>
                            </div>
                        ) : (
                            <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
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
                        )}
                      </div>
                  )}

                  {activeTab === "custom" && (
                      <div className="space-y-4">
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">Run With My Data</p>
                          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Custom runs won’t change your score.</p>
                        </div>

                        {selectedAssignment?.inputMode === "FILE" ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Custom Input File</p>
                              <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    onChange={handleCustomInputFileChange}
                                    className="text-sm text-zinc-600 dark:text-zinc-300"
                                />
                                {customInputFile.inputFileName && (
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{customInputFile.inputFileName}</span>
                                )}
                              </div>
                            </div>
                        ) : null}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Testcases</p>
                            <div className="flex items-center gap-2">
                              <button
                                  type="button"
                                  onClick={() => setCustomTestCases((prev) => [...prev, { label: "", input: "", expectedOutput: "" }])}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                              >
                                + Add Test Case
                              </button>
                            <div className="relative">
                              <button
                                  type="button"
                                  onClick={handleOpenSuitePicker}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                              >
                                <FlaskConical className="w-3.5 h-3.5" />
                                Load from Suite
                              </button>
                              {suitePickerOpen && (
                                  <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-10 overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
                                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">My Test Suites</p>
                                      <button type="button" onClick={() => setSuitePickerOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {loadingSuitePicker ? (
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 px-3 py-3">Loading...</p>
                                    ) : suitePickerList?.length === 0 ? (
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 px-3 py-3">No suites yet. Create one in Test Suites.</p>
                                    ) : (
                                        <div className="max-h-48 overflow-y-auto py-1">
                                          {suitePickerList?.map((suite) => (
                                              <button
                                                  key={suite.id}
                                                  type="button"
                                                  onClick={() => handleLoadSuite(suite.id)}
                                                  className="w-full text-left px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                              >
                                                <p className="text-sm text-zinc-900 dark:text-white font-medium">{suite.name}</p>
                                                {suite.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{suite.description}</p>}
                                              </button>
                                          ))}
                                        </div>
                                    )}
                                  </div>
                              )}
                            </div>
                          </div>
                          </div>
                          {customTestCases.map((tc, i) => (
                              <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-3">
                                <div className="flex items-center gap-3">
                                  <input
                                      value={tc.label}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        setCustomTestCases((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: v } : x)));
                                      }}
                                      placeholder={`Label (optional)`}
                                      className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40"
                                  />
                                  <button
                                      type="button"
                                      onClick={() => setCustomTestCases((prev) => prev.filter((_, idx) => idx !== i))}
                                      className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                      disabled={customTestCases.length <= 1}
                                  >
                                    Remove
                                  </button>
                                </div>

                                {selectedAssignment?.inputMode !== "FILE" ? (
                                    <div className="space-y-2">
                                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Input</p>
                                      <textarea
                                          rows={4}
                                          value={tc.input}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setCustomTestCases((prev) => prev.map((x, idx) => (idx === i ? { ...x, input: v } : x)));
                                          }}
                                          placeholder="stdin input"
                                          className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm resize-none"
                                      />
                                    </div>
                                ) : null}

                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Expected Output</p>
                                  <textarea
                                      rows={4}
                                      value={tc.expectedOutput}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        setCustomTestCases((prev) => prev.map((x, idx) => (idx === i ? { ...x, expectedOutput: v } : x)));
                                      }}
                                      placeholder="expected stdout"
                                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm resize-none"
                                  />
                                </div>
                              </div>
                          ))}

                        </div>

                        <div className="flex gap-3">
                          <button
                              type="button"
                              onClick={() => {
                                setCustomTestResults([]);
                                setCustomError(null);
                              }}
                              className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                          >
                            Clear Results
                          </button>
                          <button
                              type="button"
                              onClick={runCustomTests}
                              disabled={loadingCustomResults || customTestCases.length === 0}
                              className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ background: "#862633" }}
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
                              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <span className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">My Results</span>
                                <span className="text-sm font-semibold">
                                  <span className="text-green-400">{customTestResults.filter((r) => r.passed).length}</span>
                                  <span className="text-zinc-400 dark:text-zinc-500"> / </span>
                                  <span className="text-zinc-900 dark:text-white">{customTestResults.length}</span>
                                  <span className="text-zinc-500 dark:text-zinc-400"> passed</span>
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
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                      Expected: <span className="font-mono text-zinc-700 dark:text-zinc-300">{r.expectedOutput || ""}</span>
                                    </p>
                                    {!r.passed && (
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-8">Loading results...</p>
                        ) : testResults.length === 0 ? (
                            <div className="text-center py-8">
                              <FlaskConical className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto mb-3" />
                              <p className="text-zinc-500 dark:text-zinc-400 text-sm">No visible test results yet.</p>
                              <p className="text-zinc-500 text-xs mt-1">Test cases may be hidden or none have been added.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <span className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Results</span>
                                <span className="text-sm font-semibold">
                          <span className="text-green-400">{testResults.filter(r => r.passed).length}</span>
                          <span className="text-zinc-400 dark:text-zinc-500"> / </span>
                          <span className="text-zinc-900 dark:text-white">{testResults.length}</span>
                          <span className="text-zinc-500 dark:text-zinc-400"> passed</span>
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
                                    {!r.passed && (
                                        <>
                                          {r.testCase?.input && (
                                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Input: <span className="font-mono text-zinc-700 dark:text-zinc-300">{r.testCase.input}</span></p>
                                          )}
                                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Expected: <span className="font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{r.testCase?.expectedOutput || "(empty)"}</span></p>
                                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Got: <span className="font-mono text-red-400 whitespace-pre-wrap">{r.actualOutput || "(no output)"}</span></p>
                                        </>
                                    )}
                                  </div>
                              ))}
                            </div>
                        )}
                      </div>
                  )}

                  {activeTab === "feedback" && (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Instructor Feedback</p>
                        <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
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