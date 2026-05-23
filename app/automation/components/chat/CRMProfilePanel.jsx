'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ExternalLink, X } from 'lucide-react';
import StatusBadge from '../leads/StatusBadge';
import LeadScoreBadge from '../leads/LeadScoreBadge';
import FollowupChip from '../leads/FollowupChip';
import { assigneeName, formatSource, formatRelative, getLeadTags } from '../leads/utils';
import { PIPELINE_STAGES } from './constants';
import ActivityItem from '../dashboard/primitives/ActivityItem';

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export default function CRMProfilePanel({
  chat,
  leadDetail,
  intelligence,
  teamMembers,
  onStatusChange,
  onAssign,
  onAddNote,
  onClose,
  mobile = false
}) {
  const [note, setNote] = useState('');
  const lead = leadDetail || chat?.leadId;
  if (!lead) {
    return (
      <aside className={`flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 ${mobile ? 'w-full' : 'flex-[0_0_25%] min-w-[240px] max-w-[340px] hidden xl:flex'}`}>
        <div className="p-6 text-center text-sm text-slate-500">Select a conversation to view CRM details.</div>
      </aside>
    );
  }

  const tags = getLeadTags(lead);
  const activities = leadDetail?.activities || [];

  const panel = (
    <>
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Lead profile</h3>
        <div className="flex items-center gap-1">
          <Link href={`/automation/leads/${lead._id}`} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600">
            <ExternalLink className="w-4 h-4" />
          </Link>
          {mobile && onClose && (
            <button type="button" onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50">{lead.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">{lead.phone || lead.email}</p>
            </div>
            {intelligence && <LeadScoreBadge intelligence={intelligence} />}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <StatusBadge status={lead.status} size="xs" />
            {tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">{t}</span>
            ))}
          </div>
        </div>

        <Section title="Pipeline">
          <select
            value={lead.status || 'new'}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-3"
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mb-1">Assigned agent</p>
          <select
            value={chat?.assignedTo?._id || lead.assignedTo?._id || ''}
            onChange={(e) => onAssign(e.target.value)}
            className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m._id} value={m._id}>{assigneeName(m)}</option>
            ))}
          </select>
          <div className="mt-3">
            <p className="text-[11px] text-slate-500 mb-1">Next follow-up</p>
            <FollowupChip date={lead.nextFollowUpAt} />
          </div>
        </Section>

        <Section title="Source">
          <p className="text-sm text-slate-700 dark:text-slate-300">{formatSource(lead.source)}</p>
          {lead.campaignName && <p className="text-xs text-slate-500 mt-1">{lead.campaignName}</p>}
          {lead.serviceInterest && <p className="text-xs text-slate-500 mt-1">Interest: {lead.serviceInterest}</p>}
        </Section>

        <Section title="Notes">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note..."
              className="flex-1 text-xs px-2.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && note.trim()) {
                  onAddNote(note);
                  setNote('');
                }
              }}
            />
            <button
              type="button"
              onClick={() => { onAddNote(note); setNote(''); }}
              className="px-2.5 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2 max-h-32 overflow-y-auto">
            {(lead.notes || []).slice().reverse().map((n, i) => (
              <li key={i} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                {n.text}
                <span className="block text-[10px] text-slate-400 mt-1">{formatRelative(n.addedAt)}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Activity" defaultOpen={false}>
          <div className="max-h-48 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500">No activity yet.</p>
            ) : (
              activities.slice(0, 8).map((a, i) => (
                <ActivityItem key={a._id || i} activity={a} showConnector={i < Math.min(activities.length, 8) - 1} />
              ))
            )}
          </div>
        </Section>
      </div>
    </>
  );

  if (mobile) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
        <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
        <aside className="relative w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          {panel}
        </aside>
      </div>
    );
  }

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-[0_0_25%] min-w-[240px] max-w-[340px] hidden xl:flex">
      {panel}
    </aside>
  );
}
