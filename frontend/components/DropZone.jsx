"use client";

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export default function DropZone({ onFilesAdded, theme = "default" }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const themes = {
    default: {
      border: isDragging ? 'border-violet-500 bg-slate-800' : 'border-slate-700 hover:border-violet-500/50 hover:bg-slate-800',
      iconBg: isDragging ? 'bg-violet-600/40' : 'bg-violet-600/20',
      iconColor: 'text-violet-400',
    },
    student: {
      border: isDragging ? 'border-orange-500 bg-slate-800' : 'border-slate-700 hover:border-orange-500/50 hover:bg-slate-800',
      iconBg: isDragging ? 'bg-orange-600/40' : 'bg-orange-600/20',
      iconColor: 'text-orange-400',
    },
    faculty: {
      border: isDragging ? 'border-teal-500 bg-slate-800' : 'border-slate-700 hover:border-teal-500/50 hover:bg-slate-800',
      iconBg: isDragging ? 'bg-teal-600/40' : 'bg-teal-600/20',
      iconColor: 'text-teal-400',
    },
  };

  const currentTheme = themes[theme] || themes.default;

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    onFilesAdded(Array.from(e.dataTransfer.files));
  }

  function handleFileSelect(e) {
    onFilesAdded(Array.from(e.target.files));
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
      className={`bg-slate-900/80 backdrop-blur-sm border-2 rounded-2xl p-16 text-center cursor-pointer transition-all ${currentTheme.border}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl transition-colors ${currentTheme.iconBg}`}>
        <Upload className={`w-10 h-10 ${currentTheme.iconColor}`} />
      </div>
      <p className="text-2xl font-semibold text-white mb-3">
        {isDragging ? 'Drop files here' : 'Drag & drop your files here'}
      </p>
      <p className="text-slate-400 text-lg">or click to browse</p>
      <p className="text-slate-500 text-sm mt-4">Select multiple files at once</p>
    </div>
  );
}
