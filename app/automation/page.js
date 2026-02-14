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

      if (configData.success) setConfig(configData.data);
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
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-200 p-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0 shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Unlock Revenue Intelligence</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Configure your business metrics to see real-time revenue insights, risk calculations, and recovery tracking.
            </p>
            <a
              href="/automation/settings/details"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Set Up Now
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    const symbol = config.avgDealValue.currency === 'INR' ? '₹' : '$';
    return `${symbol}${parseFloat(value || 0).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Revenue Intelligence
          </h2>
          <p className="text-slate-600 mt-1">Real-time insights powered by your business metrics</p>
          {userPlan === 'trial' && (
            <p className="text-blue-600 text-sm font-bold mt-2 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Free Trial: You can capture up to 200 leads
            </p>
          )}
        </div>
        <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-bold text-green-700">Active</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pipeline Value */}
        <MetricCard
          title="Pipeline Value"
          value={formatCurrency(metrics?.totalPipelineValue || 0)}
          change={metrics?.pipelineChange || 0}
          icon={DollarSign}
          color="blue"
          subtitle="Total potential revenue"
          isTrial={userPlan === 'trial'}
        />

        {/* Revenue at Risk */}
        <MetricCard
          title="Revenue at Risk"
          value={formatCurrency(metrics?.revenueAtRisk || 0)}
          change={metrics?.riskChange || 0}
          icon={AlertTriangle}
          color="orange"
          subtitle="Missed SLA leads"
          inverted
          isTrial={userPlan === 'trial'}
        />

        {/* Recovered Revenue */}
        <MetricCard
          title="Recovered This Month"
          value={formatCurrency(metrics?.recoveredRevenue || 0)}
          change={metrics?.recoveryRate || 0}
          icon={TrendingUp}
          color="green"
          subtitle="From follow-ups"
          isTrial={userPlan === 'trial'}
        />

        {/* Avg Deal Value */}
        <MetricCard
          title="Avg Deal Value"
          value={formatCurrency(config.avgDealValue.typical)}
          icon={Target}
          color="purple"
          subtitle="Typical conversion"
          isTrial={userPlan === 'trial'}
        />
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Performance */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              SLA Performance
            </h3>
            {userPlan === 'trial' ? (
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">RESTRICTED</span>
            ) : (
              <span className="text-2xl font-bold text-slate-900">
                {metrics?.slaCompliance || 85}%
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">First Response</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-green-500 rounded-full transition-all duration-500 ${userPlan === 'trial' ? 'blur-[3px]' : ''}`}
                    style={{ width: `${metrics?.firstResponseRate || 90}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 w-12 text-right">
                  {userPlan === 'trial' ? '---' : `${metrics?.firstResponseRate || 90}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Follow-up</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-orange-500 rounded-full transition-all duration-500 ${userPlan === 'trial' ? 'blur-[3px]' : ''}`}
                    style={{ width: `${metrics?.followupRate || 75}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 w-12 text-right">
                  {userPlan === 'trial' ? '---' : `${metrics?.followupRate || 75}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Overall</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-blue-500 rounded-full transition-all duration-500 ${userPlan === 'trial' ? 'blur-[3px]' : ''}`}
                    style={{ width: `${metrics?.slaCompliance || 85}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 w-12 text-right">
                  {userPlan === 'trial' ? '---' : `${metrics?.slaCompliance || 85}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Sources by Value */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Top Sources by Value
          </h3>

          <div className="space-y-4">
            {config.sources
              .sort((a, b) => b.weight - a.weight)
              .slice(0, 3)
              .map((source, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{source.name}</p>
                      <p className="text-xs text-slate-500">
                        {source.avgConversion}% avg conversion
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-slate-900 ${userPlan === 'trial' ? 'blur-[3px]' : ''}`}>
                      {userPlan === 'trial' ? '₹---' : formatCurrency(config.avgDealValue.typical * source.weight)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {Math.round(source.weight * 100)}% weight
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Insights & Alerts */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200 p-6 relative overflow-hidden">
        {userPlan === 'trial' && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="bg-white/90 px-6 py-3 rounded-2xl shadow-xl border border-amber-200">
              <p className="text-amber-800 font-bold text-lg">Can not see in free trial</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-md">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 mb-3 text-lg">Smart Insights</h4>
            <div className="space-y-3">
              {metrics?.insights?.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                  <p className="text-sm text-slate-700 leading-relaxed filter blur-[2px] select-none">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon, color, subtitle, inverted = false, isTrial = false }) {
  const colorMap = {
    blue: 'from-blue-500 to-indigo-600',
    orange: 'from-orange-500 to-red-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-indigo-600'
  };


  const isPositive = inverted ? change < 0 : change > 0;
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            } ${isTrial ? 'blur-[4px] opacity-30 select-none' : ''}`}>
            <ChangeIcon className="w-3 h-3" />
            <span className="text-xs font-bold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-2">{title}</h3>
        {isTrial ? (
          <div className="space-y-1">
            <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg inline-block mb-1">Locked in Trial</p>
            <p className="text-2xl font-black text-slate-900/10 select-none blur-[6px]">₹99,999</p>
          </div>
        ) : (
          <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}