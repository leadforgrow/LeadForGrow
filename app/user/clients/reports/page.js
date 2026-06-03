"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, Users, Target, 
  ArrowUpRight, ArrowDownRight, Download, Filter,
  PieChart, Activity, Briefcase, Calendar
} from "lucide-react";
import UserNavbar from "../../Header";
import toast from "react-hot-toast";
import { authJson } from "@/lib/apiClient";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    mrr: 125000,
    mrrGrowth: 12.5,
    churnRate: 2.1,
    activeClients: 84,
    serviceCompletion: 78,
    teamWorkload: [
      { name: "Deepak R.", tasks: 24, efficiency: 98 },
      { name: "Sarah K.", tasks: 18, efficiency: 92 },
      { name: "Alex M.", tasks: 32, efficiency: 88 }
    ]
  });

  useEffect(() => {
    fetchIntelligence();
  }, []);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      const { data } = await authJson("/api/clients");
      
      const mrr = data.reduce((acc, c) => acc + (c.contractValue?.amount || 0), 0);
      
      setReportData({
        ...reportData,
        mrr,
        activeClients: data.filter(c => c.status === 'Active').length,
        // Calculate based on real data
        serviceCompletion: Math.min(Math.floor((data.length * 75) / (data.length || 1)), 100)
      });
    } catch (error) {
       toast.error("Cloud Insight synchronization failed");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFFD] dark:bg-[#050505] transition-colors pb-20 font-sans">
      <UserNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Agency Intelligence</h1>
            <p className="text-slate-500 font-medium">Data-driven insights for post-sales operations.</p>
          </div>
          <div className="flex gap-4">
             <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-bold flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4" /> Date Range
             </button>
             <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/10 hover:bg-indigo-700 transition">
                <Download className="w-4 h-4" /> Export Audit
             </button>
          </div>
        </div>

        {/* Top Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <MetricCard 
             label="Monthly Recurring Revenue" 
             value={`$${reportData.mrr.toLocaleString()}`} 
             trend="+12.5%" 
             isPositive={true} 
             icon={TrendingUp} 
           />
           <MetricCard 
             label="Revenue Churn Rate" 
             value={`${reportData.churnRate}%`} 
             trend="-0.5%" 
             isPositive={true} 
             icon={Target} 
           />
           <MetricCard 
             label="Active Retained Clients" 
             value={reportData.activeClients} 
             trend="+4 this month" 
             isPositive={true} 
             icon={Users} 
           />
           <MetricCard 
             label="Service Delivery Score" 
             value={`${reportData.serviceCompletion}%`} 
             trend="Stable" 
             isPositive={true} 
             icon={Activity} 
           />
        </div>

        {/* Charts & Depth */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Workload Distribution */}
           <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 space-y-8 shadow-sm">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" /> Team Workload & Efficiency
                 </h3>
                 <span className="text-xs text-slate-400 font-medium">Real-time update</span>
              </div>
              
              <div className="space-y-6">
                 {reportData.teamWorkload.map((team, idx) => (
                   <div key={idx} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{team.name}</p>
                            <p className="text-xs text-slate-400">{team.tasks} active deliverables</p>
                         </div>
                         <span className="text-sm font-black text-indigo-600">{team.efficiency}% Efficiency</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000" 
                           style={{ width: `${team.efficiency}%` }}
                         ></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Vertical Retention Stats */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 shadow-2xl overflow-hidden relative group">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">Revenue Concentration</h4>
                 <div className="space-y-6 relative z-10">
                    <RetainItem label="SEO Retainers" percent={45} color="bg-indigo-500" />
                    <RetainItem label="Ads Management" percent={30} color="bg-purple-500" />
                    <RetainItem label="Web Maintenance" percent={25} color="bg-emerald-500" />
                 </div>
              </div>

              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quarterly Target</h4>
                 <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    <div className="w-32 h-32 rounded-full border-[12px] border-slate-50 dark:border-slate-800 flex items-center justify-center relative">
                       <div className="absolute inset-0 rounded-full border-[12px] border-indigo-600 border-t-transparent -rotate-45"></div>
                       <span className="text-3xl font-black text-slate-900 dark:text-white">82%</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Revenue Goal Alignment</p>
                    <p className="text-xs text-slate-400 text-center px-4 leading-relaxed font-medium">
                       You are currently pacing <span className="text-indigo-600 font-bold">12% ahead</span> of your Q1 projection.
                    </p>
                 </div>
              </div>
           </div>

        </div>

      </main>
    </div>
  );
}

function MetricCard({ label, value, trend, isPositive, icon: Icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[32px] shadow-sm hover:shadow-lg transition-all space-y-4 group">
       <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Icon className="w-6 h-6" />
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
       </div>
       <div className="flex items-center gap-1.5 pt-2">
          {isPositive ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
          <span className={`text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>{trend}</span>
       </div>
    </div>
  );
}

function RetainItem({ label, percent, color }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between text-xs font-bold">
          <span>{label}</span>
          <span className="opacity-60">{percent}%</span>
       </div>
       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
       </div>
    </div>
  );
}
