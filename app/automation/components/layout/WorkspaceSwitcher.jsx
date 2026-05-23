'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Settings, Plus, User, CreditCard, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/components/ThemeContext';

export default function WorkspaceSwitcher({
  workspace,
  plan,
  displayName,
  email,
  role,
  collapsed,
  onLogout
}) {
  const [open, setOpen] = useState(false);
  const { theme = 'light', setThemeMode = () => {} } = useTheme() || {};
  const initial = workspace?.charAt(0)?.toUpperCase() || 'W';
  const roleLabel = role?.toLowerCase() === 'owner' ? 'Owner' : 'Team member';

  if (collapsed) {
    return (
      <div className="relative px-2 py-3 flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm hover:ring-2 hover:ring-blue-500/30 transition-all"
          title={workspace}
        >
          {initial}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-full bottom-0 ml-2 z-20 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{workspace}</p>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Theme</p>
                <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button type="button" onClick={() => setThemeMode('light')} className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium rounded-md ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>
                    <Sun className="w-3 h-3" /> Light
                  </button>
                  <button type="button" onClick={() => setThemeMode('dark')} className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium rounded-md ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>
                    <Moon className="w-3 h-3" /> Dark
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => { setOpen(false); onLogout?.(); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-t border-slate-100 dark:border-slate-800">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative px-3 py-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
          {initial}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">{workspace}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">{plan} plan</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-3 right-3 bottom-full mb-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{workspace}</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{displayName || email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 uppercase">
                {plan}
              </span>
              <span className="ml-1.5 text-[10px] text-slate-400">{roleLabel}</span>
            </div>
            <Link
              href="/user/home"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <User className="w-3.5 h-3.5" /> Profile
            </Link>
            <Link
              href="/automation/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Settings className="w-3.5 h-3.5" /> Workspace settings
            </Link>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <CreditCard className="w-3.5 h-3.5" /> Billing
            </Link>

            {/* Theme toggle */}
            <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Theme</p>
              <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                    theme === 'light'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" /> Add workspace (soon)
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); onLogout?.(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-t border-slate-100 dark:border-slate-800"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
