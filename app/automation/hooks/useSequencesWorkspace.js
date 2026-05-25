'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { SEQUENCE_TEMPLATES } from '@/lib/sequences/templates';
import { createNode, TRIGGER_TYPES } from '@/lib/sequences/constants';

const getUserId = () => (typeof window !== 'undefined' ? localStorage.getItem('userid') : null);
const api = (path, opts = {}) => {
  const userId = getUserId();
  const sep = path.includes('?') ? '&' : '?';
  return fetch(`${path}${sep}userId=${userId}`, opts);
};

export function useSequencesWorkspace() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sequences, setSequences] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [workspaceMode, setWorkspaceMode] = useState('home');
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardDraft, setWizardDraft] = useState({
    name: '',
    description: '',
    category: 'custom',
    triggerType: 'new_lead',
    templateId: null,
  });
  const [builderTab, setBuilderTab] = useState('builder');
  const [draftNodes, setDraftNodes] = useState([]);
  const [draftEdges, setDraftEdges] = useState([]);
  const [draftMeta, setDraftMeta] = useState({ name: '', description: '', category: 'custom', triggerType: 'new_lead', status: 'draft' });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const historyRef = useRef({ past: [], future: [] });

  const selectedSequence = useMemo(
    () => sequences.find((s) => s._id === selectedId) || null,
    [sequences, selectedId]
  );

  const stats = useMemo(() => {
    const active = sequences.filter((s) => s.status === 'active').length;
    const enrolled = sequences.reduce((n, s) => n + (s.analytics?.enrolled || 0), 0);
    const completed = sequences.reduce((n, s) => n + (s.analytics?.completed || 0), 0);
    const running = sequences.reduce((n, s) => n + (s.analytics?.activeRuns || 0), 0);
    return { total: sequences.length, active, enrolled, completed, running };
  }, [sequences]);

  const fetchSequences = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api('/api/automation/sequences');
      const data = await res.json();
      if (data.success) setSequences(data.data);
      else toast.error(data.error);
    } catch {
      toast.error('Failed to load sequences');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const loadExecutions = useCallback(async (id) => {
    if (!id) return;
    try {
      setExecutionsLoading(true);
      const [exRes, anRes] = await Promise.all([
        api(`/api/automation/sequences/${id}/executions`),
        api(`/api/automation/sequences/${id}/analytics`),
      ]);
      const exData = await exRes.json();
      const anData = await anRes.json();
      if (exData.success) setExecutions(exData.data);
      if (anData.success) setAnalytics(anData.data);
    } catch {
      toast.error('Failed to load execution data');
    } finally {
      setExecutionsLoading(false);
    }
  }, []);

  const pushHistory = useCallback(() => {
    historyRef.current.past.push({ nodes: draftNodes, edges: draftEdges });
    historyRef.current.future = [];
  }, [draftNodes, draftEdges]);

  const undo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (!past.length) return;
    future.unshift({ nodes: draftNodes, edges: draftEdges });
    const prev = past.pop();
    setDraftNodes(prev.nodes);
    setDraftEdges(prev.edges);
  }, [draftNodes, draftEdges]);

  const redo = useCallback(() => {
    const { future } = historyRef.current;
    if (!future.length) return;
    historyRef.current.past.push({ nodes: draftNodes, edges: draftEdges });
    const next = future.shift();
    setDraftNodes(next.nodes);
    setDraftEdges(next.edges);
  }, [draftNodes, draftEdges]);

  const startWizard = () => {
    setWizardDraft({ name: '', description: '', category: 'custom', triggerType: 'new_lead', templateId: null });
    setWizardStep(1);
    setWorkspaceMode('wizard');
  };

  const openEditor = (seq) => {
    setSelectedId(seq._id);
    setDraftNodes(seq.nodes || []);
    setDraftEdges(seq.edges || []);
    setDraftMeta({
      name: seq.name,
      description: seq.description || '',
      category: seq.category || 'custom',
      triggerType: seq.triggerType || 'new_lead',
      status: seq.status || 'draft',
    });
    setSelectedNodeId(null);
    historyRef.current = { past: [], future: [] };
    setWorkspaceMode('editor');
    setBuilderTab('builder');
    loadExecutions(seq._id);
  };

  const finishWizard = async (templateId) => {
    const triggerDef = TRIGGER_TYPES.find((t) => t.triggerKey === wizardDraft.triggerType);
    const triggerType = triggerDef?.type || 'trigger_new_lead';

    let nodes = [];
    let edges = [];

    if (templateId !== 'blank') {
      const template = SEQUENCE_TEMPLATES.find((t) => t.id === templateId);
      const built = template?.build?.() || { nodes: [], edges: [] };
      nodes = built.nodes || [];
      edges = built.edges || [];
    } else {
      const trigger = createNode(triggerType, { x: 280, y: 80 });
      const end = createNode('end', { x: 280, y: 280 });
      nodes = [trigger, end];
      edges = [{ id: `e_${trigger.id}_${end.id}`, source: trigger.id, target: end.id }];
    }

    if (nodes.length && !nodes.some((n) => n.type?.startsWith('trigger_'))) {
      const trigger = createNode(triggerType, { x: 280, y: 40 });
      nodes = [trigger, ...nodes];
      if (nodes[1]) {
        edges = [{ id: `e_${trigger.id}_${nodes[1].id}`, source: trigger.id, target: nodes[1].id }, ...edges];
      }
    }

    setDraftNodes(nodes);
    setDraftEdges(edges);
    setDraftMeta({
      name: wizardDraft.name,
      description: wizardDraft.description,
      category: wizardDraft.category,
      triggerType: wizardDraft.triggerType,
      status: 'draft',
    });
    setSelectedId(null);
    setWizardStep(1);
    setWorkspaceMode('editor');
    setBuilderTab('builder');
  };

  const saveSequence = async (activate = false) => {
    const userId = getUserId();
    if (!userId) return toast.error('Please sign in');
    if (!draftMeta.name?.trim()) return toast.error('Sequence name required');

    setSaving(true);
    try {
      const payload = {
        name: draftMeta.name,
        description: draftMeta.description,
        category: draftMeta.category,
        triggerType: draftMeta.triggerType,
        nodes: draftNodes,
        edges: draftEdges,
        status: activate ? 'active' : draftMeta.status,
      };

      const isNew = !selectedId;
      const url = isNew ? '/api/automation/sequences' : `/api/automation/sequences/${selectedId}`;
      const res = await api(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.success(activate ? 'Sequence activated!' : 'Sequence saved');
      setSelectedId(data.data._id);
      setDraftMeta((m) => ({ ...m, status: data.data.status }));
      await fetchSequences();
      if (activate) toast.success('Automation rule synced — toggle in Automation Rules if needed');
    } catch (e) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteSequence = async (id) => {
    try {
      const res = await api(`/api/automation/sequences/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Sequence deleted');
      if (selectedId === id) {
        setWorkspaceMode('home');
        setSelectedId(null);
      }
      fetchSequences();
    } catch (e) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const updateNode = (nodeId, patch) => {
    pushHistory();
    setDraftNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, ...patch, data: { ...n.data, ...patch.data } } : n)));
  };

  const addNode = (type, position) => {
    pushHistory();
    const node = createNode(type, position);
    setDraftNodes((prev) => [...prev, node]);
    setSelectedNodeId(node.id);
    return node;
  };

  const removeNode = (nodeId) => {
    pushHistory();
    setDraftNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setDraftEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const duplicateNode = (nodeId) => {
    const src = draftNodes.find((n) => n.id === nodeId);
    if (!src) return;
    pushHistory();
    const copy = createNode(src.type, { x: src.position.x + 40, y: src.position.y + 40 });
    copy.data = { ...src.data };
    setDraftNodes((prev) => [...prev, copy]);
    setSelectedNodeId(copy.id);
  };

  const connectNodes = (source, target) => {
    if (source === target) return;
    const exists = draftEdges.some((e) => e.source === source && e.target === target);
    if (exists) return;
    pushHistory();
    setDraftEdges((prev) => [...prev, { id: `e_${source}_${target}`, source, target }]);
  };

  const moveNode = (nodeId, position) => {
    setDraftNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, position } : n)));
  };

  const selectedNode = draftNodes.find((n) => n.id === selectedNodeId) || null;

  return {
    loading, saving, sequences, stats, selectedSequence, selectedId,
    workspaceMode, setWorkspaceMode, wizardStep, setWizardStep, wizardDraft, setWizardDraft,
    builderTab, setBuilderTab, draftNodes, draftEdges, draftMeta, setDraftMeta,
    selectedNodeId, setSelectedNodeId, selectedNode, executions, analytics, executionsLoading,
    startWizard, openEditor, finishWizard, saveSequence, deleteSequence,
    fetchSequences, loadExecutions, updateNode, addNode, removeNode, duplicateNode,
    connectNodes, moveNode, undo, redo, setDraftNodes, setDraftEdges,
    templates: SEQUENCE_TEMPLATES,
  };
}
