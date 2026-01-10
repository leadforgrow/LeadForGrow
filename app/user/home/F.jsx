import React from 'react';
import { Target, Zap, ShieldCheck, BarChart3, Globe, Layers } from 'lucide-react';

export default function LeadForGrowHero() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500 overflow-hidden relative border-t dark:border-slate-800">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-32 h-32 bg-blue-500 rounded-full -translate-x-1/2 opacity-10 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-8 py-24 relative z-10">

        {/* SECTION 3: HOW IT WORKS (SYSTEM VIEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">The System</p>
            <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white leading-tight mb-8">
              A Revenue engine<br />
              that never <span className="italic text-indigo-600">sleeps.</span>
            </h2>
            <div className="space-y-8">
              {[
                { step: "01", title: "Instant Capture", desc: "Every call, WhatsApp, and form enquiry is captured instantly. No more lost sticky notes." },
                { step: "02", title: "Smart Routing", desc: "Leads are assigned to the right team member in seconds based on availability and expertise." },
                { step: "03", title: "Automated Persistence", desc: "The system enforces follow-ups through multi-channel sequences until the lead converts." },
                { step: "04", title: "Revenue Visibility", desc: "See exactly how much revenue is 'At Risk' and who is closing the most deals." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-indigo-600 transition-colors">{item.step}</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in duration-1000">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-4 shadow-2xl overflow-hidden group">
              <img
                src="/rev-os-flow.png"
                alt="LeadForGrow System Architecture"
                className="w-full h-auto rounded-[2.5rem] group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* SECTION 5: KEY OUTCOMES */}
        <div className="pt-24 border-t border-slate-200 dark:border-slate-900">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-white mb-6">Designed for Revenue, not just dashboards.</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">We stopped selling "features" and started selling "results". Here is what changes on Day 1.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Higher Conversion", desc: "Response time under 5 minutes increases conversion rates by up to 391%. We make it happen every time.", color: "text-emerald-500" },
              { icon: ShieldCheck, title: "Zero Leakage", desc: "Every lead is accounted for. No more 'I forgot to call' or 'The lead was lost in my WhatsApp'.", color: "text-blue-500" },

              { icon: Zap, title: "Operational Discipline at Scale", desc: "Manage 10 or 10,000 leads with the same level of discipline, automated precision, and leaderboard metrics.", color: "text-amber-500" }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/40 p-10 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 group-hover:bg-slate-900 dark:group-hover:bg-white transition-colors`}>
                  <item.icon className="w-6 h-6 text-slate-400 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
