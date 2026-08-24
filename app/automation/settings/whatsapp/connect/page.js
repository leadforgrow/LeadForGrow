'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '../../../components/PageLoader';

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

  return <PageLoader label="Redirecting to Integrations…" />;
}
