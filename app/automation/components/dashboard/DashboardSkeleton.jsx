'use client';

export default function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto animate-pulse space-y-4">
      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="grid xl:grid-cols-2 gap-4">
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
