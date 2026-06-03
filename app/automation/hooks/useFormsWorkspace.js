'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';
import { DEFAULT_FIELDS, normalizeStyling } from '../components/forms/constants';

export function useFormsWorkspace() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forms, setForms] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('builder');
  const [workspaceMode, setWorkspaceMode] = useState('home');
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardDraft, setWizardDraft] = useState({
    name: '', description: '', formType: 'floating', leadSource: 'website', pipelineStage: 'new', templateId: null, templateFields: null,
  });
  const [showThemeDrawer, setShowThemeDrawer] = useState(false);
  const [draftFields, setDraftFields] = useState([]);
  const [draftStyling, setDraftStyling] = useState(normalizeStyling());
  const [draftMeta, setDraftMeta] = useState({ name: '', description: '', successMessage: '', redirectUrl: '' });
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [maxForms, setMaxForms] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  const selectedForm = useMemo(
    () => forms.find((f) => f._id === selectedId) || null,
    [forms, selectedId]
  );

  const stats = useMemo(() => {
    const totalSubmissions = forms.reduce((s, f) => s + (f.submissionCount || 0), 0);
    const activeForms = forms.filter((f) => f.active !== false).length;
    const withLeads = forms.filter((f) => f.submissionCount > 0).length;
    const avgConversion = forms.length
      ? Math.round(forms.reduce((s, f) => {
          const v = f.metadata?.viewCount || f.submissionCount * 3 || 1;
          return s + (f.submissionCount / v) * 100;
        }, 0) / forms.length)
      : 0;
    return { totalSubmissions, activeForms, withLeads, avgConversion, totalForms: forms.length };
  }, [forms]);

  const loadPlan = useCallback(async () => {
    try {
      const res = await authFetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUserPlan(data.data.plan || 'free');
        setMaxForms(data.data.quotas?.maxForms ?? 1);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/forms');
      const data = await res.json();
      if (data.success) {
        setForms(data.data);
      } else toast.error(data.error);
    } catch {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  }, []);

  const syncDraftFromForm = useCallback((form) => {
    if (!form) return;
    setDraftFields(JSON.parse(JSON.stringify(form.fields || DEFAULT_FIELDS)));
    setDraftStyling(normalizeStyling(form.styling));
    setDraftMeta({
      name: form.name || '',
      description: form.description || '',
      successMessage: form.successMessage || '',
      redirectUrl: form.redirectUrl || '',
    });
    setSelectedFieldIndex(null);
  }, []);

  useEffect(() => {
    loadPlan();
    fetchForms();
  }, [loadPlan, fetchForms]);

  useEffect(() => {
    if (selectedForm) syncDraftFromForm(selectedForm);
  }, [selectedForm?._id, syncDraftFromForm]);

  const fetchSubmissions = useCallback(async (formId) => {
    if (!formId) return;
    setSubmissionsLoading(true);
    try {
      const res = await authFetch('/api/automation/leads?source=form&limit=100');
      const data = await res.json();
      if (data.success) {
        const filtered = (data.data || []).filter(
          (l) => l.formId === formId || l.formId === String(formId) || l.sourceDetails?.includes(selectedForm?.name)
        );
        setSubmissions(filtered);
      }
    } catch {
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [selectedForm?.name]);

  useEffect(() => {
    if (view === 'analytics' && selectedId) fetchSubmissions(selectedId);
  }, [view, selectedId, fetchSubmissions]);

  const startWizard = useCallback(() => {
    if (forms.length >= maxForms) {
      toast.error(`Form limit reached (${maxForms} on ${userPlan} plan)`);
      return;
    }
    setWizardDraft({
      name: '', description: '', formType: 'floating', leadSource: 'website', pipelineStage: 'new', templateId: null, templateFields: null,
    });
    setWizardStep(1);
    setWorkspaceMode('wizard');
  }, [forms.length, maxForms, userPlan]);

  const openEditor = useCallback((formId) => {
    setSelectedId(formId);
    setView('builder');
    setWorkspaceMode('editor');
    setSelectedFieldIndex(null);
  }, []);

  const backToHome = useCallback(() => {
    setWorkspaceMode('home');
    setSelectedFieldIndex(null);
  }, []);

  const createForm = useCallback(async (payload = {}) => {
    if (forms.length >= maxForms) {
      toast.error(`Form limit reached (${maxForms} on ${userPlan} plan)`);
      return null;
    }
    try {
      const res = await authFetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name || 'Untitled Form',
          description: payload.description || '',
          fields: payload.fields || DEFAULT_FIELDS,
          styling: payload.styling,
          successMessage: payload.successMessage,
          redirectUrl: payload.redirectUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForms((prev) => [data.data, ...prev]);
        setSelectedId(data.data._id);
        setShowCreateModal(false);
        toast.success('Form created');
        return data.data;
      }
      toast.error(data.error);
      return null;
    } catch {
      toast.error('Failed to create form');
      return null;
    }
  }, [forms.length, maxForms, userPlan]);

  const completeWizard = useCallback(async () => {
    const tpl = wizardDraft.templateFields;
    if (!tpl) return;
    const styling = normalizeStyling({
      formType: wizardDraft.formType,
      automation: { pipelineStage: wizardDraft.pipelineStage, leadSource: wizardDraft.leadSource },
    });
    const created = await createForm({
      name: wizardDraft.name,
      description: wizardDraft.description,
      fields: JSON.parse(JSON.stringify(tpl)),
      styling,
    });
    if (created) {
      setWorkspaceMode('editor');
      setView('builder');
      setWizardStep(1);
    }
  }, [wizardDraft, createForm]);

  const saveForm = useCallback(async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await authFetch('/api/forms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: selectedId,
          name: draftMeta.name,
          description: draftMeta.description,
          fields: draftFields,
          styling: draftStyling,
          successMessage: draftMeta.successMessage,
          redirectUrl: draftMeta.redirectUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForms((prev) => prev.map((f) => (f._id === selectedId ? data.data : f)));
        toast.success('Form saved');
      } else toast.error(data.error);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }, [selectedId, draftFields, draftStyling, draftMeta]);

  const duplicateForm = useCallback(async (form) => {
    await createForm({
      name: `${form.name} (Copy)`,
      description: form.description,
      fields: JSON.parse(JSON.stringify(form.fields || DEFAULT_FIELDS)),
      styling: form.styling ? JSON.parse(JSON.stringify(form.styling)) : undefined,
      successMessage: form.successMessage,
      redirectUrl: form.redirectUrl,
    });
  }, [createForm]);

  const deleteForm = useCallback(async (formId) => {
    try {
      const res = await authFetch(`/api/forms?formId=${formId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setForms((prev) => prev.filter((f) => f._id !== formId));
        if (selectedId === formId) {
          setSelectedId(null);
          setWorkspaceMode('home');
        }
        toast.success('Form deleted');
        return true;
      }
      toast.error(data.error);
      return false;
    } catch {
      toast.error('Failed to delete form');
      return false;
    }
  }, [selectedId]);

  const togglePublish = useCallback(async (active) => {
    if (!selectedId) return;
    try {
      const res = await authFetch('/api/forms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: selectedId, active }),
      });
      const data = await res.json();
      if (data.success) {
        setForms((prev) => prev.map((f) => (f._id === selectedId ? data.data : f)));
        toast.success(active ? 'Form published' : 'Form unpublished');
      }
    } catch {
      toast.error('Update failed');
    }
  }, [selectedId]);

  return {
    loading, saving, forms, selectedForm, selectedId, setSelectedId,
    view, setView, workspaceMode, setWorkspaceMode,
    wizardStep, setWizardStep, wizardDraft, setWizardDraft,
    showThemeDrawer, setShowThemeDrawer,
    draftFields, setDraftFields, draftStyling, setDraftStyling,
    draftMeta, setDraftMeta, selectedFieldIndex, setSelectedFieldIndex,
    submissions, submissionsLoading, stats, userPlan, maxForms,
    showCreateModal, setShowCreateModal, showEmbedModal, setShowEmbedModal,
    createForm, saveForm, duplicateForm, deleteForm, archiveForm: deleteForm, togglePublish,
    startWizard, openEditor, backToHome, completeWizard,
    refresh: fetchForms, fetchSubmissions,
  };
}
