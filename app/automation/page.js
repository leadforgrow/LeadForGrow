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

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      const userId = localStorage.getItem('userid');
      
      // Fetch revenue config
      const configRes = await fetch(`/api/business/revenue-config?userId=${userId}`);
      const configData = await configRes.json();
      
      // Fetch revenue metrics
      const metricsRes = await fetch(`/api/business/revenue-metric?userId=${userId}`);
      const metricsData = await metricsRes.json();
      
      if (configData.success) setConfig(configData.data);
      if (metricsData.success) setMetrics(metricsData.data);
      
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
        />

        {/* Recovered Revenue */}
        <MetricCard
          title="Recovered This Month"
          value={formatCurrency(metrics?.recoveredRevenue || 0)}
          change={metrics?.recoveryRate || 0}
          icon={TrendingUp}
          color="green"
          subtitle="From follow-ups"
        />

        {/* Avg Deal Value */}
        <MetricCard
          title="Avg Deal Value"
          value={formatCurrency(config.avgDealValue.typical)}
          icon={Target}
          color="purple"
          subtitle="Typical conversion"
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
            <span className="text-2xl font-bold text-slate-900">
              {metrics?.slaCompliance || 85}%
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">First Response</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${metrics?.firstResponseRate || 90}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 w-12 text-right">
                  {metrics?.firstResponseRate || 90}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Follow-up</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${metrics?.followupRate || 75}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 w-12 text-right">
                  {metrics?.followupRate || 75}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Overall</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${metrics?.slaCompliance || 85}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 w-12 text-right">
                  {metrics?.slaCompliance || 85}%
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
                    <p className="font-bold text-slate-900">
                      {formatCurrency(config.avgDealValue.typical * source.weight)}
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
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200 p-6">
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
                  <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                </div>
              )) || (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Your WhatsApp leads have 2x higher value than other sources - prioritize these first
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      15% of high-value leads ({formatCurrency(metrics?.highValueAtRisk || 0)}) are past SLA - urgent action needed
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Your follow-up rate improved by 23% this week, recovering an estimated {formatCurrency(metrics?.weeklyRecovery || 0)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon, color, subtitle, inverted = false }) {
  const colorMap = {
    blue: 'from-blue-500 to-indigo-600',
    orange: 'from-orange-500 to-red-600',
    green: 'from-green-500 to-emerald-600',
    purple: 'from-purple-500 to-indigo-600'
  };

  const bgMap = {
    blue: 'bg-blue-50',
    orange: 'bg-orange-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50'
  };

  const isPositive = inverted ? change < 0 : change > 0;
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <ChangeIcon className="w-3 h-3" />
            <span className="text-xs font-bold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-2">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}