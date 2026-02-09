import { File, X } from 'lucide-react';

export default function FileItem({ file, onRemove, theme = "default" }) {
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
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${theme === "student" ? "bg-orange-600/20" : theme === "faculty" ? "bg-teal-600/20" : "bg-violet-600/20"}`}>
        <File className={`w-6 h-6 ${theme === "student" ? "text-orange-400" : theme === "faculty" ? "text-teal-400" : "text-violet-400"}`} />
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
