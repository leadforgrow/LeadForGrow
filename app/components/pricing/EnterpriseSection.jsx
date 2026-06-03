'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Headphones, Clock } from 'lucide-react';

const PERKS = [
  { icon: Shield, label: 'SLA-backed support' },
  { icon: Clock, label: 'Onboarding guarantee' },
  { icon: Headphones, label: 'Dedicated account manager' },
];

export default function EnterpriseSection() {
  return (
    <section className="py-16 lg:py-20 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">Enterprise</p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
          Need custom workflows, enterprise security, or multi-brand deployment?
        </h2>
        <p className="text-slate-400 mt-4 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          White-label agency mode, Salesforce sync, compliance reviews, and dedicated infrastructure — built for organizations that cannot afford revenue leakage.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mt-8 mb-10">
          {PERKS.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-2 text-sm text-slate-300">
              <Icon className="w-4 h-4 text-slate-400" />
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Talk to Sales
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Book Strategy Call
          </Link>
        </div>
      </div>
    </section>
  );
}
