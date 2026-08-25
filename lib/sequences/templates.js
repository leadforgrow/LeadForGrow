import { linearStepsToGraph, createNode } from './constants';

/**
 * Universal opt-out keywords applied to every step of every industry
 * template. Meta requires marketing messages to honour opt-out — this makes
 * every template compliant out of the box without the customer thinking
 * about it. Case-insensitive whole-word match (see engine.handleInboundReply).
 */
const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'opt out', 'band karo', 'roko', 'nahi chahiye'];

/**
 * Industry taxonomy used by the template picker chips.
 * `generic` = works for any business, no industry filter.
 * Every industry template must set one of these; sort by relevance to Indian SMB market.
 */
export const SEQUENCE_INDUSTRIES = [
  { id: 'generic',      label: 'General',       emoji: '🌐' },
  { id: 'auto',         label: 'Auto service',  emoji: '🔧' },
  { id: 'salon',        label: 'Salon & spa',   emoji: '💇' },
  { id: 'ecommerce',    label: 'E-commerce',    emoji: '🛒' },
  { id: 'restaurant',   label: 'Restaurant',    emoji: '🍔' },
  { id: 'fitness',      label: 'Gym & fitness', emoji: '🏋️' },
  { id: 'clinic',       label: 'Clinic',        emoji: '🏥' },
  { id: 'coaching',     label: 'Coaching',      emoji: '📚' },
  { id: 'realestate',   label: 'Real estate',   emoji: '🏠' },
  { id: 'retail',       label: 'Retail',        emoji: '🛍️' },
];

export const SEQUENCE_TEMPLATES = [
  {
    id: 'new_lead_followup',
    name: 'New Lead Follow-up',
    description: 'Instant WhatsApp + email nurture for fresh leads',
    category: 'nurture',
    triggerType: 'new_lead',
    icon: 'UserPlus',
    industry: 'generic',
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
    industry: 'generic',
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
    industry: 'generic',
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
    industry: 'realestate',
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
    industry: 'coaching',
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
    industry: 'generic',
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
    industry: 'generic',
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
    industry: 'generic',
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
    industry: 'generic',
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
    industry: 'generic',
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
    industry: 'generic',
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
    industry: 'generic',
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
    industry: 'generic',
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
    industry: 'generic',
    gradient: 'from-blue-600 to-indigo-700',
    build: () => buildSmartSalesFlow(),
  },

  // ── Industry-specific templates ─────────────────────────────────────────
  // Each is a proven multi-touch flow written for one Indian SMB vertical.
  // Copy is intentionally warm, opt-out compliant, and short enough that
  // Meta template review accepts it as-is (marketing category).

  {
    id: 'auto_post_service',
    name: 'Auto service · Post-visit 3-touch',
    description: 'Thank-you → review request → next-service reminder',
    category: 'nurture',
    triggerType: 'tag_added',
    icon: 'Wrench',
    industry: 'auto',
    gradient: 'from-slate-600 to-slate-800',
    build: () => buildLinear([
      // Thank-you: if the customer replies here, they usually have a
      // question — pause and route to a human instead of drip-blasting.
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}} 👋 Thanks for choosing {{business_name}} today. Your vehicle is in expert hands. Reply STOP to opt out.',
        pauseOnReply: true, exitKeywords: OPT_OUT_KEYWORDS },
      // Review request: any reply = they engaged with the goal.
      { channel: 'whatsapp', delayDays: 2, messageTemplate: 'Hi {{name}}, how was your service experience at {{business_name}}? Your feedback helps us serve you better ⭐',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
      // Booking reminder: goal step — reply = they want to book.
      { channel: 'whatsapp', delayDays: 4, messageTemplate: 'Hi {{name}}, quick reminder — routine check-ups keep your ride running smooth. Book your next visit today.',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
    ], 'trigger_new_lead'),
  },
  {
    id: 'salon_post_visit',
    name: 'Salon & spa · Rebook flow',
    description: 'Thank-you → review → rebook offer on Day 21',
    category: 'nurture',
    triggerType: 'tag_added',
    icon: 'Scissors',
    industry: 'salon',
    gradient: 'from-pink-500 to-fuchsia-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}} ✨ Thanks for visiting {{business_name}} today. Hope you loved your look! Reply STOP to opt out.',
        pauseOnReply: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 3, messageTemplate: 'Hi {{name}}, we\'d love your feedback! A quick rating helps us keep the salon just the way you like it 💇',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 21, messageTemplate: 'Hi {{name}}, it\'s been 3 weeks! Time for a touch-up? 10% off if you book this week 💫',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
    ], 'trigger_new_lead'),
  },
  {
    id: 'ecommerce_cart_recovery',
    name: 'E-commerce · Cart recovery 3-touch',
    description: 'Nudge abandoned carts back with discount escalation',
    category: 'recovery',
    triggerType: 'tag_added',
    icon: 'ShoppingCart',
    industry: 'ecommerce',
    gradient: 'from-amber-500 to-orange-600',
    build: () => buildLinear([
      // Cart nudge: any reply = they're actively deciding, exit and let a
      // human agent close instead of dropping more discounts on them.
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}} 🛒 You left something behind at {{business_name}}. Complete your order in one tap.',
        exitOnAnyReply: true, isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 1, messageTemplate: 'Hi {{name}}, still thinking? Here\'s 5% off to seal the deal — code SAVE5. Expires in 24h.',
        exitOnAnyReply: true, isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 3, messageTemplate: 'Hi {{name}}, final call — 10% off ends tonight. Code SAVE10. Grab it before it\'s gone.',
        exitOnAnyReply: true, isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
    ], 'trigger_new_lead'),
  },
  {
    id: 'restaurant_post_order',
    name: 'Restaurant · Feedback + repeat',
    description: 'Post-order feedback then next-week offer',
    category: 'nurture',
    triggerType: 'tag_added',
    icon: 'UtensilsCrossed',
    industry: 'restaurant',
    gradient: 'from-orange-500 to-red-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}} 🍽️ Hope you enjoyed your meal at {{business_name}}! Tap ⭐ if you\'d recommend us.',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 7, messageTemplate: 'Hi {{name}}, craving something again? 15% off your next order this week — order now 🍔',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
    ], 'trigger_new_lead'),
  },
  {
    id: 'gym_trial_to_paid',
    name: 'Gym · Trial to paid 4-touch',
    description: 'Convert free trials into paid memberships',
    category: 'qualification',
    triggerType: 'tag_added',
    icon: 'Dumbbell',
    industry: 'fitness',
    gradient: 'from-red-500 to-rose-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}} 🏋️ Welcome to {{business_name}}! Your first free session is booked. See you soon!',
        pauseOnReply: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 1, messageTemplate: 'Hi {{name}}, how was your workout? Any questions for our trainer?',
        pauseOnReply: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 3, messageTemplate: 'Hi {{name}}, want to keep the momentum going? Membership plans start at ₹999/month.',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 7, messageTemplate: 'Hi {{name}}, last chance to lock in your trial pricing — 20% off if you join this week.',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
    ], 'trigger_new_lead'),
  },
  {
    id: 'clinic_appointment_flow',
    name: 'Clinic · Appointment 3-touch',
    description: 'Confirmation → day-before reminder → post-visit',
    category: 'booking',
    triggerType: 'tag_added',
    icon: 'Stethoscope',
    industry: 'clinic',
    gradient: 'from-teal-500 to-cyan-600',
    build: () => buildLinear([
      // "Reply RESCHEDULE" must always pause — clinic reception needs to
      // handle rescheduling, not the sequence.
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}} 🏥 Your appointment at {{business_name}} is confirmed. Reply RESCHEDULE if you need to change it.',
        pauseOnReply: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 1, messageTemplate: 'Hi {{name}}, quick reminder — your visit is tomorrow. Please arrive 10 min early.',
        pauseOnReply: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 2, messageTemplate: 'Hi {{name}}, hope your visit went well. Rate your experience — it helps us improve 🩺',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
    ], 'trigger_new_lead'),
  },
  {
    id: 'coaching_enquiry_nurture',
    name: 'Coaching · Enquiry to enrollment 4-touch',
    description: 'Nurture course enquiries into paid enrollments',
    category: 'qualification',
    triggerType: 'new_lead',
    icon: 'BookOpen',
    industry: 'coaching',
    gradient: 'from-blue-500 to-indigo-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}} 📚 Thanks for your interest in {{business_name}}. Our counsellor will call you today to help you choose the right course.',
        pauseOnReply: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 1, messageTemplate: 'Hi {{name}}, sharing our brochure and fee details. Any questions? Just reply here.',
        pauseOnReply: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 3, messageTemplate: 'Hi {{name}}, this week\'s free demo class is open — book your seat now 🎓',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 7, messageTemplate: 'Hi {{name}}, early-bird discount ends Sunday — 15% off if you enrol this week.',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
    ], 'trigger_new_lead'),
  },
  {
    id: 'retail_new_customer',
    name: 'Retail · New customer 3-touch',
    description: 'Welcome, first-purchase offer, loyalty invite',
    category: 'nurture',
    triggerType: 'tag_added',
    icon: 'ShoppingBag',
    industry: 'retail',
    gradient: 'from-purple-500 to-pink-600',
    build: () => buildLinear([
      { channel: 'whatsapp', messageTemplate: 'Hi {{name}} 🛍️ Welcome to {{business_name}}! Enjoy 10% off your first purchase — code WELCOME10.',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
      // Explicit YES/HOLD keywords exit → treat as goal via any-reply on this
      // step; the retention manager will follow up manually.
      { channel: 'whatsapp', delayDays: 3, messageTemplate: 'Hi {{name}}, still thinking about that item? Reply YES and we\'ll hold it for you 💫',
        exitOnAnyReply: true, isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
      { channel: 'whatsapp', delayDays: 14, messageTemplate: 'Hi {{name}}, join our loyalty programme — earn points on every purchase and unlock exclusive perks 🎁',
        isGoal: true, exitKeywords: OPT_OUT_KEYWORDS },
    ], 'trigger_new_lead'),
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
