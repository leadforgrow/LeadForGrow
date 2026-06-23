'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import NotificationBadge from './NotificationBadge';

export default function SidebarItem({
  item,
  active,
  collapsed,
  badgeCount,
  onNavigate,
  onLockedClick,
}) {
  const Icon = item.icon;
  const locked = item.locked;

  if (locked) {
    return (
      <button
        type="button"
        onClick={() => onLockedClick?.(item.name, item.requiredTier || 'growth')}
        title={collapsed ? `${item.name} (Upgrade)` : undefined}
        className={`group relative flex w-full items-center gap-3 rounded-xl text-[13px] transition-all duration-200 ${
          collapsed ? 'justify-center px-2 py-2.5' : 'px-2.5 py-2'
        } cursor-pointer text-[#94A3B8] hover:bg-white/70 dark:hover:bg-emerald-950/20`}
      >
        <Icon className="h-[18px] w-[18px] opacity-45" strokeWidth={1.75} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left opacity-70">{item.name}</span>
            <Lock className="h-3.5 w-3.5 shrink-0 text-[#CBD5E1]" />
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
          ? 'bg-white font-medium text-emerald-900 shadow-[0_1px_3px_rgba(5,150,105,0.08)] ring-1 ring-emerald-100 dark:bg-emerald-950/35 dark:text-emerald-300 dark:ring-emerald-900/50'
          : 'text-[#475569] hover:bg-white/70 hover:text-[#111827] dark:text-slate-400 dark:hover:bg-emerald-950/25 dark:hover:text-slate-100'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-600 transition-all duration-200" />
      )}

      <span className={`relative shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:scale-[1.03]'}`}>
        <Icon
          className={`h-[18px] w-[18px] ${
            active
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-[#64748B] group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
          }`}
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
