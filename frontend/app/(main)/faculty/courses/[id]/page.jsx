"use client";

import { API_BASE } from "@/lib/apiBase";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, FileDown, Archive, BarChart3, Plus, MoreVertical, Pencil, Trash2, UserCog, Upload } from "lucide-react";
import Link from "next/link";
import { useFacultyClasses } from "@/contexts/FacultyClassesContext";
import NewAssignmentDialog from "@/components/faculty/NewAssignmentDialog";
import GradeReportDialog from "@/components/faculty/GradeReportDialog";
import ArchiveClassDialog from "@/components/faculty/ArchiveClassDialog";
import GradingWorkspaceDialog from "@/components/faculty/GradingWorkspaceDialog";
import Dialog from "@/components/Dialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function CourseDetailPage() {
  const params = useParams();
  const crn = params.id;
  const { setClasses } = useFacultyClasses();
  const [classItem, setClassItem] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAssignmentOpen, setNewAssignmentOpen] = useState(false);
  const [gradeReportOpen, setGradeReportOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [gradingWorkspaceOpen, setGradingWorkspaceOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [studentCwid, setStudentCwid] = useState("");
  const [rosterOpen, setRosterOpen] = useState(false);
  const [roster, setRoster] = useState([]);
  const [removeConfirm, setRemoveConfirm] = useState({ isOpen: false, student: null });
  const [activeMenu, setActiveMenu] = useState(null);
  const [editAssignment, setEditAssignment] = useState(null);
  const [deleteAssignmentConfirm, setDeleteAssignmentConfirm] = useState({ isOpen: false, assignment: null });
  const [promoteTaConfirm, setPromoteTaConfirm] = useState({ isOpen: false, courseUser: null });
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState(null);
  const csvInputRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();
  const [promoteTaError, setPromoteTaError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/course/${crn}`)
        .then((res) => { if (!res.ok) throw new Error("Course not found"); return res.json(); })
        .then((data) => { setClassItem({ ...data, days: data.days ? data.days.split(",") : [] }); setLoading(false); })
        .catch((err) => { console.error(err); setLoading(false); });
  }, [crn]);

  useEffect(() => {
    fetch(`${API_BASE}/assignment/course/${crn}`)
        .then((res) => { if (!res.ok) throw new Error("Failed to fetch assignments"); return res.json(); })
        .then((data) => setAssignments(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error loading assignments:", err));
  }, [crn]);

  const handleArchiveConfirm = () => {
    if (!classItem) return;
    fetch(`${API_BASE}/course`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...classItem, archived: true, days: classItem.days.join(",") }),
    }).then(() => {
      setClasses((prev) => prev.map((c) => (c.crn === classItem.crn ? { ...c, archived: true } : c)));
    });
  };

  const handleAddStudent = async () => {
    try {
      const response = await fetch(`${API_BASE}/courseUser/add/${crn}/${studentCwid}`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to add student");
      setStudentCwid("");
      setAddStudentOpen(false);
      alert("Student added successfully!");
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please check the CWID and try again.");
    }
  };

  const handleCsvImport = async (file) => {
    if (!file) return;
    setCsvImporting(true);
    setCsvResult(null);
    try {
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) throw new Error("CSV appears empty");
      const parseLine = (line) => {
        const result = []; let current = ""; let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') { inQuotes = !inQuotes; }
          else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; }
          else { current += char; }
        }
        result.push(current.trim());
        return result;
      };
      const headers = parseLine(lines[0]);
      const sisIndex = headers.findIndex((h) => h === "SIS User ID");
      if (sisIndex === -1) throw new Error("Could not find 'SIS User ID' column");
      const cwids = lines.slice(1).map((line) => { const cols = parseLine(line); return cols[sisIndex]; })
          .filter((cwid) => cwid && cwid.toLowerCase() !== "null" && cwid !== "" && isNaN(Number(cwid)) === false && cwid.length > 4);
      if (cwids.length === 0) { setCsvResult({ success: 0, failed: 0, errors: ["No valid CWIDs found in CSV"] }); setCsvImporting(false); return; }
      let success = 0; let failed = 0; const errors = [];
      await Promise.all(cwids.map(async (cwid) => {
        try {
          const res = await fetch(`${API_BASE}/courseUser/add/${crn}/${cwid}`, { method: "POST" });
          if (res.ok) { success++; } else { failed++; errors.push(cwid); }
        } catch { failed++; errors.push(cwid); }
      }));
      setCsvResult({ success, failed, errors });
    } catch (error) {
      console.error("CSV import error:", error);
      setCsvResult({ success: 0, failed: 0, errors: [error.message] });
    } finally {
      setCsvImporting(false);
    }
  };

  const handleViewRoster = async () => {
    try {
      const response = await fetch(`${API_BASE}/courseUser/roster/${crn}`);
      if (!response.ok) throw new Error("Failed to fetch roster");
      const data = await response.json();
      setRoster(Array.isArray(data) ? data : []);
      setRosterOpen(true);
    } catch (error) { console.error("Error fetching roster:", error); }
  };

  const handleRemoveStudent = async () => {
    try {
      const response = await fetch(`${API_BASE}/courseUser/${removeConfirm.student.user.id}/${crn}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to remove student");
      setRoster((prev) => prev.filter((s) => s.user.id !== removeConfirm.student.user.id));
      setRemoveConfirm({ isOpen: false, student: null });
    } catch (error) { console.error("Error removing student:", error); }
  };

  const handlePromoteToTa = async () => {
    const courseUser = promoteTaConfirm.courseUser;
    setPromoteTaError(null);
    try {
      const response = await fetch(`${API_BASE}/courseUser/promote-ta/${crn}/${courseUser.user.id}`, { method: "PUT" });
      if (!response.ok) {
        const text = await response.text();
        const msg = text?.includes("existing submissions")
            ? "This student has existing submissions and cannot be promoted to TA."
            : "Failed to promote to TA. Students who have submissions in this course cannot be assigned the TA role.";
        setPromoteTaError(msg);
        return;
      }
      const updated = await response.json();
      setRoster((prev) => prev.map((s) => s.user.id === courseUser.user.id ? updated : s));
      setPromoteTaConfirm({ isOpen: false, courseUser: null });
      setPromoteTaError(null);
    } catch (error) {
      console.error("Error promoting to TA:", error);
      setPromoteTaError("An unexpected error occurred.");
    }
  };

  const handleDemoteFromTa = async (courseUser) => {
    try {
      const response = await fetch(`${API_BASE}/courseUser/demote-ta/${crn}/${courseUser.user.id}`, { method: "PUT" });
      if (!response.ok) throw new Error("Failed to demote TA");
      const updated = await response.json();
      setRoster((prev) => prev.map((s) => s.user.id === courseUser.user.id ? updated : s));
    } catch (error) { console.error("Error demoting TA:", error); }
  };

  const handleEditAssignment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/assignment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editAssignment),
      });
      if (!response.ok) throw new Error("Failed to update assignment");
      const updated = await response.json();
      setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditAssignment(null);
    } catch (error) { console.error("Error updating assignment:", error); }
  };

  const handleDeleteAssignment = async () => {
    try {
      const response = await fetch(`${API_BASE}/assignment/${deleteAssignmentConfirm.assignment.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete assignment");
      setAssignments((prev) => prev.filter((a) => a.id !== deleteAssignmentConfirm.assignment.id));
      setDeleteAssignmentConfirm({ isOpen: false, assignment: null });
    } catch (error) { console.error("Error deleting assignment:", error); }
  };

  if (loading) {
    return <div className="p-8"><p className="text-zinc-400">Loading...</p></div>;
  }

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-transparent";
  const labelClass = "text-sm font-medium text-zinc-300 block mb-1.5";

  return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/faculty/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6">
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
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: "#7C1D2E33" }}>
                        <BookOpen className="w-8 h-8" style={{ color: "#c0a080" }} />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">{classItem.courseName}</h1>
                        <p className="font-medium mt-1" style={{ color: "#C9A84C" }}>{classItem.courseAbbreviation}</p>
                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                          <span className="text-zinc-300"><span className="text-zinc-500">CRN:</span> {classItem.crn}</span>
                          <span className="font-medium" style={{ color: "#C9A84C" }}><span className="text-zinc-500">Class code:</span> {classItem.code}</span>
                        </div>
                      </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNewAssignmentOpen(true)}
                        className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                        style={{ background: "#7C1D2E" }}
                    >
                      <Plus className="w-4 h-4" />
                      New Assignment
                    </button>
                  </div>
                </div>

                {/* Course Assignments */}
                <section className="mb-8">
                  <h2 className="text-lg font-semibold text-white mb-4">Course Assignments</h2>
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl divide-y divide-zinc-700/50">
                    {assignments.length === 0 ? (
                        <p className="text-zinc-400 p-4">No assignments yet.</p>
                    ) : (
                        assignments.map((a) => (
                            <div
                                key={a.id}
                                className="group flex items-center gap-4 p-4 text-zinc-300 cursor-pointer hover:bg-zinc-700/30 transition-colors rounded-lg"
                                onClick={() => router.push(`/faculty/courses/${crn}/assignments/${a.id}`)}
                            >
                              <FileText className="w-5 h-5 shrink-0" style={{ color: "#C9A84C" }} />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-white">{a.title}</p>
                                {a.description && <p className="text-sm text-zinc-400 mt-0.5 line-clamp-1">{a.description}</p>}
                              </div>
                              <div className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === a.id ? null : a.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {activeMenu === a.id && (
                                    <div className="absolute right-0 top-8 z-10 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg overflow-hidden w-40">
                                      <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setEditAssignment({ ...a }); setActiveMenu(null); }}
                                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                                      >
                                        <Pencil className="w-4 h-4" /> Edit
                                      </button>
                                      <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setDeleteAssignmentConfirm({ isOpen: true, assignment: a }); setActiveMenu(null); }}
                                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" /> Delete
                                      </button>
                                    </div>
                                )}
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                </section>

                {/* Course Administration */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-4">Course Administration</h2>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "View Roster", icon: BookOpen, onClick: handleViewRoster },
                      { label: "Add Student", icon: Plus, onClick: () => { setAddStudentOpen(true); setCsvResult(null); } },
                      { label: "Grade Report", icon: BarChart3, onClick: () => setGradeReportOpen(true) },
                    ].map(({ label, icon: Icon, onClick }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={onClick}
                            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-white rounded-lg hover:opacity-90 transition-colors"
                            style={{ background: "#7C1D2E" }}
                        >
                          <Icon className="w-5 h-5" />
                          {label}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setArchiveConfirmOpen(true)}
                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
                    >
                      <Archive className="w-5 h-5" />
                      Archive Class
                    </button>
                  </div>
                </section>
              </>
          )}
        </div>

        <NewAssignmentDialog isOpen={newAssignmentOpen} onClose={() => setNewAssignmentOpen(false)} crn={crn} onAssignmentCreated={(a) => setAssignments((prev) => [...prev, a])} />
        <GradeReportDialog isOpen={gradeReportOpen} onClose={() => setGradeReportOpen(false)} crn={crn} />

        {/* Edit Assignment */}
        <Dialog isOpen={!!editAssignment} onClose={() => setEditAssignment(null)} title="Edit Assignment">
          {editAssignment && (
              <form className="space-y-4" onSubmit={handleEditAssignment}>
                <div>
                  <label className={labelClass}>Assignment Title</label>
                  <input type="text" value={editAssignment.title} onChange={(e) => setEditAssignment((prev) => ({ ...prev, title: e.target.value }))} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows={4} value={editAssignment.description || ""} onChange={(e) => setEditAssignment((prev) => ({ ...prev, description: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex gap-3 pt-4 border-t border-zinc-700">
                  <button type="button" onClick={() => setEditAssignment(null)} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>Save Changes</button>
                </div>
              </form>
          )}
        </Dialog>

        {/* Delete Assignment */}
        <Dialog isOpen={deleteAssignmentConfirm.isOpen} onClose={() => setDeleteAssignmentConfirm({ isOpen: false, assignment: null })} title="Delete Assignment" size="sm">
          <div className="space-y-4">
            <p className="text-zinc-300">Are you sure you want to delete <span className="font-semibold text-white">{deleteAssignmentConfirm.assignment?.title}</span>? This action cannot be undone.</p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setDeleteAssignmentConfirm({ isOpen: false, assignment: null })} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
              <button type="button" onClick={handleDeleteAssignment} className="flex-1 py-3 text-sm font-medium text-white bg-red-800 rounded-xl hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </Dialog>

        {/* Add Student */}
        <Dialog isOpen={addStudentOpen} onClose={() => { setAddStudentOpen(false); setCsvResult(null); setStudentCwid(""); }} title="Add Student">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm">Enter a student's CWID to add them individually.</p>
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-2">Student CWID</label>
                <input type="text" value={studentCwid} onChange={(e) => setStudentCwid(e.target.value)} placeholder="e.g. 12345678" className={inputClass} />
              </div>
              <button type="button" onClick={handleAddStudent} disabled={!studentCwid} className="w-full py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "#7C1D2E" }}>
                Add Student
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-700" />
              <span className="text-zinc-500 text-xs">or import from Canvas</span>
              <div className="flex-1 h-px bg-zinc-700" />
            </div>
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm">Upload a Canvas grade export CSV to bulk enroll students.</p>
              <div onClick={() => csvInputRef.current?.click()} className="border-2 border-dashed border-zinc-600 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-400 transition-colors">
                <Upload className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">Click to upload CSV</p>
                <p className="text-zinc-600 text-xs mt-1">Must contain a "SIS User ID" column</p>
                <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) handleCsvImport(file); e.target.value = ""; }} />
              </div>
              {csvImporting && <p className="text-zinc-400 text-sm text-center">Importing students...</p>}
              {csvResult && (
                  <div className={`p-4 rounded-xl border ${csvResult.failed === 0 ? "bg-green-600/10 border-green-600/20" : "bg-yellow-600/10 border-yellow-600/20"}`}>
                    <p className={`text-sm font-medium ${csvResult.failed === 0 ? "text-green-400" : "text-yellow-400"}`}>
                      {csvResult.success} student{csvResult.success !== 1 ? "s" : ""} added successfully{csvResult.failed > 0 && `, ${csvResult.failed} failed`}
                    </p>
                    {csvResult.errors.length > 0 && csvResult.failed > 0 && <p className="text-zinc-400 text-xs mt-1">Failed CWIDs: {csvResult.errors.join(", ")}</p>}
                  </div>
              )}
            </div>
            <button type="button" onClick={() => { setAddStudentOpen(false); setCsvResult(null); setStudentCwid(""); }} className="w-full py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Close</button>
          </div>
        </Dialog>

        {/* Roster */}
        <Dialog isOpen={rosterOpen} onClose={() => setRosterOpen(false)} title="Course Roster">
          <div className="space-y-3">
            {roster.length === 0 ? (
                <p className="text-zinc-400 text-sm">No students enrolled yet.</p>
            ) : (
                roster.map((courseUser) => (
                    <div key={courseUser.user.id} className="group flex items-center justify-between gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#7C1D2E33" }}>
                    <span className="text-xs font-medium" style={{ color: "#c0a080" }}>
                      {courseUser.user.firstName?.charAt(0)}{courseUser.user.lastName?.charAt(0)}
                    </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-medium">{courseUser.user.firstName} {courseUser.user.lastName}</p>
                            {courseUser.courseRole === "TA" && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: "#C9A84C", background: "#C9A84C22" }}>TA</span>
                            )}
                            {courseUser.courseRole === "FACULTY" && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: "#c0a080", background: "#7C1D2E33" }}>Faculty</span>
                            )}
                          </div>
                          <p className="text-zinc-400 text-xs">{courseUser.user.cwid ? `CWID: ${courseUser.user.cwid}` : courseUser.user.email}</p>
                        </div>
                      </div>
                      {courseUser.courseRole !== "FACULTY" && (
                          <div className="relative">
                            <button
                                type="button"
                                onClick={() => setActiveMenu(activeMenu === courseUser.user.id ? null : courseUser.user.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {activeMenu === courseUser.user.id && (
                                <div className="absolute right-0 top-8 z-10 bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg overflow-hidden w-44">
                                  {courseUser.courseRole === "STUDENT" && (
                                      <button type="button" onClick={() => { setPromoteTaConfirm({ isOpen: true, courseUser }); setActiveMenu(null); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors">
                                        <UserCog className="w-4 h-4" /> Promote to TA
                                      </button>
                                  )}
                                  {courseUser.courseRole === "TA" && (
                                      <button type="button" onClick={() => { handleDemoteFromTa(courseUser); setActiveMenu(null); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors">
                                        <UserCog className="w-4 h-4" /> Revoke TA
                                      </button>
                                  )}
                                  <button type="button" onClick={() => { setRemoveConfirm({ isOpen: true, student: courseUser }); setActiveMenu(null); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-700 transition-colors">
                                    <Trash2 className="w-4 h-4" /> Remove
                                  </button>
                                </div>
                            )}
                          </div>
                      )}
                    </div>
                ))
            )}
          </div>
        </Dialog>

        {/* Promote to TA */}
        <Dialog isOpen={promoteTaConfirm.isOpen} onClose={() => { setPromoteTaConfirm({ isOpen: false, courseUser: null }); setPromoteTaError(null); }} title="Promote to TA" size="sm">
          <div className="space-y-4">
            <p className="text-zinc-300">Are you sure you want to make <span className="font-semibold text-white">{promoteTaConfirm.courseUser?.user?.firstName} {promoteTaConfirm.courseUser?.user?.lastName}</span> a TA for this course?</p>
            <p className="text-zinc-400 text-sm">They will have additional permissions such as viewing and grading student assignments.</p>
            {promoteTaError && (
                <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-xl">
                  <p className="text-red-400 text-sm">{promoteTaError}</p>
                </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setPromoteTaConfirm({ isOpen: false, courseUser: null })} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
              <button type="button" onClick={handlePromoteToTa} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>Promote to TA</button>
            </div>
          </div>
        </Dialog>

        {/* Remove Student */}
        <Dialog isOpen={removeConfirm.isOpen} onClose={() => setRemoveConfirm({ isOpen: false, student: null })} title="Remove Student" size="sm">
          <div className="space-y-4">
            <p className="text-zinc-300">Are you sure you want to remove <span className="font-semibold text-white">{removeConfirm.student?.user?.firstName} {removeConfirm.student?.user?.lastName}</span> from this course?</p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setRemoveConfirm({ isOpen: false, student: null })} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
              <button type="button" onClick={handleRemoveStudent} className="flex-1 py-3 text-sm font-medium text-white bg-red-800 rounded-xl hover:bg-red-700 transition-colors">Remove</button>
            </div>
          </div>
        </Dialog>

        {selectedAssignment && (
            <GradingWorkspaceDialog isOpen={gradingWorkspaceOpen} onClose={() => { setGradingWorkspaceOpen(false); setSelectedAssignment(null); }} assignmentTitle={selectedAssignment.title} submissionCount={3} />
        )}
        {classItem && (
            <ArchiveClassDialog isOpen={archiveConfirmOpen} onClose={() => setArchiveConfirmOpen(false)} courseName={classItem.courseName} onConfirm={handleArchiveConfirm} />
        )}
      </div>
  );
}