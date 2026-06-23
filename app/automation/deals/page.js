'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { useDealsWorkspace } from '../hooks/useDealsWorkspace';
import CrmListHeader from '../components/crm/CrmListHeader';
import CrmEmptyState from '../components/crm/CrmEmptyState';
import LeadsSkeleton from '../components/leads/LeadsSkeleton';
import { WON_STAGES } from '@/lib/crm/stageKeys';
import { DEFAULT_DEAL_STAGES } from '@/lib/crm/pipelineStages';

function DealModal({ open, editing, form, onChange, onClose, onSubmit, stages }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Deal' : 'New Deal'}</h2>
        <div className="space-y-3">
          <input placeholder="Deal title *" value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700" />
          <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => onChange({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700" />
          <select value={form.currency} onChange={(e) => onChange({ ...form, currency: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700">
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <select value={form.stage} onChange={(e) => onChange({ ...form, stage: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700">
            {(stages || []).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <input type="date" value={form.expectedCloseDate} onChange={(e) => onChange({ ...form, expectedCloseDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700" />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
          <button onClick={onSubmit} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
            {editing ? 'Save changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DealsContent() {
  const ws = useDealsWorkspace();

  if (ws.loading) return <LeadsSkeleton />;

  const wonDeals = ws.deals.filter((d) => WON_STAGES.includes(d.stage) || d.stage === 'converted');

  const formatValue = (amount, currency = 'INR') => {
    const sym = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$';
    const n = Number(amount) || 0;
    if (n >= 100000) return `${sym}${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${sym}${(n / 1000).toFixed(1)}K`;
    return `${sym}${n.toLocaleString()}`;
  };

  const wonRevenue = wonDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950">
      <div className="px-4 sm:px-6 pb-8">
        <CrmListHeader
          title="Deals"
          subtitle="Won deals and closed revenue"
          search=""
          onSearchChange={() => {}}
          total={wonDeals.length}
          refreshing={ws.refreshing}
          onRefresh={() => ws.fetchDeals(true)}
          onCreate={() => ws.openCreateModal()}
          createLabel="New Deal"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500">Revenue Won</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{formatValue(wonRevenue)}</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500">Won Deals</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{wonDeals.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-500">Avg Deal Value</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {wonDeals.length ? formatValue(wonRevenue / wonDeals.length) : '—'}
            </p>
          </div>
        </div>

        {wonDeals.length === 0 ? (
          <CrmEmptyState title="No won deals yet" description="Closed-won deals will appear here." actionLabel="Create Deal" onAction={() => ws.openCreateModal()} />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">Deal</th>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 hidden md:table-cell">Won Date</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Close Date</th>
                  <th className="px-4 py-3 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {wonDeals.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <Link href={`/automation/deals/${d._id}`} className="font-medium text-emerald-600 hover:underline">{d.title}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {d.leadId?.name || d.contactId?.fullName || '—'}
                    </td>
                    <td className="px-4 py-3">{formatValue(d.amount, d.currency)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {d.wonAt ? new Date(d.wonAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => ws.openEditDeal(d)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          title="Edit deal"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => ws.deleteDeal(d._id, d.title)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Delete deal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <DealModal
        open={ws.showModal}
        editing={!!ws.editingDealId}
        form={ws.form}
        onChange={ws.setForm}
        onClose={ws.closeModal}
        onSubmit={ws.saveDeal}
        stages={ws.stages.length ? ws.stages : DEFAULT_DEAL_STAGES}
      />
    </div>
  );
}

export default function DealsPage() {
  return <Suspense fallback={<LeadsSkeleton />}><DealsContent /></Suspense>;
}
