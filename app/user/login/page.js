'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new unified auth page
    // We can't easily pass state through redirect without query params or global state
    // But since the new page defaults to 'register', we can use a query param
    router.replace('/user/register?mode=login');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
