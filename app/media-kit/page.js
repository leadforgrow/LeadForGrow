import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

export const metadata = { title: 'Media Kit | LeadForGrow' };

export default function MediaKitPage() {
  return (
    <MarketingShell>
      <section className={`${MARKETING.section} bg-slate-900 text-white`}>
        <div className={MARKETING.container}>
          <h1 className="text-4xl font-bold font-[family-name:var(--font-plus-jakarta)]">Media Kit</h1>
          <p className="text-slate-400 mt-3">Brand assets for press and partners</p>
          <div className="grid sm:grid-cols-3 gap-4 mt-12">
            {['Logo pack (PNG/SVG)', 'Product screenshots', 'Brand colors & typography'].map((item) => (
              <div key={item} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="font-medium">{item}</p>
                <p className="text-xs text-slate-500 mt-2">Available on request — press@leadforgrow.com</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
