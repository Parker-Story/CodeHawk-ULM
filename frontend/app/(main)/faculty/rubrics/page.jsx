"use client";

import { useState, useEffect } from "react";
import { Plus, ClipboardList, Trash2, ChevronDown, ChevronUp, Copy, Eye, EyeOff, Pencil, Check, X } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import { useAuth } from "@/contexts/AuthContext";
import Dialog from "@/components/Dialog";

export default function RubricsPage() {
    const { user } = useAuth();
    const [rubrics, setRubrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRubricOpen, setNewRubricOpen] = useState(false);
    const [newRubric, setNewRubric] = useState({ name: "", description: "", visible: false });
    const [expandedRubric, setExpandedRubric] = useState(null);
    const [rubricDetails, setRubricDetails] = useState({});
    const [addingCriteria, setAddingCriteria] = useState(null);
    const [newCriteriaTitle, setNewCriteriaTitle] = useState("");
    const [addingItem, setAddingItem] = useState(null);
    const [newItem, setNewItem] = useState({ label: "", maxPoints: "", autoGrade: false });
    const [editingRubric, setEditingRubric] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", description: "", visible: false });
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, rubric: null });

    const inputClass = "w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm";
    const labelClass = "text-xs font-medium text-slate-400 block mb-1";

    useEffect(() => {
        if (!user?.id) return;
        fetch(`${API_BASE}/rubric/user/${user.id}`)
            .then((res) => res.json())
            .then((data) => {
                setRubrics(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => { console.error(err); setLoading(false); });
    }, [user?.id]);

    const handleCreateRubric = async () => {
        if (!newRubric.name) return;
        try {
            const res = await fetch(`${API_BASE}/rubric/user/${user.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRubric),
            });
            if (!res.ok) throw new Error("Failed to create rubric");
            const created = await res.json();
            setRubrics((prev) => [...prev, created]);
            setNewRubric({ name: "", description: "", visible: false });
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
            if (expandedRubric === deleteConfirm.rubric.id) setExpandedRubric(null);
            setDeleteConfirm({ isOpen: false, rubric: null });
        } catch (err) { console.error(err); }
    };

    const handleSaveEdit = async () => {
        try {
            const res = await fetch(`${API_BASE}/rubric/${editingRubric}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (!res.ok) throw new Error("Failed to update rubric");
            const updated = await res.json();
            setRubrics((prev) => prev.map((r) => r.id === editingRubric ? updated : r));
            setEditingRubric(null);
        } catch (err) { console.error(err); }
    };

    const handleExpandRubric = async (rubricId) => {
        if (expandedRubric === rubricId) { setExpandedRubric(null); return; }
        setExpandedRubric(rubricId);
        if (!rubricDetails[rubricId]) {
            try {
                const res = await fetch(`${API_BASE}/rubric/${rubricId}`);
                const data = await res.json();
                setRubricDetails((prev) => ({ ...prev, [rubricId]: data }));
            } catch (err) { console.error(err); }
        }
    };

    const handleAddCriteria = async (rubricId) => {
        if (!newCriteriaTitle) return;
        const currentCriteria = rubricDetails[rubricId]?.criteria || [];
        try {
            const res = await fetch(`${API_BASE}/rubric/${rubricId}/criteria`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newCriteriaTitle, displayOrder: currentCriteria.length }),
            });
            if (!res.ok) throw new Error("Failed to add criteria");
            const created = await res.json();
            setRubricDetails((prev) => ({
                ...prev,
                [rubricId]: {
                    ...prev[rubricId],
                    criteria: [...(prev[rubricId]?.criteria || []), { ...created, items: [] }],
                },
            }));
            setNewCriteriaTitle("");
            setAddingCriteria(null);
        } catch (err) { console.error(err); }
    };

    const handleDeleteCriteria = async (rubricId, criteriaId) => {
        try {
            const res = await fetch(`${API_BASE}/rubric/criteria/${criteriaId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete criteria");
            setRubricDetails((prev) => ({
                ...prev,
                [rubricId]: {
                    ...prev[rubricId],
                    criteria: prev[rubricId].criteria.filter((c) => c.id !== criteriaId),
                },
            }));
            // Refresh rubric to get updated totalPoints
            const r = await fetch(`${API_BASE}/rubric/${rubricId}`);
            const updated = await r.json();
            setRubrics((prev) => prev.map((rb) => rb.id === rubricId ? { ...rb, totalPoints: updated.totalPoints } : rb));
        } catch (err) { console.error(err); }
    };

    const handleAddItem = async (rubricId, criteriaId) => {
        if (!newItem.label || newItem.maxPoints === "") return;
        const criteria = rubricDetails[rubricId]?.criteria?.find((c) => c.id === criteriaId);
        const currentItems = criteria?.items || [];
        try {
            const res = await fetch(`${API_BASE}/rubric/criteria/${criteriaId}/item`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: newItem.label,
                    maxPoints: parseFloat(newItem.maxPoints),
                    autoGrade: newItem.autoGrade,
                    displayOrder: currentItems.length,
                }),
            });
            if (!res.ok) throw new Error("Failed to add item");
            const created = await res.json();
            setRubricDetails((prev) => ({
                ...prev,
                [rubricId]: {
                    ...prev[rubricId],
                    criteria: prev[rubricId].criteria.map((c) =>
                        c.id === criteriaId ? { ...c, items: [...(c.items || []), created] } : c
                    ),
                },
            }));
            // Refresh rubric totalPoints
            const r = await fetch(`${API_BASE}/rubric/${rubricId}`);
            const updated = await r.json();
            setRubrics((prev) => prev.map((rb) => rb.id === rubricId ? { ...rb, totalPoints: updated.totalPoints } : rb));
            setNewItem({ label: "", maxPoints: "", autoGrade: false });
            setAddingItem(null);
        } catch (err) { console.error(err); }
    };

    const handleDeleteItem = async (rubricId, criteriaId, itemId) => {
        try {
            const res = await fetch(`${API_BASE}/rubric/item/${itemId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete item");
            setRubricDetails((prev) => ({
                ...prev,
                [rubricId]: {
                    ...prev[rubricId],
                    criteria: prev[rubricId].criteria.map((c) =>
                        c.id === criteriaId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
                    ),
                },
            }));
            const r = await fetch(`${API_BASE}/rubric/${rubricId}`);
            const updated = await r.json();
            setRubrics((prev) => prev.map((rb) => rb.id === rubricId ? { ...rb, totalPoints: updated.totalPoints } : rb));
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="p-8"><p className="text-slate-400">Loading...</p></div>;

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Rubrics</h1>
                        <p className="text-slate-400 text-sm mt-1">Create reusable grading rubrics to attach to any assignment.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNewRubricOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Rubric
                    </button>
                </div>

                {rubrics.length === 0 ? (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-white font-medium">No rubrics yet</p>
                        <p className="text-slate-400 text-sm mt-1">Create a rubric to enable structured grading on assignments.</p>
                        <button
                            type="button"
                            onClick={() => setNewRubricOpen(true)}
                            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Rubric
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rubrics.map((rubric) => (
                            <div key={rubric.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">

                                {/* Rubric Header */}
                                {editingRubric === rubric.id ? (
                                    <div className="p-5 space-y-3">
                                        <div>
                                            <label className={labelClass}>Name</label>
                                            <input type="text" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Description</label>
                                            <textarea rows={2} value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} className={inputClass} />
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={editForm.visible} onChange={(e) => setEditForm((p) => ({ ...p, visible: e.target.checked }))} className="w-4 h-4 accent-teal-500" />
                                            <span className="text-sm text-slate-300">Visible to students</span>
                                        </label>
                                        <div className="flex gap-2 pt-1">
                                            <button type="button" onClick={() => setEditingRubric(null)} className="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
                                            <button type="button" onClick={handleSaveEdit} className="flex-1 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-5">
                                        <button
                                            type="button"
                                            onClick={() => handleExpandRubric(rubric.id)}
                                            className="flex items-center gap-3 min-w-0 flex-1 text-left"
                                        >
                                            <div className="w-10 h-10 bg-teal-600/20 rounded-xl flex items-center justify-center shrink-0">
                                                <ClipboardList className="w-5 h-5 text-teal-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-semibold">{rubric.name}</p>
                                                    {rubric.visible
                                                        ? <Eye className="w-3.5 h-3.5 text-teal-400" />
                                                        : <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                                    }
                                                </div>
                                                <p className="text-slate-400 text-xs mt-0.5">
                                                    {rubric.totalPoints} point{rubric.totalPoints !== 1 ? "s" : ""}
                                                    {rubric.description && ` • ${rubric.description}`}
                                                </p>
                                            </div>
                                            {expandedRubric === rubric.id
                                                ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                                                : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                                            }
                                        </button>
                                        <div className="flex items-center gap-1 ml-4 shrink-0">
                                            <button type="button" onClick={() => { setEditingRubric(rubric.id); setEditForm({ name: rubric.name, description: rubric.description || "", visible: rubric.visible }); }} className="p-2 text-slate-500 hover:text-teal-400 hover:bg-teal-400/10 rounded-lg transition-colors">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => handleCopyRubric(rubric.id)} className="p-2 text-slate-500 hover:text-teal-400 hover:bg-teal-400/10 rounded-lg transition-colors">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button type="button" onClick={() => setDeleteConfirm({ isOpen: true, rubric })} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Expanded Criteria */}
                                {expandedRubric === rubric.id && (
                                    <div className="border-t border-slate-700 p-5 space-y-4">
                                        {(rubricDetails[rubric.id]?.criteria || []).length === 0 && addingCriteria !== rubric.id ? (
                                            <p className="text-slate-400 text-sm">No criteria yet. Add a section to get started.</p>
                                        ) : (
                                            (rubricDetails[rubric.id]?.criteria || []).map((criteria) => (
                                                <div key={criteria.id} className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
                                                    {/* Criteria Header */}
                                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                                                        <p className="text-white font-medium text-sm">{criteria.title}</p>
                                                        <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-xs">
                                {(criteria.items || []).reduce((sum, i) => sum + i.maxPoints, 0)} pts
                              </span>
                                                            <button type="button" onClick={() => handleDeleteCriteria(rubric.id, criteria.id)} className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Items */}
                                                    <div className="divide-y divide-slate-700/30">
                                                        {(criteria.items || []).map((item) => (
                                                            <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    {item.autoGrade && (
                                                                        <span className="shrink-0 text-xs px-1.5 py-0.5 bg-teal-600/20 text-teal-400 rounded font-medium">auto</span>
                                                                    )}
                                                                    <span className="text-slate-300 text-sm truncate">{item.label}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 shrink-0 ml-3">
                                                                    <span className="text-slate-400 text-xs">{item.maxPoints} pts</span>
                                                                    <button type="button" onClick={() => handleDeleteItem(rubric.id, criteria.id, item.id)} className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Add item form */}
                                                        {addingItem === criteria.id ? (
                                                            <div className="p-3 space-y-2 bg-slate-800/30">
                                                                <input
                                                                    type="text"
                                                                    value={newItem.label}
                                                                    onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))}
                                                                    placeholder="Item label (e.g. Gets word from user)"
                                                                    className={inputClass}
                                                                />
                                                                <div className="flex gap-2 items-center">
                                                                    <input
                                                                        type="number"
                                                                        value={newItem.maxPoints}
                                                                        onChange={(e) => setNewItem((p) => ({ ...p, maxPoints: e.target.value }))}
                                                                        placeholder="Points"
                                                                        min="0"
                                                                        step="0.25"
                                                                        className="w-24 bg-slate-800/50 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                                                    />
                                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={newItem.autoGrade}
                                                                            onChange={(e) => setNewItem((p) => ({ ...p, autoGrade: e.target.checked }))}
                                                                            className="w-4 h-4 accent-teal-500"
                                                                        />
                                                                        <span className="text-xs text-slate-300">Auto-grade</span>
                                                                    </label>
                                                                    <div className="flex gap-1 ml-auto">
                                                                        <button type="button" onClick={() => { setAddingItem(null); setNewItem({ label: "", maxPoints: "", autoGrade: false }); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                        <button type="button" onClick={() => handleAddItem(rubric.id, criteria.id)} disabled={!newItem.label || newItem.maxPoints === ""} className="p-1.5 text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors disabled:opacity-50">
                                                                            <Check className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => { setAddingItem(criteria.id); setNewItem({ label: "", maxPoints: "", autoGrade: false }); }}
                                                                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors w-full"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                                Add Item
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        {/* Add criteria form */}
                                        {addingCriteria === rubric.id ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newCriteriaTitle}
                                                    onChange={(e) => setNewCriteriaTitle(e.target.value)}
                                                    placeholder="Section title (e.g. Main function)"
                                                    className={inputClass}
                                                />
                                                <button type="button" onClick={() => { setAddingCriteria(null); setNewCriteriaTitle(""); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors shrink-0">
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button type="button" onClick={() => handleAddCriteria(rubric.id)} disabled={!newCriteriaTitle} className="p-2 text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors disabled:opacity-50 shrink-0">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => { setAddingCriteria(rubric.id); setNewCriteriaTitle(""); }}
                                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Section
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                        <input type="checkbox" checked={newRubric.visible} onChange={(e) => setNewRubric((p) => ({ ...p, visible: e.target.checked }))} className="w-4 h-4 accent-teal-500" />
                        <span className="text-sm text-slate-300">Visible to students</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setNewRubricOpen(false)} className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">Cancel</button>
                        <button type="button" onClick={handleCreateRubric} disabled={!newRubric.name} className="flex-1 py-3 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors disabled:opacity-50">Create Rubric</button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ isOpen: false, rubric: null })} title="Delete Rubric" size="sm">
                <div className="space-y-4">
                    <p className="text-slate-300">
                        Are you sure you want to delete <span className="font-semibold text-white">{deleteConfirm.rubric?.name}</span>? This cannot be undone. Assignments currently using this rubric will lose their grading data.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setDeleteConfirm({ isOpen: false, rubric: null })} className="flex-1 py-3 text-sm font-medium text-slate-300 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">Cancel</button>
                        <button type="button" onClick={handleDeleteRubric} className="flex-1 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors">Delete</button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}