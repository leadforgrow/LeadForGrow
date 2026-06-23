'use client';

import Link from 'next/link';
import { PanelLeftClose, PanelLeft, X } from 'lucide-react';
import NotificationCenter from '../NotificationCenter';

export default function SidebarHeader({ collapsed, isMobile, onToggle, onMobileClose }) {
  const LogoMark = ({ size = 'md' }) => (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white shadow-[0_2px_8px_rgba(5,150,105,0.08)] ${
        size === 'sm' ? 'h-9 w-9' : 'h-8 w-8'
      }`}
    >
      <img src="/image.png" alt="LeadForGrow" className={size === 'sm' ? 'h-5 w-5 object-contain' : 'h-[18px] w-[18px] object-contain'} />
    </div>
  );

  return (
    <div
      className={`flex-shrink-0 border-b border-emerald-100/90 bg-white/60 backdrop-blur-sm dark:border-emerald-950/40 dark:bg-emerald-950/10 ${
        collapsed ? 'px-2 py-3' : 'px-3 py-3.5'
      }`}
    >
      <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
        {!collapsed ? (
          <Link href="/automation" className="group flex min-w-0 flex-1 items-center gap-2.5">
            <LogoMark />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[-0.01em] text-[#111827] transition-colors group-hover:text-emerald-800 dark:text-slate-50">
                LeadForGrow
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-700/55">
                CRM Workspace
              </p>
            </div>
          </Link>
        ) : (
          <Link href="/automation" title="LeadForGrow">
            <LogoMark size="sm" />
          </Link>
        )}

        <div className={`flex items-center gap-0.5 ${collapsed ? 'flex-col' : ''}`}>
          <NotificationCenter />
          <button
            type="button"
            onClick={isMobile ? onMobileClose : onToggle}
            className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? (
              <X className="h-4 w-4" />
            ) : collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
