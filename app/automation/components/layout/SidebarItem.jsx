'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import NotificationBadge from './NotificationBadge';

/**
 * Nav item.
 *
 * REST state: icon + label render monochrome slate, matching every other
 * item — keeps the sidebar scannable.
 *
 * ACTIVE state: applies the group's category tone (blue for CRM,
 * emerald for Communication, violet for Insights, etc.) to the icon,
 * the left stripe, and the pill background. This is the "colour only on
 * active" pattern — richness without visual noise.
 */

// Every tone maps to matched shades so the active pill, stripe, and icon
// look coherent. Fallback tone is slate (kept intentionally quiet).
const ACTIVE_TONE = {
  blue:    { pill: 'bg-blue-50 text-blue-800',       stripe: 'bg-blue-600',    icon: 'text-blue-600' },
  emerald: { pill: 'bg-emerald-50 text-emerald-800', stripe: 'bg-emerald-600', icon: 'text-emerald-600' },
  amber:   { pill: 'bg-amber-50 text-amber-800',     stripe: 'bg-amber-600',   icon: 'text-amber-600' },
  violet:  { pill: 'bg-violet-50 text-violet-800',   stripe: 'bg-violet-600',  icon: 'text-violet-600' },
  rose:    { pill: 'bg-rose-50 text-rose-800',       stripe: 'bg-rose-600',    icon: 'text-rose-600' },
  slate:   { pill: 'bg-[#F3F4F6] text-black',        stripe: 'bg-black',       icon: 'text-black' },
};

export default function SidebarItem({
  item,
  active,
  collapsed,
  badgeCount,
  onNavigate,
  onLockedClick,
  tone = 'slate',
}) {
  const Icon = item.icon;
  const locked = item.locked;
  const t = ACTIVE_TONE[tone] || ACTIVE_TONE.slate;

  if (locked) {
    return (
      <button
        type="button"
        onClick={() => onLockedClick?.(item.name, item.requiredTier || 'growth')}
        title={collapsed ? `${item.name} (Upgrade)` : undefined}
        className={`group relative flex w-full items-center gap-3 rounded-xl text-[13px] transition-all duration-200 ${
          collapsed ? 'justify-center px-2 py-2.5' : 'px-2.5 py-2'
        } cursor-pointer text-black/50 hover:bg-white/70 dark:hover:bg-emerald-950/20`}
      >
        <Icon className="h-[18px] w-[18px] text-black/50" strokeWidth={1.75} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left text-black/50">{item.name}</span>
            <Lock className="h-3.5 w-3.5 shrink-0 text-black/40" />
          </>
        )}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.name : undefined}
      className={`group relative flex items-center gap-3 rounded-xl text-[13px] transition-all duration-200 ${
        collapsed ? 'justify-center px-2 py-2.5' : 'px-2.5 py-2'
      } ${
        active
          ? `${t.pill} font-medium`
          : 'text-black hover:bg-[#F8F9FA] hover:text-black'
      }`}
    >
      {active && (
        <span className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-200 ${t.stripe}`} />
      )}

      <span className={`relative shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:scale-[1.03]'}`}>
        <Icon
          className={`h-[18px] w-[18px] transition-colors duration-200 ${active ? t.icon : 'text-black'}`}
          strokeWidth={1.75}
        />
        {collapsed && (
          <NotificationBadge count={badgeCount} urgent={item.urgent} dot={item.dot} collapsed />
        )}
      </span>

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.name}</span>
          <NotificationBadge count={badgeCount} urgent={item.urgent} dot={item.dot && !badgeCount} />
        </>
      )}
    </Link>
  );
}
