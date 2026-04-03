"use client";

import { useState, useEffect } from "react";
import { Plus, FlaskConical, Trash2, Eye, EyeOff, X, Pencil, Check } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";
import Dialog from "@/components/Dialog";

export default function TestSuitesPage() {
    const { user } = useAuth();
    const [suites, setSuites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSuiteOpen, setNewSuiteOpen] = useState(false);
    const [newSuite, setNewSuite] = useState({ name: "", description: "" });
    const [openSuiteId, setOpenSuiteId] = useState(null);
    const [suiteCases, setSuiteCases] = useState({});
    const [addingCase, setAddingCase] = useState(false);
    const [newCase, setNewCase] = useState({ input: "", expectedOutput: "", hidden: false, label: "" });
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, suite: null });
    const [editingSuiteInfo, setEditingSuiteInfo] = useState(false);
    const [suiteEditForm, setSuiteEditForm] = useState({ name: "", description: "" });

    const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm";
    const labelClass = "text-xs font-medium text-zinc-400 block mb-1";

    useEffect(() => {
        if (!user?.id) return;
        fetch(`${API_BASE}/testsuite/user/${user.id}`)
            .then((res) => res.json())
            .then((data) => { setSuites(Array.isArray(data) ? data : []); setLoading(false); })
            .catch((err) => { console.error(err); setLoading(false); });
    }, [user?.id]);

    const handleOpenSuite = async (suiteId) => {
        setOpenSuiteId(suiteId);
        setAddingCase(false);
        setNewCase({ input: "", expectedOutput: "", hidden: false, label: "" });
        if (!suiteCases[suiteId]) {
            try {
                const res = await fetch(`${API_BASE}/testsuite/${suiteId}/cases`);
                const data = await res.json();
                setSuiteCases((prev) => ({ ...prev, [suiteId]: Array.isArray(data) ? data : [] }));
            } catch (err) { console.error(err); }
        }
    };

    const handleCloseSuite = () => {
        setOpenSuiteId(null);
        setAddingCase(false);
        setEditingSuiteInfo(false);
        setNewCase({ input: "", expectedOutput: "", hidden: false, label: "" });
    };

    const handleSaveSuiteInfo = async () => {
        if (!suiteEditForm.name) return;
        try {
            const res = await fetch(`${API_BASE}/testsuite/${openSuiteId}`, {
                method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(suiteEditForm),
            });
            if (!res.ok) throw new Error("Failed to update suite");
            const updated = await res.json();
            setSuites((prev) => prev.map((s) => s.id === openSuiteId ? updated : s));
            setEditingSuiteInfo(false);
        } catch (err) { console.error(err); }
    };

    const handleCreateSuite = async () => {
        if (!newSuite.name) return;
        try {
            const res = await fetch(`${API_BASE}/testsuite/user/${user.id}`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSuite),
            });
            if (!res.ok) throw new Error("Failed to create suite");
            const created = await res.json();
            setSuites((prev) => [...prev, created]);
            setNewSuite({ name: "", description: "" });
            setNewSuiteOpen(false);
        } catch (err) { console.error(err); }
    };

    const handleDeleteSuite = async () => {
        try {
            const res = await fetch(`${API_BASE}/testsuite/${deleteConfirm.suite.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete suite");
            setSuites((prev) => prev.filter((s) => s.id !== deleteConfirm.suite.id));
            if (openSuiteId === deleteConfirm.suite.id) handleCloseSuite();
            setDeleteConfirm({ isOpen: false, suite: null });
        } catch (err) { console.error(err); }
    };

    const handleAddCase = async () => {
        if (!newCase.expectedOutput) return;
        try {
            const res = await fetch(`${API_BASE}/testsuite/${openSuiteId}/case`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCase),
            });
            if (!res.ok) throw new Error("Failed to add case");
            const created = await res.json();
            setSuiteCases((prev) => ({ ...prev, [openSuiteId]: [...(prev[openSuiteId] || []), created] }));
            setNewCase({ input: "", expectedOutput: "", hidden: false, label: "" });
            setAddingCase(false);
        } catch (err) { console.error(err); }
    };

    const handleDeleteCase = async (caseId) => {
        try {
            const res = await fetch(`${API_BASE}/testsuite/case/${caseId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete case");
            setSuiteCases((prev) => ({ ...prev, [openSuiteId]: prev[openSuiteId].filter((c) => c.id !== caseId) }));
        } catch (err) { console.error(err); }
    };

    const openSuite = suites.find(s => s.id === openSuiteId);
    const cases = openSuiteId ? (suiteCases[openSuiteId] || []) : [];

    if (loading) return <div className="p-8"><p className="text-zinc-400">Loading...</p></div>;

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Test Suites</h1>
                        <p className="text-zinc-400 text-sm mt-1">Create reusable test case collections to import into any assignment.</p>
                    </div>
                    <button type="button" onClick={() => setNewSuiteOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>
                        <Plus className="w-4 h-4" /> New Suite
                    </button>
                </div>

                {suites.length === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-12 text-center">
                        <FlaskConical className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-white font-medium">No test suites yet</p>
                        <p className="text-zinc-400 text-sm mt-1">Create a suite to reuse test cases across multiple assignments.</p>
                        <button type="button" onClick={() => setNewSuiteOpen(true)} className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>
                            <Plus className="w-4 h-4" /> New Suite
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {suites.map((suite) => (
                            <div key={suite.id} className="bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-between p-5">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#C9A84C22" }}>
                                        <FlaskConical className="w-5 h-5" style={{ color: "#C9A84C" }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-semibold">{suite.name}</p>
                                        {suite.description && <p className="text-zinc-400 text-sm truncate mt-0.5">{suite.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4 shrink-0">
                                    <button type="button" onClick={() => handleOpenSuite(suite.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors">
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button type="button" onClick={() => setDeleteConfirm({ isOpen: true, suite })} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Suite Editor Modal */}
            {openSuiteId && openSuite && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#C9A84C22" }}>
                                    <FlaskConical className="w-4 h-4" style={{ color: "#C9A84C" }} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold text-white">{openSuite.name}</h2>
                                    <p className="text-zinc-400 text-xs">
                                        {cases.length} test case{cases.length !== 1 ? "s" : ""}
                                        {openSuite.description && ` • ${openSuite.description}`}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={handleCloseSuite} className="ml-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors shrink-0">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-auto p-6 space-y-4">

                            {/* Suite info */}
                            {editingSuiteInfo ? (
                                <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-xl space-y-3">
                                    <div>
                                        <label className={labelClass}>Suite Name</label>
                                        <input type="text" value={suiteEditForm.name} onChange={(e) => setSuiteEditForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} autoFocus />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Description (optional)</label>
                                        <textarea rows={2} value={suiteEditForm.description} onChange={(e) => setSuiteEditForm((p) => ({ ...p, description: e.target.value }))} className={inputClass} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setEditingSuiteInfo(false)} className="flex-1 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors">Cancel</button>
                                        <button type="button" onClick={handleSaveSuiteInfo} disabled={!suiteEditForm.name} className="flex-1 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#7C1D2E" }}>Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between gap-3 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                                    <div className="min-w-0">
                                        <p className="text-white font-semibold">{openSuite.name}</p>
                                        {openSuite.description
                                            ? <p className="text-zinc-400 text-sm mt-0.5">{openSuite.description}</p>
                                            : <p className="text-zinc-600 text-sm mt-0.5 italic">No description</p>
                                        }
                                    </div>
                                    <button type="button" onClick={() => { setEditingSuiteInfo(true); setSuiteEditForm({ name: openSuite.name, description: openSuite.description || "" }); }} className="shrink-0 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="border-t border-zinc-700/50" />

                            {cases.length === 0 && !addingCase ? (
                                <p className="text-zinc-400 text-sm">No test cases yet. Add one below.</p>
                            ) : (
                                cases.map((tc) => (
                                    <div key={tc.id} className="flex items-start justify-between gap-4 p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                                        <div className="flex items-start gap-3 min-w-0">
                                            {tc.hidden
                                                ? <EyeOff className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                                : <Eye className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#C9A84C" }} />
                                            }
                                            <div>
                                                <p className="text-white text-sm font-medium">
                                                    {tc.label || `Test Case ${tc.id}`}
                                                    {tc.hidden && <span className="ml-2 text-xs text-zinc-500">(hidden)</span>}
                                                </p>
                                                <p className="text-zinc-400 text-xs mt-0.5">Input: <span className="font-mono text-zinc-300">{tc.input || "(none)"}</span></p>
                                                <p className="text-zinc-400 text-xs mt-0.5">Expected: <span className="font-mono text-zinc-300">{tc.expectedOutput}</span></p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => handleDeleteCase(tc.id)} className="shrink-0 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}

                            {addingCase && (
                                <div className="p-4 bg-zinc-800 border rounded-xl space-y-3 mt-2" style={{ borderColor: "#7C1D2E66" }}>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Label</label>
                                            <input type="text" value={newCase.label} onChange={(e) => setNewCase((p) => ({ ...p, label: e.target.value }))} placeholder="e.g. Test 1" className={inputClass} autoFocus />
                                        </div>
                                        <div className="flex items-end pb-1">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={newCase.hidden} onChange={(e) => setNewCase((p) => ({ ...p, hidden: e.target.checked }))} className="w-4 h-4 shrink-0" />
                                                <span className="text-sm text-zinc-300 flex items-center gap-1"><EyeOff className="w-4 h-4" /> Hidden</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Input (stdin)</label>
                                        <textarea rows={2} value={newCase.input} onChange={(e) => setNewCase((p) => ({ ...p, input: e.target.value }))} placeholder="Leave blank if no input" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Expected Output</label>
                                        <textarea rows={2} value={newCase.expectedOutput} onChange={(e) => setNewCase((p) => ({ ...p, expectedOutput: e.target.value }))} placeholder="Expected stdout output" className={inputClass} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => { setAddingCase(false); setNewCase({ input: "", expectedOutput: "", hidden: false, label: "" }); }} className="flex-1 py-2 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors">Cancel</button>
                                        <button type="button" onClick={handleAddCase} disabled={!newCase.expectedOutput} className="flex-1 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#7C1D2E" }}>Save Case</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!addingCase && (
                            <div className="px-6 py-4 border-t border-zinc-700 shrink-0">
                                <button type="button" onClick={() => setAddingCase(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#7C1D2E" }}>
                                    <Plus className="w-4 h-4" /> Add Test Case
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* New Suite Dialog */}
            <Dialog isOpen={newSuiteOpen} onClose={() => setNewSuiteOpen(false)} title="New Test Suite">
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Suite Name</label>
                        <input type="text" value={newSuite.name} onChange={(e) => setNewSuite((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. CS101 Loop Problems" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Description (optional)</label>
                        <textarea rows={3} value={newSuite.description} onChange={(e) => setNewSuite((p) => ({ ...p, description: e.target.value }))} placeholder="What is this suite for?" className={inputClass} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setNewSuiteOpen(false)} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
                        <button type="button" onClick={handleCreateSuite} disabled={!newSuite.name} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#7C1D2E" }}>Create Suite</button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, suite: null })} title="Delete Suite" size="sm">
                <div className="space-y-4">
                    <p className="text-zinc-300">Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirm.suite?.name}</span>? This will delete all test cases in the suite. Assignments that already imported from this suite are unaffected.</p>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setDeleteConfirm({ isOpen: false, suite: null })} className="flex-1 py-3 text-sm font-medium text-zinc-300 bg-zinc-700 rounded-xl hover:bg-zinc-600 transition-colors">Cancel</button>
                        <button type="button" onClick={handleDeleteSuite} className="flex-1 py-3 text-sm font-medium text-white bg-red-800 rounded-xl hover:bg-red-700 transition-colors">Delete</button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
