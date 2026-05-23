'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

const EMPTY_TASK = {
  leadId: '',
  type: 'call',
  title: '',
  description: '',
  dueDate: '',
  assignedTo: '',
  autoSend: false,
  messageContent: ''
};

export function useTasksWorkspace() {
  const searchParams = useSearchParams();
  const initialLeadId = useRef(searchParams.get('leadId'));
  const initialFilter = searchParams.get('filter') || 'today';

  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ today: 0, overdue: 0, upcoming: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const [leads, setLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [newTask, setNewTask] = useState({ ...EMPTY_TASK, leadId: initialLeadId.current || '' });

  const fetchTasks = useCallback(async (silent = false) => {
    const userId = localStorage.getItem('userid');
    if (!userId) return;
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const res = await fetch(`/api/automation/tasks?userId=${userId}&filter=${filter}`);
      const data = await res.json();
      if (data.success) setTasks(data.data || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  const fetchCounts = useCallback(async () => {
    const userId = localStorage.getItem('userid');
    if (!userId) return;
    try {
      const [today, overdue, upcoming, all] = await Promise.all(
        ['today', 'overdue', 'upcoming', 'all'].map(async (f) => {
          const res = await fetch(`/api/automation/tasks?userId=${userId}&filter=${f}`);
          const data = await res.json();
          return data.success ? (data.data?.length || 0) : 0;
        })
      );
      setCounts({ today, overdue, upcoming, all });
    } catch {
      /* non-critical */
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    const userId = localStorage.getItem('userid');
    const res = await fetch(`/api/automation/leads?userId=${userId}&limit=200`);
    const data = await res.json();
    if (data.success) setLeads(data.data || []);
  }, []);

  const fetchTeam = useCallback(async () => {
    const userId = localStorage.getItem('userid');
    const res = await fetch(`/api/automation/team?userId=${userId}`);
    const data = await res.json();
    if (data.success) {
      setTeamMembers(
        data.data
          .map((m) => ({
            _id: m.userId?._id,
            firstName: m.userId?.firstName || 'Team',
            lastName: m.userId?.lastName || '',
            email: m.userId?.email
          }))
          .filter((m) => m._id)
      );
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts, tasks]);

  useEffect(() => {
    if (showCreateModal) {
      fetchLeads();
      fetchTeam();
      setNewTask((prev) => ({
        ...prev,
        assignedTo: prev.assignedTo || localStorage.getItem('userid') || ''
      }));
    }
  }, [showCreateModal, fetchLeads, fetchTeam]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchTasks(true), fetchCounts()]);
  }, [fetchTasks, fetchCounts]);

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter((t) => {
      const lead = t.leadId;
      return (
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        lead?.name?.toLowerCase().includes(q) ||
        lead?.phone?.includes(q)
      );
    });
  }, [tasks, search]);

  const markDone = useCallback(async (taskId, silent = false) => {
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
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        fetchCounts();
      }
    } catch {
      toast.error('Failed to update task');
    }
  }, [fetchCounts]);

  const openReschedule = useCallback((task) => {
    setSelectedTask(task);
    setRescheduleDate(
      `${new Date(task.dueDate).getFullYear()}-${String(new Date(task.dueDate).getMonth() + 1).padStart(2, '0')}-${String(new Date(task.dueDate).getDate()).padStart(2, '0')}T${String(new Date(task.dueDate).getHours()).padStart(2, '0')}:${String(new Date(task.dueDate).getMinutes()).padStart(2, '0')}`
    );
    setShowRescheduleModal(true);
  }, []);

  const rescheduleTask = useCallback(async (dueDate) => {
    if (!selectedTask) return;
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/tasks/${selectedTask._id}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task rescheduled');
        setShowRescheduleModal(false);
        setSelectedTask(null);
        refresh();
      }
    } catch {
      toast.error('Failed to reschedule');
    }
  }, [selectedTask, refresh]);

  const createTask = useCallback(async (payload) => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/tasks?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Task created');
        setShowCreateModal(false);
        setNewTask({ ...EMPTY_TASK });
        refresh();
      } else {
        toast.error(data.error || 'Failed to create task');
      }
    } catch {
      toast.error('Failed to create task');
    }
  }, [refresh]);

  const handleCommunication = useCallback(
    (task, channel) => {
      const lead = task.leadId;
      if (!lead) {
        toast.error('Lead record missing');
        return;
      }
      let url = '';
      if (channel === 'call') url = `tel:${lead.phone}`;
      if (channel === 'whatsapp') url = `https://wa.me/${lead.phone?.replace(/\D/g, '')}`;
      if (channel === 'email') url = `mailto:${lead.email}`;
      if (url) {
        window.open(url, '_blank');
        markDone(task._id, true);
      }
    },
    [markDone]
  );

  return {
    tasks: filteredTasks,
    total: filteredTasks.length,
    counts,
    loading,
    refreshing,
    filter,
    setFilter,
    search,
    setSearch,
    leads,
    teamMembers,
    showCreateModal,
    setShowCreateModal,
    showRescheduleModal,
    setShowRescheduleModal,
    selectedTask,
    rescheduleDate,
    setRescheduleDate,
    newTask,
    setNewTask,
    refresh,
    markDone,
    openReschedule,
    rescheduleTask,
    createTask,
    handleCommunication
  };
}
