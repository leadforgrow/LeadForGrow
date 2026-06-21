export const PIPELINE_STAGES = [
  { key: 'new', label: 'New Lead' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'interested', label: 'Interested' },
  { key: 'follow-up', label: 'Follow-up' },
  { key: 'converted', label: 'Converted' },
  { key: 'lost', label: 'Lost' }
];

export const STATUS_CONFIG = {
  new: {
    label: 'New Lead',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900'
  },
  contacted: {
    label: 'Contacted',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900'
  },
  interested: {
    label: 'Interested',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
  },
  'follow-up': {
    label: 'Follow-up',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
  },
  converted: {
    label: 'Converted',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
  },
  lost: {
    label: 'Lost',
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
  }
};

export const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', badge: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' },
  high: { label: 'High', badge: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' },
  medium: { label: 'Medium', badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' },
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' }
};

export const SCORE_CONFIG = {
  High: { badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  Medium: { badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  Low: { badge: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' }
};

export const SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'website', label: 'Website' },
  { value: 'form', label: 'Form' },
  { value: 'bot', label: 'Chatbot' },
  { value: 'manual', label: 'Manual' },
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'instagram_ad', label: 'Instagram Ad' },
  { value: 'facebook_ad', label: 'Facebook Ad' },
  { value: 'referral', label: 'Referral' },
  { value: 'call', label: 'Call' },
  { value: 'other', label: 'Other' }
];

export const SMART_VIEWS = [
  { id: 'all', label: 'All Leads' },
  { id: 'my-leads', label: 'My Leads' },
  { id: 'today-followups', label: 'Today Follow-ups' },
  { id: 'hot', label: 'Hot Leads' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'whatsapp-unread', label: 'WhatsApp Unread' }
];

export const SAVED_VIEWS_KEY = 'lfg_leads_saved_views';

/** 10 row highlight colors for the leads table */
export const LEAD_ROW_COLORS = [
  { id: 'amber', value: '#fef3c7', dark: 'rgba(254, 243, 199, 0.15)', label: 'Amber' },
  { id: 'blue', value: '#dbeafe', dark: 'rgba(219, 234, 254, 0.15)', label: 'Blue' },
  { id: 'green', value: '#dcfce7', dark: 'rgba(220, 252, 231, 0.15)', label: 'Green' },
  { id: 'pink', value: '#fce7f3', dark: 'rgba(252, 231, 243, 0.15)', label: 'Pink' },
  { id: 'indigo', value: '#e0e7ff', dark: 'rgba(224, 231, 255, 0.15)', label: 'Indigo' },
  { id: 'orange', value: '#ffedd5', dark: 'rgba(255, 237, 213, 0.15)', label: 'Orange' },
  { id: 'purple', value: '#f3e8ff', dark: 'rgba(243, 232, 255, 0.15)', label: 'Purple' },
  { id: 'teal', value: '#ccfbf1', dark: 'rgba(204, 251, 241, 0.15)', label: 'Teal' },
  { id: 'rose', value: '#ffe4e6', dark: 'rgba(255, 228, 230, 0.15)', label: 'Rose' },
  { id: 'slate', value: '#f1f5f9', dark: 'rgba(241, 245, 249, 0.12)', label: 'Slate' }
];

export const TABLE_COLUMNS = [
  { key: 'name', label: 'Lead Name', sortable: true, minWidth: 160 },
  { key: 'phone', label: 'Phone', sortable: false, minWidth: 120 },
  { key: 'whatsapp', label: 'WhatsApp', sortable: false, minWidth: 90 },
  { key: 'source', label: 'Source', sortable: true, minWidth: 100 },
  { key: 'status', label: 'Status', sortable: true, minWidth: 110 },
  { key: 'stage', label: 'Pipeline', sortable: false, minWidth: 100 },
  { key: 'assignedTo', label: 'Assigned To', sortable: true, minWidth: 130 },
  { key: 'lastActivity', label: 'Last Activity', sortable: true, minWidth: 120 },
  { key: 'nextFollowUp', label: 'Next Follow-up', sortable: true, minWidth: 120 },
  { key: 'score', label: 'Score', sortable: true, minWidth: 70 },
  { key: 'tags', label: 'Tags', sortable: false, minWidth: 100 },
  { key: 'receivedAt', label: 'Created', sortable: true, minWidth: 100 }
];
