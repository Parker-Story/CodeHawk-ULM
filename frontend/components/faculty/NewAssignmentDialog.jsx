"use client";
import { API_BASE } from "@/lib/apiBase";
import { useState } from "react";
import Dialog from "@/components/Dialog";

const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";
const labelClass = "text-sm font-medium text-slate-300 block mb-1.5";

export default function NewAssignmentDialog({ isOpen, onClose, crn, onAssignmentCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/assignment/course/${crn}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!response.ok) throw new Error("Failed to create assignment");
      const savedAssignment = await response.json();
      onAssignmentCreated(savedAssignment);
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error creating assignment:", error);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="New Assignment" size="xl">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="assignment-title" className={labelClass}>Assignment Title</label>
          <input
            id="assignment-title"
            type="text"
            placeholder="e.g., Binary Search Tree Implementation"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="assignment-description" className={labelClass}>Description</label>
          <textarea
            id="assignment-description"
            rows={4}
            placeholder="Provide clear instructions for students..."
            className={inputClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors"
          >
            Publish Assignment
          </button>
        </div>
      </form>
    </Dialog>
  );
}