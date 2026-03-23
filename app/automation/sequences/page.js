"use client";
import { useState, useEffect } from 'react';
import {
    Zap,
    Plus,
    Trash2,
    Clock,
    Mail,
    MessageCircle,
    Save,
    ArrowLeft,
    Loader2,
    ChevronRight,
    Play
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function SequencesPage() {
    const [sequences, setSequences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editingSequence, setEditingSequence] = useState({
        name: '',
        description: '',
        steps: []
    });

    const businessId = typeof window !== 'undefined' ? localStorage.getItem('businessId') : null;
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userid') : null;

    useEffect(() => {
        if (businessId && userId) {
            fetchSequences();
        }
    }, [businessId, userId]);

    async function fetchSequences() {
        try {
            const resp = await fetch(`/api/automation/sequences?businessId=${businessId}&userId=${userId}`);
            const data = await resp.json();
            if (data.success) setSequences(data.data);
        } catch (e) {
            toast.error("Failed to load sequences");
        } finally {
            setLoading(false);
        }
    }

    const addStep = () => {
        setEditingSequence({
            ...editingSequence,
            steps: [...editingSequence.steps, {
                delayDays: editingSequence.steps.length === 0 ? 0 : 1,
                channel: 'whatsapp',
                emailSubject: '',
                messageTemplate: ''
            }]
        });
    };

    const removeStep = (index) => {
        const newSteps = [...editingSequence.steps];
        newSteps.splice(index, 1);
        setEditingSequence({ ...editingSequence, steps: newSteps });
    };

    const updateStep = (index, field, value) => {
        const newSteps = [...editingSequence.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setEditingSequence({ ...editingSequence, steps: newSteps });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (editingSequence.steps.length === 0) {
            toast.error("Add at least one step to the sequence");
            return;
        }

        setIsSaving(true);
        try {
            const method = editingSequence._id ? 'PUT' : 'POST';
            const url = editingSequence._id
                ? `/api/automation/sequences/${editingSequence._id}?userId=${userId}`
                : `/api/automation/sequences?userId=${userId}`;

            const resp = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editingSequence, businessId })
            });

            const data = await resp.json();
            if (data.success) {
                toast.success(editingSequence._id ? "Sequence updated" : "Sequence created");
                setIsModalOpen(false);
                setEditingSequence({ name: '', description: '', steps: [] });
                fetchSequences();
            } else {
                throw new Error(data.error);
            }
        } catch (e) {
            toast.error(e.message || "Failed to save sequence");
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = (seq) => {
        setEditingSequence(seq);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Zap className="w-8 h-8 text-indigo-600" />
                        Automation Sequences
                    </h1>
                    <p className="text-slate-500 mt-2">Design multi-step follow-up workflows for your event leads.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingSequence({ name: '', description: '', steps: [] });
                        setIsModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Build New Sequence
                </button>
            </div>

            {/* Empty State */}
            {sequences.length === 0 ? (
                <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-16 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Play className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No Sequences Found</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Sequences allow you to send a series of messages over several days to keep your lead's interest alive.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Create your first sequence →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sequences.map(seq => (
                        <div key={seq._id} className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors">
                                    <Zap className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                                </div>
                                <button
                                    onClick={() => openEdit(seq)}
                                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    Edit Sequence
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{seq.name}</h3>
                            <p className="text-sm text-slate-500 mt-1 mb-6">{seq.description || 'No description provided'}</p>

                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-50 p-3 rounded-xl">
                                <span className="flex items-center gap-1.5 text-indigo-600">
                                    {seq.steps.length} Steps
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {seq.steps.reduce((acc, s) => acc + s.delayDays, 0)} Days Total
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Sequence Builder</h3>
                                <p className="text-sm text-slate-500">Define the multi-day roadmap for your follow-ups.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* General Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Sequence Name*</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingSequence.name}
                                        onChange={(e) => setEditingSequence({ ...editingSequence, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                                        placeholder="e.g. 3-Day Warm Event Welcome"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
                                    <input
                                        type="text"
                                        value={editingSequence.description}
                                        onChange={(e) => setEditingSequence({ ...editingSequence, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="Briefly describe the goal"
                                    />
                                </div>
                            </div>

                            {/* Steps Builder */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-bold text-slate-900">Steps & Timeline</h4>
                                    <button
                                        type="button"
                                        onClick={addStep}
                                        className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add Step
                                    </button>
                                </div>

                                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                                    {editingSequence.steps.map((step, idx) => (
                                        <div key={idx} className="relative pl-12">
                                            {/* Node */}
                                            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400 z-10 transition-colors group-hover:border-indigo-600">
                                                {idx + 1}
                                            </div>

                                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Delay (Days)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={step.delayDays}
                                                            onChange={(e) => updateStep(idx, 'delayDays', parseInt(e.target.value) || 0)}
                                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Channel</label>
                                                        <div className="flex gap-2">
                                                            {['whatsapp', 'email', 'both'].map(ch => (
                                                                <button
                                                                    key={ch}
                                                                    type="button"
                                                                    onClick={() => updateStep(idx, 'channel', ch)}
                                                                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg border-2 transition-all uppercase ${step.channel === ch
                                                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                                                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                                        }`}
                                                                >
                                                                    {ch}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {(step.channel === 'email' || step.channel === 'both') && (
                                                        <input
                                                            type="text"
                                                            placeholder="Email Subject"
                                                            value={step.emailSubject}
                                                            onChange={(e) => updateStep(idx, 'emailSubject', e.target.value)}
                                                            className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                                        />
                                                    )}
                                                    <textarea
                                                        placeholder="Message Template (WhatsApp or Email Body)..."
                                                        rows={3}
                                                        value={step.messageTemplate}
                                                        onChange={(e) => updateStep(idx, 'messageTemplate', e.target.value)}
                                                        className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] text-slate-400 font-medium">Use {'{{name}}'} for lead's name.</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStep(idx)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {editingSequence.steps.length === 0 && (
                                        <div className="py-6 text-center text-slate-400 italic text-sm">
                                            No steps added yet. Click "Add Step" above.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 text-sm font-bold text-slate-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Sequence</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function X({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
}
