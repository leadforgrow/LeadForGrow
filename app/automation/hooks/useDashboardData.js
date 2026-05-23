'use client';

import { useCallback, useEffect, useState } from 'react';

function computeTrend(dailyTrends) {
  if (!dailyTrends?.length || dailyTrends.length < 2) return null;
  const sorted = [...dailyTrends].sort((a, b) => a._id.localeCompare(b._id));
  const half = Math.max(1, Math.floor(sorted.length / 2));
  const recent = sorted.slice(-half).reduce((s, d) => s + (d.leads || 0), 0);
  const prior = sorted.slice(0, half).reduce((s, d) => s + (d.leads || 0), 0);
  if (prior === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - prior) / prior) * 100);
}

function todayLeadCount(dailyTrends) {
  if (!dailyTrends?.length) return 0;
  const today = new Date().toISOString().slice(0, 10);
  const row = dailyTrends.find((d) => d._id === today);
  return row?.leads || 0;
}

function formatCurrency(value, currency = 'INR') {
  const symbol = currency === 'INR' ? '₹' : '$';
  const n = Number(value) || 0;
  if (n >= 100000) return `${symbol}${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${symbol}${(n / 1000).toFixed(1)}K`;
  return `${symbol}${n.toLocaleString()}`;
}

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    businessName: '',
    userEmail: '',
    reports: null,
    tasks: [],
    activities: [],
    conversations: [],
    metrics: null,
    notContacted: 0
  });

  const fetchAll = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const userId = localStorage.getItem('userid');
      if (!userId) {
        setError('Not signed in');
        setLoading(false);
        return;
      }

      const qs = `userId=${userId}`;
      const [meRes, reportsRes, tasksTodayRes, tasksOverdueRes, tasksUpcomingRes, activitiesRes, metricsRes, convRes, sidebarRes] =
        await Promise.all([
          fetch(`/api/auth/me?${qs}`),
          fetch(`/api/automation/reports?${qs}&period=30`),
          fetch(`/api/automation/tasks?${qs}&filter=today`),
          fetch(`/api/automation/tasks?${qs}&filter=overdue`),
          fetch(`/api/automation/tasks?${qs}&filter=upcoming`),
          fetch(`/api/automation/activities?${qs}&limit=12`),
          fetch(`/api/business/revenue-metric?${qs}`, { credentials: 'include' }),
          fetch('/api/automation/chat/conversations?status=unread&limit=8', { credentials: 'include' }).catch(() => null),
          fetch('/api/automation/sidebar-stats', { credentials: 'include' }).catch(() => null)
        ]);

      const [me, reports, tasksToday, tasksOverdue, tasksUpcoming, activities, metrics] = await Promise.all([
        meRes.json(),
        reportsRes.json(),
        tasksTodayRes.json(),
        tasksOverdueRes.json(),
        tasksUpcomingRes.json(),
        activitiesRes.json(),
        metricsRes.json()
      ]);

      let conversations = [];
      if (convRes?.ok) {
        const convJson = await convRes.json();
        if (convJson.success) conversations = convJson.data || [];
      }

      const reportData = reports.success ? reports.data : null;
      const trend = computeTrend(reportData?.dailyTrends);

      const todayList = tasksToday.success ? tasksToday.data : [];
      const overdueList = tasksOverdue.success ? tasksOverdue.data : [];
      const upcomingList = tasksUpcoming.success ? tasksUpcoming.data : [];
      const mergedTasks = [...overdueList, ...todayList, ...upcomingList].slice(0, 12);

      let overdueTasks = overdueList.length;
      if (sidebarRes?.ok) {
        const sidebarJson = await sidebarRes.json();
        if (sidebarJson.success) overdueTasks = sidebarJson.data?.overdueTasks ?? overdueTasks;
      }

      setData({
        businessName: me.success ? me.data.companyName : 'Workspace',
        userEmail: me.success ? me.data.email : '',
        reports: reportData,
        tasks: mergedTasks,
        overdueTasks,
        activities: activities.success ? activities.data : [],
        conversations,
        metrics: metrics.success ? metrics.data : null,
        notContacted: reportData?.notContactedCount ?? 0,
        trend,
        newLeadsToday: todayLeadCount(reportData?.dailyTrends),
        formatPipeline: () => {
          const val = metrics.success ? metrics.data?.totalPipelineValue : 0;
          const cur = metrics.success ? metrics.data?.currency : 'INR';
          return formatCurrency(val, cur);
        }
      });
      setError(null);
    } catch (err) {
      console.error('[Dashboard]', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(true), 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return {
    loading,
    refreshing,
    error,
    refresh: () => fetchAll(true),
    ...data,
    formatCurrency
  };
}

export { formatCurrency, computeTrend };
