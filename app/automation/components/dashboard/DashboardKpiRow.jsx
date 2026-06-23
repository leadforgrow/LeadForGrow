'use client';

import {
  UserPlus,
  MessageCircle,
  Briefcase,
  Layers,
  Trophy,
  XCircle,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import StatCard from './primitives/StatCard';
import { formatCurrency } from '@/lib/crm/formatCurrency';

export default function DashboardKpiRow({ kpis, revenue, currency = 'INR' }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      <StatCard
        label="New Leads Today"
        value={String(kpis.newLeadsToday ?? 0)}
        icon={UserPlus}
        accent="green"
        href="/automation/leads?view=today"
      />
      <StatCard
        label="Awaiting Response"
        value={String(kpis.leadsAwaitingFirstResponse ?? 0)}
        icon={MessageCircle}
        accent="amber"
        href="/automation/leads?filter=new"
        trendLabel="Need first contact"
      />
      <StatCard
        label="Active Deals"
        value={String(kpis.activeDeals ?? 0)}
        icon={Briefcase}
        accent="blue"
        href="/automation/deals"
      />
      <StatCard
        label="Pipeline Revenue"
        value={formatCurrency(kpis.pipelineRevenue, currency)}
        icon={Layers}
        accent="slate"
        href="/automation/deals"
        trendLabel="Open deals"
      />
      <StatCard
        label="Won Revenue"
        value={formatCurrency(kpis.wonRevenue, currency)}
        icon={Trophy}
        accent="green"
        href="/automation/deals?stage=won"
        trend={revenue?.monthChange}
        trendLabel="All-time won"
      />
      <StatCard
        label="Lost Revenue"
        value={formatCurrency(kpis.lostRevenue, currency)}
        icon={XCircle}
        accent="red"
        href="/automation/deals?stage=lost"
      />
      <StatCard
        label="Meetings Today"
        value={String(kpis.meetingsToday ?? 0)}
        icon={Calendar}
        accent="violet"
        href="/automation/meetings"
      />
      <StatCard
        label="Tasks Due Today"
        value={String(kpis.tasksDueToday ?? 0)}
        icon={CheckSquare}
        accent="amber"
        href="/automation/tasks?filter=today"
      />
    </div>
  );
}
