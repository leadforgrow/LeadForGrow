'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CompleteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = params.get('token');
    const userId = params.get('userId');
    const email = params.get('email');
    const role = params.get('role');
    const plan = params.get('plan');
    const businessId = params.get('businessId');
    const refreshToken = params.get('refreshToken');
    const isNewUser = params.get('isNewUser') === '1';

    if (!token || !userId || !email || !businessId) {
      setError('Google sign-in incomplete. Please try again.');
      return;
    }

    try {
      localStorage.setItem('userid', userId);
      localStorage.setItem('userToken', token);
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', role || 'owner');
      localStorage.setItem('userPlan', plan || 'free');
      localStorage.setItem('businessId', businessId);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      document.cookie = `token=${token}; path=/; max-age=604800; samesite=lax`;

      const roleLower = (role || 'owner').toLowerCase();
      const planLower = (plan || 'free').toLowerCase();
      if (roleLower.includes('owner') || roleLower.includes('admin')) {
        router.replace(planLower.includes('agency') ? '/agency' : '/automation');
      } else {
        router.replace('/automation/leads');
      }
    } catch {
      setError(isNewUser ? 'Account created but session failed. Please sign in.' : 'Session failed. Please try again.');
    }
  }, [params, router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white px-4">
        <p className="text-sm text-red-600 text-center">{error}</p>
        <a href="/login" className="text-sm font-medium text-[#1A45A5] hover:underline">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-[#1A45A5]" />
      <p className="text-sm text-[#667085]">Finishing Google sign-in…</p>
    </div>
  );
}

export default function GoogleCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A45A5]" />
        </div>
      }
    >
      <CompleteInner />
    </Suspense>
  );
}
