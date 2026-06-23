'use client';

import { memo } from 'react';
import { Pin, Star } from 'lucide-react';
import StatusBadge from '../leads/StatusBadge';
import { assigneeName } from '../leads/utils';
import { CHANNEL_META } from './constants';
import { Mail, MessageCircle } from 'lucide-react';

function ChannelBadge({ channel }) {
  const meta = CHANNEL_META[channel] || CHANNEL_META.whatsapp;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${meta.bg}`}
      title={meta.label}
    >
      {channel === 'email' ? <Mail className="w-2.5 h-2.5" /> : <MessageCircle className="w-2.5 h-2.5" />}
      {meta.label}
    </span>
  );
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function ConversationItem({ chat, active, onClick }) {
  const lead = chat.leadId || {};
  const unread = chat.unreadCount > 0 || chat.inboxStatus === 'unread' || chat.status === 'unread';
  const assignee = chat.assignedTo || lead.assignedTo;
  const displayName = lead.name || chat.participantName || lead.phone || chat.participantEmail || 'Unknown';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 transition-colors ${
        active
          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-l-2 border-l-blue-600'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-2 border-l-transparent'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300">
          {displayName.charAt(0)?.toUpperCase() || '?'}
        </div>
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-sm truncate ${unread ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
            {displayName}
          </span>
          <span className="text-[10px] text-slate-400 flex-shrink-0 tabular-nums">{formatTime(chat.lastMessageAt)}</span>
        </div>
        <p className={`text-xs truncate mb-1.5 ${unread ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
          {chat.lastMessagePreview || 'No messages yet'}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {chat.isPinned && <Pin className="w-3 h-3 text-blue-500" />}
          {chat.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
          <ChannelBadge channel={chat.channel || 'whatsapp'} />
          {(chat.labels || []).slice(0, 2).map((l) => (
            <span
              key={l.labelId || l.name}
              className="text-[9px] px-1 py-0.5 rounded text-white"
              style={{ backgroundColor: l.color || '#6366f1' }}
            >
              {l.name}
            </span>
          ))}
          {lead.status && <StatusBadge status={lead.status} size="xs" />}
          {assignee && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 truncate max-w-[120px]">
              {assigneeName(assignee)}
            </span>
          )}
          {chat.status === 'intervened' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">Live</span>
          )}
          {unread && (
            <span className="ml-auto text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white flex items-center justify-center tabular-nums">
              {chat.unreadCount || 1}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default memo(ConversationItem);
