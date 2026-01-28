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
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Flame,
  Wind,
  Snowflake,
  AlertCircle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');
  const [sortField, setSortField] = useState('priority');
  const [sortDirection, setSortDirection] = useState('desc');
  const [downloading, setDownloading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

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
        toast.success('Lead marked as contacted');
        fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const getPriority = (lead) => {
    const hoursSince = Math.floor((new Date() - new Date(lead.receivedAt)) / (1000 * 60 * 60));
    
    if (lead.status === 'new' && hoursSince < 2) {
      return { 
        label: 'HOT', 
        color: 'bg-red-600 text-white',
        icon: Flame,
        urgency: 4,
        rowBg: 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500'
      };
    } else if (lead.status === 'new' && hoursSince < 24) {
      return { 
        label: 'WARM', 
        color: 'bg-orange-500 text-white',
        icon: Wind,
        urgency: 3,
        rowBg: 'bg-orange-50 hover:bg-orange-100 border-l-4 border-l-orange-500'
      };
    } else if (lead.status === 'new') {
      return { 
        label: 'COLD', 
        color: 'bg-slate-400 text-white',
        icon: Snowflake,
        urgency: 2,
        rowBg: 'bg-slate-50 hover:bg-slate-100 border-l-4 border-l-slate-400'
      };
    } else if (lead.status === 'contacted' || lead.status === 'follow-up') {
      return { 
        label: 'ACTIVE', 
        color: 'bg-indigo-500 text-white',
        icon: AlertCircle,
        urgency: 1,
        rowBg: 'bg-indigo-50 hover:bg-indigo-100 border-l-4 border-l-indigo-500'
      };
    }
    return { 
      label: 'LOW', 
      color: 'bg-slate-300 text-white',
      icon: AlertCircle,
      urgency: 0,
      rowBg: 'bg-white hover:bg-slate-50 border-l-4 border-l-slate-300'
    };
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'priority' ? 'desc' : 'asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-slate-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-indigo-600" /> : 
      <ChevronDown className="w-4 h-4 text-indigo-600" />;
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.serviceInterest?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortField === 'priority') {
      const aPriority = getPriority(a).urgency;
      const bPriority = getPriority(b).urgency;
      return sortDirection === 'desc' ? bPriority - aPriority : aPriority - bPriority;
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

  const getStatusBadge = (status) => {
    const badges = {
      new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
      contacted: { label: 'Contacted', color: 'bg-green-100 text-green-700' },
      'follow-up': { label: 'Follow-up', color: 'bg-yellow-100 text-yellow-700' },
      converted: { label: 'Converted', color: 'bg-purple-100 text-purple-700' },
      lost: { label: 'Lost', color: 'bg-red-100 text-red-700' }
    };
    return badges[status] || badges.new;
  };

  const downloadExcel = async () => {
    try {
      setDownloading(true);
      setShowDownloadMenu(false);
      
      const userId = localStorage.getItem('userid');
      const res = await fetch('/api/automation/leads/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          leads: sortedLeads,
          filter: statusFilter
        })
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

      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Error downloading Excel:', error);
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
        body: JSON.stringify({
          userId,
          leads: sortedLeads,
          filter: statusFilter
        })
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

      toast.success('PDF file downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF file');
    } finally {
      setDownloading(false);
    }
  };

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
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Lead Management</h1>
              <p className="text-sm text-slate-500">
                {sortedLeads.length} total leads • 
                <span className="text-red-600 font-semibold ml-1">
                  {sortedLeads.filter(l => getPriority(l).urgency === 4).length} HOT
                </span>
                <span className="text-orange-600 font-semibold ml-2">
                  {sortedLeads.filter(l => getPriority(l).urgency === 3).length} WARM
                </span>
                <span className="text-slate-600 font-semibold ml-2">
                  {sortedLeads.filter(l => getPriority(l).urgency === 2).length} COLD
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchLeads}
                className="px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              {/* Download Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  disabled={downloading || sortedLeads.length === 0}
                  className="px-4 py-2.5 bg-emerald-600 text-white border border-emerald-600 rounded-lg font-medium text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? 'Downloading...' : 'Export'}
                  {!downloading && <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showDownloadMenu && !downloading && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDownloadMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                      <button
                        onClick={downloadExcel}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        <span>Download Excel</span>
                      </button>
                      <button
                        onClick={downloadPDF}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 text-sm text-slate-700"
                      >
                        <FileText className="w-4 h-4 text-red-600" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => router.push('/automation/leads/bulk')}
                className="px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
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
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all text-slate-900"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'new', label: 'New' },
                  { value: 'not-contacted', label: 'Not Contacted' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'follow-up', label: 'Follow-up' },
                  { value: 'converted', label: 'Converted' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
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
        </div>

        {/* Table */}
        {sortedLeads.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
            <Users className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No leads found</h3>
            <p className="text-sm text-slate-500">
              {searchTerm ? 'Try adjusting your search' : 'New leads will appear here'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-16">
                      <button
                        onClick={() => handleSort('_id')}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        S.No
                        <SortIcon field="_id" />
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-28">
                      <button
                        onClick={() => handleSort('priority')}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        Priority
                        <SortIcon field="priority" />
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        Name
                        <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        Email
                        <SortIcon field="email" />
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('phone')}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        Number
                        <SortIcon field="phone" />
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('assignedTo')}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        Assigned To
                        <SortIcon field="assignedTo" />
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('source')}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      >
                        Source
                        <SortIcon field="source" />
                      </button>
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedLeads.map((lead, index) => {
                    const priority = getPriority(lead);
                    const statusBadge = getStatusBadge(lead.status);
                    const PriorityIcon = priority.icon;
                    
                    return (
                      <tr
                        key={lead._id}
                        className={`${priority.rowBg} transition-colors cursor-pointer`}
                        onClick={() => router.push(`/automation/leads/${lead._id}`)}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md ${priority.color} text-xs font-bold whitespace-nowrap`}>
                            <PriorityIcon className="w-3.5 h-3.5" />
                            {priority.label}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900">
                              {lead.name}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              {lead.serviceInterest}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="truncate max-w-[200px]">
                              {lead.email || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {lead.phone}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {lead.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-indigo-600">
                                  {lead.assignedTo.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="truncate max-w-[150px]">
                                {lead.assignedTo.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {lead.source || 'Direct'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => markAsContacted(lead._id, e)}
                              className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-all hover:scale-105 shadow-sm"
                              title="Call"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => markAsContacted(lead._id, e)}
                              className="p-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-700 transition-all hover:scale-105 shadow-sm"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/automation/leads/${lead._id}`);
                              }}
                              className="p-2 bg-slate-700 rounded-lg text-white hover:bg-slate-800 transition-all hover:scale-105 shadow-sm"
                              title="View Details"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
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
      </div>
    </div>
  );
}