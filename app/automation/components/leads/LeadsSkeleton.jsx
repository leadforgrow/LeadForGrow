'use client';

export default function LeadsSkeleton() {
  return (
    <div className="p-4 sm:p-6 animate-pulse space-y-4">
      <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}
