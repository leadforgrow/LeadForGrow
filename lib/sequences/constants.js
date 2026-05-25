/** Node type definitions for workflow builder & executor */

export const NODE_CATEGORIES = {
  trigger: { label: 'Triggers', color: 'blue' },
  action: { label: 'Actions', color: 'green' },
  ai: { label: 'AI', color: 'cyan' },
  logic: { label: 'Logic', color: 'amber' },
  end: { label: 'End', color: 'slate' },
};

export const TRIGGER_TYPES = [
  { type: 'trigger_new_lead', label: 'New Lead', icon: 'UserPlus', triggerKey: 'new_lead', engineTrigger: 'onLeadReceived' },
  { type: 'trigger_form', label: 'Form Submission', icon: 'FileInput', triggerKey: 'form_submission', engineTrigger: 'onLeadReceived' },
  { type: 'trigger_whatsapp', label: 'WhatsApp Message', icon: 'MessageCircle', triggerKey: 'whatsapp_message', engineTrigger: 'onLeadReceived' },
  { type: 'trigger_meta_lead', label: 'Meta Lead Ad', icon: 'Megaphone', triggerKey: 'meta_lead', engineTrigger: 'onLeadReceived' },
  { type: 'trigger_stage', label: 'Stage Changed', icon: 'GitBranch', triggerKey: 'stage_changed', engineTrigger: 'onStatusChange' },
  { type: 'trigger_missed_call', label: 'Missed Call', icon: 'PhoneMissed', triggerKey: 'missed_call', engineTrigger: 'onLeadReceived' },
  { type: 'trigger_tag', label: 'Tag Added', icon: 'Tag', triggerKey: 'tag_added', engineTrigger: 'onLeadReceived' },
  { type: 'trigger_no_reply', label: 'No Reply', icon: 'Clock', triggerKey: 'no_reply', engineTrigger: 'onNoResponse' },
  { type: 'trigger_payment', label: 'Payment Received', icon: 'CreditCard', triggerKey: 'payment_received', engineTrigger: 'onLeadReceived' },
];

export const ACTION_TYPES = [
  { type: 'send_whatsapp', label: 'Send WhatsApp', icon: 'MessageCircle', category: 'action' },
  { type: 'send_email', label: 'Send Email', icon: 'Mail', category: 'action' },
  { type: 'assign_agent', label: 'Assign Agent', icon: 'UserCheck', category: 'action' },
  { type: 'add_tag', label: 'Add Tag', icon: 'Tag', category: 'action' },
  { type: 'create_task', label: 'Create Task', icon: 'CheckSquare', category: 'action' },
  { type: 'move_pipeline', label: 'Move Pipeline', icon: 'ArrowRight', category: 'action' },
  { type: 'notify_team', label: 'Notify Team', icon: 'Bell', category: 'action' },
  { type: 'delay', label: 'Delay', icon: 'Timer', category: 'logic' },
  { type: 'condition', label: 'Condition', icon: 'Split', category: 'logic' },
  { type: 'wait_until', label: 'Wait Until', icon: 'Calendar', category: 'logic' },
  { type: 'webhook', label: 'Webhook', icon: 'Webhook', category: 'action' },
  { type: 'end', label: 'End Sequence', icon: 'Flag', category: 'end' },
];

export const AI_ACTION_TYPES = [
  { type: 'ai_whatsapp_reply', label: 'AI WhatsApp Reply', icon: 'Sparkles', category: 'ai' },
  { type: 'ai_qualification', label: 'AI Lead Qualification', icon: 'Brain', category: 'ai' },
  { type: 'ai_scoring', label: 'AI Lead Scoring', icon: 'TrendingUp', category: 'ai' },
  { type: 'ai_intent', label: 'AI Intent Detection', icon: 'Scan', category: 'ai' },
  { type: 'ai_followup_timing', label: 'AI Follow-up Timing', icon: 'Clock', category: 'ai' },
];

export const ALL_NODE_TYPES = [...TRIGGER_TYPES, ...ACTION_TYPES, ...AI_ACTION_TYPES];

export const NODE_STYLES = {
  trigger: 'from-blue-500 to-indigo-600',
  send_whatsapp: 'from-emerald-500 to-teal-600',
  send_email: 'from-violet-500 to-purple-600',
  assign_agent: 'from-sky-500 to-blue-600',
  add_tag: 'from-orange-500 to-amber-600',
  create_task: 'from-pink-500 to-rose-600',
  move_pipeline: 'from-indigo-500 to-blue-700',
  notify_team: 'from-yellow-500 to-orange-500',
  delay: 'from-amber-400 to-orange-500',
  condition: 'from-amber-500 to-yellow-600',
  wait_until: 'from-slate-500 to-slate-700',
  webhook: 'from-cyan-500 to-blue-600',
  end: 'from-slate-600 to-slate-800',
  ai_whatsapp_reply: 'from-cyan-400 to-blue-500',
  ai_qualification: 'from-teal-400 to-cyan-600',
  ai_scoring: 'from-purple-400 to-indigo-600',
  ai_intent: 'from-blue-400 to-violet-600',
  ai_followup_timing: 'from-emerald-400 to-cyan-500',
};

export const TRIGGER_TO_ENGINE = {
  new_lead: 'onLeadReceived',
  form_submission: 'onLeadReceived',
  whatsapp_message: 'onLeadReceived',
  meta_lead: 'onLeadReceived',
  stage_changed: 'onStatusChange',
  missed_call: 'onLeadReceived',
  tag_added: 'onLeadReceived',
  no_reply: 'onNoResponse',
  payment_received: 'onLeadReceived',
  event_joined: 'onEventJoined',
};

export const SEQUENCE_CATEGORIES = [
  { id: 'nurture', label: 'Lead nurturing' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'qualification', label: 'Qualification' },
  { id: 'reactivation', label: 'Reactivation' },
  { id: 'booking', label: 'Booking' },
  { id: 'custom', label: 'Custom' },
];

export function getNodeDef(type) {
  return ALL_NODE_TYPES.find((n) => n.type === type) || { type, label: type, category: 'action' };
}

export function getNodeStyle(type) {
  if (NODE_STYLES[type]) return NODE_STYLES[type];
  if (type?.startsWith('trigger_')) return NODE_STYLES.trigger;
  if (type?.startsWith('ai_')) return NODE_STYLES.ai_whatsapp_reply;
  return 'from-slate-500 to-slate-700';
}

export function createNode(type, position = { x: 0, y: 0 }) {
  const def = getNodeDef(type);
  const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const defaults = {
    send_whatsapp: { message: 'Hi {{name}}, thanks for reaching out!', templateName: '' },
    send_email: { subject: 'Following up', body: 'Hi {{name}}, …' },
    delay: { delayHours: 24, delayMinutes: 0 },
    condition: { field: 'status', operator: 'equals', value: 'new' },
    assign_agent: { strategy: 'round-robin' },
    add_tag: { tag: 'nurture' },
    create_task: { title: 'Follow up with {{name}}', dueHours: 24 },
    move_pipeline: { stage: 'contacted' },
    notify_team: { message: 'Lead {{name}} needs attention' },
    ai_whatsapp_reply: { tone: 'friendly', prompt: '' },
    end: {},
  };
  return {
    id,
    type,
    position,
    data: { label: def.label, ...(defaults[type] || {}) },
  };
}

export function linearStepsToGraph(steps, triggerType = 'trigger_new_lead') {
  const nodes = [];
  const edges = [];
  let y = 80;
  const trigger = createNode(triggerType, { x: 280, y: 40 });
  nodes.push(trigger);
  let prevId = trigger.id;

  steps.forEach((step, i) => {
    y += 120;
    const channel = step.channel || 'whatsapp';
    const type = channel === 'email' ? 'send_email' : channel === 'both' ? 'send_whatsapp' : 'send_whatsapp';
    const node = createNode(type, { x: 280, y });
    node.data = {
      ...node.data,
      message: step.messageTemplate || '',
      subject: step.emailSubject || '',
      body: step.messageTemplate || '',
      delayHours: step.delayDays ? step.delayDays * 24 : 0,
    };
    nodes.push(node);
    edges.push({ id: `e_${prevId}_${node.id}`, source: prevId, target: node.id });
    if (step.delayDays > 0 && i > 0) {
      const delayNode = createNode('delay', { x: 280, y: y - 60 });
      delayNode.data.delayHours = step.delayDays * 24;
      nodes.splice(nodes.length - 1, 0, delayNode);
      edges.pop();
      edges.push({ id: `e_${prevId}_${delayNode.id}`, source: prevId, target: delayNode.id });
      edges.push({ id: `e_${delayNode.id}_${node.id}`, source: delayNode.id, target: node.id });
    }
    prevId = node.id;
  });

  y += 120;
  const endNode = createNode('end', { x: 280, y });
  nodes.push(endNode);
  edges.push({ id: `e_${prevId}_${endNode.id}`, source: prevId, target: endNode.id });
  return { nodes, edges };
}
