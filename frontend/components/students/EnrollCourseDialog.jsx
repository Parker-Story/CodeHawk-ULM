"use client";

import { useState } from "react";
import Dialog from "@/components/Dialog";

export default function EnrollCourseDialog({ isOpen, onClose, onJoinCourse }) {
    const [registrationCode, setRegistrationCode] = useState("");

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
            <p className="text-zinc-400 text-sm mb-6">
                Enter the unique course registration code provided by your instructor to add the course to your dashboard.
            </p>
            <label htmlFor="registration-code" className="block text-sm font-medium text-zinc-300 mb-2">
                Registration Code
            </label>
            <input
                id="registration-code"
                type="text"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                placeholder="e.g. CS402"
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 focus:border-transparent mb-6"
            />
            <div className="flex justify-end gap-3 mb-4">
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-zinc-300 hover:text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleJoin}
                    className="px-4 py-2 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                    style={{ background: "#7C1D2E" }}
                >
                    Join Course
                </button>
            </div>
            <p className="text-zinc-500 text-xs">
                Codes are managed by faculty. If you don&apos;t have a code, check your syllabus or contact the CS Department.
            </p>
        </Dialog>
    );
}