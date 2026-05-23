'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useDashboardData } from './hooks/useDashboardData';
import DashboardHeader from './components/dashboard/DashboardHeader';
import DashboardSkeleton from './components/dashboard/DashboardSkeleton';
import StatCardsRow from './components/dashboard/StatCardsRow';
import PipelineOverview from './components/dashboard/PipelineOverview';
import TeamLeaderboard from './components/dashboard/TeamLeaderboard';
import WhatsAppActivity from './components/dashboard/WhatsAppActivity';
import FollowUpTasks from './components/dashboard/FollowUpTasks';
import QuickActionsBar from './components/dashboard/QuickActionsBar';
import AiSuggestionsPanel from './components/dashboard/AiSuggestionsPanel';
import RecentActivity from './components/dashboard/RecentActivity';

const AnalyticsRow = dynamic(() => import('./components/dashboard/AnalyticsRow'), {
  loading: () => <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse" />,
  ssr: false
});

export default function AutomationDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    loading,
    refreshing,
    error,
    refresh,
    businessName,
    reports,
    metrics,
    tasks,
    activities,
    conversations,
    notContacted,
    overdueTasks,
    trend,
    newLeadsToday
  } = useDashboardData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950">
      <div className="px-4 sm:px-6 pb-8 max-w-[1600px] mx-auto">
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

        <div className="mb-5">
          <QuickActionsBar />
        </div>

        <div className="space-y-5">
          <StatCardsRow
            reports={reports}
            metrics={metrics}
            newLeadsToday={newLeadsToday}
            trend={trend}
          />

          <AiSuggestionsPanel
            notContacted={notContacted}
            overdueTasks={overdueTasks}
            unreadChats={conversations.length}
          />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <PipelineOverview statusCounts={reports?.statusCounts} />
            <TeamLeaderboard teamPerformance={reports?.teamPerformance} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <WhatsAppActivity conversations={conversations} />
            <FollowUpTasks tasks={tasks} />
          </div>

          <Suspense fallback={<div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />}>
            <AnalyticsRow reports={reports} />
          </Suspense>

          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}
