"use client";

import { useState, useEffect } from 'react';
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
    const [assignment,   setAssignment]   = useState(null);
    const [copied,       setCopied]       = useState(false);

    useEffect(() => {
        if (!assignmentId) return;
        fetch(`${API_BASE}/assignment/${assignmentId}`)
            .then((res) => res.ok ? res.json() : null)
            .then((data) => { if (data) setAssignment(data); })
            .catch(() => {});
    }, [assignmentId]);

    function handleCopyStarterCode() {
        navigator.clipboard.writeText(assignment.starterCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    function triggerToast(message, type = 'success') {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }

    function addFiles(newFiles) {
        setFiles(prev => [...prev, ...newFiles]);
        setDetection(null);
        setSubmitError(null);
    }

    function removeFile(fileName) {
        setFiles(prev => prev.filter(f => f.name !== fileName));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (files.length === 0 || !user) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            const fileEntries = await Promise.all(
                files.map(async (file) => ({
                    fileName: file.name,
                    fileContent: await readFileAsText(file),
                }))
            );

            const res = await fetch(
                `${API_BASE}/submission/submit-files/${assignmentId}/${user.id}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ files: fileEntries }),
                }
            );

            if (!res.ok) throw new Error('Submission failed');

            const submission = await res.json();

            if (submission.aiLabel && submission.aiLabel !== 'Unavailable') {
                setDetection({
                    ai_probability: submission.aiProbability,
                    ai_percentage:  submission.aiPercentage,
                    label:          submission.aiLabel,
                    confidence:     submission.aiConfidence,
                });
            }

            triggerToast('Submitted successfully!');
            setFiles([]);
        } catch (err) {
            console.error('Error submitting:', err);
            setSubmitError('Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="p-8">
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Submit Assignment</h1>
                        <p className="text-zinc-500 dark:text-zinc-400">Upload your files to complete the assignment</p>
                    </div>

                    {assignment?.starterCode && (
                        <div className="mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Starter Code</h2>
                                <button
                                    type="button"
                                    onClick={handleCopyStarterCode}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                                    style={copied
                                        ? { color: "#4ade80", borderColor: "#4ade8044", background: "#4ade8011" }
                                        : { color: "#C9A84C", borderColor: "#C9A84C44", background: "#C9A84C11" }
                                    }
                                >
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <pre className="px-4 py-3 text-sm font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto whitespace-pre bg-zinc-50 dark:bg-zinc-800/50 max-h-72">
                                {assignment.starterCode}
                            </pre>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <DropZone onFilesAdded={addFiles} />

                        {files.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
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

                {detection && (
                    <div className="w-full max-w-2xl">
                        <AiDetectionResult detection={detection} />
                    </div>
                )}
            </div>

            <Toast
                message={toastMessage}
                show={showToast}
                type={toastType}
                onClose={() => setShowToast(false)}
            />
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
