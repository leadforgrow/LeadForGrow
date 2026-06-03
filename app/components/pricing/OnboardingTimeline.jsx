'use client';

import { ONBOARDING_STEPS } from './pricingData';

export default function OnboardingTimeline() {
  return (
    <section className="py-16 lg:py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Onboarding</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Go live in under 24 hours
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200 hidden sm:block" />
          <div className="space-y-6">
            {ONBOARDING_STEPS.map((item, i) => (
              <div key={item.step} className="flex gap-5 sm:gap-6">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white z-10">
                  {item.step}
                </div>
                <div className="pt-1.5 pb-2">
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
                  {i < ONBOARDING_STEPS.length - 1 && (
                    <p className="text-[10px] font-medium text-slate-400 mt-2 sm:hidden">↓</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
