'use client';

import { useState, useEffect } from 'react';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    const duration = 500;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]);

  return <>₹{display.toLocaleString('en-IN')}</>;
}

export default function RoiCalculator({ embedded = false }) {
  const [leads, setLeads] = useState(200);
  const [dealValue, setDealValue] = useState(25000);
  const [responseHours, setResponseHours] = useState(4);

  const lossRate = Math.min(0.55, 0.12 + responseHours * 0.08);
  const missedRevenue = Math.round(leads * dealValue * lossRate * 0.35);
  const recovered = Math.round(missedRevenue * 0.62);

  const content = (
    <>
      <div className={`text-center mb-10 ${embedded ? '' : 'max-w-5xl mx-auto px-6'}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-2">ROI</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          How much revenue are slow follow-ups costing you?
        </h2>
      </div>

      <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-start ${embedded ? '' : 'max-w-5xl mx-auto px-6'}`}>
        <div className="space-y-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6">
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Monthly leads
              <span className="tabular-nums text-slate-900 dark:text-white">{leads}</span>
            </label>
            <input
              type="range"
              min={50}
              max={2000}
              step={50}
              value={leads}
              onChange={(e) => setLeads(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Average deal value (₹)
              <span className="tabular-nums text-slate-900 dark:text-white">{dealValue.toLocaleString('en-IN')}</span>
            </label>
            <input
              type="range"
              min={5000}
              max={500000}
              step={5000}
              value={dealValue}
              onChange={(e) => setDealValue(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Avg. first response time (hours)
              <span className="tabular-nums text-slate-900 dark:text-white">{responseHours}h</span>
            </label>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={responseHours}
              onChange={(e) => setResponseHours(Number(e.target.value))}
              className="w-full accent-slate-900"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-700/80 dark:text-rose-400 mb-2">
              Estimated missed revenue / month
            </p>
            <p className="text-3xl font-bold text-rose-900 dark:text-rose-300 tabular-nums">
              <AnimatedNumber value={missedRevenue} />
            </p>
            <p className="text-xs text-rose-700/70 dark:text-rose-400/70 mt-2">
              Based on lead decay from delayed WhatsApp follow-ups
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80 dark:text-emerald-400 mb-2">
              Projected recovery with LeadForGrow
            </p>
            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 tabular-nums">
              <AnimatedNumber value={recovered} />
            </p>
            <p className="text-xs text-emerald-800/70 dark:text-emerald-400/70 mt-2">
              Instant replies, auto follow-ups, and SLA enforcement
            </p>
          </div>
        </div>
      </div>
    </>
  );

  if (embedded) return content;

  return (
    <section className="py-16 lg:py-20 bg-white border-y border-slate-200/80">
      {content}
    </section>
  );
}
