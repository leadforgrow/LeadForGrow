'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const DEFAULT_PROFILE = {
  businessName: 'LeadForGrow Demo',
  legalName: 'LeadForGrow Technologies Pvt Ltd',
  industry: 'SaaS / CRM',
  website: 'https://leadforgrow.com',
  phone: '+91 98765 43210',
  email: 'hello@leadforgrow.com',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  address: 'Bangalore, Karnataka, India'
};

const DEFAULT_WORKSPACE = {
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  weekStartsOn: 'monday',
  defaultPipeline: 'Sales Pipeline',
  leadAssignment: 'round_robin',
  autoArchiveDays: 90,
  showWhatsAppBadge: true
};

const DEFAULT_BRANDING = {
  primaryColor: '#2563eb',
  logoUrl: '',
  faviconUrl: '',
  emailFooter: 'Powered by LeadForGrow',
  customDomain: ''
};

export function useSettings() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [workspace, setWorkspace] = useState(DEFAULT_WORKSPACE);
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (section, data) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    if (section === 'profile') setProfile(data);
    if (section === 'workspace') setWorkspace(data);
    if (section === 'branding') setBranding(data);
    setSaving(false);
    toast.success('Settings saved');
  }, []);

  return { profile, workspace, branding, setProfile, setWorkspace, setBranding, saving, save };
}

export const MOCK_STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
export const MOCK_SOURCES = ['Website', 'WhatsApp', 'Meta Ads', 'Google Ads', 'Referral', 'Cold Call', 'Event'];
export const MOCK_TAGS = ['Hot Lead', 'VIP', 'Follow-up', 'Enterprise', 'SMB', 'Demo Requested'];
export const MOCK_PIPELINES = [
  { id: '1', name: 'Sales Pipeline', stages: 7, default: true },
  { id: '2', name: 'Enterprise Pipeline', stages: 5, default: false }
];

export const MOCK_CUSTOM_FIELDS = [
  { id: '1', name: 'Budget', type: 'number', required: false, entity: 'lead' },
  { id: '2', name: 'Company Size', type: 'dropdown', options: ['1-10', '11-50', '51-200', '200+'], required: false, entity: 'lead' },
  { id: '3', name: 'Decision Date', type: 'date', required: false, entity: 'lead' },
  { id: '4', name: 'Product Interest', type: 'tags', required: true, entity: 'lead' }
];

export const MOCK_AUTOMATION = {
  defaults: { autoAssign: true, createTaskOnNewLead: true, sendWelcomeWhatsApp: false },
  workingHours: { start: '09:00', end: '18:00', days: ['mon', 'tue', 'wed', 'thu', 'fri'], timezone: 'Asia/Kolkata' },
  sla: { firstResponse: 15, followUp: 60, escalation: 240 },
  followUp: { maxAttempts: 5, intervalHours: 24, channels: ['whatsapp', 'email', 'call'] },
  assignment: { strategy: 'round_robin', fallbackOwner: 'owner', respectWorkingHours: true }
};

export const MOCK_AI = {
  assistant: { enabled: true, tone: 'professional', language: 'en' },
  replies: { enabled: true, autoSuggest: true, requireApproval: true },
  scoring: { enabled: true, factors: ['engagement', 'source', 'budget', 'response_time'] },
  insights: { weeklyDigest: true, pipelineAlerts: true, anomalyDetection: false },
  reporting: { defaultPeriod: '30d', currency: 'INR', includeTeamBreakdown: true }
};

export const MOCK_BILLING = {
  plan: 'Growth',
  price: '₹4,999/mo',
  renewsAt: 'Jun 24, 2026',
  usage: { leads: { used: 842, limit: 5000 }, whatsapp: { used: 12400, limit: 25000 }, team: { used: 3, limit: 10 }, storage: { used: 1.2, limit: 10 } },
  invoices: [
    { id: 'INV-2026-004', date: 'May 1, 2026', amount: '₹4,999', status: 'paid' },
    { id: 'INV-2026-003', date: 'Apr 1, 2026', amount: '₹4,999', status: 'paid' },
    { id: 'INV-2026-002', date: 'Mar 1, 2026', amount: '₹4,999', status: 'paid' }
  ]
};

export const MOCK_SECURITY = {
  twoFactorEnabled: false,
  sessions: [
    { id: '1', device: 'Chrome on Windows', location: 'Bangalore, IN', lastActive: 'Active now', current: true },
    { id: '2', device: 'Safari on iPhone', location: 'Bangalore, IN', lastActive: '2 hours ago', current: false },
    { id: '3', device: 'Firefox on MacOS', location: 'Mumbai, IN', lastActive: '3 days ago', current: false }
  ],
  apiTokens: [
    { id: '1', name: 'Production API', prefix: 'lfg_prod_••••', created: 'Jan 15, 2026', lastUsed: '2 min ago' },
    { id: '2', name: 'Zapier Integration', prefix: 'lfg_zap_••••', created: 'Feb 3, 2026', lastUsed: '10 min ago' }
  ],
  auditLogs: [
    { id: '1', action: 'Integration connected', user: 'Admin', time: '2 hours ago', ip: '103.x.x.x' },
    { id: '2', action: 'Team member invited', user: 'Admin', time: '1 day ago', ip: '103.x.x.x' },
    { id: '3', action: 'Pipeline updated', user: 'Sales Manager', time: '2 days ago', ip: '49.x.x.x' },
    { id: '4', action: 'API token created', user: 'Admin', time: '3 days ago', ip: '103.x.x.x' }
  ]
};
