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
      className={`bg-slate-900 border-2 rounded-2xl p-16 text-center cursor-pointer transition-all ${
        isDragging 
          ? 'border-cyan-500 bg-slate-800' 
          : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl transition-colors ${
        isDragging ? 'bg-cyan-600/40' : 'bg-cyan-600/20'
      }`}>
        <Upload className="w-10 h-10 text-cyan-400" />
      </div>
      <p className="text-2xl font-semibold text-white mb-3">
        {isDragging ? 'Drop files here' : 'Drag & drop your files here'}
      </p>
      <p className="text-slate-400 text-lg">or click to browse</p>
      <p className="text-slate-500 text-sm mt-4">Select multiple files at once</p>
    </div>
  );
}

