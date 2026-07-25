'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Plus,
  Workflow,
  Search,
  Copy,
  Trash2,
  Upload,
  BarChart3,
  Play,
  FileDown,
} from 'lucide-react';
import { authFetch } from '@/lib/apiClient';

const STATUS_STYLES = {
  draft: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  published: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  archived: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
};

export default function WhatsAppFlowsPage() {
  const router = useRouter();
  const [flows, setFlows] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [flowsRes, analyticsRes] = await Promise.all([
        authFetch(`/api/automation/whatsapp-flows${q ? `?q=${encodeURIComponent(q)}` : ''}`),
        authFetch('/api/automation/whatsapp-flows/analytics'),
      ]);
      const flowsData = await flowsRes.json();
      const analyticsData = await analyticsRes.json();
      if (flowsData.success) setFlows(flowsData.data || []);
      if (analyticsData.success) setAnalytics(analyticsData.data);
    } catch (err) {
      toast.error('Failed to load flows');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  async function createFlow() {
    setCreating(true);
    try {
      const res = await authFetch('/api/automation/whatsapp-flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New WhatsApp Flow', triggerType: 'incoming_message' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Flow created');
      router.push(`/automation/whatsapp-flows/${data.data._id}`);
    } catch (err) {
      toast.error(err.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  }

  async function duplicateFlow(id) {
    try {
      const res = await authFetch(`/api/automation/whatsapp-flows/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Duplicated');
      load();
    } catch (err) {
      toast.error(err.message || 'Duplicate failed');
    }
  }

  async function deleteFlow(id) {
    if (!confirm('Delete this flow and all versions?')) return;
    try {
      const res = await authFetch(`/api/automation/whatsapp-flows/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  }

  async function importFlow(file) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await authFetch('/api/automation/whatsapp-flows/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Imported');
      router.push(`/automation/whatsapp-flows/${data.data._id}`);
    } catch (err) {
      toast.error(err.message || 'Import failed');
    }
  }

  async function exportFlow(id, name) {
    try {
      const res = await authFetch(`/api/automation/whatsapp-flows/${id}/export`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(name || 'flow').replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  }

  const stats = [
    { label: 'Total Executions', value: analytics?.totalExecutions ?? '—' },
    { label: 'Active Flows', value: analytics?.activeFlows ?? '—' },
    { label: 'Completed', value: analytics?.completedFlows ?? '—' },
    { label: 'Drop-off Rate', value: analytics ? `${analytics.dropOffRate}%` : '—' },
    { label: 'Conversion Rate', value: analytics ? `${analytics.conversionRate}%` : '—' },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Workflow className="w-4 h-4" />
              Automation
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">WhatsApp Flows</h1>
            <p className="mt-2 text-slate-400 max-w-xl">
              Build no-code WhatsApp automation flows for any business — triggers, interactive messages, logic, and analytics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importFlow(e.target.files[0])}
              />
            </label>
            <button
              type="button"
              onClick={createFlow}
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              New Flow
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
              <div className="mt-1 text-2xl font-semibold text-white">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search flows…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        {loading ? (
          <div className="text-slate-500 py-20 text-center">Loading flows…</div>
        ) : flows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-20 text-center">
            <Workflow className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No flows yet</p>
            <p className="text-slate-500 text-sm mt-1 mb-4">Create your first WhatsApp automation flow</p>
            <button
              type="button"
              onClick={createFlow}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm"
            >
              <Plus className="w-4 h-4" /> Create Flow
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {flows.map((flow) => (
              <div
                key={flow._id}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] p-4 transition"
              >
                <Link href={`/automation/whatsapp-flows/${flow._id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white truncate">{flow.name}</h3>
                    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${STATUS_STYLES[flow.status] || STATUS_STYLES.draft}`}>
                      {flow.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 truncate">
                    {flow.description || `Trigger: ${flow.triggerType}`} · v{flow.publishedVersion || 0} published
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {flow.analytics?.totalExecutions || 0} executions · {flow.analytics?.completed || 0} completed
                  </p>
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/automation/whatsapp-flows/${flow._id}`}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                    title="Open builder"
                  >
                    <Play className="w-4 h-4" />
                  </Link>
                  <button type="button" onClick={() => exportFlow(flow._id, flow.name)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white" title="Export">
                    <FileDown className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => duplicateFlow(flow._id)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => deleteFlow(flow._id)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {analytics?.nodeAnalytics?.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
              <BarChart3 className="w-4 h-4" />
              <h2 className="font-semibold">Node analytics</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-slate-400 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Node</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Entered</th>
                    <th className="px-4 py-3 font-medium">Completed</th>
                    <th className="px-4 py-3 font-medium">Dropped</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.nodeAnalytics.slice(0, 20).map((n) => (
                    <tr key={`${n.flowId}-${n.nodeKey}`} className="border-t border-white/5">
                      <td className="px-4 py-2.5 text-white">{n.label}</td>
                      <td className="px-4 py-2.5 text-slate-400">{n.type}</td>
                      <td className="px-4 py-2.5">{n.entered}</td>
                      <td className="px-4 py-2.5">{n.completed}</td>
                      <td className="px-4 py-2.5">{n.dropped}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
