'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MARKETING } from '@/lib/marketing/designTokens';

export default function PricingFinalCTA() {
  return (
    <section className={`${MARKETING.section} bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#047857] text-white`}>
      <div className={`${MARKETING.containerNarrow} text-center`}>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
          Your leads are already expensive. Losing them costs even more.
        </h2>
        <p className="mt-4 text-base text-emerald-100/90 leading-relaxed">
          LeadForGrow helps your team respond faster, follow up automatically, and convert more revenue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Book Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
