"use client";

import { X } from "lucide-react";

export default function Dialog({ isOpen, onClose, title, children, size = "md" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />
            <div className={`relative z-10 w-full max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl ${size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : size === "xl" ? "max-w-4xl" : "max-w-xl"}`}>
                <div className="shrink-0 flex items-center justify-between p-6 pb-0">
                    {title && (
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>
                    )}
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}