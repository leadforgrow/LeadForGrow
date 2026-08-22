import { Suspense } from 'react';
import { RegisterPage } from '@/app/components/auth/AuthPages';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <RegisterPage />
    </Suspense>
  );
}
