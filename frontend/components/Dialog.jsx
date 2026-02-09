"use client";

import { X } from "lucide-react";

export default function Dialog({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={`relative z-10 w-full max-h-[90vh] flex flex-col bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl ${size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-xl"}`}>
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between p-6 pb-0">
          {title && (
            <h2 className="text-xl font-bold text-white">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
