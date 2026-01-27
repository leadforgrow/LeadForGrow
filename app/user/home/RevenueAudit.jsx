'use client';

import React from 'react';
import { TrendingDown, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useInView, useCountUp } from '@/app/hooks/useScrollAnimation';

export default function RevenueAudit() {
  const { ref: sectionRef, inView } = useInView({ threshold: 0.2 });
  const { ref: delayRef, count: delayCount } = useCountUp(10, 2000, 0);
  const { ref: dropoffRef, count: dropoffCount } = useCountUp(90, 2000, 0);
  const { ref: responseRef, count: responseCount } = useCountUp(28, 2000, 0);
  const { ref: boostRef, count: boostCount } = useCountUp(3.5, 2000, 0);

  return (
    <div ref={sectionRef} className="py-24 bg-white dark:bg-slate-950 transition-colors border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            {/* Badge with animation */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 mb-6 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <TrendingDown className="w-3 h-3" />
              The Cost of Inaction
            </div>

            {/* Headline with staggered animation */}
            <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white leading-tight mb-8">
              <span className={`inline-block transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                A <span ref={delayRef} className="text-rose-600">{delayCount}-minute</span> delay
              </span>
              <br />
              <span className={`inline-block transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                can cost you
              </span>
              <br />
              <span className={`inline-block transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                most of the deal.
              </span>
            </h2>

            {/* Subtext */}
            <p className={`text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10 max-w-xl transition-all duration-700 delay-400 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              While your team checks their email or logs into a CRM, your lead has already contacted two other competitors. LeadForGrow stops the clock the second an enquiry arrives.
            </p>

            {/* Comparison Cards with Sequential Animation */}
            <div className="space-y-6">
              {/* Human Delay - Slow fade */}
              <div className={`flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all duration-1000 delay-500 ${inView ? 'opacity-60 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Human Delay Penalty</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">
                    Avg. response time without LFG: 4.5 hours. Lead drop-off rate: <span ref={dropoffRef}>{dropoffCount}%</span>.
                  </p>
                </div>
              </div>

              {/* LFG Advantage - Fast snap */}
              <div className={`flex items-start gap-4 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 transition-all duration-500 delay-700 ${inView ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-8 scale-95'}`}>
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">The LFG Advantage</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Avg. response time with LFG: <span ref={responseRef}>{responseCount} seconds</span>. Conversion boost: <span ref={boostRef}>{boostCount.toFixed(1)}x</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Leak Card - Animated entrance */}
          <div className="relative">
            <div className={`absolute -inset-4 bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 blur-3xl transition-opacity duration-1000 ${inView ? 'opacity-50' : 'opacity-0'}`}></div>
            <div className={`relative bg-slate-900 border border-slate-800 rounded-[3rem] p-6 shadow-2xl overflow-hidden group transition-all duration-700 delay-600 ${inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
              <img
                src="/revenue-leak.png"
                alt="Revenue Leak Audit UI"
                className="w-full h-auto rounded-[2rem] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-950 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Audit Status</p>
                    <p className="text-xl font-bold text-rose-500 animate-pulse">Critical Leakage Detected</p>
                  </div>
                  <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-rose-500 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-rose-500/50">
                    Unblock My Revenue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
