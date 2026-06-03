'use client';

import { ADDONS } from './pricingData';

export default function AddonsSection() {
  return (
    <section className="py-16 lg:py-20 bg-[#fafbfc]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Add-ons</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Extend your revenue engine
          </h2>
          <p className="text-sm text-slate-600 mt-3">
            Scale capabilities without switching plans. Add what you need, when you need it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADDONS.map((addon) => (
            <div
              key={addon.name}
              className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-shadow"
            >
              <h3 className="text-base font-bold text-slate-900">{addon.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">₹{addon.price}</span>
                <span className="text-xs text-slate-500">{addon.period}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {addon.bullets.map((b) => (
                  <li key={b} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
