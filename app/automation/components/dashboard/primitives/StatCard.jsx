'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import DashboardCard from './DashboardCard';

export default function StatCard({ label, value, trend, trendLabel, icon: Icon, accent = 'blue' }) {
  const accents = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
  };

  const trendUp = typeof trend === 'number' && trend >= 0;

  return (
    <DashboardCard padding="p-4" hover className="flex flex-col justify-between min-h-[108px]">
      <div className="flex items-start justify-between gap-2 mb-3">
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accents[accent] || accents.blue}`}>
            <Icon className="w-4 h-4" strokeWidth={2} />
          </div>
        )}
        {typeof trend === 'number' && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
              trendUp
                ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400'
            }`}
          >
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight tabular-nums">
          {value}
        </p>
        {trendLabel && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{trendLabel}</p>
        )}
      </div>
    </DashboardCard>
  );
}
