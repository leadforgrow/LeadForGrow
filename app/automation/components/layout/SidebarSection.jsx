'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SidebarItem from './SidebarItem';
import { isNavItemActive } from './constants';

export default function SidebarSection({
  group,
  pathname,
  searchParams,
  collapsed,
  stats,
  onNavigate,
  onLockedClick
}) {
  const [open, setOpen] = useState(true);

  const getBadge = (item) => {
    if (!item.badgeKey) return 0;
    return stats[item.badgeKey] || 0;
  };

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={isNavItemActive(pathname, searchParams, item)}
            collapsed
            badgeCount={getBadge(item)}
            onNavigate={onNavigate}
            onLockedClick={onLockedClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 mb-1 group"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-slate-500">
          {group.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>
      {open && (
        <div className="space-y-0.5 animate-in fade-in duration-200">
          {group.items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              active={isNavItemActive(pathname, searchParams, item)}
              collapsed={false}
              badgeCount={getBadge(item)}
              onNavigate={onNavigate}
              onLockedClick={onLockedClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
