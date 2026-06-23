import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';
import Link from 'next/link';
import { Shield, Mail, Clock, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Responsible Disclosure | LeadForGrow Security',
  description: 'Report security vulnerabilities to LeadForGrow. Our responsible disclosure policy and bug bounty guidelines.',
};

const PROCESS = [
  { step: '1', title: 'Report privately', body: 'Email security@leadforgrow.com with a detailed description, steps to reproduce, and impact assessment.' },
  { step: '2', title: 'We acknowledge', body: 'Our security team responds within 48 hours with a ticket reference and initial triage.' },
  { step: '3', title: 'We investigate', body: 'We validate the report, assess severity (CVSS), and work on a fix with regular status updates.' },
  { step: '4', title: 'We resolve & credit', body: 'Once patched, we notify you and — with your permission — acknowledge your contribution.' },
];

export default function ResponsibleDisclosurePage() {
  return (
    <MarketingShell>
      <section className={`${MARKETING.section} ${MARKETING.gradientHero}`}>
        <div className={`${MARKETING.containerNarrow} text-center`}>
          <Shield className="w-10 h-10 text-emerald-600 mx-auto mb-4" />
          <p className={MARKETING.overline}>Security</p>
          <h1 className={`${MARKETING.h1} mt-3 mb-5`}>Responsible disclosure</h1>
          <p className={MARKETING.bodyLarge}>
            We take security seriously. If you discover a vulnerability, please report it responsibly so we can protect our customers.
          </p>
        </div>
      </section>

      <section className={MARKETING.sectionTight}>
        <div className={`${MARKETING.containerNarrow} space-y-12`}>
          <div className={`${MARKETING.card} p-8 border-l-4 border-l-emerald-500`}>
            <h2 className={MARKETING.h3}>Scope</h2>
            <p className={`${MARKETING.body} mt-3`}>
              Reports are in scope for leadforgrow.com, app.leadforgrow.com, and our public API endpoints.
              Social engineering, physical attacks, and denial-of-service tests are out of scope.
            </p>
          </div>

          <div>
            <h2 className={`${MARKETING.h2} mb-8`}>How to report</h2>
            <div className="space-y-6">
              {PROCESS.map((item) => (
                <div key={item.step} className="flex gap-5">
                  <span className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">{item.step}</span>
                  <div>
                    <h3 className="font-semibold text-[#111827]">{item.title}</h3>
                    <p className={`${MARKETING.body} mt-1 text-sm`}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className={`${MARKETING.card} p-6`}>
              <Mail className="w-6 h-6 text-emerald-600 mb-3" />
              <h3 className="font-semibold text-[#111827]">Contact</h3>
              <a href="mailto:security@leadforgrow.com" className={`${MARKETING.link} mt-2 inline-block`}>
                security@leadforgrow.com
              </a>
            </div>
            <div className={`${MARKETING.card} p-6`}>
              <Clock className="w-6 h-6 text-emerald-600 mb-3" />
              <h3 className="font-semibold text-[#111827]">Response SLA</h3>
              <p className={`${MARKETING.body} mt-2 text-sm`}>Initial response within 48 hours. Critical issues prioritized immediately.</p>
            </div>
          </div>

          <div className={`${MARKETING.card} p-8 bg-[#FAFDFA]`}>
            <h2 className={MARKETING.h3}>Safe harbor</h2>
            <ul className="mt-4 space-y-3">
              {[
                'Act in good faith and avoid privacy violations or data destruction',
                'Give us reasonable time to investigate and remediate before public disclosure',
                'Do not access or modify data belonging to other customers',
                'We will not pursue legal action against researchers who follow this policy',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#64748B]">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-sm text-[#64748B]">
            For general security information, visit our{' '}
            <Link href="/security" className={MARKETING.link}>Security page</Link>.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
