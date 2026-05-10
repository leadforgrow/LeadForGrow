'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Users,
  Plus,
  CheckSquare,
  CalendarCheck2,
  BarChart3,
  Sparkles,
  X,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/ui/Heading';

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'today');

  // Modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form states
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [newTask, setNewTask] = useState({
    leadId: searchParams.get('leadId') || '',
    type: 'call',
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    autoSend: false,
    messageContent: ''
  });
  const [leads, setLeads] = useState([]); // For the create task dropdown
  const [team, setTeam] = useState([]); // For the assign to dropdown

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/tasks?userId=${userId}&filter=${filter}`);
      const data = await res.json();
      if (data.success) setTasks(data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load tasks');
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/leads?userId=${userId}`);
      const data = await res.json();
      if (data.success) setLeads(data.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchTeam = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/team?userId=${userId}`);
      const data = await res.json();
      if (data.success) setTeam(data.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  useEffect(() => {
    if (showCreateModal) {
      fetchLeads();
      fetchTeam();
      // Default to current user if not set
      if (!newTask.assignedTo) {
        setNewTask(prev => ({ ...prev, assignedTo: localStorage.getItem('userid') }));
      }
    }
  }, [showCreateModal]);

  const handleMarkDone = async (taskId, silent = false) => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/tasks/${taskId}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', performedBy: userId })
      });

      const data = await res.json();
      if (data.success) {
        if (!silent) toast.success('Task completed!');
        setTasks(tasks.filter(t => t._id !== taskId));
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/tasks/${selectedTask._id}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dueDate: rescheduleDate,
          // If we add autoSend / messageContent to reschedule modal later, we'd include them here.
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Task rescheduled!');
        setShowRescheduleModal(false);
        fetchTasks();
      }
    } catch (error) {
      toast.error('Failed to reschedule');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/tasks?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Task created!');
        setShowCreateModal(false);
        setNewTask({ leadId: '', type: 'call', title: '', description: '', dueDate: '', assignedTo: '', autoSend: false, messageContent: '' });
        fetchTasks();
      }
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleCommunication = (task, channel) => {
    const lead = task.leadId;
    if (!lead) {
      toast.error('Cannot perform action: The associated lead record has been deleted or is missing.');
      return;
    }
    let url = '';

    if (channel === 'call') url = `tel:${lead.phone}`;
    if (channel === 'whatsapp') url = `https://wa.me/${lead?.phone?.replace(/\D/g, '')}`;
    if (channel === 'email') url = `mailto:${lead.email}`;

    if (url) {
      window.open(url, '_blank');
      handleMarkDone(task._id, true);
    }
  };

  const getTaskIcon = (type) => {
    const icons = {
      'call': Phone,
      'whatsapp': MessageCircle,
      'email': Mail,
      'meeting': Users
    };
    return icons[type] || Clock;
  };

  const getTaskColor = (type) => {
    const colors = {
      'call': 'bg-blue-100 text-blue-700',
      'whatsapp': 'bg-emerald-100 text-emerald-700',
      'email': 'bg-purple-100 text-purple-700',
      'meeting': 'bg-orange-100 text-orange-700'
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getTimeUntil = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) {
      const absHours = Math.abs(hours);
      return `${absHours}h overdue`;
    }

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days}d`;
    }
    if (hours > 0) return `in ${hours}h`;
    if (minutes > 0) return `in ${minutes}m`;
    return 'now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-900 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-amber-600" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Tasks & Follow-ups</h1>
            <p className="text-xs text-slate-500 font-medium">Manage your daily actions and customer touchpoints</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'today', label: 'Due Today', icon: Clock },
          { value: 'overdue', label: 'Overdue', icon: AlertCircle },
          { value: 'upcoming', label: 'Upcoming', icon: Calendar },
          { value: 'all', label: 'All Tasks', icon: CheckCircle2 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${filter === tab.value
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-600'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <Heading level={3} className="mb-2">All caught up!</Heading>
            <p className="text-slate-500 text-sm">
              {filter === 'overdue' ? 'No overdue tasks' : 'No tasks for this filter'}
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const TaskIcon = getTaskIcon(task.type);
            const overdue = isOverdue(task.dueDate);

            return (
              <div
                key={task._id}
                className={`bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${overdue ? 'border-red-200 bg-red-50/30' : 'border-slate-200'
                  }`}
              >
                <div className="flex items-start gap-6">
                  {/* Task Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTaskColor(task.type)}`}>
                    <TaskIcon className="w-6 h-6" />
                  </div>

                  {/* Task Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Heading level={3} className="text-lg mb-1">{task.title}</Heading>
                        {task.description && (
                          <p className="text-[13px] text-slate-600 mb-3">{task.description}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-4 ${overdue ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                        {new Date(task.dueDate).toLocaleDateString()} {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="mx-2 opacity-30">|</span>
                        {getTimeUntil(task.dueDate)}
                      </span>
                    </div>

                    {/* Lead Info */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      {task.leadId ? (
                        <>
                          <span className="text-slate-500">
                            Lead: <span className="font-bold text-slate-900">{task.leadId.name}</span>
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500">
                            Assigned to: <span className="font-bold text-slate-900">{task.assignedTo?.firstName || 'Me'}</span>
                          </span>
                          {task.leadId.phone && (
                            <span className="text-slate-500">{task.leadId.phone}</span>
                          )}
                          {task.leadId.serviceInterest && (
                            <span className="text-slate-500">{task.leadId.serviceInterest}</span>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-lg border border-amber-100">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[10px] font-medium text-amber-700 uppercase tracking-widest">Lead Record Deleted</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {task.type === 'call' && (
                        <button
                          onClick={() => handleCommunication(task, 'call')}
                          disabled={!task.leadId}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${!task.leadId
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed grayscale'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                            }`}
                        >
                          <Phone className="w-4 h-4" />
                          Call Now
                        </button>
                      )}
                      {task.type === 'whatsapp' && (
                        <button
                          onClick={() => handleCommunication(task, 'whatsapp')}
                          disabled={!task.leadId}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${!task.leadId
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed grayscale'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                            }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </button>
                      )}
                      {task.type === 'email' && (
                        <button
                          onClick={() => handleCommunication(task, 'email')}
                          disabled={!task.leadId}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${!task.leadId
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed grayscale'
                              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                            }`}
                        >
                          <Mail className="w-4 h-4" />
                          Send Email
                        </button>
                      )}

                      <div className="h-8 w-px bg-slate-200 mx-1 self-center" />

                      <button
                        onClick={() => handleMarkDone(task._id)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Done
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          // Extract YYYY-MM-DDTHH:mm from ISO string
                          const d = new Date(task.dueDate);
                          const formatted = d.getFullYear() + '-' +
                            String(d.getMonth() + 1).padStart(2, '0') + '-' +
                            String(d.getDate()).padStart(2, '0') + 'T' +
                            String(d.getHours()).padStart(2, '0') + ':' +
                            String(d.getMinutes()).padStart(2, '0');
                          setRescheduleDate(formatted);
                          setShowRescheduleModal(true);
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Reschedule
                      </button>

                      <button
                        onClick={() => {
                          if (task.leadId?._id) {
                            router.push(`/automation/leads/${task.leadId._id}`);
                          } else {
                            toast.error('Lead no longer exists');
                          }
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                      >
                        Lead Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <Heading level={3} className="text-xl">Reschedule Task</Heading>
              <button onClick={() => setShowRescheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleReschedule}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Date</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRescheduleModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <Heading level={3} className="text-xl">Create New Task</Heading>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Lead</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    value={newTask.leadId}
                    onChange={(e) => setNewTask({ ...newTask, leadId: e.target.value })}
                  >
                    <option value="">Select a lead...</option>
                    {leads.map(l => (
                      <option key={l._id} value={l._id}>{l.name} - {l.phone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Assign To</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  >
                    <option value="">Select teammate...</option>
                    {team.map(member => (
                      <option key={member.userId._id} value={member.userId._id}>
                        {member.userId.firstName} {member.userId.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                  >
                    <option value="call">Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Initial Discovery Call"
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              {/* Automation Toggle */}
              {(newTask.type === 'email' || newTask.type === 'whatsapp') && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black uppercase text-slate-400">Automated Follow-up</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewTask({ ...newTask, autoSend: !newTask.autoSend })}
                      className={`w-10 h-5 rounded-full relative transition-all ${newTask.autoSend ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${newTask.autoSend ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  {newTask.autoSend && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                      <textarea
                        rows="4"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder={newTask.type === 'email' ? "Hi {{name}}, just following up on..." : "Hi {{name}}, connecting regarding..."}
                        value={newTask.messageContent}
                        onChange={(e) => setNewTask({ ...newTask, messageContent: e.target.value })}
                      />
                      <p className="text-[9px] text-slate-400 italic">Use {"{{name}}"} for lead name personalization.</p>
                    </div>
                  )}
                </div>
              )}
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
