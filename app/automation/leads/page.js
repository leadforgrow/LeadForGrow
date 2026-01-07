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
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');

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

      // Build query params
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

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-indigo-100 text-indigo-700',
      'contacted': 'bg-blue-100 text-blue-700',
      'follow-up': 'bg-purple-100 text-purple-700',
      'converted': 'bg-emerald-100 text-emerald-700',
      'lost': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': 'bg-red-500',
      'high': 'bg-orange-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-slate-400'
    };
    return colors[priority] || 'bg-slate-400';
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.serviceInterest?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-900 font-medium">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Leads</h1>
          <p className="text-slate-600">Manage all your customer enquiries</p>
        </div>
        <button
          onClick={() => router.push('/automation/leads/new')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
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
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  statusFilter === filter.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
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
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No leads found</h3>
            <p className="text-slate-500">
              {searchTerm ? 'Try adjusting your search' : 'New leads will appear here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <div
                key={lead._id}
                className={`p-6 hover:bg-slate-50 transition-all cursor-pointer group border-l-4 ${
                  lead.status === 'converted' ? 'bg-emerald-50/50 border-emerald-500' : 'border-transparent'
                }`}
                onClick={() => router.push(`/automation/leads/${lead._id}`)}
              >
                <div className="flex items-start gap-6">
                  {/* Priority Indicator */}
                  <div className={`w-1 h-20 rounded-full ${getPriorityColor(lead.priority)} flex-shrink-0`}></div>

                  {/* Lead Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{lead.name}</h3>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-900 font-medium mb-2">
                          {lead.serviceInterest}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 font-medium">{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700">{lead.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <span className="text-slate-500">
                        Source: <span className="font-bold text-slate-700">{lead.source}</span>
                      </span>
                      <span className="text-slate-500">
                        Received: <span className="font-bold text-orange-600">{getTimeSince(lead.receivedAt)}</span>
                      </span>
                      {lead.lastContactedAt && (
                        <span className="text-slate-500">
                          Last contact: <span className="font-bold text-slate-700">{getTimeSince(lead.lastContactedAt)}</span>
                        </span>
                      )}
                      {lead.assignedTo && (
                        <span className="text-slate-500">
                          Assigned to: <span className="font-bold text-indigo-600">{lead.assignedTo.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
