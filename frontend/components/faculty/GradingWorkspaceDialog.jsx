"use client";

import Dialog from "@/components/Dialog";

const placeholderSubmissions = [
  { initials: "J", name: "Jane Student", submitted: "Feb 15, 2026", plagiarism: "12%", status: "pending", score: "—" },
  { initials: "J", name: "John Doe", submitted: "Feb 14, 2026", plagiarism: "5%", status: "graded", score: "95/100" },
  { initials: "A", name: "Alice Smith", submitted: "Feb 15, 2026", plagiarism: "88%", status: "pending", score: "—" },
];

export default function GradingWorkspaceDialog({ isOpen, onClose, assignmentTitle, submissionCount = 3 }) {
  return (
      <Dialog isOpen={isOpen} onClose={onClose} title="Grading Workspace" size="xl">
        <p className="text-zinc-400 text-sm mb-6">{assignmentTitle} • {submissionCount} Submissions</p>
        <div className="flex items-center justify-between gap-4 mb-6">
          <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>
            Generate Plagiarism Report
          </button>
          <button type="button" onClick={onClose} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors">
            Back to Course
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-zinc-700">
          <table className="w-full text-sm">
            <thead>
            <tr className="bg-zinc-800 border-b border-zinc-700">
              <th className="text-left py-3 px-4 font-semibold text-white">Student</th>
              <th className="text-left py-3 px-4 font-semibold text-white">Submitted</th>
              <th className="text-left py-3 px-4 font-semibold text-white">Plagiarism</th>
              <th className="text-left py-3 px-4 font-semibold text-white">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-white">Score</th>
              <th className="text-left py-3 px-4 font-semibold text-white">Actions</th>
            </tr>
            </thead>
            <tbody>
            {placeholderSubmissions.map((row, i) => (
                <tr key={i} className="border-b border-zinc-700/50 last:border-0">
                  <td className="py-3 px-4">
                    <span className="font-medium" style={{ color: "#C9A84C" }}>{row.initials}</span>
                    <span className="text-zinc-300 ml-2">{row.name}</span>
                  </td>
                  <td className="py-3 px-4 text-zinc-300">{row.submitted}</td>
                  <td className="py-3 px-4 text-zinc-300">{row.plagiarism}</td>
                  <td className="py-3 px-4">
                    <span style={row.status === "graded" ? { color: "#C9A84C" } : { color: "#71717a" }}>{row.status}</span>
                  </td>
                  <td className="py-3 px-4 text-zinc-300">{row.score}</td>
                  <td className="py-3 px-4">
                    <button type="button" className="font-medium text-sm hover:opacity-80 transition-colors" style={{ color: "#C9A84C" }}>
                      Open Solution
                    </button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </Dialog>
  );
}