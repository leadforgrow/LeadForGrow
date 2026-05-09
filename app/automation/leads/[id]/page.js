'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  User,
  Tag,
  Calendar,
  ChevronLeft,
  Send,
  Plus,
  CheckCircle2,
  XCircle,
  MoreVertical,
  PartyPopper,
  Trophy,
  Sparkles,
  ChevronDown,
  Layout,
  AlertTriangle,
  TrendingUp,
  Activity,
  Target,
  CheckCircle,
  Shield,
  BarChart3,
  FileCheck,
  AlertCircle,
  Bot,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { computeLeadIntelligence } from '@/lib/leadIntelligence';
import IntelligenceIcon from '@/app/components/ui/IntelligenceIcon';

export default function LeadDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [lead, setLead] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [showWonModal, setShowWonModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    type: 'call',
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [templates, setTemplates] = useState([]);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [intelligence, setIntelligence] = useState(null);
  const [quickSchedule, setQuickSchedule] = useState({ show: false, type: 'call', time: '' });
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [userRole, setUserRole] = useState('TEAM_MEMBER');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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

  const fetchLeadDetails = async () => {
    try {
      const userId = localStorage.getItem('userid');
      if (!userId) {
        router.push('/user/register');
        return;
      }
      const res = await fetch(`/api/automation/leads/${id}?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setLead(data.data);
        // Compute intelligence
        const intel = computeLeadIntelligence(data.data, [], null);
        setIntelligence(intel.intelligence);
        // Set user role for UI permissions
        const role = localStorage.getItem('userRole') || 'TEAM_MEMBER';
        setUserRole(role.toLowerCase());
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load lead details');
      setLoading(false);
    }
  };

  const fetchLeadsTasks = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/tasks?userId=${userId}&leadId=${id}`);
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/automation/templates?userId=${localStorage.getItem('userid')}`);
      const data = await res.json();
      if (data.success) {
        // Collect all available manual templates
        setTemplates(data.manual || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
    fetchLeadsTasks();
    fetchTemplates();
    fetchTeam();

    const handleClickAway = (e) => {
      if (showAssignDropdown && !e.target.closest('.assign-trigger') && !e.target.closest('.assign-dropdown')) {
        setShowAssignDropdown(false);
      }
      if (showMoreMenu && !e.target.closest('.more-trigger') && !e.target.closest('.more-dropdown')) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [id, showAssignDropdown, showMoreMenu]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/leads/${id}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          performedBy: userId
        })
      });
      const data = await res.json();
      if (data.success) {
        setLead(data.data); // Update local state immediately
        toast.success(`Status updated to ${newStatus}`);
        if (newStatus === 'converted') {
          setShowWonModal(true);
        }
        fetchLeadDetails();
      }
      setUpdating(false);
    } catch (error) {
      setUpdating(false);
      toast.error('Failed to update status');
    }
  };

  const handleAssignLead = async (newAssigneeId) => {
    try {
      setUpdating(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/leads/${id}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: newAssigneeId,
          performedBy: userId
        })
      });
      const data = await res.json();
      if (data.success) {
        setLead(data.data);
        toast.success('Lead re-assigned successfully');
        setShowAssignDropdown(false);
        fetchLeadDetails(); // Refresh to get populated details
      }
      setUpdating(false);
    } catch (error) {
      setUpdating(false);
      toast.error('Failed to assign lead');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setUpdating(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/leads/${id}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote, performedBy: userId })
      });
      const data = await res.json();
      if (data.success) {
        setLead(data.data);
        setNewNote('');
        toast.success('Note added');
      }
      setUpdating(false);
    } catch (error) {
      setUpdating(false);
      toast.error('Failed to add note');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/tasks?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, leadId: id, assignedTo: userId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task created');
        setShowTaskModal(false);
        fetchLeadsTasks();
        fetchLeadDetails();
      }
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleCompleteTask = async (taskId, silent = false) => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/tasks/${taskId}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', performedBy: userId })
      });
      const data = await res.json();
      if (data.success) {
        if (!silent) toast.success('Task completed');
        fetchLeadsTasks();
        fetchLeadDetails();
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleCommunication = async (channel, taskId = null, customMessage = '') => {
    let url = '';
    const phone = lead.phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(customMessage);

    if (channel === 'call') {
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
          if (taskId) handleCompleteTask(taskId, true);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast.error(error.message || 'Failed to start call', { id: tid });
      }
      return;
    }

    if (channel === 'whatsapp') url = `https://wa.me/${phone}${customMessage ? `?text=${encodedMessage}` : ''}`;
    if (channel === 'email') url = `mailto:${lead.email}${customMessage ? `?body=${encodedMessage}` : ''}`;

    if (url) {
      window.open(url, '_blank');
      if (taskId) {
        handleCompleteTask(taskId, true);
      } else {
        handleUpdateStatus('contacted');
      }
    }
  };

  const deleteLead = async () => {
    if (!window.confirm('PERMANENT DELETE? This cannot be undone.')) return;

    try {
      setUpdating(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/leads/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Lead deleted');
        router.push('/automation/leads');
      } else {
        toast.error(data.error || 'Failed to delete');
        setUpdating(false);
      }
    } catch (error) {
      setUpdating(false);
      toast.error('Connection error');
    }
  };

  const renderMessageFromTemplate = (template) => {
    if (!template) return '';
    return template.replace(/\{\{(.*?)\}\}/g, (match, field) => {
      const fieldName = field.trim();
      if (fieldName === 'name') return lead.name;
      if (fieldName === 'serviceInterest') return lead.serviceInterest || 'our services';
      return match;
    });
  };

  // Calculate additional intelligence metrics
  const getLeadHealth = () => {
    if (!intelligence) return { status: 'unknown', reason: 'Loading...', color: 'bg-slate-100 text-slate-600' };

    if (intelligence.nextAction.urgency === 'critical' || intelligence.slaStatus.breached) {
      return { status: 'Critical', reason: intelligence.slaStatus.breached ? 'SLA breached' : 'Immediate action required', color: 'bg-red-100 text-red-700' };
    }
    if (intelligence.engagementScore.level === 'High' && !intelligence.slaStatus.breached) {
      return { status: 'Healthy', reason: 'Strong engagement, on track', color: 'bg-emerald-100 text-emerald-700' };
    }
    if (intelligence.leadAge.classification === 'at-risk') {
      return { status: 'At Risk', reason: 'Delayed response', color: 'bg-orange-100 text-orange-700' };
    }
    return { status: 'Stable', reason: 'Normal progress', color: 'bg-blue-100 text-blue-700' };
  };

  const getIntentStrength = () => {
    if (!intelligence) return { level: 'Unknown', color: 'bg-slate-100 text-slate-600' };

    const score = intelligence.engagementScore.score;
    if (score >= 9) return { level: 'High Intent', color: 'bg-emerald-100 text-emerald-700' };
    if (score >= 5) return { level: 'Medium Intent', color: 'bg-yellow-100 text-yellow-700' };
    return { level: 'Low Intent', color: 'bg-slate-100 text-slate-600' };
  };

  const getCommunicationCoverage = () => {
    const activities = lead?.activities || [];
    const hasCall = activities.some(a => a.type === 'call');
    const hasWhatsApp = activities.some(a => a.type === 'whatsapp');
    const hasEmail = activities.some(a => a.type === 'email');

    return { hasCall, hasWhatsApp, hasEmail };
  };

  const getDataCompleteness = () => {
    let total = 0;
    let complete = 0;

    const fields = ['name', 'phone', 'email', 'serviceInterest', 'message'];
    fields.forEach(field => {
      total++;
      if (lead?.[field] && lead[field].trim()) complete++;
    });

    const percentage = Math.round((complete / total) * 100);
    return { percentage, missing: total - complete };
  };

  const getRiskFactors = () => {
    const risks = [];
    if (intelligence?.slaStatus.breached) risks.push('SLA breached');
    if (intelligence?.engagementScore.level === 'Low') risks.push('Low engagement');
    if (intelligence?.sourceQuality.quality === 'Low') risks.push('Poor source');
    if (intelligence?.leadAge.classification === 'cold') risks.push('Cold lead');
    return risks.slice(0, 3); // Max 3
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900">Lead not found</h2>
        <button
          onClick={() => router.push('/automation/leads')}
          className="mt-4 text-indigo-600 font-medium hover:underline flex items-center gap-2 mx-auto"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Leads
        </button>
      </div>
    );
  }

  const health = getLeadHealth();
  const intent = getIntentStrength();
  const coverage = getCommunicationCoverage();
  const completeness = getDataCompleteness();
  const risks = getRiskFactors();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6 max-w-[1800px] mx-auto">
        <button
          onClick={() => router.push('/automation/leads')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Leads
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="more-trigger p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMoreMenu && (
            <div className="more-dropdown absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] overflow-hidden py-1">
              <button
                onClick={deleteLead}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Lead
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL: Identity + Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            {/* Lead Identity */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xl font-bold">
                {lead.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{lead.name}</h1>
                <span className={`inline-block px-2 py-0.5 text-xs font-black uppercase tracking-wider rounded mt-1 ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
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
              </div>
            </div>

            {/* Contact Info - Compact */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">{lead.phone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 truncate">{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">{lead.serviceInterest || 'General Inquiry'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">{new Date(lead.receivedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Source Summary */}
            <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Source</p>
              <p className="text-sm font-semibold text-slate-900 capitalize">{lead.source}</p>
              {lead.sourceDetails && (
                <p className="text-xs text-slate-600 mt-1">{lead.sourceDetails}</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 mb-6">
              <button
                onClick={() => handleCommunication('call')}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 font-semibold text-sm hover:bg-indigo-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Lead
              </button>
              <button
                onClick={() => handleCommunication('whatsapp')}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>

              {/* Template Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg flex items-center justify-center gap-2 font-semibold text-sm hover:bg-slate-800 transition-colors"
                >
                  <Layout className="w-4 h-4" />
                  Quick Template
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showTemplateDropdown && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-600">Select Template</p>
                    </div>
                    {templates.length > 0 ? (
                      templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            const msg = renderMessageFromTemplate(template.body);
                            handleCommunication(template.channel === 'email' ? 'email' : 'whatsapp', null, msg);
                            setShowTemplateDropdown(false);
                          }}
                          className="w-full text-left p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${template.channel === 'whatsapp' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                            <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                            {template.body || 'No message content'}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-sm text-slate-500">No templates available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Won/Lost */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleUpdateStatus('converted')}
                disabled={updating}
                className="flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-semibold text-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Won
              </button>
              <button
                onClick={() => handleUpdateStatus('lost')}
                disabled={updating}
                className="flex items-center justify-center gap-2 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-semibold text-sm disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Lost
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Intelligence + History */}
        <div className="lg:col-span-2 space-y-6">
          {/* NEW: Recommendation / Next Best Action Card */}
          {/* NEW: Recommendation / Next Best Action Card */}
          {intelligence?.nextAction && (
            <div className={`p-5 rounded-[18px] shadow-lg mb-8 flex items-start gap-5 animate-in fade-in slide-in-from-top-4 duration-500 ${intelligence.nextAction.color} border-none relative overflow-hidden`}>
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-2xl pointer-events-none" />

              <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                <IntelligenceIcon name={intelligence.nextAction.icon} className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>

              <div className="flex-1 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-1">Recommended Next Action</p>
                <h3 className="text-xl font-black text-white leading-tight">
                  {intelligence.nextAction.action}
                </h3>
                <p className="text-sm text-white/80 mt-2 font-medium leading-relaxed max-w-xl">
                  {intelligence.nextAction.action === 'Stale Lead Recovery'
                    ? 'This lead has been inactive for over 24 hours. Attempt a recovery contact to see if they are still interested.'
                    : intelligence.nextAction.urgency === 'critical'
                      ? 'High priority: contact this lead immediately to maximize conversion.'
                      : 'Keep the momentum going by completing the next step in the journey.'}
                </p>
              </div>

              {intelligence.nextAction.urgency === 'critical' && (
                <button
                  onClick={() => handleCommunication('call')}
                  className="relative z-10 self-center px-6 py-3 bg-white text-red-600 rounded-[14px] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                  Call Now
                </button>
              )}

              {intelligence.nextAction.action === 'Schedule follow-up' && (
                <button
                  onClick={() => setQuickSchedule(s => ({ ...s, show: true }))}
                  className="relative z-10 self-center px-6 py-3 bg-white/20 text-white border border-white/30 rounded-[14px] font-black text-xs uppercase tracking-widest shadow-lg hover:bg-white/30 transition-all active:scale-95"
                >
                  Schedule
                </button>
              )}
            </div>
          )}

          {/* Intelligence Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Card 1: Lead Health */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">Lead Health</p>
              </div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${health.color}`}>
                {health.status}
              </div>
              <p className="text-xs text-slate-600 mt-2">{health.reason}</p>
            </div>

            {/* Card 2: Response Delay */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">Response Time</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{intelligence?.leadAge.displayText}</p>
              <p className={`text-xs mt-2 font-medium ${intelligence?.slaStatus.breached ? 'text-red-600' : 'text-emerald-600'}`}>
                {intelligence?.slaStatus.message}
              </p>
            </div>

            {/* Card 3: Intent Strength */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-medium text-slate-500">Intent</p>
                </div>
                <div className="group relative">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" />
                  <div className="absolute right-0 top-6 w-48 bg-slate-900 text-white p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-[10px] leading-tight">
                    <p className="font-bold mb-1 border-b border-slate-700 pb-1">Scoring Breakdown:</p>
                    <ul className="space-y-1">
                      {intelligence?.engagementScore.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-emerald-400">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${intent.color}`}>
                {intent.level}
              </div>
              <p className="text-xs text-slate-600 mt-2">Score: {intelligence?.engagementScore.score}/14</p>
            </div>

            {/* Card 4: Follow-up Status */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 relative group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-medium text-slate-500">Follow-up</p>
                </div>
                {!quickSchedule.show && (
                  <button
                    onClick={() => setQuickSchedule(s => ({ ...s, show: true }))}
                    className="p-1.5 hover:bg-indigo-50 rounded-md text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Quick Schedule Follow-up"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {quickSchedule.show ? (
                <div className="animate-in fade-in zoom-in duration-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <select
                      className="bg-indigo-50 border-none text-[10px] font-bold text-indigo-700 rounded px-1 py-0.5 outline-none"
                      value={quickSchedule.type}
                      onChange={(e) => setQuickSchedule(s => ({ ...s, type: e.target.value }))}
                    >
                      <option value="call">Call</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                    <button onClick={() => setQuickSchedule({ ...quickSchedule, show: false })} className="text-slate-400 hover:text-red-500">
                      <XCircle className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    className="w-full text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded p-1 outline-none focus:border-indigo-400"
                    value={quickSchedule.time}
                    onChange={(e) => setQuickSchedule(s => ({ ...s, time: e.target.value }))}
                  />
                  <button
                    onClick={async () => {
                      if (!quickSchedule.time) return toast.error('Pick a time');
                      const userId = localStorage.getItem('userid');
                      const res = await fetch(`/api/automation/tasks?userId=${userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          leadId: id,
                          type: quickSchedule.type,
                          title: `Quick ${quickSchedule.type} Follow-up`,
                          dueDate: new Date(quickSchedule.time),
                          assignedTo: userId
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        toast.success('Follow-up scheduled');
                        setQuickSchedule({ show: false, type: 'call', time: '' });
                        fetchLeadsTasks();
                        fetchLeadDetails();
                      }
                    }}
                    className="w-full bg-indigo-600 text-white py-1 rounded text-[10px] font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              ) : tasks.length > 0 ? (
                <>
                  <p className="text-lg font-bold text-indigo-600">{tasks.length} pending</p>
                  <p className="text-xs text-slate-600 mt-2">Next: {tasks[0]?.type}</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-slate-900">None</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="text-xs text-indigo-600 mt-2 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Schedule now
                  </button>
                </>
              )}
            </div>

            {/* Card 5: Communication Coverage */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">Coverage</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  {coverage.hasCall ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-300" />}
                  <span className="text-slate-600">Call</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {coverage.hasWhatsApp ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-300" />}
                  <span className="text-slate-600">WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {coverage.hasEmail ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-300" />}
                  <span className="text-slate-600">Email</span>
                </div>
              </div>
            </div>

            {/* Card 6: Source Trust */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">Source Trust</p>
              </div>
              <p className="text-sm font-semibold text-slate-900 capitalize">{lead.source}</p>
              {intelligence?.sourceQuality.conversionRate ? (
                <p className="text-xs text-slate-600 mt-2">{intelligence.sourceQuality.conversionRate}% CVR</p>
              ) : (
                <p className="text-xs text-slate-500 mt-2">No data</p>
              )}
            </div>

            {/* Card 7: Owner / Lead Assignment */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 relative group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-medium text-slate-500">Lead Owner</p>
                </div>
                {(userRole.includes('owner') || userRole.includes('admin') || userRole.includes('super')) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAssignDropdown(!showAssignDropdown);
                    }}
                    className="assign-trigger p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-1.5"
                  >
                    <div className={`w-1 h-1 rounded-full transition-all duration-300 ${showAssignDropdown ? 'bg-indigo-600 scale-125' : 'bg-slate-300 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200 uppercase">
                  {lead.assignedTo?.firstName?.charAt(0) || lead.assignedTo?.email?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {lead.assignedTo ? (lead.assignedTo.firstName ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName || ''}` : lead.assignedTo.email.split('@')[0]) : 'Unassigned'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium tracking-tight">
                    {lead.assignedTo ? 'Current Assignee' : 'Ready for assignment'}
                  </p>
                </div>
              </div>

              {/* Assignment Dropdown */}
              {showAssignDropdown && (
                <div className="assign-dropdown absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reassign To</p>
                  </div>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <button
                        key={member._id}
                        onClick={() => handleAssignLead(member.userId._id)}
                        className={`w-full text-left p-3 hover:bg-indigo-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0 ${lead.assignedTo?._id === member.userId._id ? 'bg-indigo-50/50' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black text-indigo-600 border border-indigo-100 uppercase shadow-sm shrink-0">
                          {member.userId?.firstName?.charAt(0) || member.userId?.email?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${lead.assignedTo?._id === member.userId._id ? 'text-indigo-600' : 'text-slate-900'}`}>
                            {member.userId?.firstName ? `${member.userId.firstName} ${member.userId.lastName || ''}` : member.userId?.email.split('@')[0]}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            {member.role === 'owner' ? 'Account Owner' : 'Team Member'}
                          </p>
                        </div>
                        {lead.assignedTo?._id === member.userId._id && (
                          <CheckCircle className="w-4 h-4 text-indigo-600" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-[10px] text-slate-400">No team members found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card 8: Conversion Probability */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">Conv. Probability</p>
              </div>
              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${intelligence?.engagementScore.level === 'High' ? 'bg-emerald-100 text-emerald-700' :
                intelligence?.engagementScore.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                {intelligence?.engagementScore.level}
              </div>
              <p className="text-xs text-slate-600 mt-2">Based on engagement</p>
            </div>

            {/* Card 9: Data Completeness */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">Data Quality</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{completeness.percentage}%</p>
              <p className="text-xs text-slate-600 mt-2">
                {completeness.missing > 0 ? `${completeness.missing} fields missing` : 'Complete'}
              </p>
            </div>

            {/* Card 10: Risk Factors */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">Risk Factors</p>
              </div>
              {risks.length > 0 ? (
                <div className="space-y-1">
                  {risks.map((risk, idx) => (
                    <p key={idx} className="text-xs text-red-600 font-medium">• {risk}</p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 font-medium">No major risks</p>
              )}
            </div>
          </div>

          {/* Bot Responses Section - Only if source is bot */}
          {lead.source === 'bot' && lead.metadata?.botResponses && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                Chatbot Interaction
              </h2>
              <div className="space-y-4">
                {lead.metadata.botResponses.map((resp, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Question</p>
                    <p className="text-sm font-semibold text-slate-900 mb-3">{resp.question}</p>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Response</p>
                    <p className="text-sm text-slate-700">{resp.answer}</p>
                  </div>
                ))}

                {lead.metadata.supportType && (
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Support Type</p>
                      <p className="text-sm font-bold text-indigo-900 capitalize">{lead.metadata.supportType}</p>
                    </div>
                    {lead.metadata.supportMessage && (
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">User Message</p>
                        <p className="text-sm text-emerald-900">{lead.metadata.supportMessage}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabbed Feed: Activity vs Conversations */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-start px-8 gap-2 transition-colors ${activeTab === 'activity' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Clock className="w-4 h-4" />
                Activity Timeline
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-start px-8 gap-2 transition-colors ${activeTab === 'chat' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'
                  }`}
              >
                <MessageSquare className="w-4 h-4" />
                Conversations
                {lead.messages?.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                    {lead.messages.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('calls')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-start px-8 gap-2 transition-colors ${activeTab === 'calls' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Phone className="w-4 h-4" />
                Call History
                {lead.activities?.filter(a => a.type === 'contacted').length > 0 && (
                  <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[10px] ml-1 shadow-sm">
                    {lead.activities.filter(a => a.type === 'contacted').length}
                  </span>
                )}
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'activity' ? (
                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  {(lead.activities || []).slice().sort((a, b) => new Date(b.performedAt || b.timestamp || b.createdAt) - new Date(a.performedAt || a.timestamp || a.createdAt)).slice(0, 10).map((activity, idx) => (
                    <div key={idx} className="relative flex gap-5 pl-10 group">
                      <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${activity.type === 'lead_created' ? 'bg-indigo-600' :
                        activity.type === 'status_changed' ? 'bg-amber-500' :
                          activity.type === 'note_added' ? 'bg-blue-600' :
                            activity.type === 'whatsapp_received' ? 'bg-emerald-500' :
                              activity.type === 'contacted' ? 'bg-indigo-600' :
                                'bg-slate-500'
                        }`}>
                        {activity.type === 'lead_created' && <Plus className="w-3 h-3 text-white" />}
                        {activity.type === 'status_changed' && <Calendar className="w-3 h-3 text-white" />}
                        {activity.type === 'note_added' && <Send className="w-3 h-3 text-white" />}
                        {activity.type === 'whatsapp_received' && <MessageCircle className="w-3 h-3 text-white" />}
                        {activity.type === 'contacted' && <Phone className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-[13px] font-bold text-slate-800 leading-snug">{activity.description}</p>
                          {activity.type === 'contacted' && activity.metadata?.durationSeconds && (
                            <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 uppercase tracking-tighter shrink-0">
                              {activity.metadata.durationSeconds}s
                            </span>
                          )}
                        </div>
                        {activity.metadata?.notes && (
                          <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed line-clamp-2">
                            "{activity.metadata.notes}"
                          </div>
                        )}
                        {activity.type === 'contacted' && (
                          <button
                            onClick={() => setActiveTab('calls')}
                            className="mt-2 text-[10px] text-indigo-600 font-black uppercase tracking-wider hover:underline flex items-center gap-1.5"
                          >
                            <Activity className="w-3 h-3" />
                            Listen to Recording →
                          </button>
                        )}
                        <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {(() => {
                            const date = activity.performedAt || activity.timestamp || activity.createdAt;
                            return date ? new Date(date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent';
                          })()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'chat' ? (
                <div className="space-y-4 min-h-[400px]">
                  {lead.messages?.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {lead.messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${msg.direction === 'outgoing'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'
                            }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.direction === 'outgoing' ? 'text-indigo-100 opacity-80' : 'text-slate-400'}`}>
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {msg.direction === 'outgoing' && <CheckCircle className="w-2.5 h-2.5 ml-1" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start justify-center py-20 text-left">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-slate-900 font-bold">No messages yet</h3>
                        <p className="text-slate-500 text-sm max-w-md mt-1">
                        When you send a WhatsApp or receive a reply, the conversation history will appear here.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6 min-h-[400px]">
                  {lead.activities?.filter(a => a.type === 'contacted').length > 0 ? (
                    lead.activities.filter(a => a.type === 'contacted').reverse().map((call, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                              <Phone className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">Desktop Call Session</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {new Date(call.performedAt || call.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold">
                            {call.metadata?.durationSeconds || 0}s
                          </div>
                        </div>

                        {call.metadata?.notes && (
                          <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Discussion Notes</p>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                              {call.metadata.notes}
                            </p>
                          </div>
                        )}

                        {call.metadata?.recordingUrl && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                              Voice Recording Available
                            </p>
                            <audio controls className="w-full h-10">
                              <source src={call.metadata.recordingUrl} type="audio/mpeg" />
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        )}

                        {!call.metadata?.recordingUrl && (
                          <div className="mt-2 text-[10px] font-bold text-slate-400 italic">
                            Recording processing or notes saved.
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-start justify-center py-20 text-left">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Phone className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-slate-900 font-bold">No calls recorded</h3>
                        <p className="text-slate-500 text-sm max-w-md mt-1">
                        Call the lead using the "Call Lead" button to start tracking discussions.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notes Section - Internal Collaboration */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Internal Notes</h2>

            <form onSubmit={handleAddNote} className="mb-6">
              <div className="relative">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add internal note (private to team)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] text-sm text-slate-900"
                />
                <button
                  type="submit"
                  disabled={updating || !newNote.trim()}
                  className="absolute right-3 bottom-3 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Tip: Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-sans">Win + H</kbd> for voice typing</span>
              </div>
            </form>

            <div className="space-y-3">
              {lead.notes?.map((note, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                  <p className="text-sm text-slate-900">{note.text}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <User className="w-3 h-3" />
                    <span>{note.addedBy?.email || 'Team'}</span>
                    <span>•</span>
                    <span>{new Date(note.addedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">New Follow-up</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                  >
                    <option value="call">Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow-up call"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                <textarea
                  placeholder="Task instructions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm min-h-[60px]"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Won Modal */}
      {showWonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-10 max-w-md w-full text-left border border-slate-200 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center mb-6">
              <Trophy className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Victory!</h2>
            <p className="text-slate-600 mb-6">Lead successfully converted</p>
            <button
              onClick={() => setShowWonModal(false)}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}