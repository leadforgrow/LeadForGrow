export const CHANNEL_FILTERS = [
  { id: 'all', label: 'All channels' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'email', label: 'Email' },
];

export const INBOX_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'intervened', label: 'Live' },
  { id: 'hot', label: 'Hot Leads' },
  { id: 'followup', label: 'Follow-up' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'archived', label: 'Archived' },
];

export const CHANNEL_META = {
  whatsapp: { label: 'WhatsApp', color: '#25D366', bg: 'bg-emerald-50 text-emerald-700' },
  instagram: { label: 'Instagram', color: '#E4405F', bg: 'bg-pink-50 text-pink-700' },
  email: { label: 'Email', color: '#6366f1', bg: 'bg-indigo-50 text-indigo-700' },
};

export { PIPELINE_STAGES } from '../leads/constants';

export const QUICK_EMOJIS = ['😊', '👍', '🙏', '✅', '👋', '📞', '💬', '🎉'];
