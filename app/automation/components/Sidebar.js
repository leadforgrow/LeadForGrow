'use client';

import { Suspense } from 'react';
import SidebarInner from './layout/Sidebar';

function SidebarFallback() {
  return (
    <aside className="w-[260px] h-screen flex-shrink-0 bg-[#FAFDFA] dark:bg-slate-950 border-r border-emerald-100/80 dark:border-slate-800 animate-pulse" />
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<SidebarFallback />}>
      <SidebarInner />
    </Suspense>
  );
}
