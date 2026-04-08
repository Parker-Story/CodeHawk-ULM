"use client";

import { useState, useEffect } from "react";
import { FileDown, X } from "lucide-react";
import Dialog from "@/components/Dialog";
import { API_BASE } from "@/lib/apiBase";

export default function GradeReportDialog({ isOpen, onClose, crn }) {
  const [roster, setRoster] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissionMap, setSubmissionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    if (!isOpen || !crn) return;
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE}/courseUser/roster/${crn}`).then(r => r.json()),
      fetch(`${API_BASE}/assignment/course/${crn}`).then(r => r.json()),
    ]).then(async ([rosterData, assignmentData]) => {
      const students = (Array.isArray(rosterData) ? rosterData : []).filter(cu => cu.courseRole === "STUDENT");
      const assigns = Array.isArray(assignmentData) ? assignmentData : [];
      setRoster(students);
      setAssignments(assigns);
      setSelectedStudents(students.map(s => s.user.id));

      const map = {};
      await Promise.all(assigns.map(async (a) => {
        try {
          const res = await fetch(`${API_BASE}/submission/assignment/${a.id}`);
          const subs = await res.json();
          if (Array.isArray(subs)) {
            subs.forEach(s => {
              if (!map[s.submissionId.userId]) map[s.submissionId.userId] = {};
              map[s.submissionId.userId][a.id] = s;
            });
          }
        } catch (err) { console.error(err); }
      }));
      setSubmissionMap(map);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, [isOpen, crn]);

  const toggleStudent = (id) => {
    setSelectedStudents(prev =>
        prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const visibleStudents = roster.filter(cu => selectedStudents.includes(cu.user.id));

  const getScore = (userId, assignmentId) => {
    const sub = submissionMap[userId]?.[assignmentId];
    if (!sub) return null;
    return sub.score ?? "—";
  };

  const classAverage = () => {
    const scores = visibleStudents.flatMap(cu =>
        assignments.map(a => submissionMap[cu.user.id]?.[a.id]?.score).filter(s => s !== null && s !== undefined)
    );
    if (scores.length === 0) return "—";
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) + "%";
  };

  const completionRate = () => {
    const total = visibleStudents.length * assignments.length;
    if (total === 0) return "—";
    const submitted = visibleStudents.filter(cu =>
        assignments.some(a => submissionMap[cu.user.id]?.[a.id])
    ).length;
    return Math.round((submitted / visibleStudents.length) * 100) + "%";
  };

  const ungradedCount = () => {
    return visibleStudents.reduce((count, cu) =>
            count + assignments.filter(a => {
              const sub = submissionMap[cu.user.id]?.[a.id];
              return sub && (sub.score === null || sub.score === undefined);
            }).length, 0
    );
  };

  const handleDownloadCSV = () => {
    const headers = ["Student", ...assignments.map(a => a.title), "Average"];
    const rows = visibleStudents.map(cu => {
      const scores = assignments.map(a => {
        const sub = submissionMap[cu.user.id]?.[a.id];
        return sub?.score ?? "";
      });
      const numericScores = scores.filter(s => s !== "");
      const avg = numericScores.length > 0
          ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1) + "%"
          : "—";
      return [`${cu.user.firstName} ${cu.user.lastName}`, ...scores, avg];
    });
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `grade_report_${crn}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const scoreColor = (score) => {
    if (score === null || score === undefined || score === "—") return "text-zinc-500";
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  return (
      <Dialog isOpen={isOpen} onClose={onClose} title="Grade Report" size="xl">
        {loading ? (
            <p className="text-zinc-400 text-sm text-center py-8">Loading grade data...</p>
        ) : (
            <div className="space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Class Average", value: classAverage() },
                  { label: "Completion Rate", value: completionRate() },
                  { label: "Ungraded", value: ungradedCount() },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center shadow-sm">
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm">{label}</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{value}</p>
                    </div>
                ))}
              </div>

              {/* Student filter */}
              {roster.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Filter Students</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                          type="button"
                          onClick={() => setSelectedStudents(
                              selectedStudents.length === roster.length ? [] : roster.map(s => s.user.id)
                          )}
                          className="px-3 py-1 text-xs font-medium rounded-lg border transition-colors"
                          style={{ color: "#C9A84C", borderColor: "#C9A84C44", background: "#C9A84C11" }}
                      >
                        {selectedStudents.length === roster.length ? "Deselect All" : "Select All"}
                      </button>
                      {roster.map(cu => (
                          <button
                              key={cu.user.id}
                              type="button"
                              onClick={() => toggleStudent(cu.user.id)}
                              className="px-3 py-1 text-xs font-medium rounded-lg border transition-colors"
                              style={selectedStudents.includes(cu.user.id)
                                  ? { background: "#862633", borderColor: "#862633", color: "white" }
                                  : { background: "transparent", borderColor: "#d4d4d8", color: "#71717a" }
                              }
                          >
                            {cu.user.firstName} {cu.user.lastName}
                          </button>
                      ))}
                    </div>
                  </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
                <table className="w-full text-sm">
                  <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white whitespace-nowrap">Student</th>
                    {assignments.map(a => (
                        <th key={a.id} className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white whitespace-nowrap">{a.title}</th>
                    ))}
                    <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white whitespace-nowrap">Average</th>
                  </tr>
                  </thead>
                  <tbody>
                  {visibleStudents.length === 0 ? (
                      <tr><td colSpan={assignments.length + 2} className="py-8 text-center text-zinc-400">No students selected.</td></tr>
                  ) : (
                      visibleStudents.map(cu => {
                        const scores = assignments.map(a => submissionMap[cu.user.id]?.[a.id]?.score);
                        const numeric = scores.filter(s => s !== null && s !== undefined);
                        const avg = numeric.length > 0
                            ? (numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(1) + "%"
                            : "—";
                        return (
                            <tr key={cu.user.id} className="border-b border-zinc-100 dark:border-zinc-700/50 last:border-0">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#C9A84C1a" }}>
                              <span className="text-xs font-medium" style={{ color: "#c0a080" }}>
                                {cu.user.firstName?.charAt(0)}{cu.user.lastName?.charAt(0)}
                              </span>
                                  </div>
                                  <span className="text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{cu.user.firstName} {cu.user.lastName}</span>
                                </div>
                              </td>
                              {assignments.map(a => {
                                const sub = submissionMap[cu.user.id]?.[a.id];
                                const score = sub?.score;
                                const submitted = !!sub;
                                return (
                                    <td key={a.id} className="py-3 px-4">
                                      {!submitted ? (
                                          <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Missing</span>
                                      ) : score === null || score === undefined ? (
                                          <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">Ungraded</span>
                                      ) : (
                                          <span className={`font-medium ${scoreColor(score)}`}>{score}%</span>
                                      )}
                                    </td>
                                );
                              })}
                              <td className={`py-3 px-4 font-semibold ${scoreColor(numeric.length > 0 ? numeric.reduce((a,b)=>a+b,0)/numeric.length : null)}`}>
                                {avg}
                              </td>
                            </tr>
                        );
                      })
                  )}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Close</button>
                <button type="button" onClick={handleDownloadCSV} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#862633" }}>
                  <FileDown className="w-4 h-4" /> Download CSV
                </button>
              </div>
            </div>
        )}
      </Dialog>
  );
}