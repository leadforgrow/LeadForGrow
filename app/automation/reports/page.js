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
  MessageCircle
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
    recentLeads: []
  });

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
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                period === option.value
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase">Total Leads</h3>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-2">{stats.totalLeads}</p>
          <p className="text-sm text-slate-500">in last {period} days</p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase">Avg Response</h3>
          </div>
          <p className="text-4xl font-bold text-slate-900 mb-2">{stats.avgResponseTimeHours}h</p>
          <p className="text-sm text-slate-500">average time to first contact</p>
        </div>

        {/* Converted */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase">Converted</h3>
          </div>
          <p className="text-4xl font-bold text-emerald-600 mb-2">{stats.converted}</p>
          <p className="text-sm text-emerald-600 font-bold">{stats.conversionRate}% conversion rate</p>
        </div>

        {/* Lost */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase">Lost</h3>
          </div>
          <p className="text-4xl font-bold text-red-600 mb-2">{stats.lost}</p>
          <p className="text-sm text-slate-500">{stats.notContactedCount} not contacted</p>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Top Lead Sources</h2>
        <div className="space-y-4">
          {stats.leadsBySource.map((item, index) => {
            const Icon = getSourceIcon(item.source);
            const percentage = Math.round((item.count / stats.totalLeads) * 100);
            
            return (
              <div key={item.source || index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getSourceColor(item.source)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-900 capitalize">{item.source}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-slate-900">{item.count}</span>
                    <span className="text-sm text-slate-500 font-bold w-12 text-right">{percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 print:border-none">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-bold text-slate-400 uppercase text-xs">Lead Name</th>
                <th className="pb-4 font-bold text-slate-400 uppercase text-xs">Status</th>
                <th className="pb-4 font-bold text-slate-400 uppercase text-xs">Service</th>
                <th className="pb-4 font-bold text-slate-400 uppercase text-xs">Activity Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.recentLeads && stats.recentLeads.length > 0 ? (
                stats.recentLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-bold text-slate-900">{lead.name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-[10px] font-black rounded-full uppercase ${
                        lead.status === 'converted' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-600 text-sm">{lead.serviceInterest || 'N/A'}</td>
                    <td className="py-4 text-slate-500 text-xs font-medium">
                      {new Date(lead.convertedAt || lead.lastContactedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400 italic">No recent activity found</td>
                </tr>
              )}
            </tbody>
          </table>
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
