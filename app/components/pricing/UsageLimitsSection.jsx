'use client';

import { USAGE_LIMITS } from './pricingData';

function barWidth(val, max) {
  if (typeof val === 'string') return 100;
  return Math.min(100, Math.round((val / max) * 100));
}

const MAX = { contacts: 100000, automation: 100000 };

export default function UsageLimitsSection() {
  return (
    <section className="py-16 lg:py-20 bg-[#fafbfc]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Transparency</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Usage & limits by plan
          </h2>
          <p className="text-sm text-slate-600 mt-3 max-w-xl mx-auto">
            Enterprise-grade clarity on what each plan includes. No surprise overages without notice.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Resource</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-700">Starter</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-700">Growth</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-700">Scale</th>
                <th className="px-4 py-3.5 text-xs font-semibold text-slate-700">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {USAGE_LIMITS.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-4 font-medium text-slate-800">{row.label}</td>
                  {['starter', 'growth', 'scale', 'enterprise'].map((plan) => {
                    const val = row[plan];
                    const pct =
                      row.label.includes('contacts') && typeof val === 'number'
                        ? barWidth(val, MAX.contacts)
                        : row.label.includes('Automation') && typeof val === 'number'
                          ? barWidth(val, MAX.automation)
                          : null;
                    return (
                      <td key={plan} className="px-4 py-4">
                        <span className="text-xs font-semibold text-slate-900 tabular-nums">
                          {typeof val === 'number' ? val.toLocaleString('en-IN') : val}
                        </span>
                        {pct != null && (
                          <div className="mt-2 h-1.5 w-full max-w-[100px] rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-slate-800 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
