'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Plus,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Users,
  MessageCircle,
  Zap,
  Flame,
  Wind,
  Snowflake,
  Target,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      const userId = localStorage.getItem('userid');
      if (!userId) {
        toast.error('Please login to continue');
        router.push('/user/register');
        return;
      }

      let url = `/api/automation/leads?userId=${userId}`;
      
      if (statusFilter !== 'all') {
        if (statusFilter === 'not-contacted') {
          url += '&status=new';
        } else {
          url += `&status=${statusFilter}`;
        }
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setLeads(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
      setLoading(false);
    }
  };

  const markAsContacted = async (leadId, e) => {
    e.stopPropagation();
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
        toast.success('Lead marked as contacted', {
          icon: '✓',
          style: {
            borderRadius: '12px',
            background: '#10b981',
            color: '#fff',
          },
        });
        fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const getTimeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getPriority = (lead) => {
    const hoursSince = Math.floor((new Date() - new Date(lead.receivedAt)) / (1000 * 60 * 60));
    
    if (lead.status === 'new' && hoursSince < 2) {
      return { 
        label: 'HOT', 
        color: 'bg-red-500 text-white', 
        icon: Flame,
        urgency: 'critical'
      };
    } else if (lead.status === 'new' && hoursSince < 24) {
      return { 
        label: 'WARM', 
        color: 'bg-orange-500 text-white', 
        icon: Wind,
        urgency: 'high'
      };
    } else if (lead.status === 'new') {
      return { 
        label: 'COLD', 
        color: 'bg-slate-400 text-white', 
        icon: Snowflake,
        urgency: 'medium'
      };
    } else if (lead.status === 'contacted' || lead.status === 'follow-up') {
      return { 
        label: 'ACTIVE', 
        color: 'bg-indigo-500 text-white', 
        icon: Target,
        urgency: 'low'
      };
    }
    return { 
      label: 'NEW', 
      color: 'bg-slate-500 text-white', 
      icon: Users,
      urgency: 'low'
    };
  };

  const getRecommendedAction = (lead) => {
    const hoursSince = Math.floor((new Date() - new Date(lead.receivedAt)) / (1000 * 60 * 60));
    
    if (lead.status === 'new' && hoursSince < 2) {
      return { text: 'Call immediately', color: 'text-red-600', icon: Phone };
    } else if (lead.status === 'new' && hoursSince < 24) {
      return { text: 'Contact today', color: 'text-orange-600', icon: MessageCircle };
    } else if (lead.status === 'new') {
      return { text: 'Follow up required', color: 'text-slate-600', icon: Zap };
    } else if (lead.status === 'contacted') {
      return { text: 'Schedule follow-up', color: 'text-indigo-600', icon: Clock };
    }
    return { text: 'Review', color: 'text-slate-500', icon: ArrowRight };
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.serviceInterest?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by priority (HOT > WARM > COLD > others)
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const aPriority = getPriority(a).urgency;
    const bPriority = getPriority(b).urgency;
    return priorityOrder[aPriority] - priorityOrder[bPriority];
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Leads</h1>
            <p className="text-xs text-slate-500">{sortedLeads.length} total</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-in Menu */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-200 ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Filters</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          {/* Mobile Filter Buttons */}
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Leads' },
              { value: 'new', label: 'New' },
              { value: 'not-contacted', label: 'Not Contacted' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'follow-up', label: 'Follow-up' },
              { value: 'converted', label: 'Converted' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium text-sm text-left transition-all ${
                  statusFilter === filter.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              router.push('/automation/leads/new');
              setMobileMenuOpen(false);
            }}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Lead
          </button>
          <button
            onClick={() => {
              router.push('/automation/leads/bulk');
              setMobileMenuOpen(false);
            }}
            className="w-full px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Bulk Upload
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">Leads</h1>
            <p className="text-sm text-slate-500">High-speed sales execution</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/automation/leads/bulk')}
              className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Bulk Upload
            </button>
            <button
              onClick={() => router.push('/automation/leads/new')}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg border border-slate-200/80 p-4 mb-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Desktop Status Filter */}
            <div className="hidden lg:flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'new', label: 'New' },
                { value: 'not-contacted', label: 'Not Contacted' },
                { value: 'contacted', label: 'Contacted' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3.5 py-2 rounded-lg font-medium text-xs transition-all ${
                    statusFilter === filter.value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leads List */}
        {sortedLeads.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200/80 p-12 text-center shadow-sm">
            <Users className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No leads found</h3>
            <p className="text-sm text-slate-500">
              {searchTerm ? 'Try adjusting your search' : 'New leads will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLeads.map((lead) => {
              const priority = getPriority(lead);
              const action = getRecommendedAction(lead);
              const PriorityIcon = priority.icon;
              const ActionIcon = action.icon;
              
              return (
                <div
                  key={lead._id}
                  className="bg-white rounded-lg border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all duration-150 cursor-pointer group shadow-sm overflow-hidden"
                  onClick={() => router.push(`/automation/leads/${lead._id}`)}
                >
                  <div className="p-4 lg:p-5">
                    <div className="flex items-start gap-4">
                      {/* Priority Badge */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${priority.color} text-[10px] font-bold shrink-0 h-fit`}>
                        <PriorityIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{priority.label}</span>
                      </div>

                      {/* Lead Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 mb-1 truncate">
                              {lead.name}
                            </h3>
                            <p className="text-sm text-slate-600 mb-2.5 truncate">
                              {lead.serviceInterest}
                            </p>
                            
                            {/* Contact Info */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 mb-2.5">
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" />
                                {lead.phone}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {getTimeSince(lead.receivedAt)}
                              </span>
                            </div>

                            {/* Recommended Action */}
                            <div className={`flex items-center gap-1.5 text-xs font-medium ${action.color}`}>
                              <ActionIcon className="w-3.5 h-3.5" />
                              <span>{action.text}</span>
                            </div>
                          </div>

                          {/* Desktop Arrow */}
                          <ArrowRight className="hidden lg:block w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                        </div>
                      </div>

                      {/* 1-Click Actions - Horizontal on Desktop */}
                      <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <a 
                          href={`tel:${lead.phone}`}
                          onClick={(e) => markAsContacted(lead._id, e)}
                          className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-all duration-150 hover:scale-105 shadow-sm"
                          title="Call Now"
                        >
                          <Phone className="w-4.5 h-4.5" />
                        </a>
                        <a 
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => markAsContacted(lead._id, e)}
                          className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white hover:bg-emerald-700 transition-all duration-150 hover:scale-105 shadow-sm"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4.5 h-4.5" />
                        </a>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/automation/leads/${lead._id}`);
                          }}
                          className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-slate-800 transition-all duration-150 hover:scale-105 shadow-sm"
                          title="View Details"
                        >
                          <ArrowRight className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
