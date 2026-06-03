'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PRICING_FAQ } from './pricingData';

export default function PricingFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-16 lg:py-20 bg-[#fafbfc]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">FAQ</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Common questions
          </h2>
        </div>

        <div className="space-y-2">
          {PRICING_FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50/80 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
