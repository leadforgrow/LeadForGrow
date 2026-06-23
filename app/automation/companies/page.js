'use client';

import { Suspense } from 'react';
import { useCompaniesWorkspace } from '../hooks/useCompaniesWorkspace';
import CrmListHeader from '../components/crm/CrmListHeader';
import CrmEmptyState from '../components/crm/CrmEmptyState';
import CompanyCard from '../components/companies/CompanyCard';
import LeadsSkeleton from '../components/leads/LeadsSkeleton';

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Real Estate', 'Other'];

function CompanyModal({ open, form, onChange, onClose, onSubmit, saving }) {
  if (!open) return null;
  const inputCls = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">New Company</h2>
        <div className="space-y-3">
          <input placeholder="Company name *" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} className={inputCls} />
          <select value={form.industry} onChange={(e) => onChange({ ...form, industry: e.target.value })} className={inputCls}>
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <input placeholder="Website" value={form.website} onChange={(e) => onChange({ ...form, website: e.target.value })} className={inputCls} />
          <input placeholder="Email" value={form.email} onChange={(e) => onChange({ ...form, email: e.target.value })} className={inputCls} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => onChange({ ...form, phone: e.target.value })} className={inputCls} />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
          <button onClick={onSubmit} disabled={saving} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50">Create</button>
        </div>
      </div>
    </div>
  );
}

function CompaniesContent() {
  const ws = useCompaniesWorkspace();
  if (ws.loading) return <LeadsSkeleton />;

  return (
    <div className="min-h-full bg-[#FAFDFA] dark:bg-slate-950">
      <div className="px-4 sm:px-6 pb-8 max-w-[1600px] mx-auto">
        <CrmListHeader
          title="Companies"
          subtitle="Manage organizations, accounts, and revenue"
          search={ws.search}
          onSearchChange={ws.setSearch}
          total={ws.pagination.total}
          refreshing={ws.refreshing}
          onRefresh={() => ws.fetchCompanies(true)}
          onCreate={() => ws.setShowModal(true)}
          createLabel="New Company"
        />

        {ws.companies.length === 0 ? (
          <CrmEmptyState title="No companies yet" description="Add companies to organize contacts and deals." actionLabel="Create Company" onAction={() => ws.setShowModal(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ws.companies.map((c) => (
              <CompanyCard key={c._id} company={c} />
            ))}
          </div>
        )}
      </div>
      <CompanyModal open={ws.showModal} form={ws.form} onChange={ws.setForm} onClose={() => ws.setShowModal(false)} onSubmit={ws.createCompany} />
    </div>
  );
}

export default function CompaniesPage() {
  return <Suspense fallback={<LeadsSkeleton />}><CompaniesContent /></Suspense>;
}
