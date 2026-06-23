import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

export const metadata = { title: 'Documentation | LeadForGrow' };

export default function DocumentationPage() {
  const sections = [
    { title: 'Getting started', links: ['Quick start', 'Account setup', 'First automation'] },
    { title: 'CRM', links: ['Leads & contacts', 'Pipeline stages', 'Import & export'] },
    { title: 'Automation', links: ['Workflow builder', 'Triggers & actions', 'Broadcasts'] },
    { title: 'Integrations', links: ['WhatsApp setup', 'Email configuration', 'Webhooks'] },
  ];

  return (
    <MarketingShell>
      <section className={`${MARKETING.sectionTight} bg-[#111827] text-white`}>
        <div className={MARKETING.container}>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-plus-jakarta)]">Documentation</h1>
          <p className="text-slate-400 mt-2">Guides for every feature in LeadForGrow</p>
        </div>
      </section>
      <section className={MARKETING.sectionTight}>
        <div className={`${MARKETING.container} grid sm:grid-cols-2 lg:grid-cols-4 gap-6`}>
          {sections.map((s) => (
            <div key={s.title} className={`${MARKETING.card} p-6`}>
              <h2 className="font-bold text-[#111827] mb-4">{s.title}</h2>
              <ul className="space-y-2">
                {s.links.map((l) => (
                  <li key={l}><Link href="/help-center" className="text-sm text-[#64748B] hover:text-emerald-700">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
