import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

export const metadata = { title: 'Press | LeadForGrow' };

export default function PressPage() {
  return (
    <MarketingShell>
      <section className={MARKETING.section}>
        <div className={`${MARKETING.container} grid lg:grid-cols-2 gap-12`}>
          <div>
            <h1 className={MARKETING.h1}>Press</h1>
            <p className={`${MARKETING.bodyLarge} mt-4`}>Media inquiries and brand assets for journalists and creators.</p>
            <a href="mailto:press@leadforgrow.com" className={`${MARKETING.btnGreen} mt-6 inline-flex`}>press@leadforgrow.com</a>
          </div>
          <Link href="/media-kit" className={`${MARKETING.card} p-8 flex flex-col justify-center hover:border-emerald-300 transition-colors`}>
            <p className="font-bold text-lg">Media Kit</p>
            <p className="text-sm text-[#64748B] mt-2">Logos, screenshots, and brand guidelines →</p>
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
