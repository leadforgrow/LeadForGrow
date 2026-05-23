'use client';

import { Suspense, useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import SettingsSidebar from './SettingsSidebar';
import SettingsHeader from './SettingsHeader';

function sectionFromPath(pathname) {
  if (pathname.includes('/settings/integrations')) return 'integrations';
  if (pathname.includes('/settings/crm')) return 'crm';
  if (pathname.includes('/settings/whatsapp')) return 'whatsapp';
  if (pathname.includes('/settings/automation')) return 'automation';
  if (pathname.includes('/settings/ai')) return 'ai';
  if (pathname.includes('/settings/billing')) return 'billing';
  if (pathname.includes('/settings/security')) return 'security';
  if (pathname.includes('/settings/team')) return 'team';
  if (pathname.includes('/settings/general')) return 'general';
  return 'hub';
}

function isSettingsHub(pathname) {
  return pathname === '/automation/settings' || pathname === '/automation/settings/';
}

function SettingsLayoutInner({ children }) {
  const pathname = usePathname();
  const isHub = isSettingsHub(pathname);
  const section = useMemo(() => sectionFromPath(pathname), [pathname]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wide = section === 'integrations' || section === 'team';

  if (isHub) {
    return <div className="relative min-h-full">{children}</div>;
  }

  return (
    <div className="flex h-full min-h-full bg-[#f8f9fc] dark:bg-slate-950 -m-0">
      <SettingsSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-50/40 to-transparent dark:from-blue-950/10 dark:to-transparent" />
        <SettingsHeader section={section} onMenuOpen={() => setMobileOpen(true)} showBack />
        <div className="flex-1 overflow-y-auto relative">
          <div className={`px-4 sm:px-6 py-6 ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsLayoutClient({ children }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading settings…</div>}>
      <SettingsLayoutInner>{children}</SettingsLayoutInner>
    </Suspense>
  );
}
