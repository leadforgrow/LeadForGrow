import { STATUS_CONFIG } from './constants';

export function assigneeName(user) {
  if (!user) return 'Unassigned';
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.email?.split('@')[0] || 'Team member';
}

export function formatDate(date, opts = {}) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: opts.year ? 'numeric' : undefined,
    ...opts
  });
}

export function formatRelative(date) {
  if (!date) return '—';
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function formatSource(source) {
  if (!source) return 'Unknown';
  return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function statusLabel(status) {
  return STATUS_CONFIG[status]?.label || status || 'Unknown';
}

export function getWhatsAppStatus(lead) {
  const isWa = lead.source === 'whatsapp' || lead.whatsappId || lead.whatsapp;
  if (!isWa) return { key: 'none', label: '—', dot: 'bg-slate-300' };

  if (!lead.isRead) {
    return { key: 'unread', label: 'Unread', dot: 'bg-blue-500' };
  }
  if (lead.status === 'contacted' || lead.status === 'interested' || lead.status === 'converted') {
    return { key: 'replied', label: 'Replied', dot: 'bg-emerald-500' };
  }
  if (lead.status === 'new' || lead.status === 'follow-up') {
    return { key: 'pending', label: 'Pending', dot: 'bg-orange-400' };
  }
  return { key: 'no-response', label: 'No reply', dot: 'bg-slate-400' };
}

export function getLeadTags(lead) {
  const tags = [];
  if (lead.serviceInterest) tags.push(lead.serviceInterest);
  if (lead.priority === 'high' || lead.priority === 'urgent') tags.push('Hot');
  if (lead.campaignName) tags.push(lead.campaignName.slice(0, 20));
  return tags.slice(0, 3);
}

export function resolveTeamUser(member) {
  return member?.userId || member;
}

export function buildLeadsQuery(filters, userId) {
  const params = new URLSearchParams({ userId });
  if (filters.search) params.set('search', filters.search);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.source) params.set('source', filters.source);
  if (filters.assignedTo) params.set('assignedTo', filters.assignedTo);
  if (filters.view && filters.view !== 'all') params.set('view', filters.view);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  return params.toString();
}
