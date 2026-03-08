"use client";

import { API_BASE } from "@/lib/apiBase";
import { useState } from "react";
import Dialog from "@/components/Dialog";

const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-transparent";
const labelClass = "text-sm font-medium text-zinc-300 block mb-1.5";

export default function NewAssignmentDialog({ isOpen, onClose, crn, onAssignmentCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scoresVisible, setScoresVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/assignment/course/${crn}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, scoresVisible }),
      });
      if (!response.ok) throw new Error("Failed to create assignment");
      const savedAssignment = await response.json();
      onAssignmentCreated(savedAssignment);
      setTitle("");
      setDescription("");
      setScoresVisible(false);
      onClose();
    } catch (error) { console.error("Error creating assignment:", error); }
  };

  return (
      <Dialog isOpen={isOpen} onClose={onClose} title="New Assignment" size="xl">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="assignment-title" className={labelClass}>Assignment Title</label>
            <input id="assignment-title" type="text" placeholder="e.g., Binary Search Tree Implementation" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="assignment-description" className={labelClass}>Description</label>
            <textarea id="assignment-description" rows={4} placeholder="Provide clear instructions for students..." className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center justify-between p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
            <div>
              <p className="text-sm font-medium text-zinc-300">Show Student Scores Upon Submission</p>
              <p className="text-xs text-zinc-500 mt-0.5">Students will see their score immediately after submitting.</p>
            </div>
            <button
                type="button"
                onClick={() => setScoresVisible((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${scoresVisible ? "" : "bg-zinc-600"}`}
                style={scoresVisible ? { background: "#7C1D2E" } : {}}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${scoresVisible ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="flex gap-3 pt-4 border-t border-zinc-700">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>Publish Assignment</button>
          </div>
        </form>
      </Dialog>
  );
}