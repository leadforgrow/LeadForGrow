'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

const ACCENT = {
  emerald: 'from-emerald-500 to-teal-600',
  teal: 'from-teal-500 to-cyan-600',
  cyan: 'from-cyan-500 to-blue-600',
  violet: 'from-violet-500 to-purple-600',
  indigo: 'from-indigo-500 to-blue-600',
};

export function ProductPageRenderer({ page }) {
  const gradient = ACCENT[page.accent] || ACCENT.emerald;

  if (page.layout === 'split-screenshot') {
    return (
      <MarketingShell>
        <section className={`${MARKETING.section} ${MARKETING.gradientHero}`}>
          <div className={`${MARKETING.container} grid lg:grid-cols-2 gap-12 items-center`}>
            <div>
              <p className={MARKETING.overline}>{page.overline}</p>
              <h1 className={`${MARKETING.h1} mt-3 mb-5`}>{page.headline}</h1>
              <p className={MARKETING.bodyLarge}>{page.subheadline}</p>
              <Link href="/register" className={`${MARKETING.btnPrimary} mt-8`}>{page.cta} <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className={`aspect-[4/3] rounded-3xl bg-gradient-to-br ${gradient} p-1 shadow-2xl`}>
              <div className="w-full h-full rounded-[22px] bg-white/10 backdrop-blur flex items-center justify-center">
                <div className="w-4/5 space-y-3 p-6">
                  {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-white/20" />)}
                </div>
              </div>
            </div>
          </div>
        </section>
        <FeatureSection page={page} />
        <FAQSection page={page} />
        <CTASection page={page} />
      </MarketingShell>
    );
  }

  if (page.layout === 'flow-diagram') {
    return (
      <MarketingShell>
        <section className={`${MARKETING.section} bg-[#064E3B] text-white`}>
          <div className={`${MARKETING.container} text-center max-w-3xl mx-auto`}>
            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest">{page.overline}</p>
            <h1 className="text-4xl lg:text-5xl font-bold mt-4 mb-6 font-[family-name:var(--font-plus-jakarta)]">{page.headline}</h1>
            <p className="text-emerald-100/80 text-lg">{page.subheadline}</p>
          </div>
          <div className={`${MARKETING.container} mt-16 flex justify-center gap-4 flex-wrap`}>
            {['Trigger', 'Condition', 'Delay', 'Action', 'End'].map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-sm font-semibold">{step}</div>
                {i < 4 && <ArrowRight className="w-4 h-4 text-emerald-400" />}
              </div>
            ))}
          </div>
        </section>
        <FeatureSection page={page} dark />
        <FAQSection page={page} />
        <CTASection page={page} />
      </MarketingShell>
    );
  }

  if (page.layout === 'center-glow') {
    return (
      <MarketingShell>
        <section className={`${MARKETING.section} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-50 via-white to-white" />
          <div className={`${MARKETING.container} relative text-center max-w-3xl mx-auto`}>
            <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/30">✦</div>
            <p className={MARKETING.overline}>{page.overline}</p>
            <h1 className={`${MARKETING.h1} mt-3 mb-5`}>{page.headline}</h1>
            <p className={MARKETING.bodyLarge}>{page.subheadline}</p>
            <Link href="/register" className={`${MARKETING.btnGreen} mt-8`}>{page.cta}</Link>
          </div>
        </section>
        <FeatureSection page={page} columns={2} />
        <FAQSection page={page} />
        <CTASection page={page} />
      </MarketingShell>
    );
  }

  if (page.layout === 'channel-grid') {
    return (
      <MarketingShell>
        <section className={`${MARKETING.section}`}>
          <div className={`${MARKETING.container}`}>
            <div className="max-w-2xl mb-12">
              <p className={MARKETING.overline}>{page.overline}</p>
              <h1 className={`${MARKETING.h1} mt-3 mb-5`}>{page.headline}</h1>
              <p className={MARKETING.bodyLarge}>{page.subheadline}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {page.features.map((f) => (
                <div key={f.title} className={`${MARKETING.card} ${MARKETING.cardHover} p-6`}>
                  <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center text-lg mb-4">◉</div>
                  <h3 className={MARKETING.h3}>{f.title}</h3>
                  <p className={`${MARKETING.body} mt-2 text-sm`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <FAQSection page={page} />
        <CTASection page={page} />
      </MarketingShell>
    );
  }

  if (page.layout === 'logo-wall') {
    return (
      <MarketingShell>
        <section className={`${MARKETING.section} bg-slate-50`}>
          <div className={`${MARKETING.container} text-center`}>
            <p className={MARKETING.overline}>{page.overline}</p>
            <h1 className={`${MARKETING.h1} mt-3 mb-5 max-w-2xl mx-auto`}>{page.headline}</h1>
            <p className={`${MARKETING.bodyLarge} max-w-xl mx-auto`}>{page.subheadline}</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 mt-16 opacity-70">
              {['WhatsApp', 'Meta', 'Gmail', 'Stripe', 'Razorpay', 'Twilio'].map((name) => (
                <div key={name} className="py-4 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600">{name}</div>
              ))}
            </div>
          </div>
        </section>
        <FeatureSection page={page} />
        <FAQSection page={page} />
        <CTASection page={page} />
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <section className={MARKETING.section}>
        <div className={MARKETING.container}>
          <h1 className={MARKETING.h1}>{page.headline}</h1>
          <p className={MARKETING.bodyLarge}>{page.subheadline}</p>
        </div>
      </section>
    </MarketingShell>
  );
}

export function SolutionPageRenderer({ page }) {
  const isDark = page.layout === 'enterprise-dark';

  return (
    <MarketingShell>
      <section className={`${MARKETING.section} ${isDark ? MARKETING.gradientDark + ' text-white' : MARKETING.gradientHero}`}>
        <div className={`${MARKETING.container} ${page.layout === 'story-vertical' ? 'max-w-3xl' : ''}`}>
          <p className={`${MARKETING.overline} ${isDark ? 'text-emerald-300' : ''}`}>{page.overline}</p>
          <h1 className={`${MARKETING.h1} mt-3 mb-5 ${isDark ? 'text-white' : ''}`}>{page.headline}</h1>
          <p className={`${MARKETING.bodyLarge} ${isDark ? 'text-emerald-100/80' : ''}`}>{page.subheadline}</p>
          {page.stats && (
            <div className="grid grid-cols-3 gap-6 mt-12">
              {page.stats.map((s) => (
                <div key={s.label} className={`text-center p-4 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-white/80 border border-emerald-100'}`}>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-emerald-700'}`}>{s.value}</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-emerald-200' : 'text-[#64748B]'}`}>{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {page.features && (
        <section className={MARKETING.sectionTight}>
          <div className={`${MARKETING.container} grid sm:grid-cols-2 gap-4 max-w-4xl`}>
            {(page.features || []).map((f) => (
              <div key={typeof f === 'string' ? f : f.title} className="flex gap-3 p-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-[#374151]">{typeof f === 'string' ? f : f.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      <CTASection page={{ cta: 'Start free trial', headline: page.headline }} />
    </MarketingShell>
  );
}

function FeatureSection({ page, dark, columns = 4 }) {
  return (
    <section className={`${MARKETING.sectionTight} ${dark ? 'bg-slate-900 text-white' : ''}`}>
      <div className={MARKETING.container}>
        <h2 className={`${MARKETING.h2} mb-10 ${dark ? 'text-white' : ''}`}>Built for how you sell</h2>
        <div className={`grid sm:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
          {page.features.map((f) => (
            <div key={f.title} className={`p-6 rounded-2xl ${dark ? 'bg-white/5 border border-white/10' : MARKETING.card}`}>
              <h3 className={`font-semibold mb-2 ${dark ? 'text-white' : ''}`}>{f.title}</h3>
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-[#64748B]'}`}>{f.desc}</p>
            </div>
          ))}
        </div>
        {page.useCases && (
          <div className="mt-12 flex flex-wrap gap-3">
            {page.useCases.map((u) => (
              <span key={u} className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 text-sm font-medium border border-emerald-100">{u}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FAQSection({ page }) {
  if (!page.faq?.length) return null;
  return (
    <section className={MARKETING.sectionTight}>
      <div className={`${MARKETING.containerNarrow}`}>
        <h2 className={`${MARKETING.h2} mb-8`}>Questions</h2>
        <div className="space-y-4">
          {page.faq.map((item) => (
            <details key={item.q} className={`${MARKETING.card} p-5 group`}>
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">{item.q}</summary>
              <p className={`${MARKETING.body} mt-3 text-sm`}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ page }) {
  return (
    <section className={`${MARKETING.sectionTight} bg-emerald-50/50`}>
      <div className={`${MARKETING.container} text-center`}>
        <h2 className={`${MARKETING.h2} mb-4`}>Ready to get started?</h2>
        <Link href="/register" className={MARKETING.btnPrimary}>{page.cta || 'Start free trial'} <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </section>
  );
}
