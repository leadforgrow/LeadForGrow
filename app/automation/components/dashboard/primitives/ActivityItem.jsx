'use client';

import { Phone, MessageSquare, Mail, UserPlus, RefreshCw, CheckCircle2 } from 'lucide-react';

const TYPE_ICONS = {
  whatsapp_received: MessageSquare,
  whatsapp: MessageSquare,
  call: Phone,
  email: Mail,
  assigned: UserPlus,
  status_changed: RefreshCw,
  converted: CheckCircle2
};

function pickIcon(activity) {
  const type = (activity.type || '').toLowerCase();
  for (const [key, Icon] of Object.entries(TYPE_ICONS)) {
    if (type.includes(key)) return Icon;
  }
  return RefreshCw;
}

export default function ActivityItem({ activity, showConnector = false }) {
  const Icon = pickIcon(activity);
  const time = activity.performedAt
    ? new Date(activity.performedAt).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Just now';

  return (
    <div className="flex gap-3 relative">
      {showConnector && (
        <span className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />
      )}
      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 z-[1]">
        <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
          {activity.description || activity.type}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
