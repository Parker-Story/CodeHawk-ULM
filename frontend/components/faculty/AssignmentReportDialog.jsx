"use client";

import { useState, useEffect } from "react";
import { FileDown } from "lucide-react";
import Dialog from "@/components/Dialog";
import { API_BASE } from "@/lib/apiBase";

export default function AssignmentReportDialog({ isOpen, onClose, assignment, crn, submissions }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !crn) return;
    setLoading(true);
    fetch(`${API_BASE}/courseUser/roster/${crn}`)
      .then(r => r.json())
      .then(data => {
        const students = (Array.isArray(data) ? data : []).filter(cu => cu.courseRole === "STUDENT");
        setRoster(students);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, [isOpen, crn]);

  // Build a lookup from userId -> submission for this assignment
  const subByUser = {};
  (Array.isArray(submissions) ? submissions : []).forEach(s => {
    subByUser[s.submissionId.userId] = s;
  });

  // Collect all graded scores across enrolled students
  const gradedScores = roster
    .map(cu => subByUser[cu.user.id]?.score)
    .filter(s => s !== null && s !== undefined);

  const classAverage = () => {
    if (gradedScores.length === 0) return "—";
    return (gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length).toFixed(1) + "%";
  };

  const highestScore = () => {
    if (gradedScores.length === 0) return "—";
    return Math.max(...gradedScores) + "%";
  };

  const lowestScore = () => {
    if (gradedScores.length === 0) return "—";
    return Math.min(...gradedScores) + "%";
  };

  const medianScore = () => {
    if (gradedScores.length === 0) return "—";
    const sorted = [...gradedScores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
    return median.toFixed(1) + "%";
  };

  const submittedCount = roster.filter(cu => subByUser[cu.user.id]).length;
  const missingCount = roster.length - submittedCount;
  const ungradedCount = roster.filter(cu => {
    const sub = subByUser[cu.user.id];
    return sub && (sub.score === null || sub.score === undefined);
  }).length;

  const getStatus = (sub) => {
    if (!sub) return "Missing";
    if (sub.score === null || sub.score === undefined) return "Ungraded";
    return "Submitted";
  };

  const statusStyle = (status) => {
    if (status === "Missing") return "text-red-400 bg-red-500/10";
    if (status === "Ungraded") return "text-yellow-400 bg-yellow-500/10";
    return "text-green-400 bg-green-500/10";
  };

  const scoreColor = (score) => {
    if (score === null || score === undefined) return "text-zinc-500";
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const handleDownloadCSV = () => {
    const quoteField = (val) => {
      const str = String(val ?? "");
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };
    const headers = ["Student", "CWID", "Status", "Filename", "Score", "Submitted At"];
    const rows = roster.map(cu => {
      const sub = subByUser[cu.user.id];
      const status = getStatus(sub);
      const score = sub?.score !== null && sub?.score !== undefined ? sub.score + "%" : status;
      return [
        `${cu.user.firstName} ${cu.user.lastName}`,
        cu.user.cwid ?? "—",
        status,
        sub?.fileName ?? "—",
        score,
        formatTimestamp(sub?.submittedAt),
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(quoteField).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assignment_report_${assignment?.id ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Class Average", value: classAverage() },
    { label: "Highest Score", value: highestScore() },
    { label: "Lowest Score", value: lowestScore() },
    { label: "Median Score", value: medianScore() },
    { label: "Submitted", value: submittedCount },
    { label: "Missing", value: missingCount },
    { label: "Ungraded", value: ungradedCount },
    { label: "Graded", value: gradedScores.length },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Assignment Report" size="xl">
      {loading ? (
        <p className="text-zinc-400 text-sm text-center py-8">Loading report data...</p>
      ) : (
        <div className="space-y-5">
          {/* Assignment title */}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {assignment?.title}
            {assignment?.totalPoints != null && (
              <span className="ml-2 text-zinc-400 dark:text-zinc-500">• {assignment.totalPoints} pts</span>
            )}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map(({ label, value }) => (
              <div key={label} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center shadow-sm">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">{label}</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Student table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white whitespace-nowrap">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white whitespace-nowrap">CWID</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white whitespace-nowrap">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white whitespace-nowrap">Filename</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white whitespace-nowrap">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-white whitespace-nowrap">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {roster.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400">No students enrolled.</td>
                  </tr>
                ) : (
                  roster.map(cu => {
                    const sub = subByUser[cu.user.id];
                    const status = getStatus(sub);
                    return (
                      <tr key={cu.user.id} className="border-b border-zinc-100 dark:border-zinc-700/50 last:border-0">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#C9A84C1a" }}>
                              <span className="text-xs font-medium" style={{ color: "#c0a080" }}>
                                {cu.user.firstName?.charAt(0)}{cu.user.lastName?.charAt(0)}
                              </span>
                            </div>
                            <span className="text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                              {cu.user.firstName} {cu.user.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                          {cu.user.cwid ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                          {sub?.fileName ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          {sub?.score !== null && sub?.score !== undefined ? (
                            <span className={`font-medium ${scoreColor(sub.score)}`}>{sub.score}%</span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap">
                          {formatTimestamp(sub?.submittedAt)}
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
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
              Close
            </button>
            <button type="button" onClick={handleDownloadCSV} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#862633" }}>
              <FileDown className="w-4 h-4" /> Download CSV
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
