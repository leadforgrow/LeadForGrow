'use client';

import { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import DashboardHeader from './components/dashboard/DashboardHeader';
import DashboardSkeleton from './components/dashboard/DashboardSkeleton';
import DashboardKpiRow from './components/dashboard/DashboardKpiRow';
import TodaysFocus from './components/dashboard/TodaysFocus';
import LivePipelineBar from './components/dashboard/LivePipelineBar';
import RevenueSnapshot from './components/dashboard/RevenueSnapshot';
import CrmActivityFeed from './components/dashboard/CrmActivityFeed';
import UpcomingMeetings from './components/dashboard/UpcomingMeetings';
import DashboardTasksPanel from './components/dashboard/DashboardTasksPanel';
import AiInsightsPanel from './components/dashboard/AiInsightsPanel';
import DashboardQuickActions from './components/dashboard/DashboardQuickActions';

export default function AutomationDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { loading, refreshing, error, refresh, businessName, dash, currency } = useDashboardData();

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950">
      <div className="px-4 sm:px-6 pb-24 max-w-[1600px] mx-auto">
        <DashboardHeader
          businessName={businessName}
          refreshing={refreshing}
          onRefresh={refresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {error && (
          <div className="mb-4 px-4 py-3 text-sm text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <DashboardKpiRow kpis={dash?.kpis} revenue={dash?.revenue} currency={currency} />

          <TodaysFocus focus={dash?.focus} currency={currency} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <LivePipelineBar pipeline={dash?.pipeline} currency={currency} />
            <RevenueSnapshot revenue={dash?.revenue} currency={currency} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <CrmActivityFeed activities={dash?.activities} />
            <UpcomingMeetings meetings={dash?.meetings} />
            <DashboardTasksPanel tasks={dash?.tasks} />
          </div>

          <AiInsightsPanel />
        </div>
      </div>

      <DashboardQuickActions />
    </div>
  );
}
