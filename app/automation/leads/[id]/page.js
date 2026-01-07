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
  Layout
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LeadDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [lead, setLead] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' | 'tasks'
  const [showWonModal, setShowWonModal] = useState(false);
  
  // Task Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    type: 'call',
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [templates, setTemplates] = useState([]);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  const fetchLeadDetails = async () => {
    try {
      const userId = localStorage.getItem('userid');
      if (!userId) {
        router.push('/user/register');
        return;
      }
      const res = await fetch(`/api/automation/leads/${id}?userId=${userId}`);
      const data = await res.json();
      if (data.success) setLead(data.data);
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
      const res = await fetch(`/api/automation/automation-rules?userId=${localStorage.getItem('userid')}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data.filter(rule => rule.enabled));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
    fetchLeadsTasks();
    fetchTemplates();
  }, [id]);

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
        toast.success(`Status updated to ${newStatus}`);
        if (newStatus === 'converted') {
          setShowWonModal(true);
        }
        fetchLeadDetails(); // Refetch to get updated activities and details
      }
      setUpdating(false);
    } catch (error) {
      setUpdating(false);
      toast.error('Failed to update status');
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

  const handleCommunication = (channel, taskId = null, customMessage = '') => {
    let url = '';
    const phone = lead.phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(customMessage);
    
    if (channel === 'call') url = `tel:${lead.phone}`;
    if (channel === 'whatsapp') url = `https://wa.me/${phone}${customMessage ? `?text=${encodedMessage}` : ''}`;
    if (channel === 'email') url = `mailto:${lead.email}${customMessage ? `?body=${encodedMessage}` : ''}`;

    if (url) {
      window.open(url, '_blank');
      // If a task was associated, complete it
      if (taskId) {
        handleCompleteTask(taskId, true);
      } else {
        // Log activity if manually triggered without task
        handleUpdateStatus('contacted');
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Lead not found</h2>
        <button 
          onClick={() => router.push('/automation/leads')}
          className="mt-4 text-indigo-600 font-bold hover:underline flex items-center gap-2 mx-auto"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.push('/automation/leads')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Leads
        </button>
        <div className="flex gap-3">
          <button className="p-2 hover:bg-slate-200 rounded-xl text-slate-600">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Lead Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl font-bold">
                {lead.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase mt-2 inline-block ${
                  lead.status === 'new' ? 'bg-indigo-100 text-indigo-700' :
                  lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                  lead.status === 'converted' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {lead.status}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                  <p className="text-slate-900 font-bold">{lead.phone}</p>
                </div>
              </div>

              {lead.email && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email</p>
                    <p className="text-slate-900 font-bold">{lead.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Service Interest</p>
                  <p className="text-slate-900 font-bold">{lead.serviceInterest || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Received</p>
                  <p className="text-slate-900 font-bold">{new Date(lead.receivedAt).toLocaleString()}</p>
                </div>
              </div>

              {lead.whatsapp && lead.whatsapp !== lead.phone && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">WhatsApp</p>
                    <p className="text-slate-900 font-bold">{lead.whatsapp}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                Source Details
              </h3>
              
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Source</p>
                  <p className="text-sm text-slate-900 font-bold capitalize">{lead.source}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Campaign</p>
                  <p className="text-sm text-slate-900 font-bold">{lead.sourceDetails || 'None'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Source Page</p>
                  <p className="text-sm text-slate-900 font-bold truncate" title={lead.sourcePage}>
                    {lead.sourcePage || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">IP Address</p>
                  <p className="text-sm text-slate-600 font-mono">{lead.ipAddress || 'Not logged'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Priority</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    lead.priority === 'high' ? 'bg-red-100 text-red-600' :
                    lead.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {lead.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 gap-3">
              <button 
                onClick={() => handleCommunication('call')}
                disabled={updating}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Phone className="w-5 h-5" />
                Call Lead
              </button>
              <button 
                onClick={() => handleCommunication('whatsapp')}
                disabled={updating}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>

              {/* Quick Template Selector */}
              <div className="relative">
                <button 
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  className="w-full py-3 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-slate-800 transition-all cursor-pointer active:scale-95"
                >
                  <Layout className="w-5 h-5 text-indigo-400" />
                  Use Quick Template
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showTemplateDropdown && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select a Template</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {templates.length > 0 ? (
                        templates.map((rule) => (
                          <button
                            key={rule._id}
                            onClick={() => {
                              const msg = renderMessageFromTemplate(rule.config?.messageTemplate);
                              handleCommunication(rule.config?.channel === 'email' ? 'email' : 'whatsapp', null, msg);
                              setShowTemplateDropdown(false);
                            }}
                            className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-xs">{rule.name}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                rule.config?.channel === 'whatsapp' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {rule.config?.channel || 'whatsapp'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 italic">
                              "{rule.config?.messageTemplate}"
                            </p>
                          </button>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-sm text-slate-400">No active automation templates found.</p>
                          <button onClick={() => router.push('/automation/automation-rules')} className="text-xs font-bold text-indigo-600 mt-2 hover:underline">Setup Templates</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus('converted');
                }}
                disabled={updating}
                style={{ cursor: 'pointer' }}
                className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all font-bold text-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                Won
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus('lost');
                }}
                disabled={updating}
                style={{ cursor: 'pointer' }}
                className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all font-bold text-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                Lost
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('activity')}
              className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${
                activeTab === 'activity' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Activity & Notes
            </button>
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'tasks' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Follow-ups
              {tasks.length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'activity' ? (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-indigo-600" />
                  Activity History
                </h2>

                <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {lead.activities?.map((activity, idx) => (
                    <div key={idx} className="relative flex gap-6">
                      <div className={`w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
                        activity.type === 'lead_created' ? 'bg-indigo-600' :
                        activity.type === 'status_changed' ? 'bg-amber-500' :
                        activity.type === 'note_added' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`}>
                        {activity.type === 'lead_created' && <Plus className="w-4 h-4 text-white" />}
                        {activity.type === 'status_changed' && <Calendar className="w-4 h-4 text-white" />}
                        {activity.type === 'note_added' && <Send className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold">{activity.description}</p>
                        <p className="text-xs text-slate-400 font-bold mt-1">
                          {new Date(activity.performedAt || activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Internal Notes</h2>
                <form onSubmit={handleAddNote} className="mb-8">
                  <div className="relative">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a private note..."
                      className="w-full bg-slate-50 border-0 rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-slate-900 font-medium"
                    />
                    <button 
                      type="submit"
                      disabled={updating || !newNote.trim()}
                      className="absolute right-4 bottom-4 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {lead.notes?.map((note, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-6">
                      <p className="text-slate-900 font-medium">{note.text}</p>
                      <div className="flex items-center gap-2 mt-4 text-xs text-slate-400 font-bold uppercase">
                        <User className="w-3 h-3" />
                        <span>{note.addedBy?.email || 'Team'}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(note.addedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  Follow-ups
                </h2>
                <button 
                  onClick={() => setShowTaskModal(true)}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-slate-600 font-bold text-sm">No pending tasks.</p>
                  <button onClick={() => setShowTaskModal(true)} className="mt-4 text-indigo-600 text-xs font-bold hover:underline">
                    + Add follow-up
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task._id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-slate-900 font-bold mb-1">{task.title}</h3>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">{task.type}</span>
                            <span className="text-slate-400">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button onClick={() => handleCompleteTask(task._id)} className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {task.type === 'call' && (
                          <button onClick={() => handleCommunication('call', task._id)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                            Call
                          </button>
                        )}
                        {task.type === 'whatsapp' && (
                          <button onClick={() => handleCommunication('whatsapp', task._id)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                            WhatsApp
                          </button>
                        )}
                        <button onClick={() => handleCompleteTask(task._id)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                          Done
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">New Follow-up</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Type</label>
                  <select
                    className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-slate-900 font-bold"
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                  >
                    <option value="call">Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-slate-900 font-bold"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call to finalize quote"
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-slate-900 font-bold"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Instructions</label>
                <textarea
                  placeholder="Notes for the follow-up..."
                  className="w-full bg-slate-50 border-0 rounded-2xl p-4 text-slate-900 font-medium min-h-[80px]"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Won Celebration Modal */}
      {showWonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm -z-10" onClick={() => setShowWonModal(false)}></div>
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300 text-center relative overflow-hidden">
            {/* Background Sparkles */}
            <Sparkles className="absolute top-4 left-4 w-6 h-6 text-emerald-200 animate-pulse" />
            <Sparkles className="absolute bottom-4 right-4 w-6 h-6 text-emerald-200 animate-pulse" />
            
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Trophy className="w-10 h-10 text-emerald-600 relative z-10" />
              <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-20"></div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
              <PartyPopper className="w-6 h-6 text-emerald-500" />
              Victory!
            </h2>
            <p className="text-slate-600 font-medium mb-8 leading-relaxed">
              Congrats! You got this lead for <span className="text-indigo-600 font-bold">LeadForGrow</span> service.
            </p>

            <button
              onClick={() => setShowWonModal(false)}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
            >
              Back to Business
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
