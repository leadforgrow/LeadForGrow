'use client';
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers,
  Shield,
  Plus,
  ArrowRight,
  MoreHorizontal,
  Loader2,
  Activity,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AgencyDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  
  useEffect(() => {
    fetchSummary();
  }, []);
  
  const fetchSummary = async () => {
    try {
      const userId = localStorage.getItem('userid');
      
      const [usageRes, clientsRes, invoicesRes, statsRes] = await Promise.all([
        fetch('/api/agency/usage', { headers: { 'x-user-id': userId } }),
        fetch('/api/agency/clients', { headers: { 'x-user-id': userId } }),
        fetch('/api/agency/invoices', { headers: { 'x-user-id': userId } }),
        fetch('/api/agency/reports/stats', { headers: { 'x-user-id': userId } })
      ]);
      
      const usageData = await usageRes.json();
      const clientsData = await clientsRes.json();
      const invoicesData = await invoicesRes.json();
      const statsData = await statsRes.json();
      
      setSummary({
        usage: {
          ...usageData.usage,
          leadsUsed: statsData.stats?.totalLeads || usageData.usage?.leadsUsed || 0
        },
        limits: usageData.limits || {},
        agency: usageData.agency || {},
        clientsCount: clientsData.total || 0,
        invoicesCount: invoicesData.total || 0,
        recentClients: clientsData.clients?.slice(0, 5) || [],
        stats: statsData.stats || {}
      });

      // Mock recent activity based on leads and clients
      const mockActivity = [
        ...(statsData.recentLeads || []).map(l => ({
           id: l._id,
           client: l.clientName,
           action: `Lead Captured: ${l.name}`,
           date: new Date(l.receivedAt).toLocaleDateString(),
           status: l.status
        })),
        ...(clientsData.clients || []).slice(0, 3).map(c => ({
           id: c._id,
           client: c.clientName,
           action: 'New Client Registered',
           date: new Date(c.createdAt).toLocaleDateString(),
           status: 'active'
        }))
      ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
      
      setActivity(mockActivity);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to update dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-[13px] text-slate-500 font-medium">Initializing Control Center...</p>
      </div>
    );
  }

  const KPICard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-white border border-slate-200 p-5 rounded-xl h-[110px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
         <Icon className="w-4 h-4 text-slate-400" />
         {trend && (
            <span className={`text-[11px] font-bold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
         )}
      </div>
      <div>
         <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">{title}</p>
         <h3 className="text-[20px] font-bold text-slate-900 leading-none">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-slate-900">Agency Overview</h1>
          <p className="text-[13px] text-slate-500 mt-1">Status active for {summary.agency.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/agency/reports" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">View Reports</Link>
          <button 
             onClick={() => window.location.href='/agency/clients'} 
             className="px-4 py-2 bg-slate-900 text-white text-[13px] font-bold rounded-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            Add Client
          </button>
        </div>
      </div>

      {/* KPI Row (Row layout preferred) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Active Clients" value={summary.clientsCount} icon={Users} />
        <KPICard title="Leads This Month" value={summary.stats.leadsThisMonth || 0} icon={TrendingUp} />
        <KPICard title="Revenue (Invoiced)" value={`₹${(summary.stats.revenueTracked || 0).toLocaleString()}`} icon={FileText} />
        <KPICard title="Conversion %" value={summary.stats.conversionRate || '0%'} icon={Activity} />
      </div>

      {/* Usage Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-8">
         <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Clients</span>
              <span className="text-[12px] font-bold text-slate-700">{summary.clientsCount} / {summary.limits.maxClients}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600" style={{ width: `${(summary.clientsCount / summary.limits.maxClients) * 100}%` }} />
            </div>
         </div>
         <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Leads</span>
              <span className="text-[12px] font-bold text-slate-700">{summary.usage.leadsUsed} / {summary.limits.maxLeadsPerMonth}</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500" style={{ width: `${(summary.usage.leadsUsed / summary.limits.maxLeadsPerMonth) * 100}%` }} />
            </div>
         </div>
         <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Team Seats</span>
              <span className="text-[12px] font-bold text-slate-700">3 / 5</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
               <div className="h-full bg-slate-400" style={{ width: `60%` }} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         {/* Recent Activity Table */}
         <div className="lg:col-span-2 space-y-4">
            <h2 className="text-[14px] font-medium text-slate-900 uppercase tracking-wider">Recent Activity</h2>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                     <tr>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {activity.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-6 py-4 text-[13px] font-bold text-slate-900">{item.client}</td>
                           <td className="px-6 py-4 text-[13px] text-slate-600">{item.action}</td>
                           <td className="px-6 py-4 text-[13px] text-slate-400">{item.date}</td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                 item.status === 'converted' || item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                              }`}>
                                 {item.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                     {activity.length === 0 && (
                        <tr><td colSpan="4" className="px-6 py-12 text-center text-[13px] text-slate-400 italic">No recent pulses detected.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Shortcuts & Status */}
         <div className="space-y-8">
            <div className="space-y-4">
               <h2 className="text-[14px] font-medium text-slate-900 uppercase tracking-wider">Quick Actions</h2>
               <div className="grid grid-cols-2 gap-3">
                  {[
                     { label: 'Clients', icon: Users, href: '/agency/clients' },
                     { label: 'Invoices', icon: FileText, href: '/agency/invoices' },
                     { label: 'Reports', icon: TrendingUp, href: '/agency/reports' },
                     { label: 'Automation', icon: Sparkles, href: '/agency/automation' }
                  ].map((action, i) => (
                    <Link key={i} href={action.href} className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                       <action.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                       <span className="text-[12px] font-medium text-slate-600 group-hover:text-slate-900">{action.label}</span>
                    </Link>
                  ))}
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
               <h3 className="text-[14px] font-medium text-slate-900 flex items-center justify-between">
                 System Status
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               </h3>
               <div className="space-y-3">
                  {[
                    { label: 'Capture API', status: 'Healthy', color: 'emerald' },
                    { label: 'Email Relay', status: 'Healthy', color: 'emerald' },
                    { label: 'Billing Engine', status: 'Active', color: 'indigo' }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[12px] text-slate-500">{s.label}</span>
                      <span className={`text-[10px] font-bold text-${s.color}-600 bg-${s.color}-50 px-2 py-0.5 rounded uppercase tracking-tighter`}>{s.status}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
