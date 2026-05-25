'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { computeLeadIntelligence, aggregateSourceStats } from '@/lib/leadIntelligence';
import { buildLeadsQuery } from '../components/leads/utils';
import { SAVED_VIEWS_KEY } from '../components/leads/constants';

const DEFAULT_FILTERS = {
  search: '',
  status: 'all',
  source: '',
  assignedTo: '',
  view: 'all',
  dateFrom: '',
  dateTo: '',
  page: 1,
  limit: 50
};

export function useLeadsWorkspace() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    search: searchParams.get('search') || '',
    status: searchParams.get('filter') || searchParams.get('status') || 'all',
    source: searchParams.get('source') || '',
    view: searchParams.get('view') || 'all'
  });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [drawerLeadId, setDrawerLeadId] = useState(null);
  const [viewMode, setViewMode] = useState(() =>
    searchParams.get('view') === 'kanban' ? 'kanban' : 'table'
  );
  const [sortField, setSortField] = useState('receivedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [savedViews, setSavedViews] = useState([]);
  const [userRole, setUserRole] = useState('member');

  useEffect(() => {
    if (searchParams.get('view') === 'kanban') setViewMode('kanban');
  }, [searchParams]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_VIEWS_KEY);
      if (raw) setSavedViews(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setUserRole((localStorage.getItem('userRole') || 'member').toLowerCase());
  }, []);

  const fetchTeam = useCallback(async () => {
    try {
      const uId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/team?userId=${uId}`);
      const data = await res.json();
      if (data.success) setTeamMembers(data.data);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchLeads = useCallback(async (silent = false) => {
    try {
      const userId = localStorage.getItem('userid');
      if (!userId) return;

      if (!silent) setLoading(true);
      else setRefreshing(true);

      const qs = buildLeadsQuery(
        {
          ...filters,
          status: filters.status === 'all' ? '' : filters.status
        },
        userId
      );

      const res = await fetch(`/api/automation/leads?${qs}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      setLeads(data.data || []);
      setPagination(data.pagination || { total: data.data?.length || 0, page: 1, limit: 50, pages: 1 });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const sourceStats = useMemo(() => aggregateSourceStats(leads), [leads]);

  const enrichedLeads = useMemo(
    () => leads.map((lead) => computeLeadIntelligence(lead, leads, sourceStats[lead.source])),
    [leads, sourceStats]
  );

  const sortedLeads = useMemo(() => {
    const copy = [...enrichedLeads];
    copy.sort((a, b) => {
      let aVal;
      let bVal;

      switch (sortField) {
        case 'score':
          aVal = a.intelligence?.engagementScore?.score ?? 0;
          bVal = b.intelligence?.engagementScore?.score ?? 0;
          break;
        case 'lastActivity':
          aVal = new Date(a.lastContactedAt || a.updatedAt || a.receivedAt).getTime();
          bVal = new Date(b.lastContactedAt || b.updatedAt || b.receivedAt).getTime();
          break;
        case 'nextFollowUp':
          aVal = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : 0;
          bVal = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : 0;
          break;
        case 'assignedTo':
          aVal = a.assignedTo?.email || '';
          bVal = b.assignedTo?.email || '';
          break;
        case 'name':
          aVal = a.name?.toLowerCase() || '';
          bVal = b.name?.toLowerCase() || '';
          break;
        default:
          aVal = a[sortField];
          bVal = b[sortField];
          if (sortField === 'receivedAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [enrichedLeads, sortField, sortDir]);


  const updateFilter = useCallback((patch) => {
    if ('search' in patch) setSearchInput(patch.search);
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
    setSelectedIds([]);
  }, []);

  const toggleSort = useCallback((field) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('desc');
      return field;
    });
  }, []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === sortedLeads.length ? [] : sortedLeads.map((l) => l._id)
    );
  }, [sortedLeads]);

  const saveCurrentView = useCallback(
    (name) => {
      const view = { id: Date.now().toString(), name, filters: { ...filters } };
      const next = [...savedViews, view];
      setSavedViews(next);
      localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(next));
      toast.success(`Saved view "${name}"`);
    },
    [filters, savedViews]
  );

  const applySavedView = useCallback((view) => {
    setFilters({ ...DEFAULT_FILTERS, ...view.filters });
    toast.success(`Applied "${view.name}"`);
  }, []);

  const updateLeadStatus = useCallback(
    async (leadId, status) => {
      try {
        const userId = localStorage.getItem('userid');
        const res = await fetch(`/api/automation/leads/${leadId}?userId=${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, performedBy: userId })
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Status updated');
          fetchLeads(true);
        } else toast.error(data.error || 'Update failed');
      } catch {
        toast.error('Update failed');
      }
    },
    [fetchLeads]
  );

  const assignLead = useCallback(
    async (leadId, assigneeId) => {
      try {
        const userId = localStorage.getItem('userid');
        const res = await fetch(`/api/automation/leads/${leadId}?userId=${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignedTo: assigneeId, performedBy: userId })
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Lead assigned');
          fetchLeads(true);
        } else toast.error('Assign failed');
      } catch {
        toast.error('Assign failed');
      }
    },
    [fetchLeads]
  );

  const bulkAssign = useCallback(
    async (assigneeId) => {
      const userId = localStorage.getItem('userid');
      let ok = 0;
      for (const id of selectedIds) {
        const res = await fetch(`/api/automation/leads/${id}?userId=${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignedTo: assigneeId, performedBy: userId })
        });
        if (res.ok) ok++;
      }
      toast.success(`Assigned ${ok} lead(s)`);
      setSelectedIds([]);
      fetchLeads(true);
    },
    [selectedIds, fetchLeads]
  );

  const bulkDelete = useCallback(async () => {
    if (!window.confirm(`Delete ${selectedIds.length} leads permanently?`)) return;
    const userId = localStorage.getItem('userid');
    let ok = 0;
    for (const id of selectedIds) {
      const res = await fetch(`/api/automation/leads/${id}?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) ok++;
    }
    toast.success(`Deleted ${ok} lead(s)`);
    setSelectedIds([]);
    fetchLeads(true);
  }, [selectedIds, fetchLeads]);

  const exportLeads = useCallback(
    async (format) => {
      const userId = localStorage.getItem('userid');
      const endpoint = format === 'pdf' ? '/api/automation/leads/export/pdf' : '/api/automation/leads/export/excel';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          leads: selectedIds.length ? sortedLeads.filter((l) => selectedIds.includes(l._id)) : sortedLeads,
          filter: filters.status
        })
      });
      if (!res.ok) {
        toast.error('Export failed');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    },
    [sortedLeads, selectedIds, filters.status]
  );

  const initiateCall = useCallback(async (lead) => {
    if (!lead.phone) {
      toast.error('No phone number');
      return;
    }
    try {
      const res = await fetch('/api/automation/calls/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('userToken') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userid'),
          businessId: localStorage.getItem('businessId'),
          leadId: lead._id,
          leadPhone: lead.phone
        })
      });
      const result = await res.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent('lfg-initiate-call', { detail: result.data }));
      } else {
        window.location.href = `tel:${lead.phone}`;
      }
    } catch {
      window.location.href = `tel:${lead.phone}`;
    }
  }, []);

  return {
    filters,
    updateFilter,
    leads: sortedLeads,
    pagination,
    loading,
    refreshing,
    teamMembers,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    drawerLeadId,
    setDrawerLeadId,
    viewMode,
    setViewMode,
    sortField,
    sortDir,
    toggleSort,
    savedViews,
    saveCurrentView,
    applySavedView,
    userRole,
    searchInput,
    setSearchInput,
    refresh: () => fetchLeads(true),
    updateLeadStatus,
    assignLead,
    bulkAssign,
    bulkDelete,
    exportLeads,
    initiateCall
  };
}
