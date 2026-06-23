'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';

export function useDealDetail(dealId) {
  const router = useRouter();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDeal = useCallback(async () => {
    if (!dealId) return;
    const res = await authFetch(`/api/automation/deals/${dealId}`);
    const data = await res.json();
    if (data.success) setDeal(data.data);
    return data;
  }, [dealId]);

  useEffect(() => {
    setLoading(true);
    fetchDeal().finally(() => setLoading(false));
  }, [fetchDeal]);

  const updateDeal = async (payload) => {
    setSaving(true);
    try {
      const res = await authFetch(`/api/automation/deals/${dealId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setDeal(data.data);
        toast.success('Deal updated');
        window.dispatchEvent(new CustomEvent('lfg-crm-refresh'));
        return true;
      }
      toast.error(data.error || 'Update failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const changeStage = async (stage) => {
    const payload = { stage };
    if (stage === 'lost' || stage === 'closed_lost') {
      const reason = window.prompt('Why was this deal lost?');
      if (!reason?.trim()) {
        toast.error('Lost reason is required');
        return false;
      }
      payload.lostReason = reason.trim();
    }
    return updateDeal(payload);
  };

  const archiveDeal = async () => {
    if (!window.confirm('Archive this deal?')) return;
    const ok = await updateDeal({ archived: true });
    if (ok) router.push('/automation/deals');
  };

  return { deal, loading, saving, fetchDeal, updateDeal, changeStage, archiveDeal };
}
