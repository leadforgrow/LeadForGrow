'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';
import { DEFAULT_CHATBOT_CONFIG } from '@/lib/chatbot/defaults';

export function useChatbotWorkspace() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [config, setConfig] = useState(DEFAULT_CHATBOT_CONFIG);
  const [stats, setStats] = useState({ totalLeads: 0, weekLeads: 0 });
  const [dirty, setDirty] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/automation/chatbot');
      const json = await res.json();
      if (json.success) {
        setBusinessId(json.data.businessId);
        setBusinessName(json.data.businessName || '');
        setConfig(json.data.config);
        setStats(json.data.stats || {});
        setDirty(false);
      } else {
        toast.error(json.error || 'Failed to load chatbot settings');
      }
    } catch {
      toast.error('Failed to load chatbot settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const patchConfig = useCallback((patch) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      if (patch.appearance) next.appearance = { ...prev.appearance, ...patch.appearance };
      if (patch.messages) next.messages = { ...prev.messages, ...patch.messages };
      if (patch.flow) next.flow = { ...prev.flow, ...patch.flow };
      return next;
    });
    setDirty(true);
  }, []);

  const save = useCallback(async (overrides = {}) => {
    try {
      setSaving(true);
      const payload = { config: { ...config, ...overrides } };
      const res = await authFetch('/api/automation/chatbot', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setConfig(json.data.config);
        setDirty(false);
        toast.success('Chatbot settings saved');
        return true;
      }
      toast.error(json.error || 'Save failed');
      return false;
    } catch {
      toast.error('Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  }, [config]);

  const publish = useCallback(async () => {
    const ok = await save({ published: true, enabled: true });
    if (ok) toast.success('Chatbot is now live on your website');
    return ok;
  }, [save]);

  const unpublish = useCallback(async () => {
    const ok = await save({ published: false });
    if (ok) toast.success('Chatbot unpublished');
    return ok;
  }, [save]);

  return {
    loading,
    saving,
    dirty,
    businessId,
    businessName,
    config,
    stats,
    patchConfig,
    save,
    publish,
    unpublish,
    refresh: fetchConfig,
  };
}
