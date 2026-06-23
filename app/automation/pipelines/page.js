'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';
import LeadsSkeleton from '../components/leads/LeadsSkeleton';
import { GripVertical, Save } from 'lucide-react';

function PipelinesContent() {
  const [pipelines, setPipelines] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPipelines = useCallback(async () => {
    setLoading(true);
    const res = await authFetch('/api/automation/pipelines');
    const data = await res.json();
    if (data.success) {
      setPipelines(data.data || []);
      const def = data.data?.find((p) => p.isDefault) || data.data?.[0];
      if (def && !selectedId) {
        setSelectedId(def._id);
        setStages(def.stages || []);
      }
    }
    setLoading(false);
  }, [selectedId]);

  useEffect(() => { fetchPipelines(); }, [fetchPipelines]);

  const active = pipelines.find((p) => p._id === selectedId);

  useEffect(() => {
    if (active) setStages(active.stages || []);
  }, [active?._id]);

  const saveStages = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await authFetch(`/api/automation/pipelines/${selectedId}`, {
        method: 'PUT',
        body: JSON.stringify({ stages }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Pipeline saved');
        fetchPipelines();
      } else toast.error(data.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LeadsSkeleton />;

  return (
    <div className="min-h-full bg-[#FAFDFA] dark:bg-slate-950 px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Deal Pipeline</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Customize stages for your sales process. Changes apply to new deal moves immediately.</p>

      {pipelines.length > 1 && (
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="mb-4 px-3 py-2 text-sm border rounded-lg dark:bg-slate-900 dark:border-slate-700"
        >
          {pipelines.map((p) => <option key={p._id} value={p._id}>{p.name}{p.isDefault ? ' (Default)' : ''}</option>)}
        </select>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <span className="text-sm font-semibold">{active?.name || 'Sales Pipeline'}</span>
          <button
            onClick={saveStages}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {stages.map((s, i) => (
            <div key={s.key || i} className="flex items-center gap-3 px-4 py-3">
              <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
              <input
                value={s.label}
                onChange={(e) => {
                  const next = [...stages];
                  next[i] = { ...next[i], label: e.target.value };
                  setStages(next);
                }}
                className="flex-1 px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded dark:bg-slate-800"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={s.probability}
                onChange={(e) => {
                  const next = [...stages];
                  next[i] = { ...next[i], probability: Number(e.target.value) };
                  setStages(next);
                }}
                className="w-16 px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded dark:bg-slate-800 text-center"
                title="Win probability %"
              />
              <span className="text-xs text-slate-400 w-24 truncate">{s.key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PipelinesPage() {
  return <Suspense fallback={<LeadsSkeleton />}><PipelinesContent /></Suspense>;
}
