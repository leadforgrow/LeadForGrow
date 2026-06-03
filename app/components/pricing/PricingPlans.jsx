'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { PRICING_PLANS, formatINR } from './pricingData';

export default function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="py-16 lg:py-20 bg-[#fafbfc]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                !yearly ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {!yearly && (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-slate-100 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                yearly ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {yearly && (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-slate-100 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                Yearly
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Save 35%
                </span>
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
          {PRICING_PLANS.map((plan, i) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex flex-col rounded-3xl border bg-white p-6 transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] ${
                plan.highlighted
                  ? 'border-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.1)] ring-1 ring-slate-900/10'
                  : 'border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04)]'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.label}</p>
              </div>

              <div className="mb-5 min-h-[72px]">
                <AnimatePresence mode="wait">
                  {plan.enterprise ? (
                    <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-3xl font-bold text-slate-900 tracking-tight">Custom</p>
                      <p className="text-xs text-slate-500 mt-1">Tailored to your org</p>
                    </motion.div>
                  ) : (
                    <motion.div key={yearly ? 'y' : 'm'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                          {formatINR(yearly ? plan.yearlyPrice : plan.monthlyPrice)}
                        </span>
                        <span className="text-sm text-slate-500">/mo</span>
                      </div>
                      {yearly && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          {formatINR(plan.yearlyPrice)}/month billed annually
                        </p>
                      )}
                      {!yearly && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          or {formatINR(plan.yearlyPrice)}/mo billed yearly
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12px] text-slate-600 leading-snug">
                    <Check className="w-3.5 h-3.5 text-slate-900 shrink-0 mt-0.5" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mb-5 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Limits</p>
                <ul className="space-y-1">
                  {plan.limits.map((l) => (
                    <li key={l} className="text-[11px] text-slate-500">{l}</li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : plan.enterprise
                      ? 'border border-slate-900 text-slate-900 hover:bg-slate-50'
                      : 'border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
