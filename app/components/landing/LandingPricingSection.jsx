'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { LANDING } from './landingStyles';
import {
  PRICING_PLANS,
  TRUST_BADGES,
  ADDONS,
  COMPARISON_ROWS,
  formatINR,
} from '@/app/components/pricing/pricingData';
import RoiCalculator from '@/app/components/pricing/RoiCalculator';

function ComparisonCell({ value }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
        <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" strokeWidth={2.5} />
      </span>
    );
  }
  if (value === false) {
    return <Minus className="w-4 h-4 text-slate-300 mx-auto" />;
  }
  return <span className="text-xs text-slate-500">{value}</span>;
}

export default function LandingPricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className={`${LANDING.section} bg-white`}>
      <div className={LANDING.container}>
        {/* Header + toggle */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className={LANDING.overline}>Pricing</p>
          <h2 className={`${LANDING.heading} mt-2`}>
            Recover more revenue without hiring more people
          </h2>
          <p className={`${LANDING.subheading} mt-3`}>
            Transparent plans for WhatsApp-first sales teams. Upgrade as you scale.
          </p>

          <div className="inline-flex items-center p-1 mt-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                !yearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {!yearly && (
                <motion.span
                  layoutId="landing-billing-pill"
                  className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">Monthly</span>
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                yearly ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {yearly && (
                <motion.span
                  layoutId="landing-billing-pill"
                  className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative inline-flex items-center gap-2">
                Yearly
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Save 35%
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards — full feature lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 items-stretch">
          {PRICING_PLANS.map((plan, i) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`relative flex flex-col h-full rounded-3xl border bg-white dark:bg-slate-900/80 p-6 transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] ${
                plan.highlighted
                  ? 'border-slate-900 dark:border-slate-300 shadow-[0_8px_30px_rgba(15,23,42,0.1)] ring-1 ring-slate-900/10'
                  : 'border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.04)]'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.label}</p>
              </div>

              <div className="mb-4 min-h-[68px]">
                <AnimatePresence mode="wait">
                  {plan.enterprise ? (
                    <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Custom</p>
                      <p className="text-xs text-slate-500 mt-1">Tailored to your org</p>
                    </motion.div>
                  ) : (
                    <motion.div key={yearly ? 'y' : 'm'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                          {formatINR(yearly ? plan.yearlyPrice : plan.monthlyPrice)}
                        </span>
                        <span className="text-sm text-slate-500">/mo</span>
                      </div>
                      {yearly ? (
                        <p className="text-[11px] text-slate-500 mt-1">
                          {formatINR(plan.yearlyPrice)}/month billed annually
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-1">
                          or {formatINR(plan.yearlyPrice)}/mo billed yearly
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ul className="space-y-2 flex-1 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12px] text-slate-600 dark:text-slate-400 leading-snug">
                    <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white shrink-0 mt-0.5" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mb-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Limits</p>
                {plan.limits.map((l) => (
                  <p key={l} className="text-[11px] text-slate-500 dark:text-slate-400">{l}</p>
                ))}
              </div>

              <Link
                href={plan.href}
                className={`mt-auto block text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                    : plan.enterprise
                      ? 'border border-slate-900 dark:border-slate-300 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                      : 'border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8">
          {TRUST_BADGES.map((item) => (
            <span key={item} className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
              {item}
            </span>
          ))}
        </div>

        {/* Add-ons */}
        <div className="mt-20 pt-16 border-t border-slate-200/80 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className={LANDING.overline}>Add-ons</p>
            <h3 className={`${LANDING.heading} mt-2`}>Extend your revenue engine</h3>
            <p className={`${LANDING.subheading} mt-3`}>
              Scale capabilities without switching plans. Add what you need, when you need it.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ADDONS.map((addon) => (
              <div
                key={addon.name}
                className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-shadow"
              >
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{addon.name}</h4>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{addon.price}</span>
                  <span className="text-xs text-slate-500">{addon.period}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {addon.bullets.map((b) => (
                    <li key={b} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison matrix */}
        <div className="mt-20 pt-16 border-t border-slate-200/80 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className={LANDING.overline}>Compare</p>
            <h3 className={`${LANDING.heading} mt-2`}>Built for revenue, not record-keeping</h3>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[34%]">Capability</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-800/60 w-[22%]">LeadForGrow</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[22%]">Traditional CRM</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[22%]">Manual WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-200">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center bg-slate-50/60 dark:bg-slate-900/40">
                      <ComparisonCell value={row.lfg} />
                    </td>
                    <td className="px-5 py-3.5 text-center"><ComparisonCell value={row.crm} /></td>
                    <td className="px-5 py-3.5 text-center"><ComparisonCell value={row.manual} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROI calculator — embedded */}
        <div className="mt-20 pt-16 border-t border-slate-200/80 dark:border-slate-800">
          <RoiCalculator embedded />
        </div>
      </div>
    </section>
  );
}
