'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Pin, PinOff, Star, Archive, ArchiveRestore, ShieldAlert, ShieldCheck,
  MoreVertical, UserCheck, XCircle, CheckCircle, Clock, Mail, Download, Trash2, Eye,
} from 'lucide-react';

export default function InboxActionsMenu({ chat, onUpdate, onClaim, onAction, currentUserId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!chat?._id || String(chat._id).startsWith('temp_')) return null;

  const isAssignedToMe =
    chat.assignedTo?._id === currentUserId || chat.assignedTo === currentUserId;
  const isClosed = chat.status === 'closed';

  const actions = [
    { id: 'pin', label: chat.isPinned ? 'Unpin' : 'Pin', icon: chat.isPinned ? PinOff : Pin, onClick: () => onUpdate({ isPinned: !chat.isPinned }) },
    { id: 'favorite', label: chat.isFavorite ? 'Remove favorite' : 'Favorite', icon: Star, onClick: () => onUpdate({ isFavorite: !chat.isFavorite }), active: chat.isFavorite },
    { id: 'archive', label: chat.isArchived ? 'Unarchive' : 'Archive', icon: chat.isArchived ? ArchiveRestore : Archive, onClick: () => onUpdate({ isArchived: !chat.isArchived }) },
    { id: 'spam', label: chat.isSpam ? 'Not spam' : 'Mark spam', icon: chat.isSpam ? ShieldCheck : ShieldAlert, onClick: () => onUpdate({ isSpam: !chat.isSpam }), danger: !chat.isSpam },
    { id: 'unread', label: 'Mark unread', icon: Eye, onClick: () => onAction?.('mark_unread') },
    { id: 'close', label: isClosed ? 'Reopen' : 'Close conversation', icon: isClosed ? CheckCircle : XCircle, onClick: () => onAction?.(isClosed ? 'reopen' : 'close') },
    { id: 'snooze', label: 'Snooze 1 hour', icon: Clock, onClick: () => onAction?.('snooze', { until: new Date(Date.now() + 3600000).toISOString() }) },
    { id: 'export', label: 'Export conversation', icon: Download, onClick: () => onAction?.('export') },
    { id: 'delete', label: 'Delete', icon: Trash2, onClick: () => onAction?.('delete'), danger: true },
    ...(!isAssignedToMe ? [{ id: 'claim', label: 'Claim conversation', icon: UserCheck, onClick: onClaim }] : []),
  ];

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="More actions">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-30 max-h-80 overflow-y-auto">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => { action.onClick(); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  action.danger ? 'text-red-600' : action.active ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
