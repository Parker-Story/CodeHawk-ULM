"use client";

import { useState } from "react";
import Dialog from "@/components/Dialog";

export default function EnrollCourseDialog({ isOpen, onClose, onJoinCourse, variant = "student" }) {
  const [registrationCode, setRegistrationCode] = useState("");

  const primaryBtnClass = variant === "faculty" ? "bg-teal-600 hover:bg-teal-500" : variant === "ta" ? "bg-violet-600 hover:bg-violet-500" : "bg-orange-600 hover:bg-orange-500";
  const focusRingClass = variant === "faculty" ? "focus:ring-teal-500" : variant === "ta" ? "focus:ring-violet-500" : "focus:ring-orange-500";

  const handleClose = () => {
    setRegistrationCode("");
    onClose?.();
  };

  const handleJoin = () => {
    onJoinCourse?.(registrationCode);
    handleClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Enroll in Course">
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
        className={`w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent mb-6`}
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
          onClick={handleJoin}
          className={`px-4 py-2 ${primaryBtnClass} text-white font-medium rounded-lg transition-colors`}
        >
          Join Course
        </button>
      </div>
      <p className="text-slate-500 text-xs">
        Codes are managed by faculty. If you don&apos;t have a code, check your syllabus or contact the CS Department.
      </p>
    </Dialog>
  );
}
