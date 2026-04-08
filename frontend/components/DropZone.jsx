"use client";

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export default function DropZone({ onFilesAdded }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
          className={`bg-white dark:bg-zinc-900 border-2 rounded-2xl p-16 text-center cursor-pointer transition-all ${
              isDragging ? "border-amber-600 bg-zinc-50 dark:bg-zinc-800" : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          }`}
      >
        <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
        <div
            className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl transition-colors"
            style={{ background: isDragging ? "#C9A84C2a" : "#C9A84C1a" }}
        >
          <Upload className="w-10 h-10" style={{ color: "#c0a080" }} />
        </div>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-white mb-3">
          {isDragging ? 'Drop files here' : 'Drag & drop your files here'}
        </p>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">or click to browse</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-4">Select multiple files at once</p>
      </div>
  );
}