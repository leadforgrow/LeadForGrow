import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

export const metadata = { title: 'Affiliate Program | LeadForGrow' };

export default function AffiliatePage() {
  return (
    <MarketingShell>
      <section className={`${MARKETING.section} text-center`}>
        <div className={`${MARKETING.container} max-w-2xl mx-auto`}>
          <h1 className={MARKETING.h1}>Earn by referring LeadForGrow</h1>
          <p className={`${MARKETING.bodyLarge} mt-4`}>20% recurring commission for every customer you refer. Architecture ready — program launching soon.</p>
          <Link href="/contact" className={`${MARKETING.btnPrimary} mt-8 inline-flex`}>Join waitlist</Link>
        </div>
      </section>
    </MarketingShell>
  );
}
