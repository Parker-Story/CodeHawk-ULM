import { CheckCircle, X } from 'lucide-react';

export default function Toast({ message, show, onClose, theme = "default" }) {
  if (!show) return null;

  const themes = {
    default: "text-violet-400",
    student: "text-orange-400",
    faculty: "text-teal-400",
  };

  const iconColor = themes[theme] || themes.default;

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 bg-slate-800 border border-slate-700 rounded-xl shadow-lg">
      <CheckCircle className={`w-5 h-5 ${iconColor}`} />
      <span className="text-white font-medium">{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
