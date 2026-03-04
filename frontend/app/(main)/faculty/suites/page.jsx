"use client";

import { useState, useEffect } from "react";
import { Plus, FlaskConical, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";
import Dialog from "@/components/Dialog";

export default function TestSuitesPage() {
    const { user } = useAuth();
    const [suites, setSuites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSuiteOpen, setNewSuiteOpen] = useState(false);
    const [newSuite, setNewSuite] = useState({ name: "", description: "" });
    const [expandedSuite, setExpandedSuite] = useState(null);
    const [suiteCases, setSuiteCases] = useState({});
    const [addingCase, setAddingCase] = useState(null);
    const [newCase, setNewCase] = useState({ input: "", expectedOutput: "", hidden: false, label: "" });
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, suite: null });

    useEffect(() => {
        if (!user?.id) return;
        fetch(`${API_BASE}/testsuite/user/${user.id}`)
            .then((res) => res.json())
            .then((data) => {
                setSuites(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [user?.id]);

    const handleCreateSuite = async () => {
        if (!newSuite.name) return;
        try {
            const res = await fetch(`${API_BASE}/testsuite/user/${user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSuite),
            });
            if (!res.ok) throw new Error("Failed to create suite");
            const created = await res.json();
            setSuites((prev) => [...prev, created]);
            setNewSuite({ name: "", description: "" });
            setNewSuiteOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSuite = async () => {
        try {
            const res = await fetch(`${API_BASE}/testsuite/${deleteConfirm.suite.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete suite");
            setSuites((prev) => prev.filter((s) => s.id !== deleteConfirm.suite.id));
            setDeleteConfirm({ isOpen: false, suite: null });
            if (expandedSuite === deleteConfirm.suite.id) setExpandedSuite(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleExpandSuite = async (suiteId) => {
        if (expandedSuite === suiteId) {
            setExpandedSuite(null);
            return;
        }
        setExpandedSuite(suiteId);
        if (!suiteCases[suiteId]) {
            try {
                const res = await fetch(`${API_BASE}/testsuite/${suiteId}/cases`);
                const data = await res.json();
                setSuiteCases((prev) => ({ ...prev, [suiteId]: Array.isArray(data) ? data : [] }));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleAddCase = async (suiteId) => {
        if (!newCase.expectedOutput) return;
        try {
            const res = await fetch(`${API_BASE}/testsuite/${suiteId}/case`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCase),
            });
            if (!res.ok) throw new Error("Failed to add case");
            const created = await res.json();
            setSuiteCases((prev) => ({
                ...prev,
                [suiteId]: [...(prev[suiteId] || []), created],
            }));
            setNewCase({ input: "", expectedOutput: "", hidden: false, label: "" });
            setAddingCase(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCase = async (suiteId, caseId) => {
        try {
            const res = await fetch(`${API_BASE}/testsuite/case/${caseId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete case");
            setSuiteCases((prev) => ({
                ...prev,
                [suiteId]: prev[suiteId].filter((c) => c.id !== caseId),
            }));
        } catch (err) {
            console.error(err);
        }
    };

    const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm";
    const labelClass = "text-xs font-medium text-slate-400 block mb-1";

    if (loading) return <div className="p-8"><p className="text-slate-400">Loading...</p></div>;

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Test Suites</h1>
                        <p className="text-slate-400 text-sm mt-1">Create reusable test case collections to import into any assignment.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNewSuiteOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Suite
                    </button>
                </div>

                {suites.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                        <FlaskConical className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-white font-medium">No test suites yet</p>
                        <p className="text-slate-400 text-sm mt-1">Create a suite to reuse test cases across multiple assignments.</p>
                        <button
                            type="button"
                            onClick={() => setNewSuiteOpen(true)}
                            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Suite
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {suites.map((suite) => (
                            <div key={suite.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                {/* Suite Header */}
                                <div className="flex items-center justify-between p-5">
                                    <button
                                        type="button"
                                        onClick={() => handleExpandSuite(suite.id)}
                                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                                    >
                                        <div className="w-10 h-10 bg-teal-600/20 rounded-xl flex items-center justify-center shrink-0">
                                            <FlaskConical className="w-5 h-5 text-teal-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-semibold">{suite.name}</p>
                                            {suite.description && (
                                                <p className="text-slate-400 text-sm truncate">{suite.description}</p>
                                            )}
                                        </div>
                                        {expandedSuite === suite.id
                                            ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                                            : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                                        }
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm({ isOpen: true, suite })}
                                        className="ml-4 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Expanded Cases */}
                                {expandedSuite === suite.id && (
                                    <div className="border-t border-slate-700 p-5 space-y-3">
                                        {(suiteCases[suite.id] || []).length === 0 && addingCase !== suite.id ? (
                                            <p className="text-slate-400 text-sm">No test cases yet.</p>
                                        ) : (
                                            (suiteCases[suite.id] || []).map((tc) => (
                                                <div key={tc.id} className="flex items-start justify-between gap-4 p-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                                                    <div className="flex items-start gap-2 min-w-0">
                                                        {tc.hidden
                                                            ? <EyeOff className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                                            : <Eye className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                                                        }
                                                        <div>
                                                            <p className="text-white text-sm font-medium">
                                                                {tc.label || `Test Case ${tc.id}`}
                                                                {tc.hidden && <span className="ml-2 text-xs text-slate-500">(hidden)</span>}
                                                            </p>
                                                            <p className="text-slate-400 text-xs mt-0.5">
                                                                Input: <span className="font-mono text-slate-300">{tc.input || "(none)"}</span>
                                                            </p>
                                                            <p className="text-slate-400 text-xs mt-0.5">
                                                                Expected: <span className="font-mono text-slate-300">{tc.expectedOutput}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCase(suite.id, tc.id)}
                                                        className="shrink-0 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))
                                        )}

                                        {/* Add case form */}
                                        {addingCase === suite.id ? (
                                            <div className="p-4 bg-slate-900/50 border border-teal-600/30 rounded-xl space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className={labelClass}>Label</label>
                                                        <input
                                                            type="text"
                                                            value={newCase.label}
                                                            onChange={(e) => setNewCase((prev) => ({ ...prev, label: e.target.value }))}
                                                            placeholder="e.g. Test 1"
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                    <div className="flex items-end pb-1">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={newCase.hidden}
                                                                onChange={(e) => setNewCase((prev) => ({ ...prev, hidden: e.target.checked }))}
                                                                className="w-4 h-4 accent-teal-500"
                                                            />
                                                            <span className="text-sm text-slate-300 flex items-center gap-1">
                                <EyeOff className="w-4 h-4" /> Hidden
                              </span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Input (stdin)</label>
                                                    <textarea
                                                        rows={2}
                                                        value={newCase.input}
                                                        onChange={(e) => setNewCase((prev) => ({ ...prev, input: e.target.value }))}
                                                        placeholder="Leave blank if no input"
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Expected Output</label>
                                                    <textarea
                                                        rows={2}
                                                        value={newCase.expectedOutput}
                                                        onChange={(e) => setNewCase((prev) => ({ ...prev, expectedOutput: e.target.value }))}
                                                        placeholder="Expected stdout output"
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setAddingCase(null); setNewCase({ input: "", expectedOutput: "", hidden: false, label: "" }); }}
                                                        className="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddCase(suite.id)}
                                                        disabled={!newCase.expectedOutput}
                                                        className="flex-1 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors disabled:opacity-50"
                                                    >
                                                        Save Case
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => { setAddingCase(suite.id); setNewCase({ input: "", expectedOutput: "", hidden: false, label: "" }); }}
                                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Test Case
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Suite Dialog */}
            <Dialog isOpen={newSuiteOpen} onClose={() => setNewSuiteOpen(false)} title="New Test Suite">
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Suite Name</label>
                        <input
                            type="text"
                            value={newSuite.name}
                            onChange={(e) => setNewSuite((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. CS101 Loop Problems"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Description (optional)</label>
                        <textarea
                            rows={3}
                            value={newSuite.description}
                            onChange={(e) => setNewSuite((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="What is this suite for?"
                            className={inputClass}
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setNewSuiteOpen(false)}
                            className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateSuite}
                            disabled={!newSuite.name}
                            className="flex-1 py-3 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors disabled:opacity-50"
                        >
                            Create Suite
                        </button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Suite Confirmation */}
            <Dialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, suite: null })} title="Delete Suite" size="sm">
                <div className="space-y-4">
                    <p className="text-slate-300">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-white">{deleteConfirm.suite?.name}</span>?
                        This will delete all test cases in the suite. Assignments that already imported from this suite are unaffected.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setDeleteConfirm({ isOpen: false, suite: null })}
                            className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteSuite}
                            className="flex-1 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}