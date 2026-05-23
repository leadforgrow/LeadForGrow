'use client';

import Link from 'next/link';
import { ChevronRight, ChevronLeft, Menu } from 'lucide-react';
import { SECTION_META, SECTION_COLORS } from './constants';

export default function SettingsHeader({ section, onMenuOpen, showBack = false }) {
  const meta = SECTION_META[section] || SECTION_META.hub;
  const colors = SECTION_COLORS[meta.color] || SECTION_COLORS.blue;

  const crumbs = showBack
    ? [
        { label: 'Automation', href: '/automation' },
        { label: 'Settings', href: '/automation/settings' },
        { label: meta.title.replace(' Settings', '').replace(' & Roles', '') }
      ]
    : [{ label: 'Automation', href: '/automation' }, { label: 'Settings' }];

  return (
    <header className="sticky top-0 z-20 bg-[#f8f9fc]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-4">
      <div className="flex items-start gap-3">
        {showBack && (
          <Link
            href="/automation/settings"
            className="flex items-center gap-1 p-2 -ml-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
            title="Back to Settings"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
        )}
        <button
          type="button"
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <nav className="flex items-center gap-1 text-[11px] text-slate-400 mb-1.5 flex-wrap">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-blue-600 transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {showBack && meta.color && (
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                <span className={`w-2 h-2 rounded-full ${colors.bar}`} />
              </div>
            )}
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{meta.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{meta.description}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
