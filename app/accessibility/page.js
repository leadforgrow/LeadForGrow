import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

export const metadata = { title: 'Accessibility | LeadForGrow' };

export default function AccessibilityPage() {
  return (
    <MarketingShell>
      <section className={MARKETING.section}>
        <div className={`${MARKETING.containerNarrow}`}>
          <p className={MARKETING.overline}>Accessibility</p>
          <h1 className={`${MARKETING.h1} mt-3 mb-6`}>Accessible by design.</h1>
          <div className="space-y-6 text-[#64748B] leading-relaxed">
            <p>LeadForGrow is committed to WCAG 2.1 Level AA conformance. We continuously improve keyboard navigation, color contrast, screen reader support, and focus indicators across our platform.</p>
            <p>If you encounter accessibility barriers, please contact <a href="mailto:accessibility@leadforgrow.com" className="text-emerald-700 font-medium">accessibility@leadforgrow.com</a>. We aim to respond within 5 business days.</p>
          </div>
          <Link href="/contact" className={`${MARKETING.btnOutline} mt-8 inline-flex`}>Report an issue</Link>
        </div>
      </section>
    </MarketingShell>
  );
}
