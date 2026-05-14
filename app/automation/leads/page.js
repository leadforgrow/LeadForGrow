'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MoreVertical, 
  CheckSquare, 
  Square, 
  Mail, 
  Phone, 
  Clock, 
  Calendar, 
  UserPlus, 
  HelpCircle, 
  Activity, 
  Layout, 
  Columns, 
  Download, 
  Filter,
  Users,
  Timer,
  ArrowRight,
  MessageCircle,
  RefreshCw,
  Target,
  TrendingUp,
  Award,
  AlertTriangle,
  Info,
  Trash2,
  MessageSquare,
  Instagram,
  Facebook,
  XCircle
} from 'lucide-react';
import IntelligenceIcon from '@/app/components/ui/IntelligenceIcon';
import { toast } from 'react-hot-toast';
import { computeLeadIntelligence, aggregateSourceStats } from '@/lib/leadIntelligence';
import Heading from '@/app/components/ui/Heading';

export default function EnterpriseLeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');
  const [sortField, setSortField] = useState('intelligence');
  const [sortDirection, setSortDirection] = useState('desc');
  const [downloading, setDownloading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [viewMode, setViewMode] = useState('detailed');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [userRole, setUserRole] = useState('TEAM_MEMBER');
  const [activeAssignDropdown, setActiveAssignDropdown] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'ads', 'organic'
  const [templates, setTemplates] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkTemplateMenu, setShowBulkTemplateMenu] = useState(false);
  const [activeTemplateLead, setActiveTemplateLead] = useState(null);

  const fetchTeam = async () => {
    try {
      const uId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/team?userId=${uId}`);
      const data = await res.json();
      if (data.success) setTeamMembers(data.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const computeUserRole = () => {
    const role = localStorage.getItem('userRole') || 'TEAM_MEMBER';
    setUserRole(role.toLowerCase());
  };

  const sourceStats = useMemo(() => {
    return aggregateSourceStats(leads);
  }, [leads]);

  const intelligentLeads = useMemo(() => {
    return leads.map(lead => computeLeadIntelligence(lead, leads, sourceStats[lead.source]));
  }, [leads, sourceStats]);

  useEffect(() => {
    fetchLeads();
    fetchTeam();
    fetchTemplates();
    computeUserRole();
    const interval = setInterval(fetchLeads, 30000);

    // Click away to close dropdown
    const handleClickAway = (e) => {
      if (activeAssignDropdown && !e.target.closest('.assign-trigger') && !e.target.closest('.assign-dropdown')) {
        setActiveAssignDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickAway);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [statusFilter, activeAssignDropdown]);

  const handleAssignLead = async (leadId, newAssigneeId) => {
    try {
      const uId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/leads/${leadId}?userId=${uId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: newAssigneeId,
          performedBy: uId
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Lead re-assigned');
        setActiveAssignDropdown(null);
        fetchLeads();
      }
    } catch (error) {
      toast.error('Failed to re-assign');
    }
  };

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

      const eventId = searchParams.get('eventId');
      if (eventId) {
        url += `&eventId=${eventId}`;
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

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/automation/templates?userId=${localStorage.getItem('userid')}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.manual || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const renderMessageFromTemplate = (template, lead) => {
    if (!template) return '';
    return template.replace(/\{\{(.*?)\}\}/g, (match, field) => {
      const fieldName = field.trim();
      if (fieldName === 'name') return lead.name;
      if (fieldName === 'serviceInterest') return lead.serviceInterest || 'our services';
      return match;
    });
  };

  const handleSendTemplate = async (template, lead) => {
    if (!lead) return;
    const msg = renderMessageFromTemplate(template.body, lead);
    const encodedMessage = encodeURIComponent(msg);
    const phone = lead.phone.replace(/\D/g, '');

    if (template.channel === 'whatsapp') {
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
    } else if (template.channel === 'email') {
      window.open(`mailto:${lead.email}?body=${encodedMessage}`, '_blank');
    }

    markAsContacted(lead._id, { stopPropagation: () => { } });
    setActiveTemplateLead(null);
  };

  const handleBulkSendTemplate = async (template) => {
    const leadsToSend = leads.filter(l => selectedLeads.includes(l._id));

    for (const lead of leadsToSend) {
      const msg = renderMessageFromTemplate(template.body, lead);
      const encodedMessage = encodeURIComponent(msg);
      const phone = lead.phone.replace(/\D/g, '');

      if (template.channel === 'whatsapp') {
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
      } else if (template.channel === 'email') {
        window.open(`mailto:${lead.email}?body=${encodedMessage}`, '_blank');
      }
    }

    toast.success(`Opening ${leadsToSend.length} ${template.channel} draft(s)`);
    setSelectedLeads([]);
    setShowBulkTemplateMenu(false);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${selectedLeads.length} leads?`)) return;

    const tid = toast.loading(`Deleting ${selectedLeads.length} leads...`);
    try {
      const userId = localStorage.getItem('userid');
      let successCount = 0;

      for (const leadId of selectedLeads) {
        const res = await fetch(`/api/automation/leads/${leadId}?userId=${userId}`, {
          method: 'DELETE'
        });
        if (res.ok) successCount++;
      }

      toast.success(`Deleted ${successCount} leads`, { id: tid });
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      toast.error('Bulk delete failed', { id: tid });
    }
  };

  const initiateCall = async (lead, e) => {
    if (e) e.stopPropagation();

    if (!lead.phone) {
      toast.error('Lead has no phone number');
      return;
    }

    const tid = toast.loading(`Initiating call to ${lead.name}...`);
    try {
      const bId = localStorage.getItem('businessId');
      const uId = localStorage.getItem('userid');

      const res = await fetch('/api/automation/calls/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: uId,
          businessId: bId,
          leadId: lead._id,
          leadPhone: lead.phone
        })
      });

      const result = await res.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent('lfg-initiate-call', { detail: result.data }));
        toast.dismiss(tid);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Call Initiation Error:', error);
      toast.error(error.message || 'Failed to start call', { id: tid });
    }
  };

  const markAsContacted = async (leadId, e) => {
    e.stopPropagation();
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/leads/${leadId}?userId=${userId}`, {
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
        toast.success('Lead marked as contacted');
        fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const deleteLead = async (leadId, e) => {
    e.stopPropagation();
    if (!window.confirm('ARE YOU SURE? This will permanently delete the lead AND all its history (activities, tasks, messages) from the database.')) {
      return;
    }

    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/leads/${leadId}?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Lead permanently deleted');
        fetchLeads();
      } else {
        toast.error(data.error || 'Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Connection error while deleting lead');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'intelligence' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortDirection === 'asc' ?
      <ChevronUp className="w-3.5 h-3.5 text-indigo-600" /> :
      <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />;
  };

  const filteredLeads = intelligentLeads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.serviceInterest?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSource = 
      sourceFilter === 'all' || 
      (sourceFilter === 'ads' && (lead.source === 'instagram_ad' || lead.source === 'facebook_ad' || lead.source === 'meta_ads' || lead.source?.includes('_ad') || lead.source?.includes('instagram') || lead.source?.includes('facebook'))) ||
      (sourceFilter === 'organic' && (lead.source !== 'instagram_ad' && lead.source !== 'facebook_ad' && lead.source !== 'meta_ads' && !lead.source?.includes('_ad') && !lead.source?.includes('instagram') && !lead.source?.includes('facebook')));

    return matchesSearch && matchesSource;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortField === 'intelligence') {
      const aScore = a.intelligence.nextAction.urgency === 'critical' ? 5 :
        a.intelligence.nextAction.urgency === 'high' ? 4 :
          a.intelligence.nextAction.urgency === 'medium' ? 3 : 2;
      const bScore = b.intelligence.nextAction.urgency === 'critical' ? 5 :
        b.intelligence.nextAction.urgency === 'high' ? 4 :
          b.intelligence.nextAction.urgency === 'medium' ? 3 : 2;
      return sortDirection === 'desc' ? bScore - aScore : aScore - bScore;
    }

    if (sortField === 'leadAge') {
      const aAge = a.intelligence.leadAge.ageInMinutes;
      const bAge = b.intelligence.leadAge.ageInMinutes;
      return sortDirection === 'desc' ? bAge - aAge : aAge - bAge;
    }

    if (sortField === 'engagement') {
      const aScore = a.intelligence.engagementScore.score;
      const bScore = b.intelligence.engagementScore.score;
      return sortDirection === 'desc' ? bScore - aScore : aScore - bScore;
    }

    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'receivedAt') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (sortField === 'assignedTo') {
      aVal = a.assignedTo?.email || '';
      bVal = b.assignedTo?.email || '';
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const stats = useMemo(() => {
    const critical = sortedLeads.filter(l => l.intelligence.nextAction.urgency === 'critical').length;
    const slaBreached = sortedLeads.filter(l => l.intelligence.slaStatus.breached).length;
    const highEngagement = sortedLeads.filter(l => l.intelligence.engagementScore.level === 'High').length;
    const avgEngagement = sortedLeads.reduce((acc, l) => acc + l.intelligence.engagementScore.score, 0) / sortedLeads.length || 0;

    return { critical, slaBreached, highEngagement, avgEngagement };
  }, [sortedLeads]);

  const downloadExcel = async () => {
    try {
      setDownloading(true);
      setShowDownloadMenu(false);
      const userId = localStorage.getItem('userid');
      const res = await fetch('/api/automation/leads/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, leads: sortedLeads, filter: statusFilter })
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Excel file downloaded');
    } catch (error) {
      toast.error('Failed to download Excel file');
    } finally {
      setDownloading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setDownloading(true);
      setShowDownloadMenu(false);
      const userId = localStorage.getItem('userid');
      const res = await fetch('/api/automation/leads/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, leads: sortedLeads, filter: statusFilter })
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF file downloaded');
    } catch (error) {
      toast.error('Failed to download PDF file');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-8 py-10">
        {/* Compact Header */}
        <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Lead Management</h1>
              <p className="text-xs text-slate-500 font-medium">{leads.length} active leads in pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <button
                onClick={fetchLeads}
                className="px-3 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  disabled={downloading || sortedLeads.length === 0}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>

                {showDownloadMenu && !downloading && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)} />
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                      <button onClick={downloadExcel} className="w-full px-3 py-2 text-left hover:bg-slate-50 text-sm text-slate-700">Excel</button>
                      <button onClick={downloadPDF} className="w-full px-3 py-2 text-left hover:bg-slate-50 text-sm text-slate-700">PDF</button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => router.push('/automation/leads/bulk')}
                className="px-3 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition-colors"
              >
                Bulk Upload
              </button>
              <button
                onClick={() => router.push('/automation/leads/new')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
            </div>
          </div>

          {/* Compact Stats - Minimal Design */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Immediate Rescue</span>
                <span className="text-xl font-bold text-red-600">
                  {sortedLeads.filter(l => l.intelligence.nextAction.urgency === 'critical').length}
                </span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">SLA Breach</span>
                <span className="text-xl font-bold text-orange-600">{stats.slaBreached}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Handshake OK</span>
                <span className="text-xl font-bold text-emerald-600">
                  {sortedLeads.filter(l => l.metadata?.handshakeSent).length}
                </span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">High Engage</span>
                <span className="text-xl font-bold text-indigo-600">{stats.highEngagement}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Avg Quality</span>
                <span className="text-xl font-bold text-slate-900">{stats.avgEngagement.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex flex-col gap-4 w-full">
                {/* Source Tabs - NEW */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
                  <button
                    onClick={() => setSourceFilter('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sourceFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    All Leads
                  </button>
                  <button
                    onClick={() => setSourceFilter('ads')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${sourceFilter === 'ads' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    Meta Ads
                  </button>
                  <button
                    onClick={() => setSourceFilter('organic')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sourceFilter === 'organic' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Website & Organic
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                    />
                  </div>

                  <div className="flex gap-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'new', label: 'Pending' },
                      { value: 'contacted', label: 'Connected' },
                      { value: 'follow-up', label: 'In Progress' },
                      { value: 'converted', label: 'Finalized' }
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setStatusFilter(filter.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === filter.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGuide(true)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="View Intelligence Guide"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Enterprise Table - Flat Design */}
        {sortedLeads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[32px] p-16 text-left">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <Heading level={2} className="mb-2">No leads found</Heading>
            <p className="text-slate-500 max-w-md mb-8">
              {searchTerm ? 'Try adjusting your search criteria or filters to find what you are looking for.' : 'New leads will automatically appear here as soon as they are captured by your active flows.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-indigo-600 font-bold hover:underline text-sm"
              >
                Clear Search →
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full border-collapse" style={{ minWidth: 'max-content' }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {/* Sticky Left */}
                    <th className="sticky left-0 z-20 bg-slate-50 px-4 py-2.5 text-left border-r border-slate-200">
                      <button
                        onClick={() => {
                          if (selectedLeads.length === sortedLeads.length) {
                            setSelectedLeads([]);
                          } else {
                            setSelectedLeads(sortedLeads.map(l => l._id));
                          }
                        }}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                      >
                        {selectedLeads.length === sortedLeads.length ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="sticky left-[52px] z-20 bg-slate-50 px-4 py-2.5 text-left border-r border-slate-200">
                      <button onClick={() => handleSort('leadAge')} className="flex items-center gap-1 hover:text-slate-900 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                        Age <SortIcon field="leadAge" />
                      </button>
                    </th>

                    {/* Scrollable */}
                    <th className="px-4 py-2.5 text-left">
                      <button onClick={() => handleSort('intelligence')} className="flex items-center gap-1 hover:text-slate-900 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                        Next Action <SortIcon field="intelligence" />
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-left">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-slate-900 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                        Lead Name <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                      Contact
                    </th>
                    {viewMode === 'detailed' && (
                      <>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          SLA
                        </th>
                        <th className="px-4 py-2.5 text-left">
                          <button onClick={() => handleSort('engagement')} className="flex items-center gap-1 hover:text-slate-900 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                            Engagement <SortIcon field="engagement" />
                          </button>
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Source
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">
                          Owner
                        </th>
                      </>
                    )}

                    {/* Sticky Right */}
                    <th className="sticky right-0 z-20 bg-slate-50 px-4 py-2.5 text-center text-xs font-semibold text-slate-600 uppercase border-l border-slate-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeads.map((lead, index) => {
                    const intel = lead.intelligence;
                    const isHovered = hoveredRow === lead._id;

                    return (
                      <tr
                        key={lead._id}
                        onMouseEnter={() => setHoveredRow(lead._id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        className="group border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer h-14"
                        onClick={() => router.push(`/automation/leads/${lead._id}`)}
                      >
                        {/* # */}
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-4 py-3 border-r border-slate-100 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedLeads.includes(lead._id)) {
                                setSelectedLeads(selectedLeads.filter(id => id !== lead._id));
                              } else {
                                setSelectedLeads([...selectedLeads, lead._id]);
                              }
                            }}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            {selectedLeads.includes(lead._id) ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        </td>

                        {/* Lead Age - Simple Badge */}
                        <td className="sticky left-[52px] z-10 bg-white group-hover:bg-slate-50 px-4 py-3 border-r border-slate-100">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className={`text-xs font-semibold ${intel.leadAge.classification === 'fresh' ? 'text-emerald-600' :
                              intel.leadAge.classification === 'aging' ? 'text-orange-600' :
                                intel.leadAge.classification === 'at-risk' ? 'text-red-600' :
                                  'text-slate-500'
                              }`}>
                              {intel.leadAge.displayText}
                            </span>
                          </div>
                        </td>

                        {/* Next Action - ONLY PILL (Single Decision Signal) */}
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${intel.nextAction.urgency === 'critical' ? 'bg-red-600 text-white' :
                            intel.nextAction.urgency === 'high' ? 'bg-orange-600 text-white' :
                              intel.nextAction.urgency === 'medium' ? 'bg-indigo-600 text-white' :
                                'bg-slate-600 text-white'
                            } whitespace-nowrap shadow-sm`}>
                            <IntelligenceIcon name={intel.nextAction.icon} className="w-3 h-3 text-white" strokeWidth={3} />
                            {intel.nextAction.action}
                          </div>
                        </td>

                        {/* Lead Name - PRIMARY VISUAL WEIGHT */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 truncate max-w-[200px] whitespace-nowrap">
                              {lead.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                lead.status === 'contacted' ? 'bg-indigo-100 text-indigo-700' :
                                  lead.status === 'follow-up' ? 'bg-purple-100 text-purple-700' :
                                    lead.status === 'converted' ? 'bg-emerald-100 text-emerald-700' :
                                      'bg-slate-100 text-slate-700'
                                }`}>
                                {lead.status === 'new' ? 'Pending' :
                                  lead.status === 'contacted' ? 'Connected' :
                                    lead.status === 'follow-up' ? 'In Progress' :
                                      lead.status === 'converted' ? 'Finalized' :
                                        lead.status}
                              </span>
                              {lead.metadata?.handshakeSent && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 uppercase">
                                  <Activity className="w-2 h-2" /> Handshake Sent
                                </span>
                              )}
                              {lead.serviceInterest && (
                                <span className="text-[10px] text-slate-500 truncate max-w-[150px] whitespace-nowrap">
                                  {lead.serviceInterest}
                                </span>
                              )}
                              {lead.eventId && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-2.5 h-2.5 text-indigo-500" />
                                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded uppercase tracking-tight">
                                    {lead.eventId.name || 'Event Session'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact - Clean Layout */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="whitespace-nowrap">{lead.phone}</span>
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[180px]">{lead.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {viewMode === 'detailed' && (
                          <>
                            {/* SLA - Icon + Text (No Pill) */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Timer className={`w-3.5 h-3.5 ${intel.slaStatus.breached ? 'text-red-600' : 'text-emerald-600'}`} />
                                <span className={`text-xs font-medium ${intel.slaStatus.breached ? 'text-red-600' : 'text-slate-600'} whitespace-nowrap`}>
                                  {intel.slaStatus.message}
                                </span>
                              </div>
                            </td>

                            {/* Engagement - Icon + Score */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <Activity className={`w-3.5 h-3.5 ${intel.engagementScore.level === 'High' ? 'text-emerald-600' :
                                  intel.engagementScore.level === 'Medium' ? 'text-yellow-600' :
                                    'text-slate-400'
                                  }`} />
                                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                                  {intel.engagementScore.score}/14
                                </span>
                              </div>
                            </td>

                            {/* Source - Enhanced for Ads */}
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  {lead.source === 'instagram_ad' && <Instagram className="w-3.5 h-3.5 text-pink-600" />}
                                  {lead.source === 'facebook_ad' && <Facebook className="w-3.5 h-3.5 text-blue-600" />}
                                  {lead.source === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                  
                                  <span className="text-[11px] font-bold text-slate-700 capitalize whitespace-nowrap">
                                    {(lead.source || 'Direct').replace('_ad', ' Ad')}
                                  </span>
                                </div>
                                
                                {lead.campaignName && (
                                  <span className="text-[9px] font-medium text-slate-400 truncate max-w-[120px]" title={lead.campaignName}>
                                    {lead.campaignName}
                                  </span>
                                )}
                                
                                {intel.sourceQuality.conversionRate && !lead.campaignName && (
                                  <span className="text-[10px] text-slate-400">
                                    {intel.sourceQuality.conversionRate}% conversion
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                              {(userRole.includes('owner') || userRole.includes('admin') || userRole.includes('super')) ? (
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveAssignDropdown(activeAssignDropdown === lead._id ? null : lead._id);
                                    }}
                                    className={`assign-trigger flex items-center gap-2 group/owner p-1 -m-1 rounded-md transition-all ${activeAssignDropdown === lead._id ? 'bg-indigo-50 shadow-sm ring-1 ring-indigo-100' : 'hover:bg-slate-50'}`}
                                  >
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200 uppercase group-hover/owner:border-indigo-200 transition-colors shrink-0">
                                      {lead.assignedTo?.firstName?.charAt(0) || lead.assignedTo?.email?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex flex-col items-start min-w-0">
                                      <span className={`text-[11px] font-bold truncate max-w-[90px] transition-colors ${activeAssignDropdown === lead._id ? 'text-indigo-600' : 'text-slate-700 group-hover/owner:text-indigo-600'}`}>
                                        {lead.assignedTo ? (lead.assignedTo.firstName || lead.assignedTo.email.split('@')[0]) : 'Unassigned'}
                                      </span>
                                    </div>
                                    {/* Subtly indicate interactivity without a bulky arrow */}
                                    <div className={`w-1 h-1 rounded-full transition-all duration-300 ${activeAssignDropdown === lead._id ? 'bg-indigo-600 scale-125' : 'bg-slate-300 opacity-0 group-hover/owner:opacity-100'}`} />
                                  </button>

                                  {activeAssignDropdown === lead._id && (
                                    <div className="assign-dropdown absolute top-full left-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                                      <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assign Lead</p>
                                      </div>
                                      {teamMembers.length > 0 ? (
                                        teamMembers.map((member) => (
                                          <button
                                            key={member._id}
                                            onClick={() => handleAssignLead(lead._id, member.userId._id)}
                                            className={`w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-center gap-2 border-b border-slate-50 last:border-0 ${lead.assignedTo?._id === member.userId._id ? 'bg-indigo-50/30' : ''}`}
                                          >
                                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 uppercase shrink-0">
                                              {member.userId?.firstName?.charAt(0) || member.userId?.email?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className={`text-[11px] font-bold truncate ${lead.assignedTo?._id === member.userId._id ? 'text-indigo-600' : 'text-slate-900'}`}>
                                                {member.userId?.firstName ? `${member.userId.firstName} ${member.userId.lastName || ''}` : member.userId?.email.split('@')[0]}
                                              </p>
                                            </div>
                                          </button>
                                        ))
                                      ) : (
                                        <div className="p-4 text-center">
                                          <p className="text-[10px] text-slate-400">No members</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-100 uppercase">
                                    {lead.assignedTo?.firstName?.charAt(0) || lead.assignedTo?.email?.charAt(0) || '?'}
                                  </div>
                                  <span className="text-xs text-slate-500 truncate max-w-[120px]">
                                    {lead.assignedTo ? (lead.assignedTo.firstName || lead.assignedTo.email.split('@')[0]) : 'Unassigned'}
                                  </span>
                                </div>
                              )}
                            </td>
                          </>
                        )}

                        {/* Actions - Cell-Triggered Stretch Reveal */}
                        <td
                          className="group/action-cell sticky right-0 z-20 bg-white px-4 py-3 border-l border-slate-100 transition-colors hover:bg-slate-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end">
                            <div className="flex items-center gap-1.5">
                              {/* Primary Call Action - Dialer Integrated */}
                              <button
                                onClick={(e) => initiateCall(lead, e)}
                                className="flex-shrink-0 p-2 bg-white border border-slate-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all"
                                title="Call Lead"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </button>

                              {/* Secondary Actions - Revealed on CELL hover */}
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 p-2 bg-white border border-slate-300 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTemplateLead(activeTemplateLead === lead._id ? null : lead._id);
                                    }}
                                    className="flex-shrink-0 p-2 bg-white border border-slate-300 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-all"
                                    title="Send Template"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                  {activeTemplateLead === lead._id && (
                                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                                      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Select Template</p>
                                      </div>
                                      <div className="max-h-60 overflow-y-auto">
                                        {templates.length > 0 ? (
                                          templates.map((template) => (
                                            <button
                                              key={template.id}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleSendTemplate(template, lead);
                                              }}
                                              className="w-full text-left p-3 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${template.channel === 'whatsapp' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                                <p className="text-[11px] font-bold text-slate-900">{template.name}</p>
                                              </div>
                                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{template.body}</p>
                                            </button>
                                          ))
                                        ) : (
                                          <div className="p-4 text-center">
                                            <p className="text-[10px] text-slate-400">No manual templates found</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/automation/leads/${lead._id}`);
                                  }}
                                  className="flex-shrink-0 p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
                                  title="View Details"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => deleteLead(lead._id, e)}
                                  className="flex-shrink-0 p-2 bg-white border border-slate-300 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Intelligence Guide - Hidden by Default */}
        {showGuide && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Intelligence Field Guide</h3>
                <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">Lead Age Classifications</p>
                    <ul className="space-y-1 text-slate-600">
                      <li><span className="font-medium text-emerald-600">Fresh:</span> &lt;10 min</li>
                      <li><span className="font-medium text-orange-600">Aging:</span> 10-60 min</li>
                      <li><span className="font-medium text-red-600">At Risk:</span> 1-24 hrs</li>
                      <li><span className="font-medium text-slate-600">Cold:</span> &gt;24 hrs</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">SLA Windows</p>
                    <ul className="space-y-1 text-slate-600">
                      <li>High: 10 minutes</li>
                      <li>Medium: 30 minutes</li>
                      <li>Low: 2 hours</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">Engagement Scoring</p>
                    <ul className="space-y-1 text-slate-600">
                      <li>Contact info: +2-4</li>
                      <li>Message detail: +1-3</li>
                      <li>Response time: +3</li>
                      <li>Specificity: +2</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Bulk Actions Floating Bar */}
        {selectedLeads.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-300">
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-3 pr-6 border-r border-slate-800">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-indigo-600/20">
                  {selectedLeads.length}
                </span>
                <span className="text-sm font-bold tracking-tight">Leads Selected</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowBulkTemplateMenu(!showBulkTemplateMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  Send Group Template
                </button>

                {showBulkTemplateMenu && (
                  <div className="absolute bottom-full left-0 mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Choose Template</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {templates.length > 0 ? (
                        templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleBulkSendTemplate(template)}
                            className="w-full text-left p-4 hover:bg-indigo-50 transition-all border-b border-slate-50 last:border-0 group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{template.name}</span>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${template.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {template.channel}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{template.body}</p>
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center" onClick={(e) => e.stopPropagation()}>
                          <p className="text-xs text-slate-400 font-bold">No manual templates found.</p>
                          <button onClick={() => router.push('/automation/templates')} className="mt-2 text-[10px] text-indigo-600 font-black uppercase tracking-[0.1em] hover:underline">Create One Now</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>

              <button
                onClick={() => setSelectedLeads([])}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}