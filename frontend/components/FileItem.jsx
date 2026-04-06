import { File, X } from 'lucide-react';

export default function FileItem({ file, onRemove }) {
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
        <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors shadow-sm">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg" style={{ background: "#86263333" }}>
                <File className="w-6 h-6" style={{ color: "#c0a080" }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-white truncate">{file.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{getExtension(file.name)} • {formatSize(file.size)}</p>
            </div>
            <button
                type="button"
                onClick={() => onRemove(file.name)}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}