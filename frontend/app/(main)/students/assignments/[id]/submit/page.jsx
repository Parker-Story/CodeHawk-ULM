"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/apiBase';
import Toast from '@/components/Toast';
import DropZone from '@/components/DropZone';
import FileItem from '@/components/FileItem';
import Button from '@/components/Button';
import AiDetectionResult from '@/components/AiDetectionResult';

export default function SubmitAssignmentPage() {
    const { id: assignmentId } = useParams();
    const { user } = useAuth();

    const [files,        setFiles]        = useState([]);
    const [submitting,   setSubmitting]   = useState(false);
    const [detection,    setDetection]    = useState(null);
    const [submitError,  setSubmitError]  = useState(null);
    const [showToast,    setShowToast]    = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType,    setToastType]    = useState('success');

    function addFiles(newFiles) {
        setFiles(prev => [...prev, ...newFiles]);
        setDetection(null);
        setSubmitError(null);
    }

    function removeFile(fileName) {
        setFiles(prev => prev.filter(f => f.name !== fileName));
        setDetection(null);
    }

    function triggerToast(message, type = 'success') {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (files.length === 0 || !user?.id) return;

        setSubmitting(true);
        setSubmitError(null);
        setDetection(null);

        try {
            const fileContent = await readFileAsText(files[0]);
            const fileName    = files[0].name;

            const res = await fetch(
                `${API_BASE}/submissions/${assignmentId}/submit/${user.id}`,
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ fileName, fileContent }),
                }
            );

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || `Server error ${res.status}`);
            }

            const submission = await res.json();

            // Spring Boot returns full Submission entity with AI fields
            if (submission.aiLabel && submission.aiLabel !== 'Unavailable') {
                setDetection({
                    ai_probability: submission.aiProbability,
                    ai_percentage:  submission.aiPercentage,
                    label:          submission.aiLabel,
                    confidence:     submission.aiConfidence,
                });
            }

            setFiles([]);
            triggerToast('Assignment submitted successfully!', 'success');

        } catch (err) {
            setSubmitError(err.message);
            triggerToast('Submission failed. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="p-8">
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
                <div className="w-full max-w-2xl">

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Submit Assignment</h1>
                        <p className="text-zinc-400">Upload your file to complete the assignment</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <DropZone onFilesAdded={addFiles} />

                        {files.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-sm font-medium text-zinc-300 mb-4">
                                    Selected Files ({files.length})
                                </h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {files.map((file) => (
                                        <FileItem key={file.name} file={file} onRemove={removeFile} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {submitError && (
                            <p className="mt-4 text-sm text-red-400">{submitError}</p>
                        )}

                        <div className="mt-8">
                            <Button type="submit" disabled={files.length === 0 || submitting}>
                                {submitting
                                    ? 'Submitting & Analyzing...'
                                    : `Submit Assignment (${files.length} ${files.length === 1 ? 'file' : 'files'})`}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* AI Detection Result — shown after successful submission */}
                {detection && (
                    <div className="w-full max-w-2xl">
                        <AiDetectionResult detection={detection} />
                    </div>
                )}

                <Toast
                    message={toastMessage}
                    show={showToast}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            </div>
        </div>
    );
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file, 'utf-8');
    });
}
