"use client";

import { useState } from "react";
import Dialog from "@/components/Dialog";

const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";
const labelClass = "text-sm font-medium text-slate-300 block mb-1.5";

export default function NewAssignmentDialog({ isOpen, onClose }) {
  const [groupAssignment, setGroupAssignment] = useState(false);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="New Assignment" size="xl">
      <p className="text-slate-400 text-sm mb-6">Define evaluation criteria and rules</p>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="assignment-title" className={labelClass}>Assignment Title</label>
          <input id="assignment-title" type="text" placeholder="e.g., Binary Search Tree Implementation" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="assignment-language" className={labelClass}>Language</label>
            <select id="assignment-language" className={inputClass}>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div>
            <label htmlFor="total-points" className={labelClass}>Total Points</label>
            <input id="total-points" type="number" defaultValue={100} min={0} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="due-date" className={labelClass}>Due Date</label>
          <input id="due-date" type="date" defaultValue="2026-03-15" className={inputClass} />
        </div>
        <div>
          <label htmlFor="assignment-description" className={labelClass}>Description</label>
          <textarea id="assignment-description" rows={3} placeholder="Provide clear instructions for students..." className={inputClass} />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="group-assignment" checked={groupAssignment} onChange={(e) => setGroupAssignment(e.target.checked)} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-teal-600 focus:ring-teal-500" />
          <label htmlFor="group-assignment" className="text-slate-300 text-sm">Group Assignment — Enable collaborative submissions for students</label>
        </div>

        <div>
          <label className={labelClass}>Starter Code</label>
          <p className="text-slate-400 text-xs mb-2">Provide a template for students to build upon</p>
          <textarea rows={4} placeholder="// Starter code..." className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Test Suite</label>
          <p className="text-slate-400 text-xs mb-3">Configure automated evaluation criteria</p>
          <div className="flex gap-2 mb-2">
            <span className="px-3 py-1.5 text-sm font-medium rounded-lg bg-teal-600 text-white">Public Test</span>
            <span className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-700 text-slate-400">Private Test</span>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <p className="text-slate-400 text-sm font-medium">public Case #1</p>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Input</label>
              <input type="text" placeholder="e.g., [1, 2, 3]" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Expected Output</label>
              <input type="text" placeholder="e.g., 6" className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4 mb-1.5">
            <label className={labelClass + " mb-0"}>Grading Rubric</label>
            <button type="button" className="shrink-0 px-3 py-1.5 text-sm font-medium text-teal-400 hover:text-teal-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors">Add Criteria</button>
          </div>
          <p className="text-slate-400 text-xs mb-3">Design weighted scoring criteria</p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Criteria Name</label>
              <input type="text" placeholder="e.g., Code Efficiency" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Points</label>
                <input type="number" defaultValue={0} min={0} className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Description</label>
                <input type="text" placeholder="Description of the criteria..." className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>AI & Integrity Shield</label>
          <p className="text-slate-400 text-xs mb-3">Leverage automated academic integrity features</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 text-sm">Plagiarism Check — Compare across all submissions</span>
              <button type="button" className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors">
                Plagiarism Check
              </button>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 text-sm">AI Detection — Flag AI-generated code patterns</span>
              <button type="button" className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors">
                AI Detection
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-3 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors">
            Publish Assignment
          </button>
        </div>
      </form>
    </Dialog>
  );
}
