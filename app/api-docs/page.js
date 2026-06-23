import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

export const metadata = { title: 'API Documentation | LeadForGrow' };

export default function ApiDocsPage() {
  return (
    <MarketingShell>
      <section className={MARKETING.section}>
        <div className={`${MARKETING.container} grid lg:grid-cols-2 gap-12`}>
          <div>
            <p className={MARKETING.overline}>API</p>
            <h1 className={`${MARKETING.h1} mt-3 mb-5`}>Build on LeadForGrow.</h1>
            <p className={MARKETING.bodyLarge}>REST API for leads, webhooks, and automation triggers. Authenticate with API keys from your workspace settings.</p>
            <Link href="/register" className={`${MARKETING.btnPrimary} mt-6 inline-flex`}>Get API access</Link>
          </div>
          <pre className="p-6 rounded-2xl bg-[#111827] text-emerald-300 text-sm overflow-x-auto font-mono leading-relaxed">
{`POST /api/automation/leads
Authorization: Bearer YOUR_API_KEY

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91...",
  "source": "website"
}`}
          </pre>
        </div>
      </section>
    </MarketingShell>
  );
}
