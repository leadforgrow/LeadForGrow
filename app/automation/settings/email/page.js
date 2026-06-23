'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, RefreshCw, Mail, Trash2 } from 'lucide-react';
import { authFetch } from '@/lib/apiClient';
import { toast } from 'react-hot-toast';

export default function EmailSettingsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', displayName: '', imapHost: '', smtpHost: '', imapUser: '', imapPass: '', smtpUser: '', smtpPass: '' });

  const load = async () => {
    setLoading(true);
    const res = await authFetch('/api/automation/inbox/email-accounts');
    const data = await res.json();
    if (data.success) setAccounts(data.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await authFetch('/api/automation/inbox/email-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        displayName: form.displayName,
        imap: { host: form.imapHost, username: form.imapUser, password: form.imapPass, port: 993, secure: true },
        smtp: { host: form.smtpHost, username: form.smtpUser, password: form.smtpPass, port: 587 },
      }),
    });
    const data = await res.json();
    if (data.success) { toast.success('Account added'); setShowForm(false); load(); }
    else toast.error(data.error || 'Failed');
  };

  const handleSync = async () => {
    const res = await authFetch('/api/automation/inbox/sync-email', { method: 'POST' });
    const data = await res.json();
    if (data.success) { toast.success(`Synced ${data.synced || 0} messages`); load(); }
    else toast.error(data.error || 'Sync failed');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Link href="/automation/settings/integrations" className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-lg font-semibold">Email Accounts</h1>
          <p className="text-xs text-slate-500">IMAP/SMTP for unified inbox</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg">
          <Plus className="w-4 h-4" /> Add account
        </button>
        <button type="button" onClick={handleSync} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-slate-50">
          <RefreshCw className="w-4 h-4" /> Sync now
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border rounded-xl p-4 space-y-3">
          <input required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
          <input placeholder="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="IMAP host" value={form.imapHost} onChange={(e) => setForm({ ...form, imapHost: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
            <input placeholder="SMTP host" value={form.smtpHost} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
            <input placeholder="IMAP user" value={form.imapUser} onChange={(e) => setForm({ ...form, imapUser: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
            <input type="password" placeholder="IMAP password" value={form.imapPass} onChange={(e) => setForm({ ...form, imapPass: e.target.value })} className="px-3 py-2 text-sm border rounded-lg" />
          </div>
          <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg">Save account</button>
        </form>
      )}

      {loading ? (
        <div className="h-32 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No email accounts connected.</p>
      ) : (
        <ul className="space-y-2">
          {accounts.map((a) => (
            <li key={a._id} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border rounded-xl">
              <Mail className="w-5 h-5 text-indigo-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{a.displayName || a.email}</p>
                <p className="text-xs text-slate-500">{a.email} · {a.status}</p>
              </div>
              {a.lastSyncAt && <span className="text-[10px] text-slate-400">Synced {new Date(a.lastSyncAt).toLocaleDateString()}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
