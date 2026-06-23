'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ExternalLink,
  X,
  Briefcase,
  Calendar,
  CheckSquare,
  MessageSquare,
  History,
} from 'lucide-react';
import StatusBadge from '../leads/StatusBadge';
import LeadScoreBadge from '../leads/LeadScoreBadge';
import FollowupChip from '../leads/FollowupChip';
import { assigneeName, formatSource, formatRelative, getLeadTags, mapTeamMemberOptions } from '../leads/utils';
import { PIPELINE_STAGES, CHANNEL_META } from './constants';
import ActivityItem from '../dashboard/primitives/ActivityItem';

function Section({ title, children, defaultOpen = true, icon: Icon }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function RecordLink({ href, label, sub }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
    >
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-500 truncate">{sub}</p>}
      </div>
      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 flex-shrink-0" />
    </Link>
  );
}

export default function CRMProfilePanel({
  chat,
  leadDetail,
  conversationDetail,
  intelligence,
  teamMembers,
  labels = [],
  onStatusChange,
  onAssign,
  onAddNote,
  onToggleLabel,
  onClose,
  mobile = false,
}) {
  const [note, setNote] = useState('');
  const lead = leadDetail || chat?.leadId;
  const conv = conversationDetail?.conversation || chat;
  const contact = conversationDetail?.conversation?.contactId || chat?.contactId;
  const company = conversationDetail?.conversation?.companyId || chat?.companyId;
  const deal = conversationDetail?.conversation?.dealId || chat?.dealId;
  const tasks = conversationDetail?.tasks || [];
  const meetings = conversationDetail?.meetings || [];
  const activities = conversationDetail?.activities || leadDetail?.activities || [];
  const previousConversations = conversationDetail?.previousConversations || [];
  const assignmentHistory = conv?.assignmentHistory || [];

  if (!lead) {
    return (
      <aside className={`flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 ${mobile ? 'w-full' : 'flex-[0_0_25%] min-w-[240px] max-w-[340px] hidden xl:flex'}`}>
        <div className="p-6 text-center text-sm text-slate-500">Select a conversation to view CRM details.</div>
      </aside>
    );
  }

  const tags = getLeadTags(lead);
  const channelMeta = CHANNEL_META[conv?.channel || 'whatsapp'];

  const panel = (
    <>
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Customer profile</h3>
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
              <p className="font-semibold text-slate-900 dark:text-slate-50">{lead.name || conv?.participantName}</p>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">{lead.phone || lead.email || conv?.participantEmail}</p>
              <span className={`inline-flex mt-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${channelMeta?.bg}`}>
                {channelMeta?.label}
              </span>
            </div>
            {intelligence && <LeadScoreBadge intelligence={intelligence} />}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <StatusBadge status={lead.status} size="xs" />
            {tags.map((t) => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">{t}</span>
            ))}
            {(conv?.labels || []).map((l) => (
              <span
                key={l.labelId || l.name}
                className="text-[10px] px-1.5 py-0.5 rounded text-white"
                style={{ backgroundColor: l.color || '#6366f1' }}
              >
                {l.name}
              </span>
            ))}
          </div>
        </div>

        {labels.length > 0 && onToggleLabel && (
          <Section title="Labels" defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {labels.map((label) => {
                const active = (conv?.labels || []).some((l) => String(l.labelId) === String(label._id));
                return (
                  <button
                    key={label._id}
                    type="button"
                    onClick={() => onToggleLabel(label._id, !active)}
                    className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                      active ? 'text-white border-transparent' : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                    style={active ? { backgroundColor: label.color } : {}}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {(contact || company || deal) && (
          <Section title="CRM records" icon={Briefcase}>
            <div className="space-y-1">
              {contact && (
                <RecordLink
                  href={`/automation/contacts/${contact._id}`}
                  label={[contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Contact'}
                  sub={contact.emails?.[0] || contact.phones?.[0]}
                />
              )}
              {company && (
                <RecordLink href={`/automation/companies/${company._id}`} label={company.name} sub="Company" />
              )}
              {deal && (
                <RecordLink
                  href={`/automation/deals/${deal._id}`}
                  label={deal.title}
                  sub={[deal.stage, deal.amount ? `₹${deal.amount}` : null].filter(Boolean).join(' · ')}
                />
              )}
            </div>
          </Section>
        )}

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
            {mapTeamMemberOptions(teamMembers).map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
          <div className="mt-3">
            <p className="text-[11px] text-slate-500 mb-1">Next follow-up</p>
            <FollowupChip date={lead.nextFollowUpAt} />
          </div>
        </Section>

        {tasks.length > 0 && (
          <Section title="Open tasks" icon={CheckSquare} defaultOpen={false}>
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t._id} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-medium text-slate-700 dark:text-slate-300">{t.title}</p>
                  {t.dueDate && (
                    <p className="text-[10px] text-slate-400 mt-0.5">Due {formatRelative(t.dueDate)}</p>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {meetings.length > 0 && (
          <Section title="Upcoming meetings" icon={Calendar} defaultOpen={false}>
            <ul className="space-y-2">
              {meetings.map((m) => (
                <li key={m._id} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <p className="font-medium text-slate-700 dark:text-slate-300">{m.title || 'Meeting'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {m.startTime ? new Date(m.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {previousConversations.length > 0 && (
          <Section title="Previous conversations" icon={MessageSquare} defaultOpen={false}>
            <ul className="space-y-1">
              {previousConversations.map((c) => (
                <li key={c._id} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-medium">{CHANNEL_META[c.channel]?.label || c.channel}</span>
                  <p className="text-slate-500 truncate mt-0.5">{c.lastMessagePreview}</p>
                  <p className="text-[10px] text-slate-400">{formatRelative(c.lastMessageAt)}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}

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

        {assignmentHistory.length > 0 && (
          <Section title="Assignment history" icon={History} defaultOpen={false}>
            <ul className="space-y-2">
              {assignmentHistory.slice().reverse().slice(0, 5).map((h, i) => (
                <li key={i} className="text-[10px] text-slate-500">
                  {formatRelative(h.assignedAt)} · {h.reason || 'assigned'}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Timeline" defaultOpen={false}>
          <div className="max-h-56 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500">No activity yet.</p>
            ) : (
              activities.slice(0, 12).map((a, i) => (
                <ActivityItem key={a._id || i} activity={a} showConnector={i < Math.min(activities.length, 12) - 1} />
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
