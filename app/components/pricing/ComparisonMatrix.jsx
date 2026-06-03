'use client';

import { Check, Minus } from 'lucide-react';
import { COMPARISON_ROWS } from './pricingData';

function Cell({ value }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
        <Check className="w-3.5 h-3.5 text-emerald-700" strokeWidth={2.5} />
      </span>
    );
  }
  if (value === false) {
    return <Minus className="w-4 h-4 text-slate-300 mx-auto" />;
  }
  return <span className="text-xs text-slate-500">{value}</span>;
}

export default function ComparisonMatrix() {
  return (
    <section className="py-16 lg:py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2">Compare</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Built for revenue, not record-keeping
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[34%]">Capability</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-900 bg-slate-100/80 w-[22%]">LeadForGrow</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[22%]">Traditional CRM</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 w-[22%]">Manual WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{row.feature}</td>
                  <td className="px-5 py-3.5 text-center bg-slate-50/60"><Cell value={row.lfg} /></td>
                  <td className="px-5 py-3.5 text-center"><Cell value={row.crm} /></td>
                  <td className="px-5 py-3.5 text-center"><Cell value={row.manual} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
