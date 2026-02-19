'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';

export default function RevenueIntelligenceDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [config, setConfig] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const plan = localStorage.getItem('userPlan') || 'free';
    setUserPlan(plan);
    fetchRevenueData(plan);
  }, []);

  const fetchRevenueData = async (plan) => {
    try {
      const userId = localStorage.getItem('userid');

      // Fetch revenue config
      const configRes = await fetch(`/api/business/revenue-config?userId=${userId}`);
      const configData = await configRes.json();

      // Fetch revenue metrics
      const metricsRes = await fetch(`/api/business/revenue-metric?userId=${userId}`);
      const metricsData = await metricsRes.json();

      // Fetch activities
      const activitiesRes = await fetch(`/api/automation/activities?userId=${userId}&limit=10`);
      const activitiesData = await activitiesRes.json();

      // Fetch urgent tasks
      const tasksRes = await fetch(`/api/automation/tasks?userId=${userId}&filter=today`);
      const tasksData = await tasksRes.json();

      if (configData.success) setConfig(configData.data);
      if (activitiesData.success) setActivities(activitiesData.data);
      if (tasksData.success) setTasks(tasksData.data);

      if (metricsData.success) {
        let actualMetrics = metricsData.data;
        if (plan === 'trial') {
          // Keep insights restricted for trial
          actualMetrics = {
            ...actualMetrics,
            insights: ['Can not see in free trial', 'Can not see in free trial', 'Can not see in free trial']
          };
        }
        setMetrics(actualMetrics);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!config || !config.estimationAcknowledged) {
    return (
      <div className="relative">
        {/* Background Dashboard Preview (Blurred) */}
        <div className="opacity-40 blur-[10px] pointer-events-none select-none scale-[0.98] transition-all duration-700">
          <DashboardContent
            config={{ avgDealValue: { typical: 50000, currency: 'INR' }, sources: [] }}
            metrics={{ totalPipelineValue: 1250000, revenueAtRisk: 150000, recoveredRevenue: 45000 }}
            userPlan="trial"
            isBlur={true}
          />
        </div>

        {/* Premium Unlock Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white/80 backdrop-blur-2xl rounded-[40px] border border-white p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] text-center relative overflow-hidden group">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-700" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700" />

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Zap className="w-10 h-10 text-white fill-white/20" />
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Unlock Revenue Intelligence</h3>
              <p className="text-slate-500 mb-10 text-lg leading-relaxed max-w-md mx-auto">
                Transform your lead data into <span className="text-blue-600 font-bold">predictable revenue</span>. Configure your business metrics to see real-time risk calculations.
              </p>

              <a
                href="/automation/settings/details"
                className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:scale-95 group"
              >
                Start Configuration
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>

              <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  REAL-TIME RISK
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  SLA COMPLIANCE
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  PIPELINE VALUE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    const symbol = config?.avgDealValue?.currency === 'INR' ? '₹' : '$';
    return `${symbol}${parseFloat(value || 0).toLocaleString()}`;
  };

  return (
    <DashboardContent
      config={config}
      metrics={metrics}
      userPlan={userPlan}
      formatCurrency={formatCurrency}
      activities={activities}
      tasks={tasks}
    />
  );
}

function DashboardContent({ config, metrics, userPlan, formatCurrency, activities, tasks, isBlur = false }) {
  const safeFormat = (val) => formatCurrency ? formatCurrency(val) : `₹${val.toLocaleString()}`;

  return (
    <div className={`space-y-16 px-12 py-16 ${isBlur ? '' : ''}`}>
      {/* Header */}
      {!isBlur && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              Revenue Intelligence
            </h2>
            <p className="text-slate-500 mt-1 font-medium">Real-time financial insights powered by LFG AI</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/automation/settings/details"
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Edit Configuration
            </a>
            <div className="bg-white/50 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">System Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <MetricCard
          title="Pipeline Value"
          value={safeFormat(metrics?.totalPipelineValue || 0)}
          change={metrics?.pipelineChange || 0}
          icon={DollarSign}
          color="blue"
          subtitle="Total potential revenue"
          isTrial={userPlan === 'trial' && !isBlur}
          isBlur={isBlur}
        />

        <MetricCard
          title="Revenue at Risk"
          value={safeFormat(metrics?.revenueAtRisk || 0)}
          change={metrics?.riskChange || 0}
          icon={AlertTriangle}
          color="orange"
          subtitle="Missed SLA impact"
          inverted
          isTrial={userPlan === 'trial' && !isBlur}
          isBlur={isBlur}
        />

        <MetricCard
          title="Recovery Success"
          value={safeFormat(metrics?.recoveredRevenue || 0)}
          change={metrics?.recoveryRate || 0}
          icon={TrendingUp}
          color="green"
          subtitle="Won from follow-ups"
          isTrial={userPlan === 'trial' && !isBlur}
          isBlur={isBlur}
        />

        <MetricCard
          title="Avg Opportunity"
          value={safeFormat(config.avgDealValue?.typical || 0)}
          icon={Target}
          color="purple"
          subtitle="Value per lead"
          isTrial={userPlan === 'trial' && !isBlur}
          isBlur={isBlur}
        />
      </div>

      {/* Strategic Insights & Growth */}
      {!isBlur && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
          <div className="lg:col-span-2">
            <ActionCenter tasks={tasks} />
          </div>
          <div>
            <AIInsightCard insights={metrics?.insights} />
          </div>
        </div>
      )}

      {/* Performance & Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
        <div className="lg:col-span-2">
          {/* Performance Insights */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
            {/* SLA Compliance */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white p-10 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Response Performance
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Service Level Agreement Tracking</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-slate-900">
                    {isBlur ? '92' : (metrics?.slaCompliance || 0)}%
                  </span>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">
                    {(metrics?.slaCompliance || 0) >= 80 ? 'Above Target' : 'Needs Improvement'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <SLAItem label="First Response" value={metrics?.firstResponseRate || 0} color="emerald" isBlur={isBlur} />
                <SLAItem label="Follow-up Chain" value={metrics?.followupRate || 0} color="orange" isBlur={isBlur} />
                <SLAItem label="Overall Compliance" value={metrics?.slaCompliance || 0} color="blue" isBlur={isBlur} />
              </div>
            </div>

            {/* Top Channels */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white p-10 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-10">
                <Zap className="w-5 h-5 text-blue-600" />
                Conversion Channels
              </h3>

              <div className="space-y-5">
                {config.sources && config.sources.length > 0 ? (
                  config.sources.map((source, idx) => {
                    const sourceStats = metrics?.sourceMetrics?.[source.name] || { totalValue: 0, converted: 0, count: 0 };
                    const conversionRate = sourceStats.count > 0 ? Math.round((sourceStats.converted / sourceStats.count) * 100) : 0;

                    return (
                      <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                            <span className="text-xs font-black text-slate-400">{idx + 1}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{source.name}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{conversionRate}% Conversion Rate</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900">{safeFormat(sourceStats.totalValue)}</p>
                          <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${sourceStats.totalValue > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {sourceStats.totalValue > 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                            {sourceStats.totalValue > 0 ? 'Active' : 'No Data'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <p>No lead sources configured.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Pulse */}
        <div className="lg:col-span-1">
          <ActivityPulse activities={activities} />
        </div>
      </div>
    </div>
  );
}

function ActionCenter({ tasks }) {
  return (
    <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-500/20 transition-colors duration-1000" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              Action Center
            </h3>
            <p className="text-slate-400 font-medium mt-1">High-priority items requiring your attention</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <span className="text-sm font-black">{tasks.length} URGENT</span>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.slice(0, 3).map((task, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/item">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover/item:scale-110 transition-transform">
                    {task.type === 'call' ? <Activity className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{task.title}</p>
                    <p className="text-sm text-slate-400 flex items-center gap-2">
                      {task.leadId ? (
                        <>
                          {task.leadId.name} • <span className="text-blue-400">{task.leadId.serviceInterest || 'Enquiry'}</span>
                        </>
                      ) : (
                        <span className="text-amber-400 font-black text-[10px] uppercase tracking-wider">Lead Record Deleted</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  disabled={!task.leadId}
                  className={`px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg ${!task.leadId
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-white text-slate-900 hover:bg-blue-50 shadow-black/20'
                    }`}
                >
                  {task.leadId ? 'ACTION NOW' : 'DISABLED'}
                </button>
              </div>
            ))
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-white/10 rounded-[30px]">
              <p className="text-slate-500 font-bold">Great job! No urgent tasks currently.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityPulse({ activities }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white p-10 shadow-[0_20px_40px_rgba(0,0,0,0.04)] h-full">
      <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-8">
        <Activity className="w-5 h-5 text-indigo-600" />
        Business Pulse
      </h3>

      <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {activities.length > 0 ? (
          activities.map((activity, idx) => (
            <div key={idx} className="relative pl-10 group">
              <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {activity.description}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(activity.performedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {activity.leadId && (
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {activity.leadId.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 py-10">Waiting for pulse...</p>
        )}
      </div>
    </div>
  );
}

function AIInsightCard({ insights }) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

      <div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-black tracking-tight mb-2">LFG AI Insight</h3>
        <p className="text-indigo-100 font-medium leading-relaxed">
          {insights?.[0] || "We're analyzing your lead flow patterns to provide growth opportunities."}
        </p>
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Recommended Action</p>
        <p className="text-xs font-bold leading-normal">
          Consider increasing follow-up frequency for WhatsApp leads to boost conversion by ~12%.
        </p>
      </div>
    </div>
  );
}

function SLAItem({ label, value, color, isBlur }) {
  const colors = {
    emerald: 'bg-emerald-500 shadow-emerald-200',
    orange: 'bg-orange-500 shadow-orange-200',
    blue: 'bg-blue-600 shadow-blue-200'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
        <span>{label}</span>
        <span className="text-slate-900">{isBlur ? '--' : value}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-1000 shadow-lg ${isBlur ? 'blur-[2px]' : ''}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon, color, subtitle, inverted = false, isTrial = false, isBlur = false }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-500/10',
      icon: 'bg-blue-600',
      shadow: 'shadow-blue-200/50',
      glow: 'after:bg-blue-400/20'
    },
    orange: {
      bg: 'bg-orange-500/10',
      icon: 'bg-orange-500',
      shadow: 'shadow-orange-200/50',
      glow: 'after:bg-orange-400/20'
    },
    green: {
      bg: 'bg-green-500/10',
      icon: 'bg-emerald-500',
      shadow: 'shadow-emerald-200/50',
      glow: 'after:bg-emerald-400/20'
    },
    purple: {
      bg: 'bg-purple-500/10',
      icon: 'bg-purple-600',
      shadow: 'shadow-purple-200/50',
      glow: 'after:bg-purple-400/20'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;
  const isPositive = inverted ? change < 0 : change > 0;
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`
      relative group overflow-hidden
      bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-xl
      rounded-[40px] border border-white/80
      p-10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.06)]
      hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.12)]
      hover:-translate-y-2
      transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
      ${isBlur ? 'blur-[6px] opacity-40 grayscale pointer-events-none' : ''}
    `}>
      {/* Background Glow */}
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${scheme.bg}`} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`
          w-14 h-14 rounded-2xl 
          ${scheme.icon} flex items-center justify-center 
          shadow-2xl ${scheme.shadow}
          relative overflow-hidden
          ${scheme.glow} after:absolute after:inset-0 after:blur-xl after:opacity-50
          group-hover:scale-110 transition-transform duration-500
        `}>
          <Icon className="w-7 h-7 text-white relative z-10" />
        </div>

        {change !== undefined && !isTrial && !isBlur && (
          <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-tighter
            ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}
          `}>
            <ChangeIcon className="w-3.5 h-3.5" />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">{title}</p>

        {isTrial ? (
          <div className="space-y-1">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50/50 inline-block px-2 py-0.5 rounded-md">Pro Data</p>
            <p className="text-3xl font-black text-slate-900/10 select-none blur-[6px]">₹850,000</p>
          </div>
        ) : (
          <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
            {value}
          </p>
        )}

        {subtitle && (
          <p className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${scheme.icon}`} />
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
