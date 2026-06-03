'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PricingFinalCTA() {
  return (
    <section className="py-20 lg:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
          Your leads are already expensive. Losing them is even more expensive.
        </h2>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          LeadForGrow helps your team respond faster, follow up automatically, and convert more revenue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/user/register"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-[0_4px_14px_rgba(15,23,42,0.12)]"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Book Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
