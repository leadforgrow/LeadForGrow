'use client';

import { Clock, AlertCircle } from 'lucide-react';
import { formatDate } from './utils';

export default function FollowupChip({ date }) {
  if (!date) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(d);
  dueDay.setHours(0, 0, 0, 0);

  const overdue = dueDay < today;
  const isToday = dueDay.getTime() === today.getTime();

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
        overdue
          ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          : isToday
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
      }`}
    >
      {overdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {formatDate(date)}
    </span>
  );
}
