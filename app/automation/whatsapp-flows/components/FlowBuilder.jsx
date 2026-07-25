'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  Rocket,
  History,
  FlaskConical,
  LayoutGrid,
} from 'lucide-react';
import { authFetch } from '@/lib/apiClient';
import { getDefaultNodeData } from '@/lib/whatsappFlows/constants';
import { flowNodeTypes } from './FlowNodeCard';
import NodePalette from './NodePalette';
import NodeEditor from './NodeEditor';

function autoLayoutNodes(nodes) {
  const cols = 3;
  return nodes.map((n, i) => ({
    ...n,
    position: {
      x: 80 + (i % cols) * 260,
      y: 80 + Math.floor(i / cols) * 140,
    },
  }));
}

function FlowBuilderInner({ flowId }) {
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [testOpen, setTestOpen] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testMessage, setTestMessage] = useState('hi');
  const [dirty, setDirty] = useState(false);
  const saveTimer = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/automation/whatsapp-flows/${flowId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setFlow(data.data);
      setNodes(
        (data.data.nodes || []).map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position || { x: 0, y: 0 },
          data: n.data || getDefaultNodeData(n.type),
        }))
      );
      setEdges(
        (data.data.edges || []).map((e) => ({
          ...e,
          animated: true,
          style: { stroke: '#64748b' },
        }))
      );
      setVersions(data.data.versions || []);
      setDirty(false);
    } catch (err) {
      toast.error(err.message || 'Failed to load flow');
    } finally {
      setLoading(false);
    }
  }, [flowId, setNodes, setEdges]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    async ({ silent = false, createVersion = false } = {}) => {
      setSaving(true);
      try {
        const res = await authFetch(`/api/automation/whatsapp-flows/${flowId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: flow?.name,
            description: flow?.description,
            triggerType: flow?.triggerType,
            triggerConfig: flow?.triggerConfig,
            nodes: nodes.map((n) => ({
              id: n.id,
              type: n.type,
              position: n.position,
              data: n.data,
            })),
            edges: edges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
              sourceHandle: e.sourceHandle || 'default',
              targetHandle: e.targetHandle || 'default',
              label: e.label || '',
            })),
            createVersion,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        setFlow((prev) => ({ ...prev, ...data.data, nodes: data.data.nodes }));
        setDirty(false);
        if (!silent) toast.success('Saved');
      } catch (err) {
        toast.error(err.message || 'Save failed');
      } finally {
        setSaving(false);
      }
    },
    [flowId, flow, nodes, edges]
  );

  // Autosave
  useEffect(() => {
    if (!dirty || !flow) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist({ silent: true }), 1500);
    return () => clearTimeout(saveTimer.current);
  }, [dirty, nodes, edges, flow?.name, persist, flow]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        persist();
      }
      if (e.key === 'Delete' && selectedId) {
        setNodes((nds) => nds.filter((n) => n.id !== selectedId));
        setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
        setSelectedId(null);
        setDirty(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [persist, selectedId, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          { ...connection, id: `e_${connection.source}_${connection.target}_${Date.now()}`, animated: true, style: { stroke: '#64748b' } },
          eds
        )
      );
      setDirty(true);
    },
    [setEdges]
  );

  function addNode(type, position) {
    const id = `${type}_${Date.now()}`;
    const pos = position || { x: 200 + nodes.length * 20, y: 120 + nodes.length * 20 };
    setNodes((nds) => [
      ...nds,
      { id, type, position: pos, data: getDefaultNodeData(type) },
    ]);
    setSelectedId(id);
    setDirty(true);
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onDrop(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(type, position);
  }

  async function publish() {
    await persist({ silent: true });
    try {
      const res = await authFetch(`/api/automation/whatsapp-flows/${flowId}/publish`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setFlow((prev) => ({ ...prev, ...data.data }));
      toast.success('Published');
      load();
    } catch (err) {
      toast.error(err.message || 'Publish failed');
    }
  }

  async function runTest() {
    await persist({ silent: true });
    try {
      const res = await authFetch(`/api/automation/whatsapp-flows/${flowId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessage, name: 'Test Customer', phone: '919999999999' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setTestResult(data.data);
      toast.success(`Test: ${data.data.status}`);
    } catch (err) {
      toast.error(err.message || 'Test failed');
    }
  }

  async function restoreVersion(version) {
    try {
      const res = await authFetch(`/api/automation/whatsapp-flows/${flowId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(`Restored v${version}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Restore failed');
    }
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-950">Loading builder…</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] min-h-[640px] bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-white/10 px-3 py-2.5 flex flex-wrap items-center gap-2 bg-slate-950/90">
        <Link href="/automation/whatsapp-flows" className="p-2 rounded-lg hover:bg-white/10 text-slate-400">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <input
          value={flow?.name || ''}
          onChange={(e) => {
            setFlow((f) => ({ ...f, name: e.target.value }));
            setDirty(true);
          }}
          className="bg-transparent text-white font-semibold text-sm focus:outline-none border-b border-transparent focus:border-emerald-500/50 min-w-[160px]"
        />
        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-white/10 text-slate-400">
          {flow?.status}
        </span>
        {dirty && <span className="text-[11px] text-amber-400">Unsaved</span>}
        {saving && <span className="text-[11px] text-slate-500">Saving…</span>}

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setNodes((nds) => autoLayoutNodes(nds));
              setDirty(true);
              setTimeout(() => fitView({ padding: 0.2 }), 50);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-white/10 hover:bg-white/5"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Auto layout
          </button>
          <button
            type="button"
            onClick={() => setVersionsOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-white/10 hover:bg-white/5"
          >
            <History className="w-3.5 h-3.5" /> Versions
          </button>
          <button
            type="button"
            onClick={() => setTestOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-white/10 hover:bg-white/5"
          >
            <FlaskConical className="w-3.5 h-3.5" /> Test
          </button>
          <button
            type="button"
            onClick={() => persist()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-white/10 hover:bg-white/5"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button
            type="button"
            onClick={publish}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            <Rocket className="w-3.5 h-3.5" /> Publish
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        <NodePalette onAdd={addNode} />

        <div className="flex-1 relative" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => {
              onNodesChange(changes);
              setDirty(true);
            }}
            onEdgesChange={(changes) => {
              onEdgesChange(changes);
              setDirty(true);
            }}
            onConnect={onConnect}
            onSelectionChange={({ nodes: sel }) => setSelectedId(sel[0]?.id || null)}
            nodeTypes={flowNodeTypes}
            fitView
            colorMode="dark"
            proOptions={{ hideAttribution: true }}
            className="bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020617_70%)]"
          >
            <Background gap={20} color="#1e293b" />
            <Controls className="!bg-slate-900 !border-white/10 !shadow-xl" />
            <MiniMap
              className="!bg-slate-900/90 !border-white/10"
              nodeColor={(n) => (String(n.type).startsWith('trigger_') ? '#34d399' : String(n.type).startsWith('logic_') ? '#fbbf24' : '#60a5fa')}
            />
          </ReactFlow>

          {versionsOpen && (
            <div className="absolute top-3 right-3 w-64 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl z-10">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Version history</h4>
              {(versions.length ? versions : []).map((v) => (
                <button
                  key={v._id || v.version}
                  type="button"
                  onClick={() => restoreVersion(v.version)}
                  className="w-full text-left px-2 py-2 rounded-lg hover:bg-white/5 text-xs mb-1"
                >
                  <div className="text-white font-medium">v{v.version} {v.published ? '· published' : ''}</div>
                  <div className="text-slate-500">{v.note || 'Snapshot'}</div>
                </button>
              ))}
              {!versions.length && <p className="text-slate-500 text-xs">No versions yet</p>}
            </div>
          )}

          {testOpen && (
            <div className="absolute bottom-3 left-3 right-3 md:left-auto md:right-3 md:w-96 rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl z-10">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Test Flow</h4>
              <input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full mb-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                placeholder="Simulated inbound message"
              />
              <button
                type="button"
                onClick={runTest}
                className="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold"
              >
                Run simulation
              </button>
              {testResult && (
                <div className="mt-3 max-h-40 overflow-y-auto text-[11px] space-y-1">
                  <div className="text-slate-400">Status: <span className="text-white">{testResult.status}</span></div>
                  {(testResult.logs || []).map((log, i) => (
                    <div key={i} className="text-slate-500">
                      [{log.status}] {log.nodeType || ''} — {log.message || ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <NodeEditor
          node={selectedNode}
          variables={flow?.variables}
          onChange={(nextData) => {
            setNodes((nds) =>
              nds.map((n) => (n.id === selectedId ? { ...n, data: nextData } : n))
            );
            setDirty(true);
          }}
          onDelete={() => {
            setNodes((nds) => nds.filter((n) => n.id !== selectedId));
            setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
            setSelectedId(null);
            setDirty(true);
          }}
        />
      </div>
    </div>
  );
}

export default function FlowBuilder({ flowId }) {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner flowId={flowId} />
    </ReactFlowProvider>
  );
}
