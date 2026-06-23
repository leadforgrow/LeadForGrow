'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Send, Mail, MessageCircle, BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';

const STATUS_STYLES = {
  draft: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sending: 'bg-violet-100 text-violet-700',
  sent: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function BroadcastsPage() {
  const [loading, setLoading] = useState(true);
  const [broadcasts, setBroadcasts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    channel: 'whatsapp',
    body: '',
    subject: '',
    tags: '',
  });

  const fetchBroadcasts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/automation/broadcasts');
      const data = await res.json();
      if (data.success) setBroadcasts(data.data);
    } catch {
      toast.error('Failed to load broadcasts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBroadcasts(); }, [fetchBroadcasts]);

  const createBroadcast = async (testSend = false) => {
    if (!draft.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      const res = await authFetch('/api/automation/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          channel: draft.channel,
          content: { body: draft.body, subject: draft.subject },
          audience: { type: 'tags', tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean) },
          testSend,
          testMode: testSend,
          testRecipients: testSend ? [{ name: 'Test', email: 'test@example.com', phone: '' }] : [],
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(testSend ? 'Test send complete' : 'Broadcast created');
      setShowCreate(false);
      setDraft({ name: '', channel: 'whatsapp', body: '', subject: '', tags: '' });
      fetchBroadcasts();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (id, action) => {
    try {
      const res = await authFetch(`/api/automation/broadcasts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(`Broadcast ${action.replace('_', ' ')}`);
      fetchBroadcasts();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Broadcasts</h1>
          <p className="text-sm text-slate-500 mt-1">Send WhatsApp and email campaigns to your audience</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New broadcast
        </button>
      </div>

      {showCreate && (
        <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Create broadcast</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Campaign name"
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
            />
            <select
              value={draft.channel}
              onChange={(e) => setDraft({ ...draft, channel: e.target.value })}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="both">Both</option>
            </select>
            <input
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              placeholder="Audience tags (comma-separated)"
              className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
            />
            {(draft.channel === 'email' || draft.channel === 'both') && (
              <input
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                placeholder="Email subject"
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
              />
            )}
            <textarea
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder="Message body — use {{name}} for personalization"
              rows={4}
              className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => createBroadcast(true)} disabled={saving} className="px-4 py-2 rounded-xl border text-sm font-medium">
              Test send
            </button>
            <button type="button" onClick={() => createBroadcast(false)} disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">
              {saving ? 'Saving…' : 'Create & send'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm text-slate-500">
              Cancel
            </button>
          </div>
        </div>
      )}

      {broadcasts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <Send className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <p className="text-slate-500">No broadcasts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => (
            <div key={b._id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {b.channel === 'email' ? <Mail className="w-5 h-5 text-violet-500 shrink-0" /> : <MessageCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">{b.name}</p>
                  <p className="text-xs text-slate-500">
                    {b.analytics?.sent || 0} sent · {b.analytics?.failed || 0} failed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${STATUS_STYLES[b.status] || STATUS_STYLES.draft}`}>
                  {b.status}
                </span>
                {b.status === 'draft' && (
                  <button type="button" onClick={() => runAction(b._id, 'send')} className="p-2 rounded-lg hover:bg-slate-100" title="Send">
                    <Send className="w-4 h-4" />
                  </button>
                )}
                {b.analytics?.failed > 0 && (
                  <button type="button" onClick={() => runAction(b._id, 'retry_failed')} className="p-2 rounded-lg hover:bg-slate-100" title="Retry failed">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
