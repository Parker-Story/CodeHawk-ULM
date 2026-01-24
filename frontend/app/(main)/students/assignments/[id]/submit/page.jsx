"use client";

import { useState } from 'react';
import Toast from '@/components/Toast';
import DropZone from '@/components/DropZone';
import FileItem from '@/components/FileItem';
import Button from '@/components/Button';

export default function SubmitAssignmentPage() {
  const [files, setFiles] = useState([]);
  const [showToast, setShowToast] = useState(false);

  function addFiles(newFiles) {
    setFiles([...files, ...newFiles]);
  }

  function removeFile(fileName) {
    setFiles(files.filter(file => file.name !== fileName));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (files.length > 0) {
      setShowToast(true);
      setFiles([]);
      setTimeout(() => setShowToast(false), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Submit Assignment</h1>
            <p className="text-slate-400">Upload your files to complete the assignment</p>
          </div>

          <form onSubmit={handleSubmit}>
            <DropZone onFilesAdded={addFiles} theme="student" />

            {files.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-slate-300 mb-4">
                  Selected Files ({files.length})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {files.map((file) => (
                    <FileItem key={file.name} file={file} onRemove={removeFile} theme="student" />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <Button type="submit" disabled={files.length === 0} theme="student">
                Submit Assignment ({files.length} {files.length === 1 ? 'file' : 'files'})
              </Button>
            </div>
          </form>
        </div>

        <Toast 
          message="Assignment submitted successfully!" 
          show={showToast} 
          onClose={() => setShowToast(false)}
          theme="student"
        />
      </div>
    </div>
  );
}
