"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, X, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, FlaskConical, ClipboardList, CheckCircle, Link, MoreVertical, FileInput, Users, UserPlus, ChevronRight, Shuffle, BarChart3 } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Dialog from "@/components/Dialog";
import AiDetectionBadge from "@/components/AiDetectionBadge";  // ← new
import AssignmentReportDialog from "@/components/faculty/AssignmentReportDialog";
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
  const [assignmentReportOpen, setAssignmentReportOpen] = useState(false);
  const [runningPlagiarism, setRunningPlagiarism] = useState(false);
  const [expandedPair, setExpandedPair] = useState(null);
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null);
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [savingFeedback, setSavingFeedback] = useState({});
  const [gradingFiles, setGradingFiles] = useState([]);
  const [activeGradingFile, setActiveGradingFile] = useState(0);
  const [solutionFiles, setSolutionFiles] = useState([]);
  const [activeSolutionFile, setActiveSolutionFile] = useState(0);

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

  // Group assignment state
  const [groups, setGroups] = useState([]);
  const [groupsExpanded, setGroupsExpanded] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [autoGroupSize, setAutoGroupSize] = useState(2);
  const [autoGroupOverwrite, setAutoGroupOverwrite] = useState(false);
  const [courseStudents, setCourseStudents] = useState([]);
  const [expandedGroupRows, setExpandedGroupRows] = useState(new Set());
  const [distributingGrade, setDistributingGrade] = useState({});

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

  // Load groups and course students when assignment is a group assignment
  useEffect(() => {
    if (!assignment?.groupAssignment || !crn) return;
    fetch(`${API_BASE}/assignment/${assignmentId}/groups`)
        .then((res) => res.json())
        .then((data) => setGroups(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));
    fetch(`${API_BASE}/courseUser/roster/${crn}`)
        .then((res) => res.json())
        .then((data) => {
          const students = Array.isArray(data) ? data.filter(cu => cu.courseRole === "STUDENT").map(cu => cu.user) : [];
          setCourseStudents(students);
        })
        .catch((err) => console.error(err));
  }, [assignment?.groupAssignment, assignmentId, crn]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuUserId(null);
    if (openMenuUserId) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuUserId]);

  useEffect(() => {
    if (!openSolution) { setSolutionFiles([]); setActiveSolutionFile(0); resetSolutionExecState(); return; }
    resetSolutionExecState();
    const userId = openSolution.submissionId.userId;
    const cached = testResults.filter(r => r.submission?.submissionId?.userId === userId);
    if (cached.length > 0) {
      setSolutionRunResults(cached.map(r => ({ label: r.testCase?.label ?? `Test ${r.id}`, passed: r.passed, actualOutput: r.actualOutput })));
    }
    fetch(`${API_BASE}/submission/files/${assignmentId}/${userId}`)
        .then((res) => res.json())
        .then((data) => { setSolutionFiles(Array.isArray(data) ? data : []); setActiveSolutionFile(0); })
        .catch(() => { setSolutionFiles([]); setActiveSolutionFile(0); });
  }, [openSolution?.submissionId?.userId, assignmentId]);

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
    if (!gradingStudent) { setGradingFiles([]); setActiveGradingFile(0); resetGradingExecState(); return; }
    resetGradingExecState();
    const cached = testResults.filter(r => r.submission?.submissionId?.userId === gradingStudent);
    if (cached.length > 0) {
      setGradingRunResults(cached.map(r => ({ label: r.testCase?.label ?? `Test ${r.id}`, passed: r.passed, actualOutput: r.actualOutput })));
    }
    fetch(`${API_BASE}/submission/files/${assignmentId}/${gradingStudent}`)
        .then((res) => res.json())
        .then((data) => { setGradingFiles(Array.isArray(data) ? data : []); setActiveGradingFile(0); })
        .catch(() => { setGradingFiles([]); setActiveGradingFile(0); });
  }, [gradingStudent, assignmentId]);

  useEffect(() => {
    if (!gradingStudent || !assignedRubric) return;
    fetch(`${API_BASE}/rubric/scores/${assignmentId}/${gradingStudent}`)
        .then((res) => res.json())
        .then((data) => {
          const map = {};
          if (Array.isArray(data)) { data.forEach((rs) => { map[rs.rubricItem.id] = rs.awardedPoints; }); }
          if (!assignedRubric.weighted) {
            (assignedRubric.criteria || []).flatMap((c) => c.items || []).forEach((item) => {
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
  }, [gradingStudent, assignedRubric, assignmentId]);

  const isSubmissionLate = (submission) => {
    if (!submission?.submittedAt || !assignment?.dueDate) return false;
    return new Date(submission.submittedAt) > new Date(assignment.dueDate);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return null;
    return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

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
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: Math.round(parseInt(score) / (assignment?.totalPoints ?? 100) * 100) }),
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

  const reloadGroups = () =>
      fetch(`${API_BASE}/assignment/${assignmentId}/groups`)
          .then((res) => res.json())
          .then((data) => setGroups(Array.isArray(data) ? data : []))
          .catch((err) => console.error(err));

  const handleCreateGroup = async () => {
    const name = newGroupName.trim() || `Group ${groups.length + 1}`;
    try {
      await fetch(`${API_BASE}/assignment/${assignmentId}/groups`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
      setNewGroupName("");
      reloadGroups();
    } catch (err) { console.error(err); }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await fetch(`${API_BASE}/assignment/${assignmentId}/groups/${groupId}`, { method: "DELETE" });
      reloadGroups();
    } catch (err) { console.error(err); }
  };

  const handleRenameGroup = async (groupId, name) => {
    if (!name.trim()) return;
    try {
      await fetch(`${API_BASE}/assignment/${assignmentId}/groups/${groupId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
      reloadGroups();
    } catch (err) { console.error(err); }
  };

  const handleAddMember = async (groupId, userId) => {
    try {
      const res = await fetch(`${API_BASE}/assignment/${assignmentId}/groups/${groupId}/members/${userId}`, { method: "POST" });
      if (!res.ok) { const msg = await res.text(); alert(msg || "Could not add member."); return; }
      reloadGroups();
    } catch (err) { console.error(err); }
  };

  const handleRemoveMember = async (groupId, userId) => {
    try {
      await fetch(`${API_BASE}/assignment/${assignmentId}/groups/${groupId}/members/${userId}`, { method: "DELETE" });
      reloadGroups();
    } catch (err) { console.error(err); }
  };

  const handleAutoGenerate = async () => {
    try {
      await fetch(`${API_BASE}/assignment/${assignmentId}/groups/auto-generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupSize: autoGroupSize, overwriteExisting: autoGroupOverwrite }),
      });
      reloadGroups();
    } catch (err) { console.error(err); }
  };

  const handleDistributeGrade = async (groupId, submitterId) => {
    const score = scoreInputs[submitterId] !== "" ? Math.round(parseInt(scoreInputs[submitterId]) / (assignment?.totalPoints ?? 100) * 100) : null;
    const feedback = feedbackInputs[submitterId] || null;
    setDistributingGrade((prev) => ({ ...prev, [groupId]: true }));
    try {
      const res = await fetch(`${API_BASE}/assignment/${assignmentId}/groups/${groupId}/distribute-grade`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score, feedback, submitterId }),
      });
      if (!res.ok) throw new Error("Failed to distribute grade");
      const subRes = await fetch(`${API_BASE}/submission/assignment/${assignmentId}`);
      const subData = await subRes.json();
      const list = Array.isArray(subData) ? subData : [];
      const inputs = {};
      const feedbacks = {};
      const totalPts = assignment?.totalPoints ?? 100;
      list.forEach((s) => {
        inputs[s.submissionId.userId] = s.score != null ? Math.round(s.score / 100 * totalPts) : "";
        feedbacks[s.submissionId.userId] = s.feedback ?? "";
      });
      setSubmissions(list);
      setScoreInputs(inputs);
      setFeedbackInputs(feedbacks);
      if (assignedRubric) {
        const group = groups.find(g => g.id === groupId);
        if (group) {
          const totalsUpdates = await Promise.all(
            group.members.map(async (m) => {
              const r = await fetch(`${API_BASE}/rubric/totalscore/${assignmentId}/${m.user.id}`);
              return [m.user.id, await r.json()];
            })
          );
          setRubricTotals((prev) => {
            const next = { ...prev };
            totalsUpdates.forEach(([uid, data]) => { next[uid] = data; });
            return next;
          });
        }
      }
    } catch (err) { console.error(err); } finally { setDistributingGrade((prev) => ({ ...prev, [groupId]: false })); }
  };

  // Find which group a user belongs to
  const getUserGroup = (userId) => groups.find(g => g.members?.some(m => m.user?.id === userId));

  // Get unassigned students (not in any group for this assignment)
  const assignedUserIds = new Set(groups.flatMap(g => g.members?.map(m => m.user?.id) ?? []));
  const unassignedStudents = courseStudents.filter(u => !assignedUserIds.has(u.id));

  // Distinct colors per group, cycling through a palette
  const GROUP_COLORS = [
    { bg: "#86263318", border: "#86263344", text: "#c0504d" },
    { bg: "#1e3a8a18", border: "#3b82f644", text: "#60a5fa" },
    { bg: "#14532d18", border: "#22c55e44", text: "#4ade80" },
    { bg: "#4c1d9518", border: "#a855f744", text: "#c084fc" },
    { bg: "#7c2d1218", border: "#f9731644", text: "#fb923c" },
    { bg: "#16424518", border: "#06b6d444", text: "#22d3ee" },
    { bg: "#71350018", border: "#eab30844", text: "#fbbf24" },
    { bg: "#83185018", border: "#ec489944", text: "#f472b6" },
  ];
  const getGroupColor = (groupId) => {
    const idx = groups.findIndex(g => g.id === groupId);
    return GROUP_COLORS[(idx >= 0 ? idx : 0) % GROUP_COLORS.length];
  };

  // For group assignments, only show one submission per group (the actual submitter).
  // Primary submitter = group member who has test results (real code run), or first member
  // with a submission if no test results exist. Members who only received a distributed grade
  // are shown in the expandable dropdown, not as their own table rows.
  const displayedSubmissions = (() => {
    if (!assignment?.groupAssignment || groups.length === 0) return submissions;
    const primaryByGroup = {};
    groups.forEach(group => {
      const memberIds = group.members.map(m => m.user?.id);
      const withResults = memberIds.find(uid => testResults.some(r => r.submission?.submissionId?.userId === uid));
      if (withResults) { primaryByGroup[group.id] = withResults; return; }
      const withSub = memberIds.find(uid => submissions.some(s => s.submissionId.userId === uid));
      if (withSub) primaryByGroup[group.id] = withSub;
    });
    return submissions.filter(s => {
      const uid = s.submissionId.userId;
      const group = getUserGroup(uid);
      if (!group) return true;
      return primaryByGroup[group.id] === uid;
    });
  })();

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
      const totalPts = assignment?.totalPoints ?? 100;
      list.forEach((s) => { inputs[s.submissionId.userId] = s.score != null ? Math.round(s.score / 100 * totalPts) : ""; });
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
      const totalPts = assignment?.totalPoints ?? 100;
      list.forEach((s) => { inputs[s.submissionId.userId] = s.score != null ? Math.round(s.score / 100 * totalPts) : ""; });
      setScoreInputs(inputs);
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
      setAssignment(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleTogglePublished = async () => {
    try {
      const res = await fetch(`${API_BASE}/assignment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...assignment, published: !assignment.published }),
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

  // Fall back to openSolution.fileContent when submission_files table is empty
  // (happens for code-editor submissions that use the save-code endpoint)
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
    setSolutionRunning(true); setSolutionRunResults(null); setSolutionRunError(null);
    try {
      if (Object.keys(solutionEdits).length > 0) {
        const files = getEffectiveSolutionFiles();
        const res = await fetch(`${API_BASE}/testcase/preview/${assignmentId}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: buildFilesPayload(files, solutionEdits), testCases: testCases.map(tc => ({ label: tc.label, input: tc.input, expectedOutput: tc.expectedOutput })) }),
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
    setSolutionCustomRunning(true); setSolutionCustomResult(null); setSolutionCustomError(null);
    try {
      const fileArgs = solutionCustomInputFile.inputFileName ? { inputFileName: solutionCustomInputFile.inputFileName, inputFileContentBase64: solutionCustomInputFile.inputFileContentBase64 } : {};
      const tc = [{ label: "Custom", input: solutionCustomInput || null, expectedOutput: "" }];
      const edited = Object.keys(solutionEdits).length > 0;
      const files = getEffectiveSolutionFiles();
      const res = await fetch(
        edited ? `${API_BASE}/testcase/preview/${assignmentId}` : `${API_BASE}/testcase/run/custom/${assignmentId}/${userId}`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(edited ? { files: buildFilesPayload(files, solutionEdits), testCases: tc, ...fileArgs } : { testCases: tc, ...fileArgs }) }
      );
      if (!res.ok) throw new Error();
      const results = await res.json();
      setSolutionCustomResult(results[0] ?? null);
    } catch { setSolutionCustomError("Failed to run."); }
    finally { setSolutionCustomRunning(false); }
  };

  const handleGradingRunSaved = async () => {
    setGradingRunning(true); setGradingRunResults(null); setGradingRunError(null);
    try {
      const gradingSubmission = submissions.find(s => s.submissionId.userId === gradingStudent);
      if (Object.keys(gradingEdits).length > 0) {
        const files = getEffectiveGradingFiles(gradingSubmission);
        const res = await fetch(`${API_BASE}/testcase/preview/${assignmentId}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: buildFilesPayload(files, gradingEdits), testCases: testCases.map(tc => ({ label: tc.label, input: tc.input, expectedOutput: tc.expectedOutput })) }),
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
    setGradingCustomRunning(true); setGradingCustomResult(null); setGradingCustomError(null);
    try {
      const gradingSubmission = submissions.find(s => s.submissionId.userId === gradingStudent);
      const fileArgs = gradingCustomInputFile.inputFileName ? { inputFileName: gradingCustomInputFile.inputFileName, inputFileContentBase64: gradingCustomInputFile.inputFileContentBase64 } : {};
      const tc = [{ label: "Custom", input: gradingCustomInput || null, expectedOutput: "" }];
      const edited = Object.keys(gradingEdits).length > 0;
      const files = getEffectiveGradingFiles(gradingSubmission);
      const res = await fetch(
        edited ? `${API_BASE}/testcase/preview/${assignmentId}` : `${API_BASE}/testcase/run/custom/${assignmentId}/${gradingStudent}`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(edited ? { files: buildFilesPayload(files, gradingEdits), testCases: tc, ...fileArgs } : { testCases: tc, ...fileArgs }) }
      );
      if (!res.ok) throw new Error();
      const results = await res.json();
      setGradingCustomResult(results[0] ?? null);
    } catch { setGradingCustomError("Failed to run."); }
    finally { setGradingCustomRunning(false); }
  };

  if (loading) return <div className="p-8"><p className="text-zinc-500 dark:text-zinc-400">Loading...</p></div>;

  const inputClass = "w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm";

  return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <button type="button" onClick={() => router.push(`/faculty/courses/${crn}`)} className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Course
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Grading Workspace</h1>
              {isFileMode && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "#C9A84C22", color: "#C9A84C" }}>
                    <FileInput className="w-3.5 h-3.5" /> File Input — {assignment.inputFileName}
                  </span>
              )}
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{assignment?.title} • {submissions.length} Submission{submissions.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Submissions Table */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Submissions</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Published</span>
                  <button
                      type="button"
                      onClick={handleTogglePublished}
                      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                      style={assignment?.published ? { background: "#862633" } : { background: "#52525b" }}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${assignment?.published ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Show scores to students</span>
                  <button
                      type="button"
                      onClick={handleToggleScoresVisible}
                      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                      style={assignment?.scoresVisible ? { background: "#862633" } : { background: "#52525b" }}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${assignment?.scoresVisible ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700" />
                <button type="button" onClick={() => setAssignmentReportOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors" style={{ color: "#C9A84C", borderColor: "#C9A84C44", background: "#C9A84C11" }}>
                  <BarChart3 className="w-4 h-4" /> Assignment Report
                </button>
                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700" />
                {plagiarismResults && (
                    <button type="button" onClick={() => setPlagiarismOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors" style={{ color: "#C9A84C", borderColor: "#C9A84C44", background: "#C9A84C11" }}>
                      View Results
                    </button>
                )}
                <button type="button" onClick={handleCheckPlagiarism} disabled={runningPlagiarism || submissions.length < 2} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#862633" }}>
                  {runningPlagiarism ? "Running..." : plagiarismResults ? "Re-run Check" : "Check Plagiarism"}
                </button>
              </div>
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
                {displayedSubmissions.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 px-4 text-center text-zinc-500 dark:text-zinc-400">No submissions yet.</td></tr>
                ) : (
                    displayedSubmissions.map((s) => {
                      const userId = s.submissionId.userId;
                      const studentResults = getResultsForStudent(userId);
                      const isExpanded = expandedStudent === userId;
                      const rubricTotal = rubricTotals[userId];
                      const menuOpen = openMenuUserId === userId;

                      // Group assignment: find this submitter's group and other members
                      const group = assignment?.groupAssignment ? getUserGroup(userId) : null;
                      const groupColor = group ? getGroupColor(group.id) : null;
                      const allOtherMembers = group ? group.members.filter(m => m.user?.id !== userId) : [];
                      const groupRowExpanded = expandedGroupRows.has(userId);

                      return (
                          <React.Fragment key={userId}>
                            <tr className="border-b border-zinc-200 dark:border-zinc-700/50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {group && allOtherMembers.length > 0 && (
                                      <button
                                          type="button"
                                          onClick={() => setExpandedGroupRows((prev) => {
                                            const next = new Set(prev);
                                            next.has(userId) ? next.delete(userId) : next.add(userId);
                                            return next;
                                          })}
                                          className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                                      >
                                        {groupRowExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                      </button>
                                  )}
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#C9A84C1a" }}>
                                    <span className="text-xs font-medium" style={{ color: "#c0a080" }}>{s.user?.firstName?.charAt(0)}{s.user?.lastName?.charAt(0)}</span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-zinc-700 dark:text-zinc-300">{s.user?.firstName} {s.user?.lastName}</span>
                                      {isSubmissionLate(s) && (
                                          <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-red-600/15 text-red-400 border border-red-600/25">Late</span>
                                      )}
                                      {group && groupColor && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: groupColor.bg, color: groupColor.text, border: `1px solid ${groupColor.border}` }}>
                                            <Users className="w-3 h-3" />{group.name}
                                          </span>
                                      )}
                                    </div>
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
                                      onClick={() => setOpenMenuUserId(menuOpen ? null : userId)}
                                      className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  {menuOpen && (
                                      <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                                        <button type="button" onClick={() => { setOpenSolution(s); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors text-left">
                                          <FileText className="w-4 h-4 shrink-0" /> Open Submission
                                        </button>
                                        {assignedRubric && (
                                            <button type="button" onClick={() => { setGradingStudent(userId); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors text-left">
                                              <ClipboardList className="w-4 h-4 shrink-0" />
                                              Grade Rubric
                                              {rubricTotal && <span className="text-zinc-500 text-xs ml-auto">({rubricTotal.awarded}/{rubricTotal.possible})</span>}
                                            </button>
                                        )}
                                        <div className="border-t border-zinc-200 dark:border-zinc-700 mt-1" />
                                        <button type="button" onClick={() => { setConfirmDeleteUserId(userId); setOpenMenuUserId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                                          <Trash2 className="w-4 h-4 shrink-0" /> Remove Submission
                                        </button>
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
                            {/* Group member rows — expanded under the submitter */}
                            {group && groupRowExpanded && allOtherMembers.length > 0 && (
                                <>
                                  {allOtherMembers.map((m) => {
                                    const mId = m.user?.id;
                                    const memberSub = submissions.find(sub => sub.submissionId.userId === mId);
                                    const mRubricTotal = rubricTotals[mId];
                                    return (
                                        <tr key={`member-${mId}`} className="border-b border-zinc-200 dark:border-zinc-700/30 bg-zinc-50 dark:bg-zinc-900/60">
                                          <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-2 pl-6">
                                              <div className="w-1 h-4 rounded-full shrink-0" style={{ background: groupColor?.border ?? "#52525b" }} />
                                              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: groupColor?.bg ?? "#52525b22" }}>
                                                <span className="text-xs font-medium" style={{ color: groupColor?.text ?? "#a1a1aa" }}>{m.user?.firstName?.charAt(0)}{m.user?.lastName?.charAt(0)}</span>
                                              </div>
                                              <span className="text-sm text-zinc-600 dark:text-zinc-400">{m.user?.firstName} {m.user?.lastName}</span>
                                              {mRubricTotal && <span className="text-xs text-zinc-500 ml-1">({mRubricTotal.awarded}/{mRubricTotal.possible} rubric)</span>}
                                            </div>
                                          </td>
                                          <td className="py-2.5 px-4">
                                            {memberSub ? (
                                                <div className="flex items-center gap-2">
                                                  <input type="number" min="0" max="100" value={scoreInputs[mId] ?? ""} onChange={(e) => setScoreInputs((prev) => ({ ...prev, [mId]: e.target.value }))} placeholder="—" className="w-16 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40" />
                                                  <span className="text-zinc-500 text-xs">/ {assignment?.totalPoints ?? 100}</span>
                                                  <button type="button" onClick={() => handleScoreSave(mId)} disabled={savingScore[mId]} className="px-2.5 py-1 text-xs font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#862633" }}>
                                                    {savingScore[mId] ? "Saving..." : "Save"}
                                                  </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">No grade yet</span>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-4">
                                            <span className="text-zinc-500 text-xs">—</span>
                                          </td>
                                          <td className="py-2.5 px-4" />
                                        </tr>
                                    );
                                  })}
                                  {/* Distribute row */}
                                  <tr className="border-b border-zinc-200 dark:border-zinc-700/30 bg-zinc-50 dark:bg-zinc-900/60">
                                    <td colSpan={4} className="py-2 px-4">
                                      <div className="pl-6 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleDistributeGrade(group.id, userId)}
                                            disabled={distributingGrade[group.id]}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50"
                                            style={{ color: groupColor?.text ?? "#862633", borderColor: groupColor?.border ?? "#86263344", background: groupColor?.bg ?? "#86263311" }}
                                        >
                                          <Users className="w-3.5 h-3.5" />
                                          {distributingGrade[group.id] ? "Distributing..." : `Distribute ${s.user?.firstName}'s grade to all`}
                                        </button>
                                        <span className="text-xs text-zinc-400">Copies score{assignedRubric ? " and rubric scores" : ""} to all group members</span>
                                      </div>
                                    </td>
                                  </tr>
                                </>
                            )}
                          </React.Fragment>
                      );
                    })
                )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Groups Section — only for group assignments */}
          {assignment?.groupAssignment && (
              <section className="mb-8">
                <div
                    className="flex items-center justify-between mb-4 cursor-pointer"
                    onClick={() => setGroupsExpanded((p) => !p)}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Groups</h2>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{groups.length} group{groups.length !== 1 ? "s" : ""}</span>
                  </div>
                  {groupsExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronRight className="w-5 h-5 text-zinc-400" />}
                </div>

                {groupsExpanded && (
                    <div className="space-y-4">
                      {/* Auto-generate bar */}
                      <div className="flex flex-wrap items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 shrink-0">Auto-generate:</span>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-zinc-500 dark:text-zinc-400">Size</label>
                          <input type="number" min="2" max="20" value={autoGroupSize} onChange={(e) => setAutoGroupSize(parseInt(e.target.value) || 2)} className="w-16 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600/40" />
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 cursor-pointer">
                          <input type="checkbox" checked={autoGroupOverwrite} onChange={(e) => setAutoGroupOverwrite(e.target.checked)} className="w-3.5 h-3.5" />
                          Replace existing groups
                        </label>
                        <button type="button" onClick={handleAutoGenerate} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#862633" }}>
                          <Shuffle className="w-3.5 h-3.5" /> Generate
                        </button>
                        <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-600 mx-1" />
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="New group name…" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg px-3 py-1 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600/40" onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()} />
                          <button type="button" onClick={handleCreateGroup} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#52525b" }}>
                            <Plus className="w-3.5 h-3.5" /> New Group
                          </button>
                        </div>
                      </div>

                      {/* Group cards */}
                      {groups.length === 0 ? (
                          <p className="text-zinc-500 dark:text-zinc-400 text-sm p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl">No groups yet. Auto-generate or create one manually.</p>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groups.map((group) => {
                              const gc = getGroupColor(group.id);
                              return (
                                <div key={group.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm" style={{ border: `1.5px solid ${gc.border}` }}>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: gc.text }} />
                                      <input
                                          type="text"
                                          defaultValue={group.name}
                                          className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-600/40 rounded px-1"
                                          onBlur={(e) => { if (e.target.value !== group.name) handleRenameGroup(group.id, e.target.value); }}
                                          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                                      />
                                    </div>
                                    <button type="button" onClick={() => handleDeleteGroup(group.id)} className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors ml-2">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="space-y-1 mb-3">
                                    {(group.members || []).length === 0 ? (
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500">No members yet</p>
                                    ) : (
                                        (group.members || []).map((m) => (
                                            <div key={m.user?.id} className="flex items-center justify-between text-xs">
                                              <span className="text-zinc-700 dark:text-zinc-300">{m.user?.firstName} {m.user?.lastName}</span>
                                              <button type="button" onClick={() => handleRemoveMember(group.id, m.user?.id)} className="text-zinc-400 hover:text-red-400 transition-colors ml-2">
                                                <X className="w-3 h-3" />
                                              </button>
                                            </div>
                                        ))
                                    )}
                                  </div>
                                  {unassignedStudents.length > 0 && (
                                      <select
                                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
                                          value=""
                                          onChange={(e) => { if (e.target.value) handleAddMember(group.id, e.target.value); }}
                                      >
                                        <option value="">+ Add member…</option>
                                        {unassignedStudents.map((u) => (
                                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                                        ))}
                                      </select>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                      )}

                      {unassignedStudents.length > 0 && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{unassignedStudents.length} student{unassignedStudents.length !== 1 ? "s" : ""} not yet assigned to a group.</p>
                      )}
                    </div>
                )}
              </section>
          )}

          {/* Rubric Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Rubric</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">Attach a rubric to enable structured grading for this assignment.</p>
              </div>
              {assignedRubric ? (
                  <button type="button" onClick={handleDetachRubric} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-600/10 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-colors">
                    <Trash2 className="w-4 h-4" /> Remove Rubric
                  </button>
              ) : (
                  <button type="button" onClick={() => setAttachRubricOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#862633" }}>
                    <ClipboardList className="w-4 h-4" /> Attach Rubric
                  </button>
              )}
            </div>

            {assignedRubric ? (() => {
                const rubricTotal = (assignedRubric.criteria || []).reduce((sum, c) => sum + (c.items || []).reduce((s, i) => s + i.maxPoints, 0), 0);
                return (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#C9A84C1a" }}>
                        <ClipboardList className="w-4 h-4" style={{ color: "#c0a080" }} />
                      </div>
                      <div>
                        <p className="text-zinc-900 dark:text-white font-medium">{assignedRubric.name}</p>
                        {!assignedRubric.weighted && <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{rubricTotal} pts in rubric</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignedRubric.visible
                          ? <span className="text-xs text-green-400 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Visible to students</span>
                          : <span className="text-xs text-zinc-500 flex items-center gap-1"><EyeOff className="w-3.5 h-3.5" /> Hidden from students</span>
                      }
                    </div>
                  </div>
                  {!assignedRubric.weighted && rubricTotal !== (assignment?.totalPoints ?? 100) && (
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-yellow-600/30 bg-yellow-600/10">
                        <span className="text-yellow-400 text-xs">⚠ Rubric totals {rubricTotal} pts but assignment is worth {assignment?.totalPoints ?? 100} pts</span>
                      </div>
                  )}
                  {(assignedRubric.criteria || []).map((criteria) => (
                      <div key={criteria.id} className="border-b border-zinc-200 dark:border-zinc-700/50 last:border-0">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-700/40" style={{ background: "#86263314" }}>
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 rounded-full shrink-0" style={{ background: "#862633" }} />
                            <p className="text-zinc-900 dark:text-white text-sm font-semibold">{criteria.title}</p>
                          </div>
                          {!assignedRubric.weighted && (
                              <p className="text-zinc-500 dark:text-zinc-400 text-xs">{(criteria.items || []).reduce((sum, i) => sum + i.maxPoints, 0)} pts</p>
                          )}
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/40 divide-y divide-zinc-100 dark:divide-zinc-800">
                          {(criteria.items || []).map((item) => (
                              <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-zinc-400 dark:text-zinc-600 text-xs shrink-0 select-none">›</span>
                                  {item.autoGrade && <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: "#C9A84C1a", color: "#c0a080" }}>auto</span>}
                                  <span className="text-zinc-700 dark:text-zinc-300 text-sm">{item.label}</span>
                                  {item.autoGrade && itemLinkMap[item.id]?.length > 0 && (
                                      <span className="text-xs text-zinc-500">({itemLinkMap[item.id].length} test{itemLinkMap[item.id].length !== 1 ? "s" : ""} linked)</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  {assignedRubric.weighted
                                      ? <span className="text-xs text-zinc-400">{item.weight}%</span>
                                      : <span className="text-zinc-500 text-xs">{item.maxPoints} pts</span>
                                  }
                                  {item.autoGrade && testCases.length > 0 && (
                                      <button type="button" onClick={() => handleOpenLinkDialog(item)} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-300 rounded-lg border border-zinc-600 bg-zinc-800 transition-colors hover:border-zinc-400 hover:text-white">
                                        <Link className="w-3 h-3" /> Link Tests
                                      </button>
                                  )}
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>
                  ))}
                </div>
                );
            })() : (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 text-center shadow-sm">
                  <ClipboardList className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">No rubric attached. Attach one to enable structured grading.</p>
                </div>
            )}
          </section>

          {/* Test Cases Section — unchanged from original */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Test Cases</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
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
                <button type="button" onClick={() => setAddingTestCase(true)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#862633" }}>
                  <Plus className="w-4 h-4" /> Add Test Case
                </button>
              </div>
            </div>
            {addingTestCase && (
                <div className="bg-zinc-50 dark:bg-zinc-900 border rounded-xl p-4 mb-4 space-y-3" style={{ borderColor: "#86263366" }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Label</label>
                      <input type="text" value={newTestCase.label} onChange={(e) => setNewTestCase((prev) => ({ ...prev, label: e.target.value }))} placeholder="e.g. Test 1" className={inputClass} />
                    </div>
                    <div className="flex items-end gap-2">
                      <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <input type="checkbox" checked={newTestCase.hidden} onChange={(e) => setNewTestCase((prev) => ({ ...prev, hidden: e.target.checked }))} className="w-4 h-4 shrink-0" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-1"><EyeOff className="w-4 h-4" /> Hidden from students</span>
                      </label>
                    </div>
                  </div>
                  {!isFileMode && (
                      <div>
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Input (stdin)</label>
                        <textarea rows={2} value={newTestCase.input} onChange={(e) => setNewTestCase((prev) => ({ ...prev, input: e.target.value }))} placeholder="Leave blank if program takes no input" className={inputClass} />
                      </div>
                  )}
                  {isFileMode && (
                      <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                        <FileInput className="w-4 h-4 shrink-0" style={{ color: "#C9A84C" }} />
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">Input will be read from <span className="text-zinc-700 dark:text-zinc-300 font-medium">{assignment.inputFileName}</span> at runtime.</p>
                      </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Expected Output</label>
                    <textarea rows={2} value={newTestCase.expectedOutput} onChange={(e) => setNewTestCase((prev) => ({ ...prev, expectedOutput: e.target.value }))} placeholder="Expected stdout output" className={inputClass} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => { setAddingTestCase(false); setNewTestCase({ input: "", expectedOutput: "", hidden: false, label: "" }); }} className="flex-1 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
                    <button type="button" onClick={handleAddTestCase} disabled={!newTestCase.expectedOutput} className="flex-1 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#862633" }}>Save Test Case</button>
                  </div>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-700/50 shadow-sm">
              {testCases.length === 0 ? (
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm p-4">No test cases yet. Add one to enable auto-grading.</p>
              ) : (
                  testCases.map((tc) => (
                      <div key={tc.id} className="flex items-start justify-between gap-4 p-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex items-center gap-2 shrink-0 mt-0.5">
                            {tc.hidden ? <EyeOff className="w-4 h-4 text-zinc-500" /> : <Eye className="w-4 h-4" style={{ color: "#C9A84C" }} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-zinc-900 dark:text-white text-sm font-medium">{tc.label || `Test Case ${tc.id}`}{tc.hidden && <span className="ml-2 text-xs text-zinc-500">(hidden)</span>}</p>
                            {!isFileMode && (
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Input: <span className="font-mono text-zinc-700 dark:text-zinc-300">{tc.input || "(none)"}</span></p>
                            )}
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">Expected: <span className="font-mono text-zinc-700 dark:text-zinc-300">{tc.expectedOutput}</span></p>
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

        {/* All modals — unchanged from original */}
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
                      <div className="w-px h-5 bg-zinc-700 mx-1" />
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

        {confirmDeleteUserId && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Remove Submission?</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
                  This will permanently delete{" "}
                  <span className="text-zinc-900 dark:text-white font-medium">
                    {submissions.find(s => s.submissionId.userId === confirmDeleteUserId)?.user?.firstName}{" "}
                    {submissions.find(s => s.submissionId.userId === confirmDeleteUserId)?.user?.lastName}
                  </span>
                  's submission, test results, and rubric scores. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setConfirmDeleteUserId(null)} className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
                  <button type="button" onClick={() => handleDeleteSubmission(confirmDeleteUserId)} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors" style={{ background: "#862633" }}>
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
                        {gradingSubmission?.user?.firstName} {gradingSubmission?.user?.lastName}{gradingSubmission?.user?.cwid ? ` (${gradingSubmission.user.cwid})` : ""} • {assignedRubric.name}
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
                      <div className="w-px h-5 bg-zinc-700 mx-1" />
                      <button type="button" onClick={() => setGradingStudent(null)} className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 overflow-hidden">

                    {/* Left — code viewer */}
                    <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-700 overflow-hidden min-w-0">
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
                          <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-700/50 shrink-0">
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
                                {gradingRunResults === null && !gradingRunning && <p className="text-xs text-zinc-500">No test results yet. Click Run All to execute tests against this submission.</p>}
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

                    {/* Right — rubric panel */}
                    <div className="w-[520px] flex flex-col overflow-hidden shrink-0">
                      <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-700/50 shrink-0">
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Rubric</p>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-0.5">{assignedRubric.weighted ? "Weighted — score each item 0 to 5" : `${assignedRubric.totalPoints} total points`}</p>
                      </div>

                      <div className="flex-1 overflow-auto p-5 space-y-6">
                        {(assignedRubric.criteria || []).map((criteria) => (
                            <div key={criteria.id} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-700/60" style={{ background: "#86263314" }}>
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-3.5 rounded-full shrink-0" style={{ background: "#862633" }} />
                                  <p className="text-zinc-900 dark:text-white font-semibold text-sm">{criteria.title}</p>
                                </div>
                                {assignedRubric.weighted ? (
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
                                      {/* Item header */}
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="text-zinc-400 dark:text-zinc-600 text-xs shrink-0 select-none">›</span>
                                          {item.autoGrade && <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0" style={{ background: "#C9A84C1a", color: "#c0a080" }}>auto</span>}
                                          <span className="text-zinc-800 dark:text-zinc-200 text-sm font-medium">{item.label}</span>
                                        </div>
                                        <span className="text-zinc-500 text-xs shrink-0 ml-3">
                                          {assignedRubric.weighted ? `${item.weight}%` : `${item.maxPoints} pts`}
                                        </span>
                                      </div>

                                      {/* Non-weighted: number input */}
                                      {!assignedRubric.weighted && (
                                        <div className="flex items-center gap-2 mt-1">
                                          <input type="number" min="0" max={item.maxPoints} step="0.25" value={rubricScores[item.id] ?? ""} onChange={(e) => handleRubricScoreChange(item.id, e.target.value)} placeholder="0" disabled={item.autoGrade} className="w-16 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40 disabled:opacity-50 disabled:cursor-not-allowed" />
                                          <span className="text-zinc-500 text-xs">/ {item.maxPoints}</span>
                                        </div>
                                      )}

                                      {/* Weighted: vertical score option list */}
                                      {assignedRubric.weighted && (
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
                      </div>

                      {/* Footer — total + actions */}
                      <div className="p-5 border-t border-zinc-200 dark:border-zinc-700 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Total Score</p>
                          {assignedRubric.weighted ? (
                            <p className="text-zinc-900 dark:text-white font-bold">
                              {(() => {
                                const allItems = (assignedRubric.criteria || []).flatMap((c) => c.items || []);
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
                              {(assignedRubric.criteria || []).flatMap((c) => c.items || []).reduce((sum, i) => sum + (parseFloat(rubricScores[i.id]) || 0), 0).toFixed(2)} / {assignedRubric.totalPoints} pts
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

        <Dialog isOpen={!!linkingItem} onClose={() => setLinkingItem(null)} title={`Link Test Cases — ${linkingItem?.label}`}>
          <div className="space-y-3">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Select which test cases count toward this rubric item. The score will be calculated as (passed / total) × max points.</p>
            {testCases.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">No test cases on this assignment yet.</p>
            ) : (
                <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-700/50">
                  {testCases.map((tc) => (
                      <label key={tc.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700/30 transition-colors">
                        <input type="checkbox" checked={linkedTestCaseIds.includes(tc.id)} onChange={() => handleToggleTestCaseLink(tc.id)} className="w-4 h-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">{tc.label || `Test Case ${tc.id}`}</p>
                          <p className="text-zinc-500 text-xs font-mono truncate">{tc.input ? `in: ${tc.input}` : "no input"} → {tc.expectedOutput}</p>
                        </div>
                        {tc.hidden && <span className="text-xs text-zinc-500 shrink-0">(hidden)</span>}
                      </label>
                  ))}
                </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setLinkingItem(null)} className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
              <button type="button" onClick={handleSaveLinks} disabled={savingLinks} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#862633" }}>
                {savingLinks ? "Saving..." : "Save Links"}
              </button>
            </div>
          </div>
        </Dialog>

        {plagiarismOpen && plagiarismResults && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Plagiarism Check Results</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{plagiarismResults.length} pair{plagiarismResults.length !== 1 ? "s" : ""} compared • {plagiarismResults.filter(r => r.similarity >= 70).length} flagged</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleDownloadPlagiarismCSV} className="px-3 py-2 text-sm font-medium rounded-lg border transition-colors hover:opacity-80" style={{ color: "#C9A84C", borderColor: "#C9A84C44", background: "#C9A84C11" }}>Download CSV</button>
                    <button type="button" onClick={() => { setPlagiarismOpen(false); setExpandedPair(null); }} className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="overflow-auto flex-1">
                  {plagiarismResults.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">Not enough submissions to compare.</div>
                  ) : (
                      plagiarismResults.map((r, idx) => {
                        const isExpanded = expandedPair === idx;
                        const color = r.similarity >= 70 ? "text-red-400" : r.similarity >= 50 ? "text-yellow-400" : "text-green-400";
                        const bg = r.similarity >= 70 ? "bg-red-500/10 border-red-500/20" : r.similarity >= 50 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-zinc-800 border-zinc-700";
                        return (
                            <div key={idx} className="border-b border-zinc-200 dark:border-zinc-700/50 last:border-0">
                              <button type="button" onClick={() => setExpandedPair(isExpanded ? null : idx)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left">
                                <div className="flex items-center gap-4">
                                  <div className={`text-2xl font-bold ${color}`}>{r.similarity}%</div>
                                  <div>
                                    <p className="text-zinc-900 dark:text-white text-sm font-medium">{r.studentAName} &amp; {r.studentBName}</p>
                                    {r.similarity >= 70 && <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Flagged</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-zinc-500 dark:text-zinc-400 text-sm">{isExpanded ? "Hide" : "Compare"}</span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
                                </div>
                              </button>
                              {isExpanded && (
                                  <div className="px-6 pb-5">
                                    <div className={`border rounded-xl overflow-hidden ${bg}`}>
                                      <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-700">
                                        <div>
                                          <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50"><p className="text-sm font-semibold text-zinc-900 dark:text-white">{r.studentAName}</p></div>
                                          <pre className="text-xs text-zinc-700 dark:text-zinc-300 font-mono p-4 overflow-auto max-h-96 whitespace-pre-wrap">{r.fileContentA || "No content"}</pre>
                                        </div>
                                        <div>
                                          <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50"><p className="text-sm font-semibold text-zinc-900 dark:text-white">{r.studentBName}</p></div>
                                          <pre className="text-xs text-zinc-700 dark:text-zinc-300 font-mono p-4 overflow-auto max-h-96 whitespace-pre-wrap">{r.fileContentB || "No content"}</pre>
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

        <Dialog isOpen={attachRubricOpen} onClose={() => setAttachRubricOpen(false)} title="Attach Rubric">
          <div className="space-y-3">
            {(() => {
              const assignmentPts = assignment?.totalPoints ?? 100;
              const compatible = availableRubrics.filter((rubric) => {
                if (rubric.weighted) return true;
                const total = (rubric.criteria || []).reduce((sum, c) => sum + (c.items || []).reduce((s, i) => s + i.maxPoints, 0), 0);
                return total === assignmentPts;
              });
              if (availableRubrics.length === 0) {
                return <p className="text-zinc-500 dark:text-zinc-400 text-sm">No rubrics available. Create one from the Rubrics page.</p>;
              }
              return availableRubrics.map((rubric) => {
                const rubricTotal = (rubric.criteria || []).reduce((sum, c) => sum + (c.items || []).reduce((s, i) => s + i.maxPoints, 0), 0);
                const isCompatible = rubric.weighted || rubricTotal === assignmentPts;
                const subtitle = rubric.weighted ? `Weighted${rubric.description ? ` • ${rubric.description}` : ""}` : `${rubricTotal} pts${rubric.description ? ` • ${rubric.description}` : ""}`;
                return (
                  <button key={rubric.id} type="button" onClick={isCompatible ? () => handleAttachRubric(rubric.id) : undefined} disabled={!isCompatible} className={`w-full flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 border rounded-xl transition-colors text-left ${isCompatible ? "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700/50" : "border-zinc-200 dark:border-zinc-700 opacity-50 cursor-not-allowed"}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#C9A84C1a" }}>
                      <ClipboardList className="w-4 h-4" style={{ color: "#c0a080" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-900 dark:text-white font-medium text-sm">{rubric.name}</p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{subtitle}</p>
                    </div>
                    {!isCompatible && (
                      <div className="relative group shrink-0">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-600/20 text-red-400 text-xs font-bold cursor-default">!</span>
                        <div className="absolute right-0 bottom-7 w-56 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-600 text-xs text-zinc-300 shadow-lg invisible group-hover:visible z-50 pointer-events-none">
                          Point-based rubrics must total {assignmentPts} pts to match this assignment.
                        </div>
                      </div>
                    )}
                  </button>
                );
              });
            })()}
            <button type="button" onClick={() => setAttachRubricOpen(false)} className="w-full py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
          </div>
        </Dialog>

        <Dialog isOpen={importSuiteOpen} onClose={() => setImportSuiteOpen(false)} title="Import from Suite">
          <div className="space-y-3">
            {availableSuites.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">No suites available. Create one from the Test Suites page.</p>
            ) : (
                availableSuites.map((suite) => (
                    <button key={suite.id} type="button" onClick={() => handleImportSuite(suite.id)} className="w-full flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors text-left">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#C9A84C22" }}>
                        <FlaskConical className="w-4 h-4" style={{ color: "#C9A84C" }} />
                      </div>
                      <div>
                        <p className="text-zinc-900 dark:text-white font-medium text-sm">{suite.name}</p>
                        {suite.description && <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{suite.description}</p>}
                      </div>
                    </button>
                ))
            )}
            <button type="button" onClick={() => setImportSuiteOpen(false)} className="w-full py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
          </div>
        </Dialog>

        <AssignmentReportDialog
          isOpen={assignmentReportOpen}
          onClose={() => setAssignmentReportOpen(false)}
          assignment={assignment}
          crn={crn}
          submissions={submissions}
        />
      </div>
  );
}
