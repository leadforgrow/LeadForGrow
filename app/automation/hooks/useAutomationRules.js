'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';
import { buildEditForm } from '../components/automation/constants';

const EMPTY_CREATE = {
  name: '',
  description: '',
  type: 'instant_acknowledgement',
  enabled: true
};

export function useAutomationRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRule, setSelectedRule] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ ...EMPTY_CREATE });
  const [cloudinaryConfig, setCloudinaryConfig] = useState({ cloudName: '', uploadPreset: '' });

  useEffect(() => {
    const saved = localStorage.getItem('lfg_cloudinary');
    if (saved) {
      try {
        setCloudinaryConfig(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const saveCloudinaryConfig = useCallback((key, value) => {
    setCloudinaryConfig((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('lfg_cloudinary', JSON.stringify(next));
      return next;
    });
  }, []);

  const fetchRules = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const res = await authFetch('/api/automation/automation-rules');
      const data = await res.json();
      if (data.success) setRules(data.data || []);
      else toast.error(data.error || 'Failed to load automations');
    } catch {
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const automationRules = useMemo(
    () => rules.filter((r) => r.type !== 'manual_template'),
    [rules]
  );

  const templateRules = useMemo(
    () => rules.filter((r) => r.type === 'manual_template'),
    [rules]
  );

  const filteredRules = useMemo(() => {
    let list = automationRules;
    if (statusFilter === 'active') list = list.filter((r) => r.enabled);
    else if (statusFilter === 'paused') list = list.filter((r) => !r.enabled);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.type?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [automationRules, statusFilter, search]);

  const activeCount = useMemo(() => automationRules.filter((r) => r.enabled).length, [automationRules]);

  const selectRule = useCallback((rule) => {
    setSelectedRule(rule);
    setEditForm(buildEditForm(rule));
  }, []);

  const toggleRule = useCallback(
    async (ruleId) => {
      const rule = rules.find((r) => r._id === ruleId);
      if (!rule) return;
      const newEnabled = !rule.enabled;

      setRules((prev) => prev.map((r) => (r._id === ruleId ? { ...r, enabled: newEnabled } : r)));
      if (selectedRule?._id === ruleId) {
        setSelectedRule((prev) => (prev ? { ...prev, enabled: newEnabled } : prev));
      }

      try {
        const res = await authFetch('/api/automation/automation-rules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ruleId, enabled: newEnabled }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success(newEnabled ? `${rule.name} activated` : `${rule.name} paused`);
      } catch {
        setRules((prev) => prev.map((r) => (r._id === ruleId ? { ...r, enabled: !newEnabled } : r)));
        toast.error('Failed to update automation');
      }
    },
    [rules, selectedRule]
  );

  const saveEdit = useCallback(async () => {
    if (!selectedRule || !editForm) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/automation/automation-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: selectedRule._id,
          name: editForm.name,
          description: editForm.description,
          config: {
            ...selectedRule.config,
            channel: editForm.channel,
            messageTemplate: editForm.messageTemplate,
            whatsappTemplate: editForm.whatsappTemplate,
            whatsappTemplateName: editForm.whatsappTemplateName,
            whatsappHeaderMedia: editForm.whatsappHeaderMedia,
            delayHours: editForm.delayHours,
            emailSubject: editForm.emailSubject,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRules((prev) => prev.map((r) => (r._id === selectedRule._id ? data.data : r)));
        setSelectedRule(data.data);
        toast.success('Settings saved');
      } else {
        toast.error(data.error || 'Save failed');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  }, [selectedRule, editForm]);

  const createRule = useCallback(async () => {
    try {
      const res = await authFetch('/api/automation/automation-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          triggers: { onLeadReceived: true },
          config: { channel: 'both', delayHours: 0 },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Automation created');
        setShowCreateModal(false);
        setCreateForm({ ...EMPTY_CREATE });
        await fetchRules(true);
        selectRule(data.data);
      } else {
        toast.error(data.error || 'Create failed');
      }
    } catch {
      toast.error('Failed to create automation');
    }
  }, [createForm, fetchRules, selectRule]);

  const uploadHeaderMedia = useCallback(
    async (file) => {
      if (!file) return null;
      toast.loading('Uploading media...');
      try {
        let fullUrl = '';
        let uploaded = false;

        try {
          const sigReq = await authFetch('/api/cloudinary-sign', { method: 'POST' });
          if (sigReq.ok) {
            const sigData = await sigReq.json();
            if (sigData.success) {
              const cloudData = new FormData();
              cloudData.append('file', file);
              cloudData.append('api_key', sigData.apiKey);
              cloudData.append('timestamp', sigData.timestamp);
              cloudData.append('signature', sigData.signature);
              const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
                method: 'POST',
                body: cloudData
              });
              const cloudJson = await cloudRes.json();
              if (cloudJson.secure_url) {
                fullUrl = cloudJson.secure_url;
                uploaded = true;
              }
            }
          }
        } catch {
          /* fallback */
        }

        if (!uploaded && cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset) {
          const cloudData = new FormData();
          cloudData.append('file', file);
          cloudData.append('upload_preset', cloudinaryConfig.uploadPreset);
          const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`, {
            method: 'POST',
            body: cloudData
          });
          const cloudJson = await cloudRes.json();
          if (cloudJson.secure_url) {
            fullUrl = cloudJson.secure_url;
            uploaded = true;
          } else {
            throw new Error(cloudJson.error?.message || 'Cloudinary upload failed');
          }
        }

        if (!uploaded) {
          if (file.size > 4.5 * 1024 * 1024) {
            throw new Error('File too large. Configure Cloudinary for large uploads.');
          }
          const formData = new FormData();
          formData.append('file', file);
          const req = await fetch('/api/upload', { method: 'POST', body: formData });
          const res = await req.json();
          if (res.success) fullUrl = `${window.location.origin}${res.url}`;
          else throw new Error(res.error || 'Upload failed');
        }

        toast.dismiss();
        toast.success('Media uploaded');
        return fullUrl;
      } catch (err) {
        toast.dismiss();
        toast.error(err.message || 'Upload error');
        return null;
      }
    },
    [cloudinaryConfig]
  );

  return {
    rules: filteredRules,
    allRules: automationRules,
    templateRules,
    loading,
    refreshing,
    saving,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    activeCount,
    selectedRule,
    editForm,
    setEditForm,
    selectRule,
    clearSelection: () => {
      setSelectedRule(null);
      setEditForm(null);
    },
    toggleRule,
    saveEdit,
    refresh: () => fetchRules(true),
    showCreateModal,
    setShowCreateModal,
    createForm,
    setCreateForm,
    createRule,
    cloudinaryConfig,
    saveCloudinaryConfig,
    uploadHeaderMedia
  };
}
