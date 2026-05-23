export const AVATAR_PALETTE = [
  { bg: 'bg-blue-100 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-400', ring: 'ring-blue-200/60', bar: 'bg-blue-500' },
  { bg: 'bg-violet-100 dark:bg-violet-950/50', text: 'text-violet-700 dark:text-violet-400', ring: 'ring-violet-200/60', bar: 'bg-violet-500' },
  { bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-200/60', bar: 'bg-emerald-500' },
  { bg: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-200/60', bar: 'bg-amber-500' },
  { bg: 'bg-rose-100 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-400', ring: 'ring-rose-200/60', bar: 'bg-rose-500' },
  { bg: 'bg-cyan-100 dark:bg-cyan-950/50', text: 'text-cyan-700 dark:text-cyan-400', ring: 'ring-cyan-200/60', bar: 'bg-cyan-500' }
];

export const STRATEGIES = [
  {
    id: 'solo',
    title: 'Only me (Solo)',
    description: 'Every new lead assigns to you. Best when you handle sales personally.',
    icon: 'UserCircle',
    accent: 'blue',
    selectedClass: 'border-blue-500/60 bg-blue-50/80 dark:bg-blue-950/20',
    iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
  },
  {
    id: 'round-robin',
    title: 'Round robin (Team)',
    description: 'Distribute leads evenly across active team members automatically.',
    icon: 'RefreshCw',
    accent: 'violet',
    selectedClass: 'border-violet-500/60 bg-violet-50/80 dark:bg-violet-950/20',
    iconClass: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400'
  }
];

export function memberName(member) {
  const u = member.userId;
  if (u?.firstName) return [u.firstName, u.lastName].filter(Boolean).join(' ');
  if (member.role === 'owner') return 'Business Owner';
  return u?.email || 'Team member';
}

export function memberInitials(member) {
  const name = memberName(member);
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

export function avatarColor(index) {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}
