'use client';

import { Users, UserPlus, TrendingUp, Layers } from 'lucide-react';
import StatCard from './primitives/StatCard';
import { formatCurrency } from '../../hooks/useDashboardData';

export default function StatCardsRow({ reports, metrics, newLeadsToday, trend }) {
  const totalLeads = reports?.totalLeads ?? 0;
  const conversionRate = reports?.conversionRate ?? 0;
  const pipelineValue = metrics?.totalPipelineValue ?? 0;
  const currency = metrics?.currency || 'INR';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        label="Total Leads"
        value={totalLeads.toLocaleString()}
        trend={trend ?? undefined}
        trendLabel="Last 30 days"
        icon={Users}
        accent="blue"
      />
      <StatCard
        label="New Today"
        value={String(newLeadsToday ?? 0)}
        icon={UserPlus}
        accent="green"
        trendLabel="Received today"
      />
      <StatCard
        label="Conversion Rate"
        value={`${conversionRate}%`}
        icon={TrendingUp}
        accent="amber"
        trendLabel="Converted / total"
      />
      <StatCard
        label="Revenue Pipeline"
        value={formatCurrency(pipelineValue, currency)}
        icon={Layers}
        accent="slate"
        trendLabel="Active pipeline value"
      />
    </div>
  );
}
