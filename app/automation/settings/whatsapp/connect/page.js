'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Retired page — WhatsApp credentials now live in the main Integrations panel
 * so users have one consistent place for every integration (WhatsApp, Gmail,
 * Interakt, …). This route just redirects there so any bookmarks still work.
 */
export default function ConnectWhatsAppRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/automation/settings/integrations');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Redirecting to Integrations…
      </div>
    </div>
  );
}
