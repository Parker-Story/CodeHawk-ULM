"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, X } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

export default function GradingWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { id: crn, assignmentId } = params;
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSolution, setOpenSolution] = useState(null);
  const [scoreInputs, setScoreInputs] = useState({});
  const [savingScore, setSavingScore] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/assignment/${assignmentId}`)
      .then((res) => res.json())
      .then((data) => setAssignment(data))
      .catch((err) => console.error(err));

    fetch(`${API_BASE}/submission/assignment/${assignmentId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch submissions");
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSubmissions(list);
        const inputs = {};
        list.forEach((s) => {
          inputs[s.submissionId.userId] = s.score ?? "";
        });
        setScoreInputs(inputs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [assignmentId]);

  const handleScoreSave = async (userId) => {
    const score = scoreInputs[userId];
    if (score === "" || score === null || score === undefined) return;
    setSavingScore((prev) => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(`${API_BASE}/submission/score/${assignmentId}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: parseInt(score) }),
      });
      if (!response.ok) throw new Error("Failed to save score");
      const updated = await response.json();
      setSubmissions((prev) =>
        prev.map((s) => (s.submissionId.userId === userId ? updated : s))
      );
    } catch (error) {
      console.error("Error saving score:", error);
    } finally {
      setSavingScore((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Loading...</p></div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => router.push(`/faculty/courses/${crn}`)}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Grading Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">
            {assignment?.title} • {submissions.length} Submission{submissions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700/50 border-b border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-white">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-white">File</th>
                <th className="text-left py-3 px-4 font-semibold text-white">Score</th>
                <th className="text-left py-3 px-4 font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-slate-400">
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => {
                  const userId = s.submissionId.userId;
                  return (
                    <tr key={userId} className="border-b border-slate-700/50 last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-teal-600/20 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-teal-400 text-xs font-medium">
                              {s.user?.firstName?.charAt(0)}{s.user?.lastName?.charAt(0)}
                            </span>
                          </div>
                          <span className="text-slate-300">{s.user?.firstName} {s.user?.lastName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <FileText className="w-4 h-4" />
                          <span>{s.fileName || "Unnamed file"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={scoreInputs[userId] ?? ""}
                            onChange={(e) => setScoreInputs((prev) => ({ ...prev, [userId]: e.target.value }))}
                            placeholder="—"
                            className="w-16 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleScoreSave(userId)}
                            disabled={savingScore[userId]}
                            className="px-3 py-1 text-xs font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors disabled:opacity-50"
                          >
                            {savingScore[userId] ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setOpenSolution(s)}
                          className="text-teal-400 hover:text-teal-300 font-medium text-sm"
                        >
                          Open Solution
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Solution Viewer Modal */}
      {openSolution && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">{openSolution.fileName}</h2>
                <p className="text-slate-400 text-sm">{openSolution.user?.firstName} {openSolution.user?.lastName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenSolution(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-800/50 rounded-xl p-4">
                {openSolution.fileContent
                  ? atob(openSolution.fileContent)
                  : "No file content available."}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}