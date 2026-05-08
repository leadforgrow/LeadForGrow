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
  Sparkles,
  Users,
  Bot,
  FileText,
  Send,
  BarChart2
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

    // Redirect if not authorized
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
      console.log('[RevDash] Fetching data for userId:', userId, 'plan:', plan);

      // Fetch revenue config + metrics in parallel for speed
      const [configRes, metricsRes, activitiesRes, tasksRes] = await Promise.all([
        fetch(`/api/business/revenue-config?userId=${userId}`, { cache: 'no-store' }),
        fetch(`/api/business/revenue-metric?userId=${userId}`, { cache: 'no-store' }),
        fetch(`/api/automation/activities?userId=${userId}&limit=10`, { cache: 'no-store' }),
        fetch(`/api/automation/tasks?userId=${userId}&filter=today`, { cache: 'no-store' })
      ]);

      const [configData, metricsData, activitiesData, tasksData] = await Promise.all([
        configRes.json(), metricsRes.json(), activitiesRes.json(), tasksRes.json()
      ]);

      console.log('[RevDash] metricsData:', metricsData);
      console.log('[RevDash] configData:', configData);

      if (configData.success) setConfig(configData.data);
      if (activitiesData.success) setActivities(activitiesData.data);
      if (tasksData.success) setTasks(tasksData.data);

      if (metricsData.success && metricsData.data) {
        let actualMetrics = metricsData.data;
        // For trial/free users, insights are obscured but numbers shown
        if (plan === 'trial' || plan === 'free') {
          actualMetrics = {
            ...actualMetrics,
            insights: actualMetrics.insights?.map(() => 'ðŸ”’ Upgrade to see AI Insights')
          };
        }
        setMetrics(actualMetrics);
        console.log('[RevDash] Metrics set successfully:', actualMetrics);
      } else {
        // API failed (e.g. plan block, DB error) — use client-side fallback
        console.warn('[RevDash] Metrics API failed, using local fallback. Reason:', metricsData?.error);
        const dealValue = configData?.data?.avgDealValue?.typical || 14999;
        const fallback = {
          totalPipelineValue: 0,
          revenueAtRisk: 0,
          recoveredRevenue: 0,
          pipelineChange: 0,
          riskChange: 0,
          recoveryRate: 0,
          slaCompliance: 0,
          firstResponseRate: 0,
          followupRate: 0,
          isProjected: false,
          insights: [],
          totalLeads: 0, activeLeads: 0, convertedLeads: 0, lostLeads: 0
        };
        setMetrics(fallback);
      }

      setLoading(false);
    } catch (error) {
      console.error('[RevDash] Fatal fetch error:', error);
      // Even on complete failure — show sensible defaults so the page isn't broken
      setMetrics({
        totalPipelineValue: 0, revenueAtRisk: 0, recoveredRevenue: 0,
        pipelineChange: 0, riskChange: 0, recoveryRate: 0, slaCompliance: 0,
        firstResponseRate: 0, followupRate: 0, isProjected: false, insights: []
      });
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
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-slate-50/20 backdrop-blur-[2px]">
          <Card className="max-w-md w-full p-10 text-center shadow-xl border-slate-200/60 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                <Sparkles className="w-8 h-8 text-white fill-white/10" />
              </div>

              <Heading level={2} className="mb-3 text-slate-900">Unlock Revenue Intelligence</Heading>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed max-w-[280px] mx-auto">
                Transform your lead data into <span className="text-indigo-600 font-semibold">predictable revenue</span>. Configure your business metrics to see risk calculations.
              </p>

              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-md"
                onClick={() => router.push('/automation/settings/details')}
                icon={ArrowUpRight}
              >
                Start Configuration
              </Button>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Badge variant="success">Real-time Risk</Badge>
                <Badge variant="success">SLA Compliance</Badge>
                <Badge variant="success">Pipeline Value</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    const symbol = config?.avgDealValue?.currency === 'INR' ? '₹' : '$';
    return `${symbol}${parseFloat(value || 0).toLocaleString()}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <DashboardContent
      config={config}
      metrics={metrics}
      userPlan={userPlan}
      formatCurrency={formatCurrency}
      activities={activities}
      tasks={tasks}
      greeting={getGreeting()}
    />
  );
}

function DashboardContent({ config, metrics, userPlan, formatCurrency, activities, tasks, greeting, isBlur = false }) {
  const safeFormat = (val) => formatCurrency ? formatCurrency(val) : `₹${val.toLocaleString()}`;

  return (
    <div className={`space-y-8 px-8 py-10 ${isBlur ? '' : ''}`}>
      {/* Header */}
      {!isBlur && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="indigo" className="font-black">PRO</Badge>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {config?.businessName || 'Revenue'} Command Center
              </span>
            </div>
            <Heading level={1} className="flex items-center gap-3">
              {greeting}, {config?.businessName?.split(' ')[0] || 'Partner'} <span className="animate-bounce-slow">👋</span>
            </Heading>
            <p className="text-slate-500 mt-1 max-w-none">Here's your revenue performance and automated recovery overview for today.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-100 bg-emerald-50/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-tight">AI Active</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/automation/settings/details'}>
              System Config
            </Button>
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Pipeline Value"
          value={safeFormat(metrics?.totalPipelineValue || 0)}
          change={metrics?.pipelineChange || 0}
          icon={DollarSign}
          color="blue"
          subtitle="Total active pipeline"
          isTrial={userPlan === 'trial' && !isBlur}
          isBlur={isBlur}
          isProjected={metrics?.isProjected}
        />
        <MetricCard
          title="Revenue at Risk"
          value={safeFormat(metrics?.revenueAtRisk || 0)}
          change={metrics?.riskChange || 0}
          icon={AlertTriangle}
          color="orange"
          subtitle={`${metrics?.activeLeads || 0} leads need follow-up`}
          inverted
          isTrial={userPlan === 'trial' && !isBlur}
          isBlur={isBlur}
          isProjected={metrics?.isProjected}
        />
        <MetricCard
          title="Won Revenue"
          value={safeFormat(metrics?.recoveredRevenue || 0)}
          change={metrics?.recoveryRate || 0}
          icon={TrendingUp}
          color="green"
          subtitle={`${metrics?.wonLeads || metrics?.convertedLeads || 0} deals closed this month`}
          isTrial={userPlan === 'trial' && !isBlur}
          isBlur={isBlur}
          isProjected={metrics?.isProjected}
        />
        <MetricCard
          title="Avg Deal Value"
          value={safeFormat(config.avgDealValue?.typical || 0)}
          icon={Target}
          color="purple"
          subtitle="Configured per lead"
          isTrial={userPlan === 'trial' && !isBlur}
          isBlur={isBlur}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <RevenueLeakCard metrics={metrics} />
        </div>
        <div className="lg:col-span-2">
          <GrowthStrategistCard metrics={metrics} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PredictiveForecastCard metrics={metrics} />
        </div>
        <div className="lg:col-span-1">
          <SentimentPulseCard metrics={metrics} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <AiCopilotCard metrics={metrics} />
        </div>
        <div className="lg:col-span-1">
          <FullReportCard metrics={metrics} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ActionCenter tasks={tasks} />
        </div>
        <div className="lg:col-span-1">
          <ActivityPulse activities={activities} />
        </div>
      </div>
    </div>
  );
}

function RevenueLeakCard({ metrics }) {
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const runAudit = async () => {
    console.log("INITIALIZING AUDIT: METRICS=", metrics);
    setAuditing(true);
    try {
      // Logic to call Python backend /api/proxy-ai/audit
      const res = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics || {})
      });

      console.log("AUDIT RESPONSE STATUS:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Audit failed with status ${res.status}:`, errorText);
        alert(`AI Audit failed: ${res.status}. Check if the AI backend is running.`);
        return;
      }

      const data = await res.json();
      if (!data.success) {
        alert(`AI Audit Error: ${data.error || 'Unknown error'}`);
        return;
      }
      setAuditResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 border-t-2 border-t-red-300 p-7 h-full flex flex-col" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Revenue Leak Auditor</h3>
            <p className="text-xs text-slate-500 font-medium">Automatic pipeline scan and recovery</p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {!auditResult ? (
          <button
            onClick={runAudit}
            disabled={auditing}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {auditing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                Scanning pipeline...
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                Run Leak Audit
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
              <p className="text-[10px] font-medium text-red-500 uppercase tracking-wider mb-1">Estimated Monthly Leak</p>
              <p className="text-2xl font-bold text-red-700">₹{(auditResult.leakValue || 0).toLocaleString()}</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{auditResult.mainLeakReason}</p>
            {auditResult.recommendation && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">AI Recommendation</p>
                <p className="text-xs text-slate-700 leading-relaxed">{auditResult.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GrowthStrategistCard({ metrics }) {
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);

  const getStrategy = async () => {
    console.log("GETTING STRATEGY: METRICS=", metrics);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics || {})
      });

      console.log("STRATEGY RESPONSE STATUS:", res.status);

      if (!res.ok) {
        console.error(`Strategy failed: ${res.status}`);
        return;
      }

      const data = await res.json();
      setStrategy(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 border-t-2 border-t-blue-400 p-7 h-full flex flex-col" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Growth Strategist</h3>
            <p className="text-xs text-slate-500 font-medium">Personalized AI revenue blueprint</p>
          </div>
        </div>
        {!strategy && (
          <button
            onClick={getStrategy}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Generate
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
          <div className="w-8 h-8 border-[3px] border-slate-100 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs">Building your growth plan...</p>
        </div>
      ) : strategy && strategy.strategySteps ? (
        <div className="flex-1 flex flex-col gap-3 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
            {strategy.strategySteps.map((step, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mb-3">
                  {idx + 1}
                </div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1.5 leading-snug">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl mt-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-xs font-medium">{strategy.projectedGrowth}</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-start justify-start text-left p-10 border border-slate-100 rounded-[28px] bg-slate-50/30">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-slate-900 font-bold mb-2">Build your strategy</p>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Click "Generate" to build a personalised revenue blueprint based on your current lead flow.</p>
        </div>
      )}
    </div>
  );
}

function ActionCenter({ tasks = [] }) {
  const urgentCount = (tasks || []).filter(t => t.priority === 'urgent' || (t.dueDate && new Date(t.dueDate) <= new Date())).length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 border-t-2 border-t-amber-400 p-7" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Action Center</h3>
            <p className="text-xs text-slate-500 font-medium">High-priority engagement tasks</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-[10px] font-medium ${urgentCount > 0
          ? 'bg-rose-50 border-rose-100 text-rose-600'
          : 'bg-slate-50 border-slate-100 text-slate-500'
          }`}>
          {urgentCount > 0 ? `${urgentCount} overdue` : 'All clear'}
        </div>
      </div>

      <div className="space-y-2">
        {tasks && tasks.length > 0 ? (
          tasks.slice(0, 4).map((task, idx) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
            return (
              <div key={idx} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isOverdue ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-white border border-slate-200 text-slate-500'
                  }`}>
                  {task.type === 'call' ? <Activity className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{task.title || task.description || 'Follow-up Task'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.leadId?.name && (
                      <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{task.leadId.name}</span>
                    )}
                    {isOverdue && <span className="text-[10px] font-medium text-rose-500">Overdue</span>}
                    {task.dueDate && !isOverdue && (
                      <span className="text-[10px] text-slate-400">{new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    )}
                  </div>
                </div>
                <button
                  disabled={!task.leadId}
                  onClick={() => task.leadId && window.open(`/automation/leads/${task.leadId._id || task.leadId}`, '_blank')}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${!task.leadId ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : isOverdue ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                >
                  {task.leadId ? 'View' : '—'}
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-left bg-slate-50/30 border border-slate-100 rounded-[24px] px-8 flex flex-col items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-900 font-bold">All caught up</p>
              <p className="text-slate-500 text-sm mt-1">There are no pending high-priority tasks for today.</p>
            </div>
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
    return Sparkles;
  };

  const activityCount = activities?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 border-t-2 border-t-indigo-400 p-7 h-full flex flex-col" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-indigo-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Business Pulse</h3>
            <p className="text-xs text-slate-500 font-medium">Real-time automation events</p>
          </div>
        </div>
        {activityCount > 0 && (
          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            {activityCount} events
          </span>
        )}
      </div>

      <div className="flex-1 relative">
        {activityCount > 0 ? (
          <>
            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
            {activities.slice(0, 8).map((activity, idx) => {
              const Icon = getActivityIcon(activity.description || activity.type);
              return (
                <div key={idx} className="relative pl-10 py-2.5 group">
                  <div className="absolute left-0 top-2.5 w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center z-10 group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all duration-300">
                    <Icon className="w-4 h-4 text-indigo-600 group-hover:text-white transition-colors" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm text-slate-700 leading-snug">
                    {activity.description || activity.type || 'Activity recorded'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400">
                      {activity.performedAt ? new Date(activity.performedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                    {activity.leadId?.name && (
                      <span className="text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">{activity.leadId.name}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="h-full min-h-[180px] flex flex-col items-start justify-start text-left gap-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-800 font-bold">Pulse inactive</p>
              <p className="text-slate-500 text-sm mt-1">Real-time activity will appear once your first leads start flowing.</p>
            </div>
          </div>
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
          <Sparkles className="w-6 h-6 text-white" />
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

function PredictiveForecastCard({ metrics }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const runForecast = async () => {
    console.log("[Forecast] Triggering with metrics:", metrics);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics || {})
      });
      console.log("[Forecast] Status:", res.status);
      if (!res.ok) {
        console.error("[Forecast] API Fail:", await res.text());
        return;
      }
      const json = await res.json();
      console.log("[Forecast] Data received:", json);
      setData(json);
    } catch (err) { console.error("[Forecast] Error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (metrics) runForecast(); }, [metrics]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 border-t-2 border-t-emerald-400 p-7 h-full" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">AI Revenue Projection</h3>
            <p className="text-xs text-slate-500 font-medium">6-Month Predictive Modeling</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-700 text-[10px] font-medium">92% confidence</span>
        </div>
      </div>

      {loading ? (
        <div className="h-52 flex flex-col items-center justify-center gap-3">
          <div className="flex gap-1 items-end h-10">
            {[40, 65, 55, 80, 70, 95].map((h, i) => (
              <div key={i} className="w-6 bg-emerald-200 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <p className="text-slate-400 text-xs">Processing projections...</p>
        </div>
      ) : data && data.forecast ? (
        <div className="animate-in fade-in duration-700">
          {/* Chart */}
          <div className="flex items-end gap-2 mb-3" style={{ height: '160px' }}>
            {data.forecast.map((f, i) => {
              const maxVal = Math.max(...data.forecast.map(x => x.value || 0));
              const pct = maxVal > 0 ? Math.max(8, Math.round((f.value / maxVal) * 100)) : 20;
              const monthColors = ['bg-emerald-300', 'bg-emerald-400', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-500', 'bg-emerald-600'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full group/bar">
                  <div
                    className={`w-full ${monthColors[i]} rounded-t-lg transition-all duration-700 relative cursor-pointer hover:opacity-80`}
                    style={{ height: `${pct}%` }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded font-medium pointer-events-none whitespace-nowrap transition-all z-10">
                      ₹{Math.round(f.value || 0).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">M{i + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-100 pt-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Target className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">{data.summary}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-52 flex flex-col items-center justify-end gap-2 border-b border-slate-100 pb-4 mb-4">
          {/* Skeleton chart */}
          <div className="flex items-end gap-2 w-full" style={{ height: '120px' }}>
            {[40, 65, 55, 80, 70, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                <div className="w-full bg-slate-100 rounded-t-lg" style={{ height: `${h}%` }} />
                <span className="text-[9px] text-slate-300">M{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-3">Computing 6-month trajectory...</p>
        </div>
      )}
    </div>
  );
}

function SentimentPulseCard({ metrics }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const runPulse = async () => {
    console.log("[Sentiment] Triggering with metrics:", metrics);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics || {})
      });
      console.log("[Sentiment] Status:", res.status);
      if (!res.ok) {
        console.error("[Sentiment] API Fail:", await res.text());
        return;
      }
      const json = await res.json();
      console.log("[Sentiment] Data received:", json);
      setData(json);
    } catch (err) { console.error("[Sentiment] Error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (metrics) runPulse(); }, [metrics]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-7 h-full flex flex-col" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Activity className="w-5 h-5 text-indigo-600" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Market Sentiment</h3>
          <p className="text-xs text-slate-500 font-medium">Lead Psychological Analysis</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs">Analysing sentiment...</p>
        </div>
      ) : data && data.distribution ? (
        <div className="flex-1 flex flex-col justify-between gap-5">
          <div>
            <p className="text-xs text-slate-500 mb-1">Overall Signal</p>
            <p className="text-base font-semibold text-slate-900">{data.overallVibe}</p>
          </div>
          <div className="space-y-3">
            {Object.entries(data.distribution).map(([key, val], idx) => {
              const barColors = ['bg-indigo-500', 'bg-blue-400', 'bg-slate-300', 'bg-slate-200'];
              return (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-600">{key}</span>
                    <span className="text-xs font-medium text-slate-700">{val}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColors[idx] || 'bg-indigo-400'} rounded-full transition-all duration-700`} style={{ width: `${val}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {data.advice && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-[10px] font-medium text-indigo-500 uppercase tracking-wider mb-1">AI Insight</p>
              <p className="text-xs text-indigo-900 leading-relaxed">{data.advice}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-slate-400 text-sm">Calibrating sensor...</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon, color, subtitle, inverted = false, isTrial = false, isBlur = false, isProjected = false }) {
  const isPositive = inverted ? change < 0 : change > 0;

  return (
    <Card
      className={`relative group hover:border-slate-300 transition-all duration-200 ${isBlur ? 'blur-[6px] opacity-40 grayscale pointer-events-none' : ''}`}
      padding="p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
          <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </div>

        {change !== undefined && !isTrial && !isBlur && (
          <Badge variant={isPositive ? 'success' : 'error'} className="font-black">
            {isPositive ? '+' : ''}{change}%
          </Badge>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>

        {isTrial ? (
          <p className="text-xl font-bold text-slate-200 select-none">••••••</p>
        ) : (
          <div className="flex items-baseline gap-2">
            <Heading level={3} className="text-xl text-slate-900 leading-none">{value}</Heading>
            {isProjected && (
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">AI Est.</span>
            )}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5 truncate">
          <span className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
          {subtitle}
        </p>
      )}
    </Card>
  );
}

function AiCopilotCard({ metrics }) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Hello! I am your Revenue Intelligence Copilot. How can we optimize your pipeline today?' }
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
        setChatHistory(prev => [...prev, { role: 'ai', text: 'Error: Could not reach the AI Engine.' }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Error connecting to bridge.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-7 h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Bot className="w-5 h-5" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">AI Copilot</h3>
          <p className="text-xs text-slate-500 font-medium">Chat with your Revenue Intelligence Engine</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 bg-slate-50/50 rounded-xl p-4 border border-slate-100 min-h-[250px] max-h-[250px] flex flex-col gap-4">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20' 
                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text.split('\n').map((line, idx) => (
                <span key={idx} className="block mb-1">{line}</span>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="relative mt-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me anything about your revenue..."
          disabled={loading}
          className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium disabled:opacity-60 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 shadow-sm shadow-blue-600/20 disabled:shadow-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function FullReportCard({ metrics }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/full-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics || {})
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      } else {
        alert("Failed to generate report.");
      }
    } catch (err) {
      alert("Error reaching AI Engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-7 h-full flex flex-col relative overflow-hidden shadow-xl shadow-slate-900/20">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/5">
          <FileText className="w-5 h-5" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">Executive Report</h3>
          <p className="text-xs text-slate-400 font-medium tracking-wide">(Beta) AI Generated</p>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex flex-col">
        {!report ? (
          <div className="flex flex-col items-center justify-center flex-1 py-8 text-center group">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-slate-800 transition-all duration-300">
              <BarChart2 className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-2">Automated Board Report</h4>
            <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mb-6">Instantly compile a deep-dive analysis of current pipelines and 6-month growth strategies.</p>
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full max-w-[220px] py-3 rounded-xl text-sm font-bold transition-all bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col animate-in fade-in duration-500">
            <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 overflow-y-auto max-h-[220px] text-xs leading-relaxed text-slate-300 custom-scrollbar">
              {report.split('\n').map((line, idx) => {
                if(line.startsWith('##') || line.startsWith('#')) return <h4 key={idx} className="text-white font-bold mt-4 mb-2 text-sm">{line.replace(/#/g, '').trim()}</h4>;
                if(line.startsWith('-')) return <li key={idx} className="ml-3 mt-1 text-slate-300 list-disc">{line.substring(1).trim()}</li>;
                return <p key={idx} className="mt-1">{line}</p>;
              })}
            </div>
            <button 
              onClick={() => setReport(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/50"
            >
              Close Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
