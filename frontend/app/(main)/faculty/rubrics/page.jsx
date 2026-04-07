"use client";

import { useState, useEffect } from "react";
import { Plus, ClipboardList, Trash2, Copy, Eye, EyeOff, Pencil, Check, X, Settings2 } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";
import Dialog from "@/components/Dialog";

export default function RubricsPage() {
    const { user } = useAuth();
    const [rubrics, setRubrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRubricOpen, setNewRubricOpen] = useState(false);
    const [newRubric, setNewRubric] = useState({ name: "", description: "", visible: false, weighted: false });
    const [openRubricId, setOpenRubricId] = useState(null);
    const [rubricDetails, setRubricDetails] = useState({});
    const [editingSettings, setEditingSettings] = useState(false);
    const [editForm, setEditForm] = useState({ name: "", description: "", visible: false });
    const [addingCriteria, setAddingCriteria] = useState(false);
    const [newCriteriaTitle, setNewCriteriaTitle] = useState("");
    const [addingItem, setAddingItem] = useState(null);
    const [newItem, setNewItem] = useState({ label: "", weight: "", autoGrade: false });
    const [newItemLabels, setNewItemLabels] = useState({ 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" });
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, rubric: null });

    const inputClass = "w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm";
    const labelClass = "text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1";

    useEffect(() => {
        if (!user?.id) return;
        fetch(`${API_BASE}/rubric/user/${user.id}`)
            .then((res) => res.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                setRubrics(list);
                const details = {};
                list.forEach((r) => { if (r.criteria) details[r.id] = r; });
                setRubricDetails(details);
                setLoading(false);
            })
            .catch((err) => { console.error(err); setLoading(false); });
    }, [user?.id]);

    const handleOpenRubric = async (rubricId) => {
        setOpenRubricId(rubricId);
        setEditingSettings(false);
        setAddingCriteria(false);
        setAddingItem(null);
        if (!rubricDetails[rubricId]) {
            try {
                const res = await fetch(`${API_BASE}/rubric/${rubricId}`);
                const data = await res.json();
                setRubricDetails((prev) => ({ ...prev, [rubricId]: data }));
            } catch (err) { console.error(err); }
        }
    };

    const handleCloseRubric = () => {
        setOpenRubricId(null);
        setEditingSettings(false);
        setAddingCriteria(false);
        setAddingItem(null);
    };

    const handleCreateRubric = async () => {
        if (!newRubric.name) return;
        try {
            const res = await fetch(`${API_BASE}/rubric/user/${user.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newRubric) });
            if (!res.ok) throw new Error("Failed to create rubric");
            const created = await res.json();
            setRubrics((prev) => [...prev, created]);
            setNewRubric({ name: "", description: "", visible: false, weighted: false });
            setNewRubricOpen(false);
        } catch (err) { console.error(err); }
    };

    const handleCopyRubric = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/rubric/${id}/copy`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to copy rubric");
            const copied = await res.json();
            setRubrics((prev) => [...prev, copied]);
        } catch (err) { console.error(err); }
    };

    const handleDeleteRubric = async () => {
        try {
            const res = await fetch(`${API_BASE}/rubric/${deleteConfirm.rubric.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete rubric");
            setRubrics((prev) => prev.filter((r) => r.id !== deleteConfirm.rubric.id));
            if (openRubricId === deleteConfirm.rubric.id) handleCloseRubric();
            setDeleteConfirm({ isOpen: false, rubric: null });
        } catch (err) { console.error(err); }
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch(`${API_BASE}/rubric/${openRubricId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
            if (!res.ok) throw new Error("Failed to update rubric");
            const updated = await res.json();
            setRubrics((prev) => prev.map((r) => r.id === openRubricId ? updated : r));
            setEditingSettings(false);
        } catch (err) { console.error(err); }
    };

    const handleAddCriteria = async () => {
        if (!newCriteriaTitle) return;
        const currentCriteria = rubricDetails[openRubricId]?.criteria || [];
        try {
            const res = await fetch(`${API_BASE}/rubric/${openRubricId}/criteria`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newCriteriaTitle, displayOrder: currentCriteria.length })
            });
            if (!res.ok) throw new Error("Failed to add criteria");
            const created = await res.json();
            setRubricDetails((prev) => ({ ...prev, [openRubricId]: { ...prev[openRubricId], criteria: [...(prev[openRubricId]?.criteria || []), { ...created, items: [] }] } }));
            setNewCriteriaTitle("");
            setAddingCriteria(false);
        } catch (err) { console.error(err); }
    };

    const handleDeleteCriteria = async (criteriaId) => {
        try {
            const res = await fetch(`${API_BASE}/rubric/criteria/${criteriaId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete criteria");
            setRubricDetails((prev) => ({ ...prev, [openRubricId]: { ...prev[openRubricId], criteria: prev[openRubricId].criteria.filter((c) => c.id !== criteriaId) } }));
            const r = await fetch(`${API_BASE}/rubric/${openRubricId}`);
            const updated = await r.json();
            setRubrics((prev) => prev.map((rb) => rb.id === openRubricId ? { ...rb, totalPoints: updated.totalPoints } : rb));
        } catch (err) { console.error(err); }
    };

    const handleAddItem = async (criteriaId) => {
        if (!newItem.label || newItem.weight === "") return;
        const isWeighted = rubricDetails[openRubricId]?.weighted;
        const criteria = rubricDetails[openRubricId]?.criteria?.find((c) => c.id === criteriaId);
        const currentItems = criteria?.items || [];
        try {
            const res = await fetch(`${API_BASE}/rubric/criteria/${criteriaId}/item`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ label: newItem.label, weight: parseFloat(newItem.weight), autoGrade: newItem.autoGrade, displayOrder: currentItems.length })
            });
            if (!res.ok) throw new Error("Failed to add item");
            const created = await res.json();

            if (isWeighted) {
                const hasLabels = Object.values(newItemLabels).some(v => v.trim() !== "");
                if (hasLabels) {
                    const labelsToSave = {};
                    Object.entries(newItemLabels).forEach(([k, v]) => { if (v.trim()) labelsToSave[k] = v.trim(); });
                    await fetch(`${API_BASE}/rubric/item/${created.id}/labels`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(labelsToSave) });
                    const refetch = await fetch(`${API_BASE}/rubric/${openRubricId}`);
                    const updated = await refetch.json();
                    setRubricDetails((prev) => ({ ...prev, [openRubricId]: updated }));
                } else {
                    setRubricDetails((prev) => ({ ...prev, [openRubricId]: { ...prev[openRubricId], criteria: prev[openRubricId].criteria.map((c) => c.id === criteriaId ? { ...c, items: [...(c.items || []), created] } : c) } }));
                }
            } else {
                setRubricDetails((prev) => ({ ...prev, [openRubricId]: { ...prev[openRubricId], criteria: prev[openRubricId].criteria.map((c) => c.id === criteriaId ? { ...c, items: [...(c.items || []), created] } : c) } }));
            }

            const r = await fetch(`${API_BASE}/rubric/${openRubricId}`);
            const updated = await r.json();
            setRubrics((prev) => prev.map((rb) => rb.id === openRubricId ? { ...rb, totalPoints: updated.totalPoints } : rb));
            setNewItem({ label: "", weight: "", autoGrade: false });
            setNewItemLabels({ 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" });
            setAddingItem(null);
        } catch (err) { console.error(err); }
    };

    const handleDeleteItem = async (criteriaId, itemId) => {
        try {
            const res = await fetch(`${API_BASE}/rubric/item/${itemId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete item");
            setRubricDetails((prev) => ({ ...prev, [openRubricId]: { ...prev[openRubricId], criteria: prev[openRubricId].criteria.map((c) => c.id === criteriaId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c) } }));
            const r = await fetch(`${API_BASE}/rubric/${openRubricId}`);
            const updated = await r.json();
            setRubrics((prev) => prev.map((rb) => rb.id === openRubricId ? { ...rb, totalPoints: updated.totalPoints } : rb));
        } catch (err) { console.error(err); }
    };

    const getTotalWeight = (rubricId) => {
        const criteria = rubricDetails[rubricId]?.criteria || [];
        return criteria.flatMap(c => c.items || []).reduce((sum, i) => sum + (i.weight || 0), 0);
    };

    const getDisplayTotalPoints = (rubric) => {
        if (rubricDetails[rubric.id]) {
            return rubricDetails[rubric.id].criteria?.flatMap(c => c.items || []).reduce((sum, i) => sum + (i.maxPoints || 0), 0) ?? 0;
        }
        return rubric.totalPoints;
    };

    const openRubric = rubrics.find(r => r.id === openRubricId);
    const openDetails = openRubricId ? rubricDetails[openRubricId] : null;

    if (loading) return <div className="p-8"><p className="text-zinc-400">Loading...</p></div>;

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Rubrics</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Create reusable grading rubrics to attach to any assignment.</p>
                    </div>
                    <button type="button" onClick={() => setNewRubricOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#862633" }}>
                        <Plus className="w-4 h-4" /> New Rubric
                    </button>
                </div>

                {rubrics.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-12 text-center shadow-sm">
                        <ClipboardList className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-900 dark:text-white font-medium">No rubrics yet</p>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Create a rubric to enable structured grading on assignments.</p>
                        <button type="button" onClick={() => setNewRubricOpen(true)} className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#862633" }}>
                            <Plus className="w-4 h-4" /> New Rubric
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rubrics.map((rubric) => (
                            <div key={rubric.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between p-5 shadow-sm">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#C9A84C22" }}>
                                        <ClipboardList className="w-5 h-5" style={{ color: "#C9A84C" }} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-zinc-900 dark:text-white font-semibold">{rubric.name}</p>
                                            {rubric.weighted && <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: "#C9A84C22", color: "#C9A84C" }}>weighted</span>}
                                            {rubric.visible ? <Eye className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} /> : <EyeOff className="w-3.5 h-3.5 text-zinc-500" />}
                                        </div>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                                            {rubric.weighted ? "Score 0–5 per item • weights sum to 100%" : `${getDisplayTotalPoints(rubric)} pts`}
                                            {rubric.description && ` • ${rubric.description}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4 shrink-0">
                                    <button type="button" onClick={() => handleOpenRubric(rubric.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button type="button" onClick={() => handleCopyRubric(rubric.id)} className="p-2 text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Duplicate">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={() => setDeleteConfirm({ isOpen: true, rubric })} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Rubric Editor Modal */}
            {openRubricId && openRubric && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#C9A84C22" }}>
                                    <ClipboardList className="w-4 h-4" style={{ color: "#C9A84C" }} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{openRubric.name}</h2>
                                        {openRubric.weighted && <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: "#C9A84C22", color: "#C9A84C" }}>weighted</span>}
                                        {openRubric.visible ? <Eye className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} /> : <EyeOff className="w-3.5 h-3.5 text-zinc-500" />}
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                                        {openRubric.weighted ? "Score 0–5 per item" : `${getDisplayTotalPoints(openRubric)} pts total`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-4 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingSettings((v) => !v);
                                        setEditForm({ name: openRubric.name, description: openRubric.description || "", visible: openRubric.visible });
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${editingSettings ? "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-700" : "text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
                                    title="Edit settings"
                                >
                                    <Settings2 className="w-4 h-4" />
                                </button>
                                <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
                                <button type="button" onClick={handleCloseRubric} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        {editingSettings && (
                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 shrink-0 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Name</label>
                                        <input type="text" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Description (optional)</label>
                                        <input type="text" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className={inputClass} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editForm.visible} onChange={(e) => setEditForm((p) => ({ ...p, visible: e.target.checked }))} className="w-4 h-4" />
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Visible to students</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setEditingSettings(false)} className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
                                        <button type="button" onClick={handleSaveSettings} className="px-3 py-1.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors" style={{ background: "#862633" }}>Save</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Weight indicator */}
                        {openDetails?.weighted && (
                            <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-700/60 shrink-0 flex items-center justify-between">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total item weight</p>
                                <p className="text-sm font-semibold" style={{ color: getTotalWeight(openRubricId) === 100 ? "#4ade80" : "#f87171" }}>
                                    {getTotalWeight(openRubricId).toFixed(1)}% / 100%
                                </p>
                            </div>
                        )}

                        {/* Body */}
                        <div className="flex-1 overflow-auto p-6 space-y-4">
                            {(openDetails?.criteria || []).length === 0 && !addingCriteria ? (
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm">No criteria yet. Add a section below to get started.</p>
                            ) : (
                                (openDetails?.criteria || []).map((criteria) => (
                                    <div key={criteria.id} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                        {/* Section header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700/60" style={{ background: "#86263314" }}>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-1 h-4 rounded-full shrink-0" style={{ background: "#862633" }} />
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{criteria.title}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {!openDetails?.weighted && (
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{(criteria.items || []).reduce((sum, i) => sum + i.maxPoints, 0)} pts</span>
                                                )}
                                                <button type="button" onClick={() => handleDeleteCriteria(criteria.id)} className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="bg-zinc-50 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {(criteria.items || []).map((item) => (
                                                <div key={item.id} className="flex items-start gap-3 px-4 py-2.5">
                                                    <span className="text-zinc-600 text-xs mt-0.5 shrink-0 select-none">›</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {item.autoGrade && <span className="shrink-0 text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "#C9A84C1a", color: "#c0a080" }}>auto</span>}
                                                                <span className="text-zinc-700 dark:text-zinc-300 text-sm truncate">{item.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 shrink-0 ml-3">
                                                                {openDetails?.weighted
                                                                    ? <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.weight}%</span>
                                                                    : <span className="text-xs text-zinc-400 dark:text-zinc-500">{item.maxPoints} pts</span>
                                                                }
                                                                <button type="button" onClick={() => handleDeleteItem(criteria.id, item.id)} className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {item.scoreLabels && item.scoreLabels.length > 0 && (
                                                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                                {item.scoreLabels.map((sl) => (
                                                                    <span key={sl.score} className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">{sl.score}: {sl.label}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {addingItem === criteria.id ? (
                                                <div className="p-4 space-y-3 bg-zinc-50 dark:bg-zinc-900/80">
                                                    <input type="text" value={newItem.label} onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))} placeholder="Item label (e.g. Correct Output)" className={inputClass} />
                                                    <div className="flex gap-2 items-center">
                                                        {openDetails?.weighted ? (
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <input type="number" value={newItem.weight} onChange={(e) => setNewItem((p) => ({ ...p, weight: e.target.value }))} placeholder="Weight %" min="0" max="100" step="1" className="w-24 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm" />
                                                                <span className="text-zinc-400 text-xs">%</span>
                                                                {newItem.weight !== "" && (() => {
                                                                    const projected = getTotalWeight(openRubricId) + parseFloat(newItem.weight || 0);
                                                                    return projected > 100
                                                                        ? <span className="text-xs" style={{ color: "#f87171" }}>exceeds 100% by {(projected - 100).toFixed(1)}%</span>
                                                                        : <span className="text-xs text-zinc-500">→ {projected.toFixed(1)}% total</span>;
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <input type="number" value={newItem.weight} onChange={(e) => setNewItem((p) => ({ ...p, weight: e.target.value }))} placeholder="Points" min="0" step="0.25" className="w-24 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-600/40 text-sm" />
                                                        )}
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input type="checkbox" checked={newItem.autoGrade} onChange={(e) => setNewItem((p) => ({ ...p, autoGrade: e.target.checked }))} className="w-4 h-4" />
                                                            <span className="text-xs text-zinc-600 dark:text-zinc-300">Auto-grade</span>
                                                        </label>
                                                    </div>

                                                    {openDetails?.weighted && (
                                                        <div className="space-y-2 pt-1 border-t border-zinc-200 dark:border-zinc-700/50">
                                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Score labels <span className="text-zinc-400 dark:text-zinc-600">(optional)</span></p>
                                                            <div className="grid grid-cols-2 gap-1.5">
                                                                {[5, 4, 3, 2, 1, 0].map((score) => (
                                                                    <div key={score} className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 w-4 shrink-0">{score}</span>
                                                                        <input type="text" value={newItemLabels[score]} onChange={(e) => setNewItemLabels((p) => ({ ...p, [score]: e.target.value }))} placeholder={score === 5 ? "e.g. Flawless" : score === 0 ? "e.g. Not attempted" : ""} className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded py-1 px-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-600/40 text-xs" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 justify-end">
                                                        <button type="button" onClick={() => { setAddingItem(null); setNewItem({ label: "", weight: "", autoGrade: false }); setNewItemLabels({ 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" }); }} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                                                        <button type="button" onClick={() => handleAddItem(criteria.id)} disabled={!newItem.label || newItem.weight === "" || (openDetails?.weighted && getTotalWeight(openRubricId) + parseFloat(newItem.weight || 0) > 100)} className="p-1.5 text-white rounded-lg transition-colors disabled:opacity-50" style={{ background: "#862633" }}><Check className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => { setAddingItem(criteria.id); setNewItem({ label: "", weight: "", autoGrade: false }); setNewItemLabels({ 0: "", 1: "", 2: "", 3: "", 4: "", 5: "" }); }} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors w-full hover:opacity-80 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
                                                    <Plus className="w-3.5 h-3.5" /> Add Item
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            {addingCriteria ? (
                                <div className="flex gap-2">
                                    <input type="text" value={newCriteriaTitle} onChange={(e) => setNewCriteriaTitle(e.target.value)} placeholder="Section title (e.g. Correctness)" className={inputClass} autoFocus />
                                    <button type="button" onClick={() => { setAddingCriteria(false); setNewCriteriaTitle(""); }} className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors shrink-0"><X className="w-4 h-4" /></button>
                                    <button type="button" onClick={handleAddCriteria} disabled={!newCriteriaTitle} className="p-2 text-white rounded-lg transition-colors disabled:opacity-50 shrink-0" style={{ background: "#862633" }}><Check className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => { setAddingCriteria(true); setNewCriteriaTitle(""); }} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#C9A84C" }}>
                                    <Plus className="w-4 h-4" /> Add Section
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* New Rubric Dialog */}
            <Dialog isOpen={newRubricOpen} onClose={() => setNewRubricOpen(false)} title="New Rubric">
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Name</label>
                        <input type="text" value={newRubric.name} onChange={(e) => setNewRubric((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Programming Assignment Rubric" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Description (optional)</label>
                        <textarea rows={2} value={newRubric.description} onChange={(e) => setNewRubric((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description" className={inputClass} />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newRubric.visible} onChange={(e) => setNewRubric((p) => ({ ...p, visible: e.target.checked }))} className="w-4 h-4" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Visible to students</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={newRubric.weighted} onChange={(e) => setNewRubric((p) => ({ ...p, weighted: e.target.checked }))} className="w-4 h-4" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Weighted rubric <span className="text-zinc-400 dark:text-zinc-500">(0–5 score per item)</span></span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setNewRubricOpen(false)} className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
                        <button type="button" onClick={handleCreateRubric} disabled={!newRubric.name} className="flex-1 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-colors disabled:opacity-50" style={{ background: "#862633" }}>Create Rubric</button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, rubric: null })} title="Delete Rubric" size="sm">
                <div className="space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-300">Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-white">{deleteConfirm.rubric?.name}</span>? This cannot be undone.</p>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setDeleteConfirm({ isOpen: false, rubric: null })} className="flex-1 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors">Cancel</button>
                        <button type="button" onClick={handleDeleteRubric} className="flex-1 py-3 text-sm font-medium text-white bg-red-800 rounded-xl hover:bg-red-700 transition-colors">Delete</button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
