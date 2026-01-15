'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Phone,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  Flame,
  Snowflake,
  Wind
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import OnboardingFlow from './components/OnboardingFlow';

export default function AutomationDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [setupStatus, setSetupStatus] = useState({
    onboardingComplete: true
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
        setRecentLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'contacted' } : l));
        fetchDashboardData();
        toast.success('Lead marked as contacted', {
          icon: '✓',
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
          },
        });
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

      const leadsRes = await fetch(`/api/automation/leads?userId=${userId}`);
      const leadsData = await leadsRes.json();
      
      if (!leadsData.success) {
        throw new Error(leadsData.error);
      }

      const allLeads = leadsData.data;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newLeadsToday = allLeads.filter(lead => {
        const leadDate = new Date(lead.receivedAt);
        return leadDate >= today;
      }).length;

      const notContacted = allLeads.filter(lead => lead.status === 'new').length;
      const converted = allLeads.filter(lead => lead.status === 'converted').length;
      const lost = allLeads.filter(lead => lead.status === 'lost').length;

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

      const recentLeads = allLeads
        .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
        .slice(0, 8)
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
    
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getPriorityBadge = (lead) => {
    const hoursSince = Math.floor((new Date() - lead.receivedAt) / (1000 * 60 * 60));
    
    if (lead.status === 'new' && hoursSince < 2) {
      return { label: 'HOT', color: 'bg-red-500 text-white', icon: Flame };
    } else if (lead.status === 'new' && hoursSince < 24) {
      return { label: 'WARM', color: 'bg-orange-500 text-white', icon: Wind };
    } else if (lead.status === 'new') {
      return { label: 'COLD', color: 'bg-slate-400 text-white', icon: Snowflake };
    }
    return null;
  };

  const getRecommendedAction = (lead) => {
    const hoursSince = Math.floor((new Date() - lead.receivedAt) / (1000 * 60 * 60));
    
    if (lead.status === 'new' && hoursSince < 2) {
      return 'Call now';
    } else if (lead.status === 'new' && hoursSince < 24) {
      return 'Send WhatsApp';
    } else if (lead.status === 'new') {
      return 'Follow up required';
    } else if (lead.status === 'contacted') {
      return 'Auto-follow-up running';
    }
    return 'Review';
  };

  const getAIInsight = (lead) => {
    const hoursSince = Math.floor((new Date() - lead.receivedAt) / (1000 * 60 * 60));
    
    if (lead.status === 'new' && hoursSince < 1) {
      return 'Response within 5 min increases conversion by 400%';
    } else if (lead.status === 'new' && hoursSince < 2) {
      return 'Contact within 2h = 60% higher close rate';
    } else if (lead.status === 'new' && hoursSince < 24) {
      return 'Same-day contact = 7x more likely to convert';
    } else if (lead.status === 'new' && hoursSince >= 24) {
      return 'Risk: Conversion drops 80% after 24h';
    } else if (lead.status === 'contacted') {
      return 'Follow-up scheduled automatically';
    }
    return 'Review recommended';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const hotLeadsCount = recentLeads.filter(lead => {
    const hoursSince = Math.floor((new Date() - lead.receivedAt) / (1000 * 60 * 60));
    return lead.status === 'new' && hoursSince < 2;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      {showOnboarding && (
        <OnboardingFlow onComplete={() => {
          setShowOnboarding(false);
          checkOnboardingStatus();
        }} />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              {localStorage.getItem('userRole') === 'owner' ? 'Sales Command Center' : 'Your Dashboard'}
            </h1>
            {setupStatus.onboardingComplete && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-xs border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Live
              </div>
            )}
          </div>
          <p className="text-slate-500 text-sm">Never miss a lead. Close faster.</p>
        </div>

       

        {/* Action Cards - Insight-Driven with Numbers, Urgency, Consequence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-7">
          <button
            onClick={() => router.push('/automation/leads?filter=new')}
            className="bg-white rounded-lg p-5 border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all duration-150 text-left group shadow-sm"
          >
            <div className="flex items-start justify-between mb-3.5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                <Target className="w-5 h-5 text-white" />
              </div>
              <ArrowRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all duration-150" />
            </div>
            <div className="mb-2">
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-base font-semibold text-slate-900">Call High-Intent Leads</h3>
                <span className="text-lg font-bold text-indigo-600">{hotLeadsCount}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Leads received in last 2 hours</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-orange-600 font-medium">
              <Clock className="w-3 h-3" />
              <span>60% higher close rate if contacted now</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/automation/tasks')}
            className="bg-white rounded-lg p-5 border border-slate-200/80 hover:border-emerald-200 hover:shadow-md transition-all duration-150 text-left group shadow-sm"
          >
            <div className="flex items-start justify-between mb-3.5">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-150">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <ArrowRight className="w-4.5 h-4.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all duration-150" />
            </div>
            <div className="mb-2">
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-base font-semibold text-slate-900">Complete Follow-ups</h3>
                <span className="text-lg font-bold text-emerald-600">{stats.followUpsDueToday}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Tasks scheduled for today</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-red-600 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>Delayed follow-ups reduce conversion by 50%</span>
            </div>
          </button>
        </div>

        {/* Intelligent Leads Queue - Increased Density */}
        <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-200/60 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Lead Queue</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Prioritized by urgency and intent</p>
              </div>
              <button
                onClick={() => router.push('/automation/leads')}
                className="px-3.5 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
              >
                View All
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100/60">
            {recentLeads.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium text-sm mb-1">No leads yet</p>
                <p className="text-xs text-slate-400">New leads will appear here automatically</p>
              </div>
            ) : (
              recentLeads.map((lead) => {
                const priority = getPriorityBadge(lead);
                const action = getRecommendedAction(lead);
                const aiInsight = getAIInsight(lead);
                const PriorityIcon = priority?.icon;
                
                return (
                  <div
                    key={lead.id}
                    className="px-4 py-2.5 hover:bg-slate-50/50 transition-all duration-100 cursor-pointer group"
                    onClick={() => router.push(`/automation/leads/${lead.id}`)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Priority Badge */}
                        {priority && (
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${priority.color} text-[10px] font-bold shrink-0`}>
                            {PriorityIcon && <PriorityIcon className="w-2.5 h-2.5" />}
                            {priority.label}
                          </div>
                        )}

                        {/* Lead Info - Increased Density */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-semibold text-slate-900 truncate">{lead.name}</h3>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs text-slate-500 truncate">{lead.serviceInterest}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {getTimeSince(lead.receivedAt)}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate">{lead.source}</span>
                            <span className="text-slate-300">•</span>
                            {/* AI Insight Inline */}
                            <span className="text-indigo-600 font-medium italic truncate">
                              💡 {aiInsight}
                            </span>
                          </div>
                        </div>

                        {/* Recommended Action */}
                        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/80 rounded-md shrink-0">
                          <Zap className="w-3 h-3 text-slate-600" />
                          <span className="text-[11px] font-medium text-slate-700">{action}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <a 
                          href={`tel:${lead.phone}`}
                          onClick={() => markLeadAsContacted(lead.id)}
                          className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all duration-150 hover:scale-105"
                          title="Call Now"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button 
                          onClick={() => router.push(`/automation/leads/${lead.id}`)}
                          className="w-8 h-8 bg-slate-900 text-white rounded-md flex items-center justify-center hover:bg-slate-800 transition-all duration-150 opacity-0 group-hover:opacity-100"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
