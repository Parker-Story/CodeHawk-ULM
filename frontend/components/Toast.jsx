import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message, show, onClose, type = "success" }) {
    if (!show) return null;

    const isError = type === "error";

    return (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg">
            {isError
                ? <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                : <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "#C9A84C" }} />
            }
            <span className="text-white font-medium">{message}</span>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}