'use client';

export default function NotificationBadge({ count, urgent = false, dot = false, collapsed = false }) {
  if (dot && !count) {
    return (
      <span
        className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"
        title="Active"
      />
    );
  }

  if (!count || count <= 0) return null;

  if (collapsed) {
    return (
      <span
        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          urgent ? 'bg-blue-600' : 'bg-slate-400'
        }`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-md text-[10px] font-semibold tabular-nums flex-shrink-0 ${
        urgent
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
