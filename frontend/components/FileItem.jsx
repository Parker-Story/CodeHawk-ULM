import { File, X } from 'lucide-react';

export default function FileItem({ file, onRemove, theme = "default" }) {
  const themes = {
    default: {
      bg: "bg-violet-600/20",
      icon: "text-violet-400",
    },
    student: {
      bg: "bg-orange-600/20",
      icon: "text-orange-400",
    },
    faculty: {
      bg: "bg-teal-600/20",
      icon: "text-teal-400",
    },
  };

  const currentTheme = themes[theme] || themes.default;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function getExtension(fileName) {
    const parts = fileName.split('.');
    if (parts.length === 1) return 'FILE';
    return parts[parts.length - 1].toUpperCase();
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
      <div className={`w-12 h-12 flex items-center justify-center ${currentTheme.bg} rounded-lg`}>
        <File className={`w-6 h-6 ${currentTheme.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{file.name}</p>
        <p className="text-sm text-slate-400">
          {getExtension(file.name)} • {formatSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(file.name)}
        className="p-2 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
