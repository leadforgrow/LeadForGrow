import React from 'react';
import { TrendingDown, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function RevenueAudit() {
  return (
    <div className="py-24 bg-white dark:bg-slate-950 transition-colors border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 mb-6 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest">
              <TrendingDown className="w-3 h-3" />
              The Cost of Inaction
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white leading-tight mb-8">
              A 10-minute delay <br />
              can cost you <br />
              most of the deal.
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10 max-w-xl">
              While your team checks their email or logs into a CRM, your lead has already contacted two other competitors. LeadForGrow stops the clock the second an enquiry arrives.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Human Delay Penalty</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">Avg. response time without LFG: 4.5 hours. Lead drop-off rate: 90%.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">The LFG Advantage</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Avg. response time with LFG: 28 seconds. Conversion boost: 3.5x.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-rose-500/20 to-indigo-500/20 blur-3xl opacity-50"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-[3rem] p-6 shadow-2xl overflow-hidden group">
              <img
                src="/revenue-leak.png"
                alt="Revenue Leak Audit UI"
                className="w-full h-auto rounded-[2rem] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-950 to-transparent">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Audit Status</p>
                    <p className="text-xl font-bold text-rose-500">Critical Leakage Detected</p>
                  </div>
                  <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-rose-500 hover:text-white transition-all">
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
