'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';

export function useDealsWorkspace() {
  const [deals, setDeals] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDealId, setEditingDealId] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', currency: 'INR', stage: 'qualified', expectedCloseDate: '' });

  const resetForm = useCallback(() => {
    setForm({ title: '', amount: '', currency: 'INR', stage: 'qualified', expectedCloseDate: '' });
    setEditingDealId(null);
  }, []);

  const openCreateModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const openEditDeal = useCallback((deal) => {
    setEditingDealId(deal._id);
    setForm({
      title: deal.title || '',
      amount: deal.amount != null ? String(deal.amount) : '',
      currency: deal.currency || 'INR',
      stage: deal.stage || 'qualified',
      expectedCloseDate: deal.expectedCloseDate
        ? new Date(deal.expectedCloseDate).toISOString().split('T')[0]
        : '',
    });
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  const fetchDeals = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const [dealsRes, pipelinesRes] = await Promise.all([
        authFetch('/api/automation/deals?limit=200'),
        authFetch('/api/automation/pipelines'),
      ]);
      const [dealsData, pipelinesData] = await Promise.all([dealsRes.json(), pipelinesRes.json()]);
      if (dealsData.success) {
        setDeals(dealsData.data || []);
        setPipeline(dealsData.pipeline || []);
      }
      if (pipelinesData.success) {
        setPipelines(pipelinesData.data || []);
        if (!selectedPipeline && pipelinesData.data?.length) {
          setSelectedPipeline(pipelinesData.data.find((p) => p.isDefault)?._id || pipelinesData.data[0]._id);
        }
      }
    } catch {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPipeline]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  const createDeal = async () => {
    if (!form.title) { toast.error('Deal title is required'); return; }
    const res = await authFetch('/api/automation/deals', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        amount: parseFloat(form.amount) || 0,
        pipelineId: selectedPipeline,
        expectedCloseDate: form.expectedCloseDate || undefined,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Deal created');
      closeModal();
      fetchDeals(true);
    } else toast.error(data.error || 'Failed to create');
  };

  const updateDeal = async () => {
    if (!editingDealId) return;
    if (!form.title) { toast.error('Deal title is required'); return; }
    const res = await authFetch(`/api/automation/deals/${editingDealId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: form.title,
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        stage: form.stage,
        expectedCloseDate: form.expectedCloseDate || undefined,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('Deal updated');
      closeModal();
      fetchDeals(true);
      window.dispatchEvent(new CustomEvent('lfg-crm-refresh'));
    } else toast.error(data.error || 'Failed to update');
  };

  const saveDeal = async () => {
    if (editingDealId) await updateDeal();
    else await createDeal();
  };

  const deleteDeal = async (dealId, dealTitle) => {
    if (!window.confirm(`Delete deal "${dealTitle || 'this deal'}"? This cannot be undone.`)) return;
    const res = await authFetch(`/api/automation/deals/${dealId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setDeals((prev) => prev.filter((d) => d._id !== dealId));
      toast.success('Deal deleted');
      window.dispatchEvent(new CustomEvent('lfg-crm-refresh'));
    } else toast.error(data.error || 'Failed to delete');
  };

  const updateDealStage = async (dealId, stage) => {
    const payload = { stage };
    if (stage === 'lost' || stage === 'closed_lost') {
      const reason = window.prompt('Why was this deal lost?');
      if (!reason?.trim()) {
        toast.error('Lost reason is required');
        return;
      }
      payload.lostReason = reason.trim();
    }
    const res = await authFetch(`/api/automation/deals/${dealId}`, { method: 'PUT', body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      setDeals((prev) => prev.map((d) => (d._id === dealId ? { ...d, stage } : d)));
      toast.success('Stage updated');
      window.dispatchEvent(new CustomEvent('lfg-crm-refresh'));
    } else toast.error(data.error || 'Update failed');
  };

  const activePipeline = pipelines.find((p) => p._id === selectedPipeline);
  const stages = activePipeline?.stages || [];

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.key] = deals.filter((d) => d.stage === stage.key);
    return acc;
  }, {});

  return {
    deals, pipeline, pipelines, loading, refreshing, viewMode, setViewMode,
    selectedPipeline, setSelectedPipeline, activePipeline, stages, dealsByStage,
    showModal, setShowModal, openCreateModal, openEditDeal, closeModal, editingDealId,
    form, setForm, fetchDeals, createDeal, updateDeal, saveDeal, deleteDeal, updateDealStage,
  };
}
