import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

const ENTRIES = [
  { version: '2.5.0', date: '2026-06-01', items: ['Automation platform Phase 5', 'Broadcast campaigns', 'Customer journey tracker', 'Test mode for workflows'] },
  { version: '2.4.0', date: '2026-05-01', items: ['Unified inbox improvements', 'AI knowledge base', 'Deal pipeline kanban'] },
  { version: '2.3.0', date: '2026-04-01', items: ['WhatsApp template sync', 'Meeting scheduling', 'Team permissions'] },
];

export const metadata = { title: 'Changelog | LeadForGrow' };

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <section className={MARKETING.section}>
        <div className={`${MARKETING.containerNarrow}`}>
          <h1 className={MARKETING.h1}>Changelog</h1>
          <p className={`${MARKETING.body} mt-3 mb-12`}>Every release, documented.</p>
          <div className="space-y-10">
            {ENTRIES.map((e) => (
              <article key={e.version} className="border-l-2 border-emerald-400 pl-6">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-bold text-emerald-700">v{e.version}</span>
                  <span className="text-sm text-[#94A3B8]">{e.date}</span>
                </div>
                <ul className="space-y-1.5">
                  {e.items.map((item) => <li key={item} className="text-sm text-[#64748B]">· {item}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <Link href="/product-updates" className={`${MARKETING.link} mt-10 inline-block`}>View product updates →</Link>
        </div>
      </section>
    </MarketingShell>
  );
}
