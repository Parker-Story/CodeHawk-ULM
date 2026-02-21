"use client";

import { Printer, FileDown } from "lucide-react";
import Dialog from "@/components/Dialog";

const gradeReportStudents = [
  { initials: "JS", name: "Jane Student", a1: 92, a2: 67, total: "80%" },
  { initials: "JD", name: "John Doe", a1: 71, a2: 82, total: "77%" },
  { initials: "AS", name: "Alice Smith", a1: 99, a2: 74, total: "87%" },
  { initials: "BJ", name: "Bob Johnson", a1: 70, a2: 81, total: "76%" },
  { initials: "ED", name: "Emma Davis", a1: 70, a2: 81, total: "76%" },
  { initials: "MB", name: "Michael Brown", a1: 98, a2: 73, total: "86%" },
];

export default function GradeReportDialog({ isOpen, onClose }) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Grade Distribution Report" size="xl">
      <p className="text-slate-400 text-sm mb-6">Analytics Dashboard • Dr. Sarah Miller</p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm">Class Average</p>
          <p className="text-2xl font-bold text-white mt-1">84.2%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm">Completion Rate</p>
          <p className="text-2xl font-bold text-white mt-1">92%</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-slate-400 text-sm">Flagged Cases</p>
          <p className="text-2xl font-bold text-white mt-1">3</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-700 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700/50 border-b border-slate-700">
              <th className="text-left py-3 px-4 font-semibold text-white">Student</th>
              <th className="text-left py-3 px-4 font-semibold text-white">Binary Search Tree Implementation</th>
              <th className="text-left py-3 px-4 font-semibold text-white">Hash Table Lab</th>
              <th className="text-left py-3 px-4 font-semibold text-white">Total</th>
            </tr>
          </thead>
          <tbody>
            {gradeReportStudents.map((row, i) => (
              <tr key={i} className="border-b border-slate-700/50 last:border-0">
                <td className="py-3 px-4">
                  <span className="font-medium text-teal-400">{row.initials}</span>
                  <span className="text-slate-300 ml-2">{row.name}</span>
                </td>
                <td className="py-3 px-4 text-slate-300">{row.a1}</td>
                <td className="py-3 px-4 text-slate-300">{row.a2}</td>
                <td className="py-3 px-4 font-medium text-white">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Download CSV
        </button>
      </div>
    </Dialog>
  );
}
