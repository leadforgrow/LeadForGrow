export function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

export function getTimeUntil(date) {
  if (!date) return '—';
  const now = new Date();
  const target = new Date(date);
  const diff = target - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (diff < 0) {
    const absHours = Math.abs(hours);
    if (absHours >= 24) return `${Math.floor(absHours / 24)}d overdue`;
    return `${absHours}h overdue`;
  }
  if (hours >= 24) return `in ${Math.floor(hours / 24)}d`;
  if (hours > 0) return `in ${hours}h`;
  if (minutes > 0) return `in ${minutes}m`;
  return 'now';
}

export function formatDueDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function toDatetimeLocalValue(date) {
  if (!date) return '';
  const d = new Date(date);
  return (
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T` +
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  );
}
