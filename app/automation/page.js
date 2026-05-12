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
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Award,
  Timer,
  HelpCircle,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
  MessageSquare,
  RefreshCw,
  Phone,
  ClipboardList,
  BarChart3,
  Users,
  FileText,
  Send,
  BarChart2,
  Zap,
  Command,
  Shield,
  PieChart,
  Workflow,
  Compass,
  Layout,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Heading from '../components/ui/Heading';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

export default function RevenueIntelligenceDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [config, setConfig] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const rawRole = localStorage.getItem('userRole') || 'member';
    const userRole = rawRole.toLowerCase();

    if (!userRole.includes('owner') && !userRole.includes('admin')) {
      router.push('/automation/leads');
      return;
    }

    const plan = localStorage.getItem('userPlan') || 'free';
    setUserPlan(plan);
    fetchRevenueData(plan);
  }, [router]);

  const fetchRevenueData = async (plan) => {
    try {
      const userId = localStorage.getItem('userid');
      const [configRes, metricsRes, activitiesRes, tasksRes] = await Promise.all([
        fetch(`/api/business/revenue-config?userId=${userId}`, { cache: 'no-store' }),
        fetch(`/api/business/revenue-metric?userId=${userId}`, { cache: 'no-store' }),
        fetch(`/api/automation/activities?userId=${userId}&limit=10`, { cache: 'no-store' }),
        fetch(`/api/automation/tasks?userId=${userId}&filter=today`, { cache: 'no-store' })
      ]);

      const [configData, metricsData, activitiesData, tasksData] = await Promise.all([
        configRes.json(), metricsRes.json(), activitiesRes.json(), tasksRes.json()
      ]);

      if (configData.success) setConfig(configData.data);
      if (activitiesData.success) setActivities(activitiesData.data);
      if (tasksData.success) setTasks(tasksData.data);

      if (metricsData.success && metricsData.data) {
        let actualMetrics = metricsData.data;
        if (plan === 'trial' || plan === 'free') {
          actualMetrics = {
            ...actualMetrics,
            insights: actualMetrics.insights?.map(() => '🔒 Upgrade for AI Insights')
          };
        }
        setMetrics(actualMetrics);
      } else {
        setMetrics({
          totalPipelineValue: 0, revenueAtRisk: 0, recoveredRevenue: 0,
          pipelineChange: 0, riskChange: 0, recoveryRate: 0, slaCompliance: 0,
          firstResponseRate: 0, followupRate: 0, isProjected: false, insights: []
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('[RevDash] Fatal error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!config || !config.estimationAcknowledged) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-premium">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Initialize Revenue Intelligence</h1>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Configure your business metrics to enable real-time risk auditing and predictive forecasting.</p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/automation/settings/details')}
            className="shadow-indigo-200 shadow-lg"
          >
            Configure System
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardContent
      config={config}
      metrics={metrics}
      userPlan={userPlan}
      activities={activities}
      tasks={tasks}
    />
  );
}

function DashboardContent({ config, metrics, userPlan, activities, tasks }) {
  const formatCurrency = (val) => {
    const symbol = config?.avgDealValue?.currency === 'INR' ? '₹' : '$';
    return `${symbol}${parseFloat(val || 0).toLocaleString()}`;
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 bg-grid-slate min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Revenue OS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {config?.businessName || 'Command Center'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
            <RefreshCw className="w-3 h-3 text-slate-400 animate-spin-slow" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Sync: Just Now</span>
          </div>
          <div className="flex -space-x-2 mr-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                <Users className="w-3 h-3 text-slate-400" />
              </div>
            ))}
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <Button variant="outline" size="sm" className="bg-white" onClick={() => window.location.href = '/automation/settings/details'}>
            System
          </Button>
          <Button variant="primary" size="sm" className="shadow-slate-200 shadow-lg">
            Share
          </Button>
        </div>
      </div>

      {/* Main Intelligence Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Predictive Forecast (Dominant) */}
        <div className="lg:col-span-8">
          <PredictiveForecastCard metrics={metrics} />
        </div>

        {/* Right: Revenue Snapshot Grid (High Density) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            <MetricCard
              title="Pipeline"
              value={formatCurrency(metrics?.totalPipelineValue || 0)}
              change={metrics?.pipelineChange || 0}
              icon={Layers}
              color="indigo"
            />
            <MetricCard
              title="At Risk"
              value={formatCurrency(metrics?.revenueAtRisk || 0)}
              change={metrics?.riskChange || 0}
              icon={Shield}
              color="rose"
              inverted
            />
            <MetricCard
              title="Won Revenue"
              value={formatCurrency(metrics?.recoveredRevenue || 0)}
              change={metrics?.recoveryRate || 0}
              icon={CheckCircle2}
              color="emerald"
            />
            <MetricCard
              title="Recovery"
              value={`${metrics?.recoveryRate || 0}%`}
              icon={Workflow}
              color="blue"
            />
          </div>
          <ExecutiveReportCTA metrics={metrics} />
        </div>
      </div>

      {/* Actionable Intelligence Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueLeakCard metrics={metrics} />
        </div>
        <div className="lg:col-span-1">
          <AiCopilotCard metrics={metrics} />
        </div>
      </div>

      {/* Operational Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ActionCenter tasks={tasks} />
        </div>
        <div className="lg:col-span-1">
          <ActivityPulse activities={activities} />
        </div>
        <div className="lg:col-span-1">
          <SentimentPulseCard metrics={metrics} />
        </div>
      </div>
    </div>
  );
}

function ExecutiveReportCTA({ metrics }) {
  const [loading, setLoading] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  const generate = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setReportVisible(true);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group shadow-xl shadow-slate-200 flex flex-col h-full transition-all duration-500">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Layout className="w-16 h-16" />
      </div>

      <div className="relative z-10 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-base font-bold">Executive Summary</h3>
          <div className="px-2 py-1 bg-white/10 rounded-md border border-white/20">
            <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">System Health: 94%</span>
          </div>
        </div>

        {!reportVisible ? (
          <div className="space-y-4 mb-6 animate-in fade-in duration-500">
            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Pipeline velocity is up 12% YoY; conversion gap identified in mid-funnel WhatsApp sequences.
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Recovery efforts successfully recaptured <span className="text-emerald-400 font-bold">₹1.4L</span> in at-risk revenue this month.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-6 animate-in slide-in-from-top-2 duration-500 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Full Insights Generated</p>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "System identifies significant churn risk in organic leads from North region. Recommended immediate pivot to personalized WhatsApp follow-ups using the 'High Intent' template."
            </p>
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <p className="text-[10px] text-slate-300">Target Recovery: <span className="text-emerald-400 font-bold">₹2.8L</span></p>
              <p className="text-[10px] text-slate-300">Confidence: <span className="text-indigo-400 font-bold">89.4%</span></p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="relative z-10 w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn"
      >
        {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3 text-indigo-600 group-hover/btn:scale-110 transition-transform" />}
        {loading ? 'Preparing Board Deck...' : reportVisible ? 'Regenerate Report' : 'Generate Full Report'}
      </button>

      {/* Subtle background glow */}
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

function RevenueLeakCard({ metrics }) {
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const runAudit = async () => {
    setAuditing(true);
    try {
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics || {})
      });
      const data = await res.json();
      if (data.success) setAuditResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-premium h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue Audit</h3>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Asset Recovery Center</p>
          </div>
        </div>
        {!auditResult && (
          <button
            onClick={runAudit}
            disabled={auditing}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {auditing ? 'Scanning...' : 'Run Audit'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Leak Velocity</span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-slate-900">₹{(auditResult?.leakValue || 0).toLocaleString()}</span>
              <span className="text-[10px] font-bold text-rose-500 mb-1">/ mo</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] text-emerald-700 font-bold">Recoverable: 84% via AI Automation</span>
          </div>
        </div>

        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary Leak Vector</span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {auditResult?.mainLeakReason || "Analysis required to identify specific leak vectors in your current CRM flow."}
            </p>
          </div>
          <button className="text-indigo-600 text-[11px] font-bold flex items-center gap-1 mt-4 hover:translate-x-1 transition-transform">
            View Impact Analysis <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}


function ActionCenter({ tasks = [] }) {
  const urgentCount = (tasks || []).filter(t => t.priority === 'urgent' || (t.dueDate && new Date(t.dueDate) <= new Date())).length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-premium h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Priority Actions</h3>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Queue Management</p>
          </div>
        </div>
        {urgentCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
            {urgentCount} Priority
          </span>
        )}
      </div>

      <div className="space-y-2 flex-1">
        {tasks && tasks.length > 0 ? (
          tasks.slice(0, 5).map((task, idx) => (
            <div key={idx} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                {task.type === 'call' ? <Phone className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-indigo-900 transition-colors">
                  {task.title || task.description}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {task.leadId?.name || 'Unknown Lead'} • {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                </p>
              </div>
              <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-lg shadow-sm border border-slate-200">
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-xs text-slate-400 font-medium">All tasks cleared</p>
          </div>
        )}
      </div>
    </div>
  );
}


function ActivityPulse({ activities = [] }) {
  const getActivityIcon = (type) => {
    if (!type) return MessageSquare;
    if (type.includes('convert')) return Award;
    if (type.includes('follow')) return RefreshCw;
    if (type.includes('call')) return Phone;
    if (type.includes('status')) return ClipboardList;
    if (type.includes('schedule')) return Calendar;
    return Activity;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-premium h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Business Pulse</h3>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Operational Log</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {activities && activities.length > 0 ? (
          activities.slice(0, 6).map((activity, idx) => {
            const Icon = getActivityIcon(activity.description || activity.type);
            return (
              <div key={idx} className="flex gap-3 items-start relative">
                {idx !== activities.slice(0, 6).length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-[-16px] w-[1.5px] bg-slate-100" />
                )}
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 relative z-10">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[12px] font-medium text-slate-700 leading-snug">
                    {activity.description || activity.type}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {activity.performedAt ? new Date(activity.performedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
            <Activity className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-xs text-slate-400 font-medium">Listening for events...</p>
          </div>
        )}
      </div>
    </div>
  );
}



function PredictiveForecastCard({ metrics }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const runForecast = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics || {})
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (metrics) runForecast(); }, [metrics]);

  const months = ['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'];
  const values = [65, 78, 72, 85, 94, 110]; // Mock forecast data

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-premium h-full flex flex-col relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-grid-slate"></div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Revenue Forecast</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Monthly Projection • Q3-Q4</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Live Signal</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">94.2% Precision</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative min-h-[280px] z-10 flex flex-col">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Calculating Dynamics...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 relative mb-6">
              {/* SVG Bar Chart */}
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                  <linearGradient id="bar-grad-alt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid Lines */}
                {[0, 50, 100, 150].map(y => (
                  <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}

                {/* Bars */}
                {values.map((v, i) => {
                  const barWidth = 40;
                  const gap = 60;
                  const x = 50 + i * (barWidth + gap);
                  const h = v * 1.5;
                  const isProjected = i > 3;
                  
                  return (
                    <g key={i} className="group/bar">
                      <rect
                        x={x}
                        y={200 - h}
                        width={barWidth}
                        height={h}
                        rx="6"
                        fill={isProjected ? "url(#bar-grad-alt)" : "url(#bar-grad)"}
                        className="transition-all duration-500 group-hover/bar:brightness-110"
                      />
                      {isProjected && (
                        <rect
                          x={x}
                          y={200 - h}
                          width={barWidth}
                          height={h}
                          rx="6"
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="1"
                          strokeDasharray="4,2"
                        />
                      )}
                      {/* Tooltip placeholder on hover */}
                      <text
                        x={x + barWidth / 2}
                        y={190 - h}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-indigo-600 opacity-0 group-hover/bar:opacity-100 transition-opacity"
                      >
                        {v}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-8">
              {months.map((m, i) => (
                <div key={m} className="text-center">
                  <span className={`text-[10px] font-black tracking-widest ${i > 3 ? 'text-slate-300' : 'text-slate-500'}`}>
                    {m}
                  </span>
                  {i > 3 && <p className="text-[8px] font-bold text-indigo-400 mt-0.5">PROJ</p>}
                </div>
              ))}
            </div>

            <div className="mt-auto p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4 shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">AI Strategic Intelligence</p>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {data?.summary || "Projected breakout in Q4 (Oct) driven by current pipeline velocity. System recommends increasing ad-spend by 15% in late September to capture emerging market demand."}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SentimentPulseCard({ metrics }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics || {})
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (metrics) runAnalysis(); }, [metrics]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-premium h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Intent Analysis</h3>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Market Psychographics</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-100 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-[10px] text-slate-400 font-medium">Decoding intent...</p>
        </div>
      ) : data && data.distribution ? (
        <div className="flex-1 flex flex-col justify-between">
          <div className="mb-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Dominant Signal</span>
            <p className="text-sm font-bold text-slate-800">{data.overallVibe}</p>
          </div>

          <div className="space-y-4">
            {Object.entries(data.distribution).map(([key, val], idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-medium text-slate-600">{key}</span>
                  <span className="text-[11px] font-bold text-slate-900">{val}%</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 rounded-xl bg-violet-50 border border-violet-100">
            <p className="text-[11px] text-violet-900 leading-relaxed font-medium">
              {data.advice || "Leads showing strong purchase intent. Priority response recommended for WhatsApp channels."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
          <Compass className="w-8 h-8 text-slate-200 mb-2" />
          <p className="text-xs text-slate-400 font-medium">Sensor calibrating...</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon, color, inverted = false, isProjected = false }) {
  const isPositive = inverted ? change < 0 : change > 0;

  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100'
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-premium hover:border-slate-300 transition-all group flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colors[color] || colors.indigo}`}>
          <Icon className="w-4 h-4" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
            {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
          {isProjected && <Command className="w-2.5 h-2.5 text-indigo-400" />}
        </div>
        <div className="text-lg font-bold text-slate-900 tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function AiCopilotCard({ metrics }) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Operational. How can I assist with your revenue strategy today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', text: query };
    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, question: userMessage.text })
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'ai', text: data.answer }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', text: 'Engine offline. Please try again.' }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Connection lost.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 h-full flex flex-col shadow-inner">
      <div className="flex items-center gap-2 mb-4">
        <Command className="w-4 h-4 text-slate-600" />
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Revenue Interface</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 bg-white border border-slate-200 rounded-xl flex gap-1">
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Command..."
          disabled={loading}
          className="w-full bg-white border border-slate-200 text-slate-900 text-[12px] rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
        />
        <button type="submit" className="absolute right-2 top-2 p-1 text-slate-400 hover:text-indigo-600">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

