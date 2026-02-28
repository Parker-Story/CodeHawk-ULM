"use client";

import { API_BASE } from "@/lib/apiBase";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, FileDown, Archive, BarChart3, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useFacultyClasses } from "@/contexts/FacultyClassesContext";
import NewAssignmentDialog from "@/components/faculty/NewAssignmentDialog";
import GradeReportDialog from "@/components/faculty/GradeReportDialog";
import ArchiveClassDialog from "@/components/faculty/ArchiveClassDialog";
import GradingWorkspaceDialog from "@/components/faculty/GradingWorkspaceDialog";
import Dialog from "@/components/Dialog";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
      const response = await fetch(`${API_BASE}/courseUser/add/${crn}/${studentCwid}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to add student");
      setStudentCwid("");
      setAddStudentOpen(false);
      alert("Student added successfully!");
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please check the CWID and try again.");
    }
  };

  const handleViewRoster = async () => {
    try {
      const response = await fetch(`${API_BASE}/courseUser/roster/${crn}`);
      if (!response.ok) throw new Error("Failed to fetch roster");
      const data = await response.json();
      setRoster(Array.isArray(data) ? data : []);
      setRosterOpen(true);
    } catch (error) {
      console.error("Error fetching roster:", error);
    }
  };

  const handleRemoveStudent = async () => {
    try {
      const response = await fetch(`${API_BASE}/courseUser/${removeConfirm.student.cwid}/${crn}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove student");
      setRoster((prev) => prev.filter((s) => s.cwid !== removeConfirm.student.cwid));
      setRemoveConfirm({ isOpen: false, student: null });
    } catch (error) {
      console.error("Error removing student:", error);
    }
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
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  const handleDeleteAssignment = async () => {
    try {
      const response = await fetch(`${API_BASE}/assignment/${deleteAssignmentConfirm.assignment.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete assignment");
      setAssignments((prev) => prev.filter((a) => a.id !== deleteAssignmentConfirm.assignment.id));
      setDeleteAssignmentConfirm({ isOpen: false, assignment: null });
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";
  const labelClass = "text-sm font-medium text-slate-300 block mb-1.5";

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/faculty/dashboard"
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
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="shrink-0 w-16 h-16 bg-teal-600/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-teal-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{classItem.courseName}</h1>
                    <p className="text-teal-400 font-medium mt-1">{classItem.courseAbbreviation}</p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="text-slate-300">
                        <span className="text-slate-500">CRN:</span> {classItem.crn}
                      </span>
                      <span className="text-teal-400 font-medium">
                        <span className="text-slate-500">Class code:</span> {classItem.code}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewAssignmentOpen(true)}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Assignment
                </button>
              </div>
            </div>

            {/* Course Assignments */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Course Assignments</h2>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl divide-y divide-slate-700/50">
                {assignments.length === 0 ? (
                  <p className="text-slate-400 p-4">No assignments yet.</p>
                ) : (
                  assignments.map((a) => (
                    <div
                      key={a.id}
                      className="group flex items-center gap-4 p-4 text-slate-300 cursor-pointer hover:bg-slate-700/30 transition-colors rounded-lg"
                      onClick={() => router.push(`/faculty/courses/${crn}/assignments/${a.id}`)}
                    >
                      <FileText className="w-5 h-5 text-teal-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{a.title}</p>
                        {a.description && (
                          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{a.description}</p>
                        )}
                      </div>
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveMenu(activeMenu === a.id ? null : a.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenu === a.id && (
                          <div className="absolute right-0 top-8 z-10 bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden w-40">
                            <button
                              type="button"
                              onClick={() => {
                                setEditAssignment({ ...a });
                                setActiveMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteAssignmentConfirm({ isOpen: true, assignment: a });
                                setActiveMenu(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
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
                <button
                  type="button"
                  onClick={() => setGradeReportOpen(true)}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  Generate Grade Report
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                >
                  <FileDown className="w-5 h-5" />
                  Export Grades
                </button>
                <button
                  type="button"
                  onClick={handleViewRoster}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  View Roster
                </button>
                <button
                  type="button"
                  onClick={() => setAddStudentOpen(true)}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Student
                </button>
                <button
                  type="button"
                  onClick={() => setArchiveConfirmOpen(true)}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <Archive className="w-5 h-5" />
                  Archive Class
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      <NewAssignmentDialog
        isOpen={newAssignmentOpen}
        onClose={() => setNewAssignmentOpen(false)}
        crn={crn}
        onAssignmentCreated={(newAssignment) => setAssignments((prev) => [...prev, newAssignment])}
      />
      <GradeReportDialog isOpen={gradeReportOpen} onClose={() => setGradeReportOpen(false)} />

      {/* Edit Assignment Dialog */}
      <Dialog isOpen={!!editAssignment} onClose={() => setEditAssignment(null)} title="Edit Assignment">
        {editAssignment && (
          <form className="space-y-4" onSubmit={handleEditAssignment}>
            <div>
              <label className={labelClass}>Assignment Title</label>
              <input
                type="text"
                value={editAssignment.title}
                onChange={(e) => setEditAssignment((prev) => ({ ...prev, title: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                rows={4}
                value={editAssignment.description || ""}
                onChange={(e) => setEditAssignment((prev) => ({ ...prev, description: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setEditAssignment(null)}
                className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Delete Assignment Confirmation */}
      <Dialog isOpen={deleteAssignmentConfirm.isOpen} onClose={() => setDeleteAssignmentConfirm({ isOpen: false, assignment: null })} title="Delete Assignment" size="sm">
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">{deleteAssignmentConfirm.assignment?.title}</span>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteAssignmentConfirm({ isOpen: false, assignment: null })}
              className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAssignment}
              className="flex-1 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog isOpen={addStudentOpen} onClose={() => setAddStudentOpen(false)} title="Add Student">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Enter the student's CWID to add them to this course.</p>
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Student CWID</label>
            <input
              type="text"
              value={studentCwid}
              onChange={(e) => setStudentCwid(e.target.value)}
              placeholder="e.g. 12345678"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddStudentOpen(false)}
              className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddStudent}
              className="flex-1 py-3 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors"
            >
              Add Student
            </button>
          </div>
        </div>
      </Dialog>

      {/* Roster Dialog */}
      <Dialog isOpen={rosterOpen} onClose={() => setRosterOpen(false)} title="Course Roster">
        <div className="space-y-3">
          {roster.length === 0 ? (
            <p className="text-slate-400 text-sm">No students enrolled yet.</p>
          ) : (
            roster.map((student) => (
              <div
                key={student.cwid}
                className="group flex items-center justify-between gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-600/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-teal-400 text-xs font-medium">
                      {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-slate-400 text-xs">CWID: {student.cwid}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRemoveConfirm({ isOpen: true, student })}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  ···
                </button>
              </div>
            ))
          )}
        </div>
      </Dialog>

      {/* Remove Student Confirmation */}
      <Dialog isOpen={removeConfirm.isOpen} onClose={() => setRemoveConfirm({ isOpen: false, student: null })} title="Remove Student" size="sm">
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-white">
              {removeConfirm.student?.firstName} {removeConfirm.student?.lastName} ({removeConfirm.student?.cwid})
            </span>{" "}
            from this course?
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRemoveConfirm({ isOpen: false, student: null })}
              className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRemoveStudent}
              className="flex-1 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </Dialog>

      {selectedAssignment && (
        <GradingWorkspaceDialog
          isOpen={gradingWorkspaceOpen}
          onClose={() => { setGradingWorkspaceOpen(false); setSelectedAssignment(null); }}
          assignmentTitle={selectedAssignment.title}
          submissionCount={3}
        />
      )}
      {classItem && (
        <ArchiveClassDialog
          isOpen={archiveConfirmOpen}
          onClose={() => setArchiveConfirmOpen(false)}
          courseName={classItem.courseName}
          onConfirm={handleArchiveConfirm}
        />
      )}
    </div>
  );
}