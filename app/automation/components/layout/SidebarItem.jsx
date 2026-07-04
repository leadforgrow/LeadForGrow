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
          ? 'bg-[#F3F4F6] font-medium text-black'
          : 'text-black hover:bg-[#F8F9FA] hover:text-black'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-black transition-all duration-200" />
      )}

      <span className={`relative shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:scale-[1.03]'}`}>
        <Icon
          className="h-[18px] w-[18px] text-black"
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
