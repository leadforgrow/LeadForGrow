'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  Send
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ReportsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState('30');
  const [stats, setStats] = useState({
    totalLeads: 0,
    avgResponseTimeHours: 0,
    converted: 0,
    lost: 0,
    notContactedCount: 0,
    conversionRate: 0,
    leadsBySource: [],
    recentLeads: [],
    dailyTrends: [],
    teamPerformance: [],
    hourlyHeatmap: []
  });
  const [warmingEmail, setWarmingEmail] = useState('');
  const [warmingLoading, setWarmingLoading] = useState(false);

  useEffect(() => {
    const rawRole = localStorage.getItem('userRole') || 'member';
    const userRole = rawRole.toLowerCase();

    // Redirect if not authorized
    if (!userRole.includes('owner') && !userRole.includes('admin')) {
      router.push('/automation/leads');
      return;
    }
  }, [router]);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      const userId = localStorage.getItem('userid');
      if (!userId) {
        toast.error('Please login to continue');
        router.push('/user/register');
        return;
      }

      const res = await fetch(`/api/automation/reports?userId=${userId}&period=${period}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setStats(data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    }
  };

  // --- NEW: Growth Trend Chart Component (SVG Based) ---
  const GrowthTrendChart = ({ data }) => {
    if (!data || data.length === 0) return (
      <div className="h-64 flex items-center justify-center text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-3xl">
        Waiting for trend data...
      </div>
    );

    const maxLeads = Math.max(...data.map(d => d.leads), 10);
    const height = 200;
    const width = 800;
    const padding = 40;

    const points = data.map((d, i) => {
      const x = padding + (i * (width - padding * 2)) / (data.length - 1 || 1);
      const y = height - padding - (d.leads / maxLeads) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-xl">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + v * (height - padding * 2)}
              x2={width - padding}
              y2={padding + v * (height - padding * 2)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          {/* Area */}
          <polyline
            points={areaPoints}
            fill="url(#trendGradient)"
            className="transition-all duration-1000"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-1000"
          />

          {/* Data Points */}
          {data.map((d, i) => {
            const x = padding + (i * (width - padding * 2)) / (data.length - 1 || 1);
            const y = height - padding - (d.leads / maxLeads) * (height - padding * 2);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke="#4f46e5"
                strokeWidth="2"
                className="hover:r-6 cursor-pointer transition-all"
              >
                <title>{`${d._id}: ${d.leads} leads`}</title>
              </circle>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex justify-between px-10 mt-4">
          {data.length > 0 && (
            <>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(data[0]._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(data[data.length - 1]._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  const getSourceIcon = (source) => {
    const icons = {
      'website': Globe,
      'referral': Users,
      'ad': TrendingUp,
      'whatsapp': MessageCircle,
      'phone': Phone,
      'email': Mail
    };
    return icons[source] || Globe;
  };

  const getSourceColor = (source) => {
    const colors = {
      'website': 'bg-indigo-100 text-indigo-700',
      'referral': 'bg-purple-100 text-purple-700',
      'ad': 'bg-orange-100 text-orange-700',
      'whatsapp': 'bg-emerald-100 text-emerald-700',
      'phone': 'bg-blue-100 text-blue-700',
      'email': 'bg-pink-100 text-pink-700'
    };
    return colors[source] || 'bg-slate-100 text-slate-700';
  };

  // --- NEW: Team Performance Component ---
  const TeamLeaderboard = ({ data }) => (
    <div className="space-y-4">
      {data && data.length > 0 ? (
        data.sort((a, b) => (b.conversionRate || 0) - (a.conversionRate || 0)).map((member, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                {(member.name || 'U').charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 leading-tight">{member.name || 'Anonymous User'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.total || 0} Leads</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-bold text-indigo-600">
                    {member.avgResponseTime ? Math.round(member.avgResponseTime / 3600000) : '--'}h Avg Speed
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-900">{Math.round(member.conversionRate || 0)}%</p>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Close Rate</p>
            </div>
          </div>
        ))
      ) : (
        <div className="py-10 text-center text-slate-400 font-bold italic border-2 border-dashed border-slate-100 rounded-3xl">
          No team performance data yet
        </div>
      )}
    </div>
  );

  // --- NEW: Busiest Hours Heatmap ---
  const StaffingHeatmap = ({ data }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxCount = Math.max(...(data?.map(d => d.count) || []), 1);

    return (
      <div className="space-y-4 mt-2">
        <div className="grid grid-cols-8 gap-1">
          <div className="h-6" /> {/* Corner Spacer */}
          {[0, 4, 8, 12, 16, 20].map(h => (
            <div key={h} className="text-[9px] font-black text-slate-400 uppercase text-center col-span-1">
              {h}:00
            </div>
          ))}
        </div>

        {days.map((day, dIdx) => (
          <div key={day} className="grid grid-cols-8 gap-1 items-center">
            <div className="text-[10px] font-black text-slate-500 uppercase">{day}</div>
            <div className="col-span-7 flex gap-1">
              {Array.from({ length: 24 }).map((_, h) => {
                const hourData = data?.find(d => d._id.hour === h && d._id.day === dIdx + 1);
                const intensity = hourData ? hourData.count / maxCount : 0;
                return (
                  <div
                    key={h}
                    className="flex-1 h-4 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-pointer"
                    style={{
                      backgroundColor: intensity > 0
                        ? `rgba(79, 70, 229, ${0.1 + intensity * 0.9})`
                        : '#f8fafc'
                    }}
                    title={`${day} ${h}:00 - ${hourData?.count || 0} leads`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleWarmEmail = async () => {
    if (!warmingEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setWarmingLoading(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/reports/warm-email?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetEmail: warmingEmail })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setWarmingEmail('');
      } else {
        toast.error(data.error || 'Failed to send warming email');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setWarmingLoading(false);
    }
  };

  const FunnelStep = ({ label, value, subtext, colorClass, width }) => (
    <div className="relative mb-6 last:mb-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <span className="text-sm font-bold text-slate-900">{label}</span>
          <span className="ml-2 text-xs font-medium text-slate-500">{subtext}</span>
        </div>
        <span className="text-sm font-black text-slate-900 tabular-nums">{value}</span>
      </div>
      <div className="h-10 relative overflow-hidden rounded-xl bg-slate-100/50 border border-slate-200/50">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-xl opacity-90 shadow-sm ${colorClass}`}
          style={{ width: `${width}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports</h1>
          <p className="text-slate-600">Business insights at a glance</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {[
            { value: '7', label: '7 Days' },
            { value: '30', label: '30 Days' },
            { value: '90', label: '90 Days' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${period === option.value
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-600'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Leads */}
        <div className="group relative bg-white/60 backdrop-blur-xl rounded-[24px] p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-16 h-16 text-indigo-600" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100/50 shadow-inner">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Leads</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-black text-slate-900 tracking-tight">{stats.totalLeads}</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <p className="text-xs font-bold text-slate-400">Captured in last {period} days</p>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="group relative bg-white/60 backdrop-blur-xl rounded-[24px] p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-16 h-16 text-blue-600" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100/50 shadow-inner">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Avg Response</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-black text-slate-900 tracking-tight">{stats.avgResponseTimeHours}h</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <p className="text-xs font-bold text-slate-400">Speed to lead average</p>
          </div>
        </div>

        {/* Converted */}
        <div className="group relative bg-white/60 backdrop-blur-xl rounded-[24px] p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100/50 shadow-inner">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Converted</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-emerald-600 tracking-tight">{stats.converted}</p>
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg">{stats.conversionRate}%</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className="text-xs font-bold text-slate-400">Overall success rate</p>
          </div>
        </div>

        {/* Lost */}
        <div className="group relative bg-white/60 backdrop-blur-xl rounded-[24px] p-6 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(239,68,68,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown className="w-16 h-16 text-red-600" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100/50 shadow-inner">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Lost / Open</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-black text-red-600 tracking-tight">{stats.lost + stats.notContactedCount}</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <p className="text-xs font-bold text-slate-400">{stats.notContactedCount} leads pending contact</p>
          </div>
        </div>
      </div>

      {/* Growth Trends Section */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Growth Trends</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lead Volume Over Time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              Live Data
            </div>
          </div>
        </div>
        <GrowthTrendChart data={stats.dailyTrends} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Conversion Funnel */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Conversion Funnel</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider">
              {stats.conversionRate}% Efficiency
            </div>
          </div>
          <div className="max-w-md mx-auto">
            <FunnelStep
              label="Pending Leads"
              value={stats.totalLeads}
              subtext="Leads awaiting action"
              colorClass="bg-gradient-to-r from-indigo-500 to-indigo-600"
              width={100}
            />
            <FunnelStep
              label="Connected"
              value={stats.statsLeadsByStatus?.contacted || (stats.totalLeads - stats.notContactedCount)}
              subtext="Initial contact achieved"
              colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
              width={Math.max(15, ((stats.totalLeads - stats.notContactedCount) / (stats.totalLeads || 1)) * 100)}
            />
            <FunnelStep
              label="Finalized"
              value={stats.converted}
              subtext="Revenue deals closed"
              colorClass="bg-gradient-to-r from-emerald-500 to-emerald-600"
              width={Math.max(10, (stats.converted / (stats.totalLeads || 1)) * 100)}
            />
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h2 className="text-xl font-black text-slate-900 mb-10 tracking-tight">Top Lead Sources</h2>
          <div className="space-y-6">
            {stats.leadsBySource.map((item, index) => {
              const Icon = getSourceIcon(item.source);
              const percentage = Math.round((item.count / (stats.totalLeads || 1)) * 100);

              return (
                <div key={item.source || index} className="group">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-current/10 ${getSourceColor(item.source)} shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <span className="font-bold text-slate-800 capitalize text-sm">{item.source}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900">{item.count}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100/50 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.2)]"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="w-full h-full bg-gradient-to-r from-white/20 to-transparent" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Team Performance */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Team Performance</h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion Leaderboard</span>
          </div>
          <TeamLeaderboard data={stats.teamPerformance} />
        </div>

        {/* Staffing Heatmap */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Staffing Heatmap</h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Arrival Patterns</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">
            Identifies peak demand hours to optimize agent availability and minimize response lag.
          </p>
          <StaffingHeatmap data={stats.hourlyHeatmap} />
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] print:border-none">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Performance</h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 5 Activities</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100/50">
                <th className="pb-5 pl-2 font-black text-slate-400 uppercase text-[10px] tracking-widest">Lead Identity</th>
                <th className="pb-5 font-black text-slate-400 uppercase text-[10px] tracking-widest text-center">Outcome</th>
                <th className="pb-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">Interest Area</th>
                <th className="pb-5 pr-2 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Date Occurred</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {stats.recentLeads && stats.recentLeads.length > 0 ? (
                stats.recentLeads.map((lead) => (
                  <tr key={lead._id} className="group hover:bg-slate-50/80 transition-all duration-200">
                    <td className="py-5 pl-2">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{lead.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Lead</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${lead.status === 'converted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                          <span className={`w-1 h-1 rounded-full ${lead.status === 'converted' ? 'bg-emerald-600' : 'bg-blue-600'} animate-pulse`} />
                          {lead.status === 'converted' ? 'Finalized' :
                            lead.status === 'contacted' ? 'Connected' :
                              lead.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100/50 px-3 py-1 rounded-lg border border-slate-200/50">
                        {lead.serviceInterest || 'Consultation'}
                      </span>
                    </td>
                    <td className="py-5 pr-2 text-right">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-700">{new Date(lead.convertedAt || lead.lastContactedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(lead.convertedAt || lead.lastContactedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-slate-200" />
                      <span className="text-sm font-bold text-slate-400 italic">No recent activity found to display</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reputation Warmer */}
      <div className="bg-indigo-900 rounded-[32px] p-8 text-white mb-8 border border-indigo-800 shadow-2xl shadow-indigo-200/50 no-print">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-indigo-800 rounded-3xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-10 h-10 text-indigo-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Email Reputation Warmer</h2>
            <p className="text-indigo-200 mb-6 max-w-lg">
              Is your mail going to spam? Send a test email to your personal Gmail/Outlook, and mark it as
              <strong> "Not Spam"</strong> to help build your domain reputation.
            </p>
            <div className="flex gap-3 max-w-md">
              <input
                type="email"
                placeholder="Enter your personal email"
                value={warmingEmail}
                onChange={(e) => setWarmingEmail(e.target.value)}
                className="flex-1 bg-indigo-800/50 border border-indigo-700 rounded-xl px-4 py-3 text-white placeholder:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleWarmEmail}
                disabled={warmingLoading}
                className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {warmingLoading ? <div className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Export Data</h3>
        <p className="text-sm text-slate-600 mb-4">
          Download your lead data and reports for further analysis
        </p>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Export to CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold hover:border-indigo-600 transition-colors"
          >
            Export to PDF
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          nav, aside, header, .no-print, .no-print *, button, .bg-slate-50.rounded-2xl.p-6, .mb-8:has(.px-4.py-2) {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
          .p-8 {
            padding: 2rem !important;
          }
          .bg-white {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            margin-bottom: 2rem !important;
            page-break-inside: avoid;
          }
          h1 {
            color: #1e293b !important;
            margin-bottom: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
