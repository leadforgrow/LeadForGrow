'use client';

import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';
import { isStageLost, resolveStages } from '@/lib/crm/pipelineUtils';
import { normalizeStageKey } from '@/lib/crm/stageKeys';

function needsDemoDetails(stage, extra = {}) {
  const key = normalizeStageKey(stage);
  return key === 'demo_scheduled' && !extra.meetingDate;
}

function needsQuotationDetails(stage, extra = {}) {
  const key = normalizeStageKey(stage);
  return (key === 'proposal_sent' || key === 'quotation_sent') && !extra.quotationUrl;
}

function needsLostReason(stage, stages, extra = {}) {
  return isStageLost(stage, stages) && !extra.lostReason;
}

/**
 * Shared deal stage change flow — opens modals for demo, quotation, and lost stages.
 */
export function useDealStageModals({ getStages, onUpdated }) {
  const [demoPrompt, setDemoPrompt] = useState(null);
  const [demoSaving, setDemoSaving] = useState(false);
  const [quotationPrompt, setQuotationPrompt] = useState(null);
  const [quotationSaving, setQuotationSaving] = useState(false);
  const [lostPrompt, setLostPrompt] = useState(null);
  const [lostSaving, setLostSaving] = useState(false);

  const applyDealStageUpdate = useCallback(
    async (dealId, stage, extra = {}) => {
      const stages = getStages?.() || [];
      const payload = { stage, ...extra };
      if (isStageLost(stage, stages) && extra.lostReason) {
        payload.lostReason = extra.lostReason;
      }
      const res = await authFetch(`/api/automation/deals/${dealId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Stage updated');
        onUpdated?.(data.data);
        window.dispatchEvent(new CustomEvent('lfg-crm-refresh'));
        return data.data;
      }
      if (data.code === 'LOST_REASON_REQUIRED') toast.error('Lost reason is required');
      else toast.error(data.error || 'Update failed');
      return null;
    },
    [getStages, onUpdated]
  );

  const requestDealStageChange = useCallback(
    async (dealId, stage, meta = {}, options = {}) => {
      const stages = getStages?.() || [];
      if (needsDemoDetails(stage, options)) {
        setDemoPrompt({ dealId, dealName: meta.title || 'Deal' });
        return null;
      }
      if (needsQuotationDetails(stage, options)) {
        setQuotationPrompt({ dealId, dealName: meta.title || 'Deal' });
        return null;
      }
      if (needsLostReason(stage, stages, options)) {
        setLostPrompt({ dealId, dealName: meta.title || 'Deal' });
        return null;
      }
      return applyDealStageUpdate(dealId, stage, options);
    },
    [getStages, applyDealStageUpdate]
  );

  const cancelDemoPrompt = useCallback(() => setDemoPrompt(null), []);
  const cancelQuotationPrompt = useCallback(() => setQuotationPrompt(null), []);
  const cancelLostPrompt = useCallback(() => setLostPrompt(null), []);

  const confirmDemoScheduled = useCallback(
    async (meeting) => {
      if (!demoPrompt) return null;
      setDemoSaving(true);
      try {
        const updated = await applyDealStageUpdate(demoPrompt.dealId, 'demo_scheduled', meeting);
        if (updated) setDemoPrompt(null);
        return updated;
      } finally {
        setDemoSaving(false);
      }
    },
    [demoPrompt, applyDealStageUpdate]
  );

  const confirmQuotationSent = useCallback(
    async (data) => {
      if (!quotationPrompt) return null;
      setQuotationSaving(true);
      try {
        const updated = await applyDealStageUpdate(quotationPrompt.dealId, 'proposal_sent', data);
        if (updated) setQuotationPrompt(null);
        return updated;
      } finally {
        setQuotationSaving(false);
      }
    },
    [quotationPrompt, applyDealStageUpdate]
  );

  const confirmLostReason = useCallback(
    async ({ reason, comments }) => {
      if (!lostPrompt) return null;
      setLostSaving(true);
      try {
        const stages = getStages?.() || [];
        const lostStage = stages.find((s) => s.isLost)?.key || 'lost';
        const updated = await applyDealStageUpdate(lostPrompt.dealId, lostStage, {
          lostReason: reason,
          note: comments,
        });
        if (updated) setLostPrompt(null);
        return updated;
      } finally {
        setLostSaving(false);
      }
    },
    [lostPrompt, getStages, applyDealStageUpdate]
  );

  return {
    requestDealStageChange,
    applyDealStageUpdate,
    demoPrompt,
    demoSaving,
    confirmDemoScheduled,
    cancelDemoPrompt,
    quotationPrompt,
    quotationSaving,
    confirmQuotationSent,
    cancelQuotationPrompt,
    lostPrompt,
    lostSaving,
    confirmLostReason,
    cancelLostPrompt,
  };
}

export function resolveDealStagesFromPipeline(pipelines, selectedPipelineId, fallbackStages) {
  const active = pipelines?.find((p) => p._id === selectedPipelineId);
  return resolveStages(active?.stages || fallbackStages || []);
}
