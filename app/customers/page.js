import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

export const metadata = { title: 'Customers | LeadForGrow' };

export default function CustomersPage() {
  const stories = [
    { company: 'Growth Agency Mumbai', result: '3x faster lead response', industry: 'Agency' },
    { company: 'EduTech Academy', result: '40% more demo bookings', industry: 'Education' },
    { company: 'Property Plus Realty', result: '2x pipeline conversion', industry: 'Real Estate' },
  ];

  return (
    <MarketingShell>
      <section className={MARKETING.section}>
        <div className={MARKETING.container}>
          <h1 className={MARKETING.h1}>Customers who grow with us</h1>
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            {stories.map((s) => (
              <div key={s.company} className={`${MARKETING.card} p-6`}>
                <p className="text-xs font-semibold text-emerald-700 uppercase">{s.industry}</p>
                <h2 className="font-bold text-[#111827] mt-2">{s.company}</h2>
                <p className="text-emerald-700 font-semibold mt-3">{s.result}</p>
              </div>
            ))}
          </div>
          <Link href="/case-studies" className={`${MARKETING.link} mt-10 inline-block`}>Read case studies →</Link>
        </div>
      </section>
    </MarketingShell>
  );
}
