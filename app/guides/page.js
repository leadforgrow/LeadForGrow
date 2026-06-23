import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

const GUIDES = [
  { title: 'Connect WhatsApp in 10 minutes', time: '8 min read', category: 'Setup' },
  { title: 'Your first automation workflow', time: '12 min read', category: 'Automation' },
  { title: 'Import leads from Excel', time: '5 min read', category: 'CRM' },
  { title: 'Set up team permissions', time: '6 min read', category: 'Team' },
];

export const metadata = { title: 'Guides | LeadForGrow' };

export default function GuidesPage() {
  return (
    <MarketingShell>
      <section className={`${MARKETING.section} ${MARKETING.gradientHero}`}>
        <div className={MARKETING.container}>
          <h1 className={MARKETING.h1}>Guides</h1>
          <p className={`${MARKETING.bodyLarge} mt-3 max-w-xl`}>Step-by-step tutorials to get the most from LeadForGrow.</p>
        </div>
      </section>
      <section className={MARKETING.sectionTight}>
        <div className={`${MARKETING.container} grid sm:grid-cols-2 gap-4 max-w-4xl`}>
          {GUIDES.map((g) => (
            <Link key={g.title} href="/help-center" className={`${MARKETING.card} ${MARKETING.cardHover} p-6 block`}>
              <span className="text-xs font-semibold text-emerald-700 uppercase">{g.category}</span>
              <h2 className="font-semibold text-[#111827] mt-2">{g.title}</h2>
              <p className="text-xs text-[#94A3B8] mt-2">{g.time}</p>
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
