import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

export const metadata = { title: 'Partners | LeadForGrow' };

export default function PartnersPage() {
  return (
    <MarketingShell>
      <section className={`${MARKETING.section} bg-emerald-900 text-white`}>
        <div className={`${MARKETING.container} max-w-2xl`}>
          <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest">Partners</p>
          <h1 className="text-4xl font-bold mt-4 mb-5 font-[family-name:var(--font-plus-jakarta)]">Grow together.</h1>
          <p className="text-emerald-100/80 text-lg">Agency partners, technology integrators, and referral partners — join the LeadForGrow ecosystem.</p>
          <Link href="/contact" className="inline-flex mt-8 px-6 py-3 rounded-xl bg-white text-emerald-900 font-semibold hover:bg-emerald-50">Become a partner</Link>
        </div>
      </section>
    </MarketingShell>
  );
}
