"use client";

import Dialog from "@/components/Dialog";

export default function ArchiveClassDialog({ isOpen, onClose, courseName, onConfirm }) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Archive this Class?" size="sm">
      <p className="text-slate-300 mb-6">
        Are you sure you want to archive <span className="font-semibold text-white">{courseName}</span>? Students will no longer be able to submit assignments.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm?.();
            onClose();
          }}
          className="flex-1 py-3 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors"
        >
          Yes, Archive
        </button>
      </div>
    </Dialog>
  );
}
