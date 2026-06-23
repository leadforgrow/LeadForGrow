import Link from 'next/link';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

export const metadata = { title: 'Video Tutorials | LeadForGrow' };

export default function VideosPage() {
  const videos = [
    { title: 'Platform overview', duration: '4:32' },
    { title: 'WhatsApp setup walkthrough', duration: '8:15' },
    { title: 'Building your first automation', duration: '11:20' },
  ];

  return (
    <MarketingShell>
      <section className={MARKETING.section}>
        <div className={MARKETING.container}>
          <h1 className={MARKETING.h1}>Video tutorials</h1>
          <div className="grid sm:grid-cols-3 gap-6 mt-10">
            {videos.map((v) => (
              <div key={v.title} className={`${MARKETING.card} overflow-hidden`}>
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-600 font-semibold">▶ Preview</div>
                <div className="p-4">
                  <p className="font-semibold">{v.title}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">{v.duration}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/guides" className={`${MARKETING.link} mt-8 inline-block`}>Browse written guides →</Link>
        </div>
      </section>
    </MarketingShell>
  );
}
