'use client';

import UserNavbar from '@/app/user/Header';
import IndustryPageTemplate from '@/app/components/landing/IndustryPageTemplate';

export default function IndustryPageClient({ industry }) {
  return (
    <>
      <UserNavbar />
      <IndustryPageTemplate industry={industry} />
    </>
  );
}
