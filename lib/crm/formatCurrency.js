export function formatCurrency(value, currency = 'INR') {
  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$';
  const n = Number(value) || 0;
  if (n >= 10000000) return `${symbol}${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `${symbol}${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${symbol}${(n / 1000).toFixed(1)}K`;
  return `${symbol}${n.toLocaleString()}`;
}

export function formatTime(date) {
  if (!date) return '—';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
