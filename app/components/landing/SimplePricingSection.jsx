'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    emoji: '🚀',
    name: 'Starter',
    price: '₹1,299',
    period: '/month',
    description: 'Perfect for startups & small businesses.',
    features: [
      'CRM & unlimited contacts',
      'WhatsApp, Instagram & Email',
      'Website lead capture',
      'AI reply assistant',
      'Basic automation workflows',
      'Unified inbox',
      'Sales pipeline',
      'Basic analytics',
      '1 team member',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    id: 'growth',
    emoji: '⭐',
    name: 'Growth',
    badge: 'Most Popular',
    price: '₹2,999',
    period: '/month',
    description: 'Built for businesses ready to automate and scale.',
    includesNote: 'Everything in Starter, plus:',
    features: [
      'Up to 5 team members',
      'AI lead qualification',
      'Advanced automation workflows',
      'Team inbox',
      'Lead assignment',
      'Calendar booking',
      'Advanced analytics',
      'API & webhooks',
      'Priority support',
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    id: 'enterprise',
    emoji: '🏢',
    name: 'Enterprise',
    price: 'Custom Pricing',
    period: null,
    description: 'For large teams and custom business workflows.',
    includesNote: 'Includes:',
    features: [
      'Unlimited team members',
      'Custom AI agents',
      'Custom integrations',
      'Dedicated account manager',
      'White label (if available)',
      'SLA & priority support',
      'Team training',
      'Custom onboarding',
      'Migration assistance',
      'Dedicated infrastructure (if required)',
    ],
    cta: 'Contact Sales',
    highlighted: false,
    enterprise: true,
  },
];

export default function SimplePricingSection({ onGetStarted }) {
  return (
    <section id="pricing" className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-[#FAFDFA] to-[#EEF8ED]/40" />
      <div className="pointer-events-none absolute -left-[8%] bottom-[5%] h-[260px] w-[260px] rounded-full bg-[#D2EDD0]/25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Pricing</p>
          <h2
            className="mt-3 text-[1.75rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-[#111827] sm:text-[2.15rem]"
            style={{ fontFamily: 'var(--font-plus-jakarta)' }}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#64748B]">
            Choose the plan that fits your business today. Upgrade anytime as your team grows.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 ${plan.highlighted
                  ? 'border-emerald-300 bg-gradient-to-b from-[#ECFDF5] to-white shadow-[0_12px_48px_rgba(5,150,105,0.12)] ring-1 ring-emerald-200/80 lg:scale-[1.02]'
                  : 'border-[#E2E8F0] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]'
                }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#111827] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <p className="text-lg font-bold text-[#111827]">
                  <span className="mr-1.5" aria-hidden>
                    {plan.emoji}
                  </span>
                  {plan.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span
                    className={`font-extrabold tracking-tight text-[#111827] ${plan.enterprise ? 'text-2xl sm:text-[1.65rem]' : 'text-3xl'
                      }`}
                    style={{ fontFamily: 'var(--font-plus-jakarta)' }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-sm font-medium text-[#64748B]">{plan.period}</span>}
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">{plan.description}</p>
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  {plan.includesNote || 'Includes'}
                </p>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5]">
                      <Check className="h-3 w-3 text-emerald-700" strokeWidth={2.5} />
                    </span>
                    <span className="text-[13px] leading-snug text-[#374151] sm:text-[14px]">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.enterprise ? (
                <Link
                  href="/contact"
                  className="mt-auto inline-flex items-center justify-center rounded-xl border border-[#111827] px-5 py-3 text-[14px] font-semibold text-[#111827] transition-colors hover:bg-[#111827] hover:text-white"
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onGetStarted}
                  className={`mt-auto inline-flex items-center justify-center rounded-xl px-5 py-3 text-[14px] font-semibold transition-colors ${plan.highlighted
                      ? 'bg-[#111827] text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-black'
                      : 'border border-[#D4D4D4] bg-white text-[#111827] hover:border-[#BDBDBD]'
                    }`}
                >
                  {plan.cta}
                </button>
              )}
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-2 text-[14px] font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
          >
            View Full Feature Comparison
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
