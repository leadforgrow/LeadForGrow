import { linearStepsToGraph, createNode } from './constants';

export const SEQUENCE_TEMPLATES = [
  {
    id: 'new_lead_followup',
    name: 'New Lead Follow-up',
    description: 'Instant WhatsApp + email nurture for fresh leads',
    category: 'nurture',
    triggerType: 'new_lead',
    icon: 'UserPlus',
    gradient: 'from-blue-500 to-indigo-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}}! 👋 Thanks for your interest. Our team will reach out shortly.' },
      { channel: 'email', delayDays: 1, emailSubject: 'Welcome {{name}}', messageTemplate: 'Hi {{name}},\n\nGreat to connect with you…' },
      { channel: 'whatsapp', delayDays: 2, messageTemplate: 'Hi {{name}}, just checking in — any questions we can help with?' },
    ]),
  },
  {
    id: 'whatsapp_nurture',
    name: 'WhatsApp Lead Nurturing',
    description: 'Multi-touch WhatsApp sequence for Indian SMBs',
    category: 'nurture',
    triggerType: 'new_lead',
    icon: 'MessageCircle',
    gradient: 'from-emerald-500 to-teal-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Namaste {{name}}! 🙏 We received your enquiry.' },
      { channel: 'whatsapp', delayDays: 1, messageTemplate: 'Hi {{name}}, sharing our brochure — reply YES for a callback.' },
      { channel: 'whatsapp', delayDays: 3, messageTemplate: 'Last chance to book your free consultation this week!' },
    ]),
  },
  {
    id: 'missed_call_recovery',
    name: 'Missed Call Recovery',
    description: 'Recover leads from missed calls automatically',
    category: 'recovery',
    triggerType: 'missed_call',
    icon: 'PhoneMissed',
    gradient: 'from-red-500 to-orange-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}}, we missed your call! When is a good time to connect?' },
      { channel: 'whatsapp', delayDays: 1, messageTemplate: 'Still here to help — reply with your preferred time.' },
    ], 'trigger_missed_call'),
  },
  {
    id: 'real_estate',
    name: 'Real Estate Follow-up',
    description: 'Property inquiry nurturing flow',
    category: 'nurture',
    triggerType: 'form_submission',
    icon: 'Home',
    gradient: 'from-amber-500 to-orange-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}}! Thanks for your property inquiry. Which location interests you?' },
      { channel: 'email', delayDays: 1, emailSubject: 'Properties for you', messageTemplate: 'Hi {{name}}, here are matching properties…' },
    ], 'trigger_form'),
  },
  {
    id: 'education',
    name: 'Education Inquiry',
    description: 'Course admission follow-up sequence',
    category: 'nurture',
    triggerType: 'form_submission',
    icon: 'GraduationCap',
    gradient: 'from-sky-500 to-blue-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}}! Thanks for your course inquiry. Our counselor will call you today.' },
      { channel: 'whatsapp', delayDays: 2, messageTemplate: 'Hi {{name}}, seats are filling fast — book your demo class now!' },
    ], 'trigger_form'),
  },
  {
    id: 'consultation',
    name: 'Consultation Booking',
    description: 'Drive consultation bookings',
    category: 'booking',
    triggerType: 'new_lead',
    icon: 'Calendar',
    gradient: 'from-violet-500 to-purple-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}}! Book your free consultation: reply with your preferred date & time.' },
      { channel: 'email', delayDays: 1, emailSubject: 'Book your consultation', messageTemplate: 'Hi {{name}},\n\nPick a slot that works for you…' },
    ]),
  },
  {
    id: 'reactivation',
    name: 'Reactivation Campaign',
    description: 'Win back cold leads',
    category: 'reactivation',
    triggerType: 'no_reply',
    icon: 'RotateCcw',
    gradient: 'from-rose-500 to-pink-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}}, we haven\'t heard from you — still interested?' },
      { channel: 'whatsapp', delayDays: 3, messageTemplate: 'Special offer just for you — reply INTERESTED to learn more.' },
    ], 'trigger_no_reply'),
  },
  {
    id: 'ai_whatsapp',
    name: 'AI WhatsApp Follow-up',
    description: 'AI-powered personalized WhatsApp replies',
    category: 'qualification',
    triggerType: 'new_lead',
    icon: 'Sparkles',
    gradient: 'from-cyan-500 to-blue-600',
    build: () => buildAiFlow(),
  },
  {
    id: 'qualification',
    name: 'Lead Qualification Flow',
    description: 'Qualify leads with AI scoring + pipeline move',
    category: 'qualification',
    triggerType: 'new_lead',
    icon: 'Target',
    gradient: 'from-indigo-500 to-violet-600',
    build: () => buildQualificationFlow(),
  },
  {
    id: 'demo_reminder',
    name: 'Demo Reminder',
    description: 'Remind leads before their scheduled demo',
    category: 'booking',
    triggerType: 'meeting_scheduled',
    icon: 'CalendarClock',
    gradient: 'from-violet-500 to-purple-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}}! Reminder: your demo is tomorrow. Reply CONFIRM to confirm.' },
      { channel: 'email', delayDays: 0, emailSubject: 'Demo reminder', messageTemplate: 'Hi {{name}},\n\nLooking forward to your demo tomorrow!' },
    ], 'trigger_meeting_scheduled'),
  },
  {
    id: 'payment_reminder',
    name: 'Payment Reminder',
    description: 'Follow up on pending payments',
    category: 'recovery',
    triggerType: 'payment_received',
    icon: 'CreditCard',
    gradient: 'from-emerald-500 to-green-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}}, friendly reminder about your pending payment. Need help?' },
      { channel: 'whatsapp', delayDays: 2, messageTemplate: 'Hi {{name}}, payment still pending — reply PAID once done.' },
    ], 'trigger_payment'),
  },
  {
    id: 'no_reply_sequence',
    name: 'No Reply Sequence',
    description: 'Multi-touch follow-up when leads go silent',
    category: 'reactivation',
    triggerType: 'no_reply',
    icon: 'MessageSquareOff',
    gradient: 'from-orange-500 to-red-500',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}}, just checking in — did you get my last message?' },
      { channel: 'email', delayDays: 2, emailSubject: 'Still interested?', messageTemplate: 'Hi {{name}}, wanted to follow up on your enquiry.' },
      { channel: 'whatsapp', delayDays: 4, messageTemplate: 'Last chance to connect this week — reply YES!' },
    ], 'trigger_no_reply'),
  },
  {
    id: 'welcome_customer',
    name: 'Welcome Customer',
    description: 'Onboard new customers after deal won',
    category: 'nurture',
    triggerType: 'deal_won',
    icon: 'PartyPopper',
    gradient: 'from-pink-500 to-rose-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Welcome aboard {{name}}! 🎉 We\'re thrilled to have you.' },
      { channel: 'email', delayDays: 1, emailSubject: 'Getting started', messageTemplate: 'Hi {{name}},\n\nHere\'s everything you need to get started…' },
    ], 'trigger_deal_won'),
  },
  {
    id: 'smart_sales',
    name: 'Smart Sales Automation',
    description: 'AI qualify → assign → welcome → task → follow-up',
    category: 'qualification',
    triggerType: 'new_lead',
    icon: 'Zap',
    gradient: 'from-blue-600 to-indigo-700',
    build: () => buildSmartSalesFlow(),
  },
];

function buildLinear(steps, trigger = 'trigger_new_lead') {
  const { nodes, edges } = linearStepsToGraph(steps, trigger);
  return { nodes, edges, steps, workflowMode: 'graph' };
}

function buildAiFlow() {
  const trigger = createNode('trigger_new_lead', { x: 280, y: 40 });
  const ai = createNode('ai_whatsapp_reply', { x: 280, y: 160 });
  ai.data.tone = 'friendly';
  const delay = createNode('delay', { x: 280, y: 280 });
  delay.data.delayHours = 24;
  const wa = createNode('send_whatsapp', { x: 280, y: 400 });
  wa.data.message = 'Hi {{name}}, following up on our conversation!';
  const end = createNode('end', { x: 280, y: 520 });
  const nodes = [trigger, ai, delay, wa, end];
  const edges = [
    { id: 'e1', source: trigger.id, target: ai.id },
    { id: 'e2', source: ai.id, target: delay.id },
    { id: 'e3', source: delay.id, target: wa.id },
    { id: 'e4', source: wa.id, target: end.id },
  ];
  return { nodes, edges, workflowMode: 'graph' };
}

function buildQualificationFlow() {
  const trigger = createNode('trigger_new_lead', { x: 280, y: 40 });
  const aiScore = createNode('ai_scoring', { x: 280, y: 160 });
  const condition = createNode('condition', { x: 280, y: 280 });
  condition.data = { field: 'score', operator: 'gte', value: '70', label: 'High score?' };
  const assign = createNode('assign_agent', { x: 120, y: 400 });
  const move = createNode('move_pipeline', { x: 440, y: 400 });
  move.data.stage = 'qualified';
  const end = createNode('end', { x: 280, y: 520 });
  const nodes = [trigger, aiScore, condition, assign, move, end];
  const edges = [
    { id: 'e1', source: trigger.id, target: aiScore.id },
    { id: 'e2', source: aiScore.id, target: condition.id },
    { id: 'e3', source: condition.id, target: assign.id, label: 'Yes' },
    { id: 'e4', source: condition.id, target: move.id, label: 'No' },
    { id: 'e5', source: assign.id, target: end.id },
    { id: 'e6', source: move.id, target: end.id },
  ];
  return { nodes, edges, workflowMode: 'graph' };
}

function buildSmartSalesFlow() {
  const trigger = createNode('trigger_new_lead', { x: 280, y: 40 });
  const aiQual = createNode('ai_qualification', { x: 280, y: 140 });
  const assign = createNode('assign_agent', { x: 280, y: 240 });
  const wa = createNode('send_whatsapp', { x: 280, y: 340 });
  wa.data.message = 'Hi {{name}}! Welcome — your dedicated advisor will reach out shortly.';
  const task = createNode('create_task', { x: 280, y: 440 });
  task.data.title = 'Book demo with {{name}}';
  task.data.dueHours = 24;
  const end = createNode('end', { x: 280, y: 540 });
  const nodes = [trigger, aiQual, assign, wa, task, end];
  const edges = [
    { id: 'e1', source: trigger.id, target: aiQual.id },
    { id: 'e2', source: aiQual.id, target: assign.id },
    { id: 'e3', source: assign.id, target: wa.id },
    { id: 'e4', source: wa.id, target: task.id },
    { id: 'e5', source: task.id, target: end.id },
  ];
  return { nodes, edges, workflowMode: 'graph' };
}

export function getTemplateById(id) {
  return SEQUENCE_TEMPLATES.find((t) => t.id === id);
}
