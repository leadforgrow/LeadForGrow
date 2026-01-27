'use client';

import React from 'react';
import { ShieldCheck, Zap, Users } from 'lucide-react';
import { useInView, useCountUp } from '@/app/hooks/useScrollAnimation';

export default function LeaderboardSection() {
  const { ref: sectionRef, inView } = useInView({ threshold: 0.2 });
  const { ref: speedRef, count: speedCount } = useCountUp(45.2, 2000, 0);

  return (
    <div ref={sectionRef} className="py-24 bg-slate-50 dark:bg-black transition-colors overflow-hidden relative border-y border-slate-100 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">

          {/* Leaderboard Image - Slides in from left */}
          <div className={`w-full lg:w-1/2 order-2 lg:order-1 transition-all duration-1000 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-4 shadow-2xl border border-slate-100 dark:border-slate-800">
                <img
                  src="/leaderboard.png"
                  alt="Team Accountability Leaderboard"
                  className="w-full h-auto rounded-[2.5rem] group-hover:scale-[1.02] transition-transform duration-700"
                />
              </div>

              {/* Floating Stats Card with Counter Animation */}
              <div className={`absolute -top-10 -right-10 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 hidden md:block transition-all duration-1000 delay-500 ${inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-90'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-600 animate-pulse">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Response Speed</p>
                    <p ref={speedRef} className="text-xl font-black text-slate-900 dark:text-white leading-none">
                      {speedCount.toFixed(1)}s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content - Slides in from right */}
          <div className={`w-full lg:w-1/2 order-1 lg:order-2 transition-all duration-1000 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 mb-6 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              <Users className="w-3 h-3" />
              Billion-Dollar Scale
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">You can't improve what you can't enforce.</p>
            <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white leading-tight mb-8">
              <span className={`inline-block transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}>
                Absolute
              </span>
              <br />
              <span className={`inline-block transition-all duration-700 delay-400 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}>
                Accountability.
              </span>
              <br />
              <span className={`inline-block transition-all duration-700 delay-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}>
                Zero <span className="italic text-indigo-600">friction.</span>
              </span>
            </h2>
            <p className={`text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10 max-w-xl transition-all duration-700 delay-600 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}>
              Don't just hope your team is following up. See exactly who is unblocking revenue and who is letting leads slip. Gamify your sales culture with real-time performance grades.
            </p>

            {/* Feature Cards - Slide in horizontally */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`p-8 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-500 group ${inView ? 'opacity-100 translate-x-0 delay-700' : 'opacity-0 -translate-x-8'
                }`}>
                <ShieldCheck className="w-8 h-8 text-indigo-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Audit Logs</h4>
                <p className="text-sm text-slate-500 font-medium">Every interaction, call, and message logged automatically for full compliance.</p>
              </div>
              <div className={`p-8 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-500 group ${inView ? 'opacity-100 translate-x-0 delay-800' : 'opacity-0 -translate-x-8'
                }`}>
                <Zap className="w-8 h-8 text-emerald-500 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Alerts</h4>
                <p className="text-sm text-slate-500 font-medium">Managers get notified the second a lead goes unanswered past the 5-minute mark.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Background Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-3xl -z-10 animate-glow-pulse"></div>
    </div>
  );
}
