import React from 'react';
import { AlertTriangle, Clock, Users, ZapOff } from 'lucide-react';

export default function PainSection() {
  return (
    <div className="py-24 bg-white dark:bg-black transition-colors border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-8">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4">The Revenue Leak</p>
          <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white leading-tight mb-8">
            Your CRM is where<br />
            leads go to <span className="text-rose-600">die.</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            CRMs are built for tracking history and managing pipelines. They aren't built for the <span className="text-slate-900 dark:text-white font-bold">first 5 minutes</span> of an enquiry—the most critical window for your revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Clock,
              title: "The Speed Gap",
              desc: "Leads go cold in minutes, not days. If you aren't responding instantly, your competitor is.",
              color: "text-rose-500",
              bg: "bg-rose-50 dark:bg-rose-950/20"
            },
            {
              icon: ZapOff,
              title: "Manual Chaos",
              desc: "WhatsApp groups and spreadsheets break at scale. Enquiries slip through the cracks every single day.",
              color: "text-amber-500",
              bg: "bg-amber-50 dark:bg-amber-950/20"
            },
            {
              icon: Users,
              title: "Zero Accountability",
              desc: "Who called the lead? When? What happened? Without a system, there is no team accountability.",
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-950/20"
            },
            {
              icon: AlertTriangle,
              title: "Revenue Leakage",
              desc: "You're spending on ads and marketing but losing the ROI at the very last step: the follow-up.",
              color: "text-indigo-500",
              bg: "bg-indigo-50 dark:bg-indigo-950/20"
            }
          ].map((item, i) => (
            <div key={i} className="group p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 md:p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">"We have a CRM, we're fine."</h4>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              That's what 90% of business owners say right before they realize their Sales team only logs 20% of incoming enquiries. LeadForGrow captures <span className="text-indigo-600 dark:text-indigo-400 font-bold">100%</span> of calls, forms, and chats before they ever reach your CRM.
            </p>
          </div>
          <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all whitespace-nowrap">
            Audit My Follow-Ups
          </button>
        </div>
      </div>
    </div>
  );
}
