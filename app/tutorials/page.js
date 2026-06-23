'use client';

import Link from 'next/link';
import { Play, Clock, ArrowRight, BookOpen } from 'lucide-react';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

const TUTORIALS = [
  { slug: 'setup-whatsapp', title: 'Connect WhatsApp Business', duration: '8 min', level: 'Beginner', category: 'Getting Started' },
  { slug: 'create-pipeline', title: 'Build your first sales pipeline', duration: '12 min', level: 'Beginner', category: 'CRM' },
  { slug: 'automation-basics', title: 'Create your first automation rule', duration: '15 min', level: 'Intermediate', category: 'Automation' },
  { slug: 'ai-replies', title: 'Configure AI reply assistant', duration: '10 min', level: 'Intermediate', category: 'AI' },
  { slug: 'team-permissions', title: 'Set up team roles & permissions', duration: '7 min', level: 'Beginner', category: 'Team' },
  { slug: 'meta-integration', title: 'Connect Meta Lead Ads', duration: '11 min', level: 'Intermediate', category: 'Integrations' },
];

const LEVEL_COLORS = {
  Beginner: 'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced: 'bg-violet-50 text-violet-700',
};

export default function TutorialsPage() {
  return (
    <MarketingShell>
      <section className={`${MARKETING.section} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className={`${MARKETING.container} relative`}>
          <div className="max-w-2xl">
            <p className={MARKETING.overline}>Tutorials</p>
            <h1 className={`${MARKETING.h1} mt-3 mb-5`}>Step-by-step product walkthroughs</h1>
            <p className={MARKETING.bodyLarge}>
              Learn LeadForGrow at your own pace. Each tutorial walks you through a real workflow — from setup to advanced automation.
            </p>
          </div>
        </div>
      </section>

      <section className={MARKETING.sectionTight}>
        <div className={MARKETING.container}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TUTORIALS.map((t) => (
              <Link
                key={t.slug}
                href="/help-center"
                className={`${MARKETING.card} ${MARKETING.cardHover} group block overflow-hidden`}
              >
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center relative">
                  <div className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-emerald-600 ml-1" fill="currentColor" />
                  </div>
                  <span className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-medium text-emerald-800 bg-white/80 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" /> {t.duration}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{t.category}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[t.level]}`}>{t.level}</span>
                  </div>
                  <h2 className="font-semibold text-[#111827] group-hover:text-emerald-800 transition-colors">{t.title}</h2>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-emerald-700">
                    Start tutorial <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className={`${MARKETING.card} mt-12 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6`}>
            <div className="flex items-start gap-4">
              <BookOpen className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h3 className={MARKETING.h3}>Prefer written guides?</h3>
                <p className={`${MARKETING.body} mt-1 text-sm`}>Browse our documentation and help center for detailed articles.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/documentation" className={MARKETING.btnOutline}>Documentation</Link>
              <Link href="/help-center" className={MARKETING.btnGreen}>Help Center</Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
