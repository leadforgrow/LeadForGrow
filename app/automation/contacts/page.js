'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useContactsWorkspace } from '../hooks/useContactsWorkspace';
import CrmListHeader from '../components/crm/CrmListHeader';
import CrmEmptyState from '../components/crm/CrmEmptyState';
import LeadsSkeleton from '../components/leads/LeadsSkeleton';

function ContactModal({ open, form, onChange, onClose, onSubmit }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">New Contact</h2>
        <div className="space-y-3">
          <input placeholder="First name *" value={form.firstName} onChange={(e) => onChange({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700" />
          <input placeholder="Last name" value={form.lastName} onChange={(e) => onChange({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700" />
          <input placeholder="Email" value={form.email} onChange={(e) => onChange({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => onChange({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700" />
          <input placeholder="Job title" value={form.jobTitle} onChange={(e) => onChange({ ...form, jobTitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700" />
          <select value={form.type} onChange={(e) => onChange({ ...form, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700">
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
          <button onClick={onSubmit} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg">Create</button>
        </div>
      </div>
    </div>
  );
}

function ContactsContent() {
  const ws = useContactsWorkspace();
  if (ws.loading) return <LeadsSkeleton />;

  return (
    <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950">
      <div className="px-4 sm:px-6 pb-8">
        <CrmListHeader
          title="Contacts"
          subtitle="Manage personal and business contacts"
          search={ws.search}
          onSearchChange={ws.setSearch}
          total={ws.pagination.total}
          refreshing={ws.refreshing}
          onRefresh={() => ws.fetchContacts(true)}
          onCreate={() => ws.setShowModal(true)}
          createLabel="New Contact"
        />

        {ws.contacts.length === 0 ? (
          <CrmEmptyState title="No contacts yet" description="Create your first contact or import from CSV." actionLabel="Create Contact" onAction={() => ws.setShowModal(true)} />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Company</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ws.contacts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <Link href={`/automation/contacts/${c._id}`} className="font-medium text-indigo-600 hover:underline">
                        {c.fullName || `${c.firstName} ${c.lastName}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-600">{c.emails?.[0]?.address || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">{c.phones?.[0]?.number || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-600">{c.companyId?.name || '—'}</td>
                    <td className="px-4 py-3 capitalize text-slate-500">{c.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ContactModal open={ws.showModal} form={ws.form} onChange={ws.setForm} onClose={() => ws.setShowModal(false)} onSubmit={ws.createContact} />
    </div>
  );
}

export default function ContactsPage() {
  return <Suspense fallback={<LeadsSkeleton />}><ContactsContent /></Suspense>;
}
