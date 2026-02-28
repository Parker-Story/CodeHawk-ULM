"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, FileDown, Archive, BarChart3, Plus } from "lucide-react";
import Link from "next/link";
import { useFacultyClasses } from "@/contexts/FacultyClassesContext";
import NewAssignmentDialog from "@/components/faculty/NewAssignmentDialog";
import GradeReportDialog from "@/components/faculty/GradeReportDialog";
import ArchiveClassDialog from "@/components/faculty/ArchiveClassDialog";
import GradingWorkspaceDialog from "@/components/faculty/GradingWorkspaceDialog";

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

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/course/${crn}`)
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
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/assignment/course/${crn}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assignments");
        return res.json();
      })
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading assignments:", err));
  }, [crn]);
    const handleArchiveConfirm = () => {
      if (!classItem) return;
      fetch(`${process.env.NEXT_PUBLIC_API_BASE}/course`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...classItem, archived: true, days: classItem.days.join(",") }),
      }).then(() => {
        setClasses((prev) => prev.map((c) => (c.crn === classItem.crn ? { ...c, archived: true } : c)));
      });
    };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

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
                  assignments.map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedAssignment(a);
                        setGradingWorkspaceOpen(true);
                      }}
                      className="flex items-center gap-4 p-4 w-full text-left text-slate-300 hover:bg-slate-700/30 transition-colors rounded-lg first:rounded-t-xl last:rounded-b-xl"
                    >
                      <FileText className="w-5 h-5 text-teal-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{a.title}</p>
                        <p className="text-sm text-slate-400">
                          Due {a.due} • {a.language}
                        </p>
                      </div>
                    </button>
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

      <NewAssignmentDialog isOpen={newAssignmentOpen} onClose={() => setNewAssignmentOpen(false)} crn={crn} onAssignmentCreated={(newAssignment) => setAssignments((prev) => [...prev, newAssignment])}
/>
      <GradeReportDialog isOpen={gradeReportOpen} onClose={() => setGradeReportOpen(false)} />
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