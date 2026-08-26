'use client';

import { useMemo } from 'react';
import {
  MessageCircle, Mail, Instagram, Clock, Plus, Trash2, GitBranch, Info, Layers,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import { createNode } from '@/lib/sequences/constants';

/**
 * SimpleEditView — the non-graph editor for linear sequences.
 *
 * Renders the sequence as a stacked list of editable cards, one per
 * messaging step, and rebuilds the underlying graph (draftNodes + draftEdges)
 * on any mutation — so this is the source of truth for the 80% linear use
 * case, while the Builder tab remains authoritative for branches / AI nodes.
 *
 * Structural mutations (add / delete / reorder / change channel) regenerate
 * the whole linear chain — simpler and less error-prone than surgical edge
 * splicing, and no visible cost at typical sequence sizes (<10 steps).
 * Preserves the existing trigger node so the trigger's config doesn't churn.
 */
export default function SimpleEditView({
  nodes, edges, onUpdateNode, onReplaceGraph, onSwitchToBuilder,
}) {
  const linear = useMemo(() => walkLinear(nodes, edges), [nodes, edges]);

  if (!linear.ok) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 mb-3">
            <GitBranch className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            This sequence has advanced logic
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            {linear.reason} Simple edit only supports straight-line drips
            (message → wait → message). Open the Builder to edit the full
            workflow visually.
          </p>
          <button
            type="button"
            onClick={onSwitchToBuilder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            <Layers className="w-4 h-4" /> Open Builder
          </button>
        </div>
      </div>
    );
  }

  const { steps, triggerNode, endNode, triggerLabel } = linear;

  // Rebuild the linear chain from a modified steps array. We keep the same
  // trigger + end nodes so their IDs stay stable (useful for anything else
  // holding references) — only the middle chain gets regenerated.
  const rebuild = (newSteps) => {
    const rebuilt = buildLinearChain({
      trigger: triggerNode,
      end: endNode,
      steps: newSteps,
    });
    onReplaceGraph(rebuilt.nodes, rebuilt.edges);
  };

  const handleAddStep = (afterIndex, channel = 'whatsapp') => {
    const newStep = {
      channel,
      messageTemplate: '',
      emailSubject: channel === 'email' ? '' : undefined,
      delayDays: 1,
      exitKeywords: ['stop', 'unsubscribe'],
    };
    const nextSteps = normaliseStepsForRebuild(steps);
    nextSteps.splice(afterIndex + 1, 0, newStep);
    rebuild(nextSteps);
  };

  const handleDeleteStep = (index) => {
    if (steps.length <= 1) return; // Never allow zero steps
    const nextSteps = normaliseStepsForRebuild(steps);
    nextSteps.splice(index, 1);
    rebuild(nextSteps);
  };

  const handleMoveStep = (index, direction) => {
    const target = index + (direction === 'up' ? -1 : 1);
    if (target < 0 || target >= steps.length) return;
    const nextSteps = normaliseStepsForRebuild(steps);
    [nextSteps[index], nextSteps[target]] = [nextSteps[target], nextSteps[index]];
    rebuild(nextSteps);
  };

  const handleChangeChannel = (index, newChannel) => {
    // Channel swap = swap the node type but keep everything else. No need to
    // rebuild the whole chain — a single node.type mutation is enough.
    const sendNode = steps[index].sendNode;
    const newType = channelToNodeType(newChannel);
    if (sendNode.type === newType) return;
    // updateNode's shallow-merge doesn't touch the `type` field — use full
    // graph replace with just the type changed for this one node.
    const nextNodes = nodes.map((n) =>
      n.id === sendNode.id ? { ...n, type: newType } : n
    );
    onReplaceGraph(nextNodes, edges);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-3">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200">
          <p className="font-semibold">Simple edit — no canvas needed.</p>
          <p className="mt-0.5 text-blue-800/80 dark:text-blue-300/80">
            Trigger: <strong>{triggerLabel}</strong> · {steps.length} {steps.length === 1 ? 'message' : 'messages'} · edits save
            with <em>Save draft</em> at the top.
          </p>
        </div>
      </div>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <StepCard
            key={step.sendNode.id}
            index={i}
            step={step}
            isFirst={i === 0}
            isLast={i === steps.length - 1}
            canDelete={steps.length > 1}
            onChangeMessage={(msg) => onUpdateNode(step.sendNode.id, { data: { message: msg, body: msg } })}
            onChangeEmailSubject={(subj) => onUpdateNode(step.sendNode.id, { data: { subject: subj } })}
            onChangeDelayHours={(hours) => step.delayNode && onUpdateNode(step.delayNode.id, { data: { delayHours: hours } })}
            onChangeChannel={(ch) => handleChangeChannel(i, ch)}
            onDelete={() => handleDeleteStep(i)}
            onMoveUp={() => handleMoveStep(i, 'up')}
            onMoveDown={() => handleMoveStep(i, 'down')}
            onInsertAfter={() => handleAddStep(i)}
          />
        ))}
      </ol>

      {/* Bottom "add first / another" button — mirrors the between-cards
          insertion so users always have an obvious way to grow the sequence. */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => handleAddStep(steps.length - 1)}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-400 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add another step
        </button>
      </div>
    </div>
  );
}

function StepCard({
  index, step, isFirst, isLast, canDelete,
  onChangeMessage, onChangeEmailSubject, onChangeDelayHours,
  onChangeChannel, onDelete, onMoveUp, onMoveDown, onInsertAfter,
}) {
  const channel = nodeTypeToChannel(step.sendNode.type);
  const { Icon, label, chipClass } = CHANNEL_META[channel] || CHANNEL_META.whatsapp;
  const message = step.sendNode.data?.message || step.sendNode.data?.body || '';
  const subject = step.sendNode.data?.subject || '';
  const delayHours = step.delayNode?.data?.delayHours ?? 0;
  const delayLabel = delayLabelFor(delayHours, index);
  const isEmail = channel === 'email';

  return (
    <li className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-2.5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[11px] font-semibold shrink-0">
          {index + 1}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide">
          <Clock className="w-3 h-3" /> {delayLabel}
        </div>

        {/* Channel selector — swaps the node type in one click */}
        <select
          value={channel}
          onChange={(e) => onChangeChannel(e.target.value)}
          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded border-0 cursor-pointer ${chipClass}`}
          title="Change channel"
        >
          <option value="whatsapp">📱 WhatsApp</option>
          <option value="email">📧 Email</option>
          <option value="instagram_dm">📸 Instagram DM</option>
        </select>

        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Move up"
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            title="Move down"
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={!canDelete}
            title={canDelete ? 'Delete step' : 'A sequence needs at least one step'}
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {step.delayNode && index > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-500">Wait</label>
            <input
              type="number"
              min="0"
              step="1"
              value={Math.max(0, Math.round((delayHours || 0) / 24))}
              onChange={(e) => onChangeDelayHours(Math.max(0, parseInt(e.target.value || '0', 10)) * 24)}
              className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm tabular-nums text-center"
            />
            <span className="text-slate-500">day(s) after previous step</span>
          </div>
        )}

        {isEmail && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => onChangeEmailSubject(e.target.value)}
              placeholder="Email subject line"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
            <span>Message</span>
            <span className="text-[10px] text-slate-400 font-normal">Variables: {'{{name}}, {{phone}}, {{business_name}}'}</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => onChangeMessage(e.target.value)}
            rows={4}
            placeholder={isEmail ? 'Write your email body…' : 'Hi {{name}}, ...'}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono leading-relaxed"
          />
          <p className="mt-1 text-[10px] text-slate-400 tabular-nums">
            {message.length}/1024 characters
            {message.length > 1024 && <span className="text-red-500 ml-2">Meta limit exceeded</span>}
          </p>
        </div>

        <BranchingBadges data={step.sendNode.data} />
      </div>

      {/* Add-between button — hangs below each card so inserting a new step
          between existing ones is a single click, not "scroll to bottom, add,
          drag up to reorder". */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-center py-2">
        <button
          type="button"
          onClick={onInsertAfter}
          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 font-medium"
        >
          <Plus className="w-3 h-3" /> Insert step below
        </button>
      </div>
    </li>
  );
}

function BranchingBadges({ data }) {
  const isGoal = !!data?.isGoal;
  const pauseOnReply = !!data?.pauseOnReply;
  const exitOnAnyReply = !!data?.exitOnAnyReply;
  const exitKeywords = Array.isArray(data?.exitKeywords) ? data.exitKeywords : [];
  if (!isGoal && !pauseOnReply && !exitOnAnyReply && !exitKeywords.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {isGoal && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
          🎯 Goal step
        </span>
      )}
      {pauseOnReply && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-medium">
          ⏸ Pauses if replied
        </span>
      )}
      {exitOnAnyReply && !pauseOnReply && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
          ✓ Exits on any reply
        </span>
      )}
      {exitKeywords.length > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-medium">
          🛑 Exits: {exitKeywords.slice(0, 3).join(', ')}{exitKeywords.length > 3 ? '…' : ''}
        </span>
      )}
    </div>
  );
}

const CHANNEL_META = {
  whatsapp:     { Icon: MessageCircle, label: 'WhatsApp',     chipClass: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300' },
  email:        { Icon: Mail,          label: 'Email',        chipClass: 'text-violet-700 bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300' },
  instagram_dm: { Icon: Instagram,     label: 'Instagram DM', chipClass: 'text-pink-700 bg-pink-100 dark:bg-pink-950/40 dark:text-pink-300' },
};

function channelToNodeType(channel) {
  if (channel === 'email') return 'send_email';
  if (channel === 'instagram_dm') return 'send_instagram_dm';
  return 'send_whatsapp';
}
function nodeTypeToChannel(type) {
  if (type === 'send_email') return 'email';
  if (type === 'send_instagram_dm') return 'instagram_dm';
  return 'whatsapp';
}

function delayLabelFor(hours, index) {
  if (index === 0 && !hours) return 'Immediately';
  if (!hours) return 'Same time';
  const days = hours / 24;
  if (days >= 1 && Number.isInteger(days)) return `+${days} day${days === 1 ? '' : 's'} later`;
  if (hours >= 1) return `+${Math.round(hours)}h later`;
  return `+${Math.round(hours * 60)}m later`;
}

/**
 * Convert a walked linear-view back into the plain-step objects that
 * buildLinearChain wants — one entry per messaging step, delay expressed in
 * days, branching config carried across.
 */
function normaliseStepsForRebuild(walkedSteps) {
  return walkedSteps.map((s) => ({
    channel: nodeTypeToChannel(s.sendNode.type),
    messageTemplate: s.sendNode.data?.message || s.sendNode.data?.body || '',
    emailSubject: s.sendNode.data?.subject || '',
    delayDays: s.delayNode ? Math.round((s.delayNode.data?.delayHours || 0) / 24) : 0,
    exitOnAnyReply: !!s.sendNode.data?.exitOnAnyReply,
    exitKeywords: Array.isArray(s.sendNode.data?.exitKeywords) ? s.sendNode.data.exitKeywords : [],
    pauseOnReply: !!s.sendNode.data?.pauseOnReply,
    isGoal: !!s.sendNode.data?.isGoal,
  }));
}

/**
 * Build a fresh linear chain (trigger → [delay → send]... → end). Keeps
 * whatever trigger + end nodes we were passed so their IDs stay stable and
 * any settings on the trigger survive a Simple-Edit mutation. Only the
 * middle chain (send + delay nodes) is regenerated.
 */
function buildLinearChain({ trigger, end, steps }) {
  const nodes = [trigger];
  const edges = [];
  let y = (trigger.position?.y ?? 40) + 120;
  let prevId = trigger.id;

  steps.forEach((step, i) => {
    // Preceding delay (skip on first step — that's "Immediately")
    if (step.delayDays > 0 && i > 0) {
      const delayNode = createNode('delay', { x: trigger.position?.x ?? 280, y });
      delayNode.data = { ...delayNode.data, delayHours: step.delayDays * 24 };
      nodes.push(delayNode);
      edges.push({ id: `e_${prevId}_${delayNode.id}`, source: prevId, target: delayNode.id });
      prevId = delayNode.id;
      y += 100;
    }

    const sendType = channelToNodeType(step.channel);
    const sendNode = createNode(sendType, { x: trigger.position?.x ?? 280, y });
    sendNode.data = {
      ...sendNode.data,
      message: step.messageTemplate || '',
      body: step.messageTemplate || '',
      subject: step.emailSubject || '',
      delayHours: step.delayDays ? step.delayDays * 24 : 0,
      exitOnAnyReply: !!step.exitOnAnyReply,
      exitKeywords: Array.isArray(step.exitKeywords) ? step.exitKeywords : [],
      pauseOnReply: !!step.pauseOnReply,
      isGoal: !!step.isGoal,
    };
    nodes.push(sendNode);
    edges.push({ id: `e_${prevId}_${sendNode.id}`, source: prevId, target: sendNode.id });
    prevId = sendNode.id;
    y += 120;
  });

  // Keep the same end node if the caller passed one, otherwise mint a new one
  const endNode = end || createNode('end', { x: trigger.position?.x ?? 280, y });
  // Reposition end to sit below the last step so the graph tab still renders sanely
  endNode.position = { x: endNode.position?.x ?? 280, y };
  nodes.push(endNode);
  edges.push({ id: `e_${prevId}_${endNode.id}`, source: prevId, target: endNode.id });

  return { nodes, edges };
}

/**
 * Walk the graph as a linear chain: trigger → (delay?) → send → (delay?) → send → … → end.
 * Returns { ok, steps, triggerNode, endNode, triggerLabel } — the trigger/end
 * refs let callers rebuild the middle without churning those.
 */
function walkLinear(nodes, edges) {
  if (!nodes?.length) return { ok: false, reason: 'This sequence is empty.' };

  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const outByNode = new Map();
  edges?.forEach((e) => {
    if (!outByNode.has(e.source)) outByNode.set(e.source, []);
    outByNode.get(e.source).push(e);
  });

  const trigger = nodes.find((n) => n.type?.startsWith('trigger_'));
  if (!trigger) return { ok: false, reason: 'No trigger node found.' };

  const steps = [];
  let cursor = trigger;
  let pendingDelay = null;
  let endNode = null;
  const visited = new Set();

  while (cursor) {
    if (visited.has(cursor.id)) {
      return { ok: false, reason: 'This sequence has a cycle.' };
    }
    visited.add(cursor.id);

    const outEdges = outByNode.get(cursor.id) || [];
    if (cursor.type === 'end') { endNode = cursor; break; }
    if (outEdges.length > 1) {
      return { ok: false, reason: 'This sequence has branches or conditions.' };
    }
    if (outEdges.length === 0 && cursor.type !== 'end') break;

    const next = nodesById.get(outEdges[0]?.target);
    if (!next) break;

    if (next.type === 'delay') {
      pendingDelay = next;
    } else if (next.type === 'send_whatsapp' || next.type === 'send_email' || next.type === 'send_instagram_dm') {
      steps.push({ sendNode: next, delayNode: pendingDelay });
      pendingDelay = null;
    } else if (next.type === 'end') {
      endNode = next;
      cursor = next;
      break;
    } else {
      return { ok: false, reason: `This sequence uses a "${next.type}" node the simple editor doesn't handle.` };
    }
    cursor = next;
  }

  if (!steps.length) {
    return { ok: false, reason: 'This sequence has no messages yet.' };
  }

  const triggerLabel = trigger.data?.label || trigger.type?.replace(/^trigger_/, '').replace(/_/g, ' ') || 'trigger';
  return { ok: true, steps, triggerNode: trigger, endNode, triggerLabel };
}
