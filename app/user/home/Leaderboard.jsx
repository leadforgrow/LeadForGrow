import React from 'react';
import { ShieldCheck, Zap, Users } from 'lucide-react';

export default function LeaderboardSection() {
  return (
    <div className="py-24 bg-slate-50 dark:bg-black transition-colors overflow-hidden relative border-y border-slate-100 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">

          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-4 shadow-2xl border border-slate-100 dark:border-slate-800">
                <img
                  src="/leaderboard.png"
                  alt="Team Accountability Leaderboard"
                  className="w-full h-auto rounded-[2.5rem]"
                />
              </div>
              {/* Floating Stats */}
              <div className="absolute -top-10 -right-10 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 hidden md:block animate-bounce-slow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-600">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Response Speed</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none">45.2s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 mb-6 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              <Users className="w-3 h-3" />
              Billion-Dollar Scale
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white leading-tight mb-8">
              Absolute <br />
              Accountability. <br />
              Zero <span className="italic text-indigo-600">friction.</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-10 max-w-xl">
              Don't just hope your team is following up. See exactly who is unblocking revenue and who is letting leads slip. Gamify your sales culture with real-time performance grades.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all group">
                <ShieldCheck className="w-8 h-8 text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Audit Logs</h4>
                <p className="text-sm text-slate-500 font-medium">Every interaction, call, and message logged automatically for full compliance.</p>
              </div>
              <div className="p-8 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all group">
                <Zap className="w-8 h-8 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Alerts</h4>
                <p className="text-sm text-slate-500 font-medium">Managers get notified the second a lead goes unanswered past the 5-minute mark.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Background Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}
