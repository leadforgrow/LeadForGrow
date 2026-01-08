'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Phone,
  Eye,
  CheckCircle2,
  ArrowRight,
  Globe,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import OnboardingFlow from './components/OnboardingFlow';

export default function AutomationDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [setupStatus, setSetupStatus] = useState({
    onboardingComplete: true // Default to true to prevent flicker
  });

  const [stats, setStats] = useState({
    newLeadsToday: 0,
    notContacted: 0,
    followUpsDueToday: 0,
    converted: 0,
    lost: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/setup-status?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setSetupStatus(data.data);
        if (!data.data.onboardingComplete) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

  const markLeadAsContacted = async (leadId) => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status: 'contacted',
          performedBy: userId
        })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setRecentLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'contacted' } : l));
        // Refresh stats
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error marking lead as contacted:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const userId = localStorage.getItem('userid');
      if (!userId) {
        toast.error('Please login to continue');
        router.push('/user/register');
        return;
      }

      // Fetch leads
      const leadsRes = await fetch(`/api/automation/leads?userId=${userId}`);
      const leadsData = await leadsRes.json();
      
      if (!leadsData.success) {
        throw new Error(leadsData.error);
      }

      const allLeads = leadsData.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate stats
      const newLeadsToday = allLeads.filter(lead => {
        const leadDate = new Date(lead.receivedAt);
        return leadDate >= today;
      }).length;

      const notContacted = allLeads.filter(lead => lead.status === 'new').length;
      const converted = allLeads.filter(lead => lead.status === 'converted').length;
      const lost = allLeads.filter(lead => lead.status === 'lost').length;

      // Fetch tasks for today
      const tasksRes = await fetch(`/api/automation/tasks?userId=${userId}`);
      const tasksData = await tasksRes.json();
      const followUpsDueToday = tasksData.success ? tasksData.data.length : 0;

      setStats({
        newLeadsToday,
        notContacted,
        followUpsDueToday,
        converted,
        lost
      });

      // Get recent leads (last 5)
      const recentLeads = allLeads
        .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
        .slice(0, 5)
        .map(lead => ({
          ...lead,
          id: lead._id,
          receivedAt: new Date(lead.receivedAt)
        }));

      setRecentLeads(recentLeads);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard');
      setLoading(false);
    }
  };

  const getTimeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-900 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {showOnboarding && (
        <OnboardingFlow onComplete={() => {
          setShowOnboarding(false);
          checkOnboardingStatus();
        }} />
      )}

      {/* Setup Reminder Banner */}
      {!setupStatus.onboardingComplete && !showOnboarding && localStorage.getItem('userRole') === 'owner' && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">You're almost ready!</h2>
              <p className="text-orange-50">Connect where leads come from to go live.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowOnboarding(true)}
            className="px-8 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors"
          >
            Finish Setup
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            {localStorage.getItem('userRole') === 'owner' ? 'Your business at a glance' : 'Focus on your assigned work'}
          </p>
        </div>
        {setupStatus.onboardingComplete && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            SYSTEM LIVE
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* New Leads Today */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              TODAY
            </span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.newLeadsToday}</h3>
          <p className="text-sm text-slate-600 font-medium">
            {localStorage.getItem('userRole') === 'owner' ? 'New Leads Today' : 'Your New Leads Today'}
          </p>
        </div>

        {/* Not Contacted */}
        <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 bg-orange-50/30 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              ACTION NEEDED
            </span>
          </div>
          <h3 className="text-3xl font-bold text-orange-900 mb-1">{stats.notContacted}</h3>
          <p className="text-sm text-orange-700 font-medium">
            {localStorage.getItem('userRole') === 'owner' ? 'Leads Not Contacted' : 'Your Leads Not Contacted'}
          </p>
        </div>

        {/* Follow-ups Due */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              DUE TODAY
            </span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.followUpsDueToday}</h3>
          <p className="text-sm text-slate-600 font-medium">
            {localStorage.getItem('userRole') === 'owner' ? 'Follow-ups Due' : 'Your Follow-ups Due'}
          </p>
        </div>

        {/* Conversion Stats */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <h3 className="text-3xl font-bold text-emerald-600 mb-1">{stats.converted}</h3>
              <p className="text-sm text-slate-600 font-medium">Converted</p>
            </div>
            <div className="pb-1">
              <h3 className="text-2xl font-bold text-red-600 mb-1">{stats.lost}</h3>
              <p className="text-xs text-slate-500 font-medium">Lost</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => router.push('/automation/leads?filter=new')}
          className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 hover:shadow-2xl hover:shadow-indigo-200 transition-all group text-left"
        >
          <Eye className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold mb-2">View My Leads</h3>
          <p className="text-indigo-100 text-sm mb-4">See your assigned leads</p>
          <div className="flex items-center gap-2 text-sm font-bold">
            Open Leads <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => router.push('/automation/tasks')}
          className="bg-white border-2 border-purple-200 rounded-2xl p-6 hover:shadow-xl transition-all group text-left"
        >
          <CheckCircle2 className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">My Tasks</h3>
          <p className="text-slate-600 text-sm mb-4">Follow up with your leads</p>
          <div className="flex items-center gap-2 text-sm font-bold text-purple-600">
            View Tasks <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => router.push('/automation/leads?filter=not-contacted')}
          className="bg-white border-2 border-orange-200 rounded-2xl p-6 hover:shadow-xl transition-all group text-left"
        >
          <Phone className="w-8 h-8 text-orange-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Call Now</h3>
          <p className="text-slate-600 text-sm mb-4">Contact pending leads immediately</p>
          <div className="flex items-center gap-2 text-sm font-bold text-orange-600">
            Start Calling <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent Leads</h2>
              <p className="text-sm text-slate-600 mt-1">Latest enquiries received</p>
            </div>
            <button
              onClick={() => router.push('/automation/leads')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
            >
              View All
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {recentLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No leads yet</p>
              <p className="text-sm text-slate-400 mt-1">New leads will appear here</p>
            </div>
          ) : (
            recentLeads.map((lead) => (
              <div
                key={lead.id}
                className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer relative group ${
                  lead.status === 'new' ? 'bg-orange-50/20' : ''
                }`}
                onClick={() => router.push(`/automation/leads/${lead.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{lead.name}</h3>
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                        lead.status === 'new' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {lead.status === 'new' ? 'Action Needed' : lead.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-900 font-bold mb-3 flex items-center gap-2">
                       <span className="text-slate-400 font-medium">Interested in:</span> {lead.serviceInterest}
                    </p>

                    <div className="flex items-center gap-6 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Globe className="w-3.5 h-3.5" />
                        {lead.source}
                      </span>
                      <span className="flex items-center gap-1.5 text-orange-600 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {getTimeSince(lead.receivedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <a 
                      href={`tel:${lead.phone}`}
                      onClick={() => markLeadAsContacted(lead.id)}
                      className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                      title="Call Now"
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                    <a 
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markLeadAsContacted(lead.id)}
                      className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                    <button 
                      onClick={() => router.push(`/automation/leads/${lead.id}`)}
                      className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-sm"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
