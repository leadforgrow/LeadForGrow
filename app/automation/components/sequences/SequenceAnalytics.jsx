'use client';

import { motion } from 'framer-motion';
import { Users, CheckCircle2, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function SequenceAnalytics({ analytics, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return <p className="text-sm text-slate-500 text-center py-12">No analytics yet — activate your sequence to start tracking.</p>;
  }

  const cards = [
    { label: 'Enrolled', value: analytics.enrolled, icon: Users, color: 'blue' },
    { label: 'Completion rate', value: `${analytics.completionRate}%`, icon: CheckCircle2, color: 'emerald' },
    { label: 'Active runs', value: analytics.activeRuns, icon: Activity, color: 'amber' },
    { label: 'Response rate', value: `${analytics.responseRate}%`, icon: TrendingUp, color: 'violet' },
    { label: 'Failed', value: analytics.failed, icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <c.icon className={`w-4 h-4 text-${c.color}-500 mb-2`} />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {analytics.byStatus && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Execution status breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analytics.byStatus).map(([status, count]) => (
              <span key={status} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                {status}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
