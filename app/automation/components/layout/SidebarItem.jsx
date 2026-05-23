'use client';

import Link from 'next/link';
import NotificationBadge from './NotificationBadge';

export default function SidebarItem({
  item,
  active,
  collapsed,
  badgeCount,
  onNavigate
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.name : undefined}
      className={`group relative flex items-center gap-3 rounded-lg text-[13px] transition-all duration-200 ${
        collapsed ? 'justify-center px-2 py-2.5' : 'px-2.5 py-2'
      } ${
        active
          ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full transition-all duration-200" />
      )}

      <span className={`relative flex-shrink-0 transition-transform duration-200 ${active ? 'scale-105' : 'group-hover:scale-105'}`}>
        <Icon
          className={`w-[18px] h-[18px] ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}
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
