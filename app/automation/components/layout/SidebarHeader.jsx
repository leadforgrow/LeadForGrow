'use client';

import Link from 'next/link';
import { PanelLeftClose, PanelLeft, Menu, X } from 'lucide-react';
import NotificationCenter from '../NotificationCenter';

export default function SidebarHeader({ collapsed, isMobile, onToggle, onMobileClose }) {
  return (
    <div className={`flex-shrink-0 border-b border-slate-200/80 dark:border-slate-800 ${collapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
      <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
        {!collapsed ? (
          <Link href="/automation" className="flex items-center gap-2.5 min-w-0 flex-1 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate group-hover:text-blue-600 transition-colors">
                LeadForGrow
              </p>
              <p className="text-[10px] text-slate-400">CRM Workspace</p>
            </div>
          </Link>
        ) : (
          <Link href="/automation" className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm" title="LeadForGrow">
            <span className="text-white font-bold text-sm">L</span>
          </Link>
        )}

        <div className={`flex items-center gap-0.5 ${collapsed ? 'flex-col' : ''}`}>
          <NotificationCenter />
          <button
            type="button"
            onClick={isMobile ? onMobileClose : onToggle}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? (
              <X className="w-4 h-4" />
            ) : collapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
