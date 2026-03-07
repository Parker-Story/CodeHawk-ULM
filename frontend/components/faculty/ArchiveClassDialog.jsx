"use client";

import Dialog from "@/components/Dialog";

export default function ArchiveClassDialog({ isOpen, onClose, courseName, onConfirm }) {
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Archive this Class?" size="sm">
            <p className="text-zinc-300 mb-6">
                Are you sure you want to archive <span className="font-semibold text-white">{courseName}</span>? Students will no longer be able to submit assignments.
            </p>
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => { onConfirm?.(); onClose(); }}
                    className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors"
                    style={{ background: "#7C1D2E" }}
                >
                    Yes, Archive
                </button>
            </div>
        </Dialog>
    );
}