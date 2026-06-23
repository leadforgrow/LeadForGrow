'use client';

import LandingNavbar from '@/app/components/landing/LandingNavbar';

/** Public marketing page shell — footer comes from root layout */
export default function MarketingShell({ children, hideNav = false }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {!hideNav && <LandingNavbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
