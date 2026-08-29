'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SidebarItem from './SidebarItem';
import { isNavItemActive, NAV_GROUP_TONES } from './constants';

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

  // Category tone — used only when an item is the active page, so the icon
  // tints to signal WHERE you are without colouring the whole nav.
  const groupTone = NAV_GROUP_TONES[group.id] || 'slate';

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
            tone={groupTone}
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
        className="group mb-1 flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-white/50 dark:hover:bg-emerald-950/20"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-black/60 group-hover:text-black">
          {group.label}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-black/50 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
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
              tone={groupTone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
