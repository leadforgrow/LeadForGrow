'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WebsitesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/website-funnel');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="animate-pulse text-indigo-600 font-bold">Redirecting...</div>
    </div>
  );
}
