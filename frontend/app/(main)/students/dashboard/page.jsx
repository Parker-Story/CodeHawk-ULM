"use client";

import { useState } from "react";

export default function StudentDashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");

  const handleClose = () => {
    setDialogOpen(false);
    setRegistrationCode("");
  };

  const handleJoinCourse = () => {
    // TODO: call API to enroll with registrationCode
    handleClose();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] p-8 gap-10">
      <div className="flex-1 min-w-0 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="bg-orange-600 hover:bg-orange-500 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Add course
          </button>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-400">Welcome to your dashboard.</p>
        </div>
      </div>

      <aside className="w-72 shrink-0 pl-6 border-l border-slate-700/50">
        <h2 className="text-lg font-semibold text-white mb-2">To-do</h2>
        <p className="text-slate-400 text-sm">No tasks have been assigned.</p>
      </aside>

      {dialogOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enroll-dialog-title"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-slate-800 p-6 shadow-xl border border-slate-700"
          >
            <h2 id="enroll-dialog-title" className="text-xl font-semibold text-white mb-2">
              Enroll in Course
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              Enter the unique course registration code provided by your instructor to add the course to your dashboard.
            </p>
            <label htmlFor="registration-code" className="block text-sm font-medium text-slate-300 mb-2">
              Registration Code
            </label>
            <input
              id="registration-code"
              type="text"
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value)}
              placeholder="e.g. CS402"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-6"
            />
            <div className="flex justify-end gap-3 mb-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-slate-300 hover:text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleJoinCourse}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors"
              >
                Join Course
              </button>
            </div>
            <p className="text-slate-500 text-xs">
              Codes are managed by faculty. If you don&apos;t have a code, check your syllabus or contact the CS Department.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
