import { Check, X, Shield, Rocket, Building2, Users } from 'lucide-react';

export default function AgencyOSLanding() {
  return (
    <div id="features" className="min-h-screen bg-white dark:bg-black transition-colors duration-500 py-24 border-t dark:border-slate-800">
      <main className="px-8 max-w-7xl mx-auto">
        
        {/* SECTION 4: WHY NOT A CRM? */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white mb-6">The missing layer between<br /> enquiry and revenue.</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">CRMs are databases. LeadForGrow is a discipline engine. Here is the difference.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Feature / Outcome</th>
                  <th className="px-8 py-8 text-xl font-bold text-slate-900 dark:text-white">LeadForGrow (Rev-OS)</th>
                  <th className="px-8 py-8 text-lg font-bold text-slate-400">Traditional CRM</th>
                  <th className="px-8 py-8 text-lg font-bold text-slate-400">WhatsApp/Manual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {[
                  { label: "Lead Capture Speed", lfg: "Instant (Seconds)", crm: "Delayed (Minutes/Hours)", manual: "Chaos" },
                  { label: "Follow-up Enforcement", lfg: "Automated & Mandatory", crm: "Optional / Manual Log", manual: "None" },
                  { label: "Revenue Leak Visibility", lfg: "Real-time Dashboard", crm: "Buried in Reports", manual: "Invisible" },
                  { label: "Accountability", lfg: "Enforced tasks", crm: "Self-governed", manual: "Non-existent" },
                  { label: "Cost of Inaction", lfg: "Minimized", crm: "High", manual: "Losing 50%+ Revenue" }
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-6 text-sm font-bold text-slate-500 dark:text-slate-500">{row.label}</td>
                    <td className="px-8 py-6 text-indigo-600 dark:text-indigo-400 font-black">
                      <div className="flex items-center gap-2"><Check className="w-4 h-4" /> {row.lfg}</div>
                    </td>
                    <td className="px-8 py-6 text-slate-400 font-medium">
                      <div className="flex items-center gap-2"><X className="w-4 h-4" /> {row.crm}</div>
                    </td>
                    <td className="px-8 py-6 text-slate-400 font-medium italic">{row.manual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 6: FOR WHO IS THIS? */}
        <div className="mb-32">
           <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-white">Built for those who care about ROI.</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Shield, 
                  title: "SMB Owners", 
                  pain: "Losing leads while focus is on ops.", 
                  solution: "LeadForGrow becomes your 'Automated Manager', ensuring your staff never misses a callback.",
                  cta: "Fix My Business"
                },
                { 
                  icon: Rocket, 
                  title: "Agencies", 
                  pain: "Clients complaining about lead quality.", 
                  solution: "Prove the problem is 'Follow-up' not 'Leads'. Provide a Rev-OS to clients and increase your retention.",
                  cta: "Scale My Agency"
                },
                { 
                  icon: Users, 
                  title: "Sales Teams", 
                  pain: "Sales team underperforming benchmarks.", 
                  solution: "Enforce a standardized follow-up culture. See exactly who is closing and why.",
                  cta: "Unblock My Team"
                }
              ].map((item, i) => (
                <div key={i} className="p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                   <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
                      <item.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                   <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2">The Pain: {item.pain}</p>
                   <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8 flex-grow">{item.solution}</p>
                   <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all uppercase tracking-widest">
                      {item.cta}
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* SECTION 7: TRUST & PROOF */}
        <div className="grid md:grid-cols-3 gap-12 text-center pt-20 border-t dark:border-slate-900 transition-colors duration-500">
          <div>
            <div className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent mb-4 tracking-tighter">
              20M+
            </div>
            <div className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">Total Revenue Protected</div>
          </div>

          <div>
            <div className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent mb-4 tracking-tighter">
              34%
            </div>
            <div className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">Avg. Conversion Boost (Day 45)</div>
          </div>

          <div>
            <div className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-4 tracking-tighter">
              150+
            </div>
            <div className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">High-Growth Sales Teams</div>
          </div>
        </div>
      </main>
    </div>
  );
}
