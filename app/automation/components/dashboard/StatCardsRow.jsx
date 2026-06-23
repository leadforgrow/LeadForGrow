'use client';

import { Users, UserPlus, TrendingUp, Trophy, Layers } from 'lucide-react';
import StatCard from './primitives/StatCard';
import { formatCurrency } from '../../hooks/useDashboardData';

export default function StatCardsRow({ reports, metrics, newLeadsToday, trend, crmDashboard }) {
  const totalLeads = reports?.totalLeads ?? 0;
  const conversionRate = reports?.conversionRate ?? 0;
  const currency = metrics?.currency || 'INR';

  const wonRevenue = crmDashboard?.deals?.wonValue ?? metrics?.recoveredRevenue ?? 0;
  const pipelineValue = crmDashboard?.deals?.openValue ?? metrics?.totalPipelineValue ?? 0;
  const wonCount = crmDashboard?.deals?.wonCount ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
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
        label="Revenue Won"
        value={formatCurrency(wonRevenue, currency)}
        icon={Trophy}
        accent="green"
        trendLabel={wonCount ? `${wonCount} deal${wonCount === 1 ? '' : 's'} won` : 'Closed-won deals'}
      />
      <StatCard
        label="In Pipeline"
        value={formatCurrency(pipelineValue, currency)}
        icon={Layers}
        accent="slate"
        trendLabel="Open deal value"
      />
      <StatCard
        label="Open Deals"
        value={String(crmDashboard?.deals?.openDeals ?? 0)}
        icon={Layers}
        accent="blue"
        trendLabel="Active in pipeline"
      />
    </div>
  );
}
