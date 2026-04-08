import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message, show, onClose }) {
    if (!show) return null;

    return (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg">
            <CheckCircle className="w-5 h-5" style={{ color: "#C9A84C" }} />
            <span className="text-zinc-900 dark:text-white font-medium">{message}</span>
            <button onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}