'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Plus,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Users,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Target,
  TrendingUp,
  Activity,
  Award,
  AlertTriangle,
  Timer,
  Info,
  HelpCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { computeLeadIntelligence, aggregateSourceStats } from '@/lib/leadIntelligence';

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

  const sourceStats = useMemo(() => {
    return aggregateSourceStats(leads);
  }, [leads]);

  const intelligentLeads = useMemo(() => {
    return leads.map(lead => computeLeadIntelligence(lead, leads, sourceStats[lead.source]));
  }, [leads, sourceStats]);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
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
        toast.success('Lead marked as contacted');
        fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
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

  const filteredLeads = intelligentLeads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.serviceInterest?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="p-6 max-w-full mx-auto">
        {/* Compact Header */}
        <div className="mb-6 max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Lead Management</h1>
              <p className="text-sm text-slate-500 mt-0.5">{sortedLeads.length} leads</p>
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
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase">Critical</span>
                <span className="text-xl font-bold text-red-600">{stats.critical}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase">SLA Breach</span>
                <span className="text-xl font-bold text-orange-600">{stats.slaBreached}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase">High Engage</span>
                <span className="text-xl font-bold text-emerald-600">{stats.highEngagement}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase">Avg Score</span>
                <span className="text-xl font-bold text-indigo-600">{stats.avgEngagement.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
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
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'follow-up', label: 'Follow-up' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === filter.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
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
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-[1800px] mx-auto">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No leads found</h3>
            <p className="text-sm text-slate-500">
              {searchTerm ? 'Try adjusting your search' : 'New leads will appear here'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full border-collapse" style={{ minWidth: 'max-content' }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {/* Sticky Left */}
                    <th className="sticky left-0 z-20 bg-slate-50 px-4 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase border-r border-slate-200">
                      #
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
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer h-14"
                        onClick={() => router.push(`/automation/leads/${lead._id}`)}
                      >
                        {/* # */}
                        <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500 border-r border-slate-100 whitespace-nowrap">
                          {index + 1}
                        </td>
                        
                        {/* Lead Age - Simple Badge */}
                        <td className="sticky left-[52px] z-10 bg-white group-hover:bg-slate-50 px-4 py-3 border-r border-slate-100">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className={`text-xs font-semibold ${
                              intel.leadAge.classification === 'fresh' ? 'text-emerald-600' :
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
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                            intel.nextAction.urgency === 'critical' ? 'bg-red-600 text-white' :
                            intel.nextAction.urgency === 'high' ? 'bg-orange-600 text-white' :
                            intel.nextAction.urgency === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-slate-600 text-white'
                          } whitespace-nowrap`}>
                            <span>{intel.nextAction.icon}</span>
                            {intel.nextAction.action}
                          </div>
                        </td>
                        
                        {/* Lead Name - PRIMARY VISUAL WEIGHT */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 truncate max-w-[200px] whitespace-nowrap">
                              {lead.name}
                            </span>
                            {lead.serviceInterest && (
                              <span className="text-xs text-slate-500 truncate max-w-[200px] whitespace-nowrap">
                                {lead.serviceInterest}
                              </span>
                            )}
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
                                <Activity className={`w-3.5 h-3.5 ${
                                  intel.engagementScore.level === 'High' ? 'text-emerald-600' :
                                  intel.engagementScore.level === 'Medium' ? 'text-yellow-600' :
                                  'text-slate-400'
                                }`} />
                                <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                                  {intel.engagementScore.score}/14
                                </span>
                              </div>
                            </td>
                            
                            {/* Source - Simple Text */}
                            <td className="px-4 py-3">
                              <span className="text-xs text-slate-600 whitespace-nowrap">
                                {lead.source || 'Direct'}
                                {intel.sourceQuality.conversionRate && (
                                  <span className="text-slate-400 ml-1">
                                    ({intel.sourceQuality.conversionRate}%)
                                  </span>
                                )}
                              </span>
                            </td>
                            
                            {/* Owner - Simple */}
                            <td className="px-4 py-3">
                              {lead.assignedTo ? (
                                <span className="text-xs text-slate-600 truncate max-w-[120px] whitespace-nowrap">
                                  {lead.assignedTo.email.split('@')[0]}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 whitespace-nowrap">Unassigned</span>
                              )}
                            </td>
                          </>
                        )}
                        
                        {/* Actions - White Backgrounds, Reveal on Hover */}
                        <td className="sticky right-0 z-10 bg-white group-hover:bg-slate-50 px-4 py-3 border-l border-slate-100" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Always show primary action */}
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => markAsContacted(lead._id, e)}
                              className="p-2 bg-white border border-slate-300 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            
                            {/* Show secondary on hover */}
                            {isHovered && (
                              <>
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => markAsContacted(lead._id, e)}
                                  className="p-2 bg-white border border-slate-300 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                                  title="WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/automation/leads/${lead._id}`);
                                  }}
                                  className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-all"
                                  title="View Details"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
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
      </div>
    </div>
  );
}