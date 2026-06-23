'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { PRICING_PLANS, formatINR } from './pricingData';
import { MARKETING } from '@/lib/marketing/designTokens';

export default function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className={`${MARKETING.sectionTight} bg-[#FAFDFA]`} id="plans">
      <div className={MARKETING.container}>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className={MARKETING.overline}>Plans</p>
          <h2 className={`${MARKETING.h2} mt-2`}>Simple pricing that scales with you</h2>
          <p className={`${MARKETING.body} mt-3`}>All plans include a free trial. No hidden fees. Cancel anytime.</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 rounded-xl bg-white border border-emerald-100 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                !yearly ? 'text-[#111827]' : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              {!yearly && (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-emerald-50 rounded-lg border border-emerald-100"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                yearly ? 'text-[#111827]' : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              {yearly && (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-emerald-50 rounded-lg border border-emerald-100"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                Yearly
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
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
              className={`relative flex flex-col rounded-3xl border p-6 transition-all duration-300 ${
                plan.highlighted
                  ? `${MARKETING.card} border-emerald-300 shadow-[0_12px_40px_rgba(6,95,70,0.12)] ring-2 ring-emerald-500/20 scale-[1.02]`
                  : `${MARKETING.card} ${MARKETING.cardHover}`
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-emerald-600/20">
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <h3 className="text-lg font-bold text-[#111827]">{plan.name}</h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{plan.label}</p>
              </div>

              <div className="mb-5 min-h-[72px]">
                <AnimatePresence mode="wait">
                  {plan.enterprise ? (
                    <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-3xl font-bold text-[#111827] tracking-tight">Custom</p>
                      <p className="text-xs text-[#64748B] mt-1">Tailored to your org</p>
                    </motion.div>
                  ) : (
                    <motion.div key={yearly ? 'y' : 'm'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-[#111827] tracking-tight tabular-nums">
                          {formatINR(yearly ? plan.yearlyPrice : plan.monthlyPrice)}
                        </span>
                        <span className="text-sm text-[#64748B]">/mo</span>
                      </div>
                      {yearly ? (
                        <p className="text-[11px] text-[#64748B] mt-1">
                          {formatINR(plan.yearlyPrice)}/month billed annually
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#94A3B8] mt-1">
                          or {formatINR(plan.yearlyPrice)}/mo billed yearly
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12px] text-[#64748B] leading-snug">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mb-5 pt-4 border-t border-emerald-100/80">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">Limits</p>
                <ul className="space-y-1">
                  {plan.limits.map((l) => (
                    <li key={l} className="text-[11px] text-[#64748B]">{l}</li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.href === '/user/register' ? '/register' : plan.href}
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? MARKETING.btnGreen.replace('inline-flex items-center justify-center gap-2 ', '')
                    : plan.enterprise
                      ? 'border border-[#111827] text-[#111827] hover:bg-emerald-50'
                      : 'border border-emerald-200 text-[#111827] hover:bg-emerald-50 hover:border-emerald-300'
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
