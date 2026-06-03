'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  ExternalLink,
  Clock,
  User,
  Tag,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authFetch, getUserId } from '@/lib/apiClient';
import StatusBadge from './StatusBadge';
import FollowupChip from './FollowupChip';
import LeadScoreBadge from './LeadScoreBadge';
import { assigneeName, formatSource, formatRelative, formatDate, mapTeamMemberOptions } from './utils';
import { computeLeadIntelligence } from '@/lib/leadIntelligence';
import { PIPELINE_STAGES } from './constants';

export default function LeadDrawer({ leadId, onClose, onStatusChange, onAssign, teamMembers, onCall }) {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('overview');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!leadId) return;
    setLoading(true);
    authFetch(`/api/automation/leads/${leadId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setLead(data.data);
        else toast.error('Failed to load lead');
      })
      .catch(() => toast.error('Failed to load lead'))
      .finally(() => setLoading(false));
  }, [leadId]);

  if (!leadId) return null;

  const intelligence = lead ? computeLeadIntelligence(lead).intelligence : null;
  const activities = lead?.activities || [];
  const tasks = lead?.tasks || [];

  const addNote = async () => {
    if (!note.trim()) return;
    const userId = getUserId();
    const res = await authFetch(`/api/automation/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note.trim(), performedBy: userId })
    });
    const data = await res.json();
    if (data.success) {
      setNote('');
      toast.success('Note added');
      const refetch = await authFetch(`/api/automation/leads/${leadId}`);
      const refreshed = await refetch.json();
      if (refreshed.success) setLead(refreshed.data);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-full w-full sm:w-[440px] lg:w-[480px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Lead Details</h2>
          <div className="flex items-center gap-1">
            <Link
              href={`/automation/leads/${leadId}`}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Full page"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button type="button" onClick={onClose} className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : lead ? (
          <>
            <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{lead.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{lead.phone || lead.email || 'No contact'}</p>
                </div>
                <LeadScoreBadge intelligence={intelligence} />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <StatusBadge status={lead.status} />
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {formatSource(lead.source)}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => onCall(lead)} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Phone className="w-3.5 h-3.5" /> Call
                </button>
                <Link href={`/automation/chat?leadId=${leadId}`} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </Link>
              </div>
            </div>

            <div className="flex border-b border-slate-100 dark:border-slate-800 px-2">
              {['overview', 'activity', 'notes'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-3 py-2.5 text-xs font-medium capitalize border-b-2 -mb-px ${
                    tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tab === 'overview' && (
                <>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Assigned</p>
                      <select
                        value={lead.assignedTo?._id || ''}
                        onChange={(e) => onAssign(leadId, e.target.value || null)}
                        className="w-full text-sm font-medium bg-transparent border-none p-0 focus:ring-0"
                      >
                        <option value="">Unassigned</option>
                        {mapTeamMemberOptions(teamMembers).map((m) => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Follow-up</p>
                      <FollowupChip date={lead.nextFollowUpAt} />
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-500 mb-1">Stage</p>
                      <select
                        value={lead.status}
                        onChange={(e) => onStatusChange(leadId, e.target.value)}
                        className="w-full text-sm font-medium bg-transparent border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-slate-500 mb-1">Created</p>
                      <p className="text-sm font-medium">{formatDate(lead.receivedAt)}</p>
                    </div>
                  </div>

                  {lead.serviceInterest && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Interest</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{lead.serviceInterest}</p>
                    </div>
                  )}

                  {intelligence && (
                    <div className="p-3 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3.5 h-3.5" /> Suggested next step
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{intelligence.nextAction?.text || 'Review and follow up'}</p>
                    </div>
                  )}

                  {(lead.campaignName || lead.adName) && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Attribution</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{lead.campaignName || lead.adName}</p>
                    </div>
                  )}
                </>
              )}

              {tab === 'activity' && (
                <ul className="space-y-3">
                  {activities.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">No activity yet</p>
                  ) : (
                    activities.slice(0, 20).map((a, i) => (
                      <li key={a._id || i} className="text-sm border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                        <p className="text-slate-700 dark:text-slate-300">{a.description || a.type}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{formatRelative(a.performedAt)}</p>
                      </li>
                    ))
                  )}
                </ul>
              )}

              {tab === 'notes' && (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 text-sm px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                      onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    />
                    <button type="button" onClick={addNote} className="px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg">
                      Add
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {(lead.notes || []).map((n, i) => (
                      <li key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-sm">
                        <p className="text-slate-700 dark:text-slate-300">{n.text}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{formatRelative(n.addedAt)}</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}
