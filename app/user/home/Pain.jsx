'use client';

import React from 'react';
import { AlertTriangle, Clock, Users, ZapOff } from 'lucide-react';
import { useStaggerAnimation, useInView } from '@/app/hooks/useScrollAnimation';

export default function PainSection() {
  const { ref: cardsRef, visibleItems } = useStaggerAnimation(4, 150);
  const { ref: quoteRef, inView: quoteInView } = useInView({ threshold: 0.5 });

  const painPoints = [
    {
      icon: Clock,
      title: "The Speed Gap",
      desc: "Leads go cold in minutes, not days. If you aren't responding instantly, your competitor is.",
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/20",
      borderColor: "border-rose-200 dark:border-rose-900/30"
    },
    {
      icon: ZapOff,
      title: "Manual Chaos",
      desc: "WhatsApp groups and spreadsheets break at scale. Enquiries slip through the cracks every single day.",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-900/30"
    },
    {
      icon: Users,
      title: "Zero Accountability",
      desc: "Who called the lead? When? What happened? Without a system, there is no team accountability.",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-900/30"
    },
    {
      icon: AlertTriangle,
      title: "Revenue Leakage",
      desc: "You're spending on ads and marketing but losing the ROI at the very last step: the follow-up.",
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
      borderColor: "border-indigo-200 dark:border-indigo-900/30"
    }
  ];

  return (
    <div className="py-24 bg-white dark:bg-black transition-colors border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header Section */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4 opacity-0 animate-fade-in">The Revenue Leak</p>
          <h2 className="text-5xl md:text-6xl font-serif text-slate-900 dark:text-white leading-tight mb-8">
            <span className="inline-block opacity-0 animate-fade-in-up delay-100">Your CRM is where</span>
            <br />
            <span className="inline-block opacity-0 animate-fade-in-up delay-200">
              leads go to <span className="text-rose-600">die.</span>
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed opacity-0 animate-fade-in-up delay-300">
            CRMs are built for tracking history and managing pipelines. They aren't built for the <span className="text-slate-900 dark:text-white font-bold">first 5 minutes</span> of an enquiry—the most critical window for your revenue.
          </p>
        </div>

        {/* Pain Point Cards with Sequential Animation */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {painPoints.map((item, i) => (
            <div
              key={i}
              className={`group p-8 rounded-3xl border ${item.borderColor} hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-500 ${visibleItems.includes(i)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
                }`}
              style={{
                transitionDelay: `${i * 100}ms`
              }}
            >
              {/* Animated divider that draws itself */}
              <div className="relative mb-6">
                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6" />
                </div>
                {i < painPoints.length - 1 && (
                  <div className="absolute top-full left-6 w-0.5 h-8 bg-gradient-to-b from-slate-200 dark:from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-400 transition-all duration-300">
                {item.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Quote Section with Delayed Appearance */}
        <div
          ref={quoteRef}
          className={`mt-20 p-8 md:p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-700 ${quoteInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
            }`}
        >
          <div className="max-w-xl">
            <h4 className={`text-2xl font-bold text-slate-900 dark:text-white mb-4 transition-all duration-700 delay-200 ${quoteInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
              "We have a CRM, we're fine."
            </h4>
            <p className={`text-slate-600 dark:text-slate-400 font-medium transition-all duration-700 delay-400 ${quoteInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
              That's what 90% of business owners say right before they realize their Sales team only logs 20% of incoming enquiries. LeadForGrow captures <span className="text-indigo-600 dark:text-indigo-400 font-bold">100%</span> of calls, forms, and chats before they ever reach your CRM.
            </p>
          </div>
          <button className={`group px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all duration-300 whitespace-nowrap hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30 ${quoteInView ? 'opacity-100 translate-x-0 delay-600' : 'opacity-0 translate-x-4'
            }`}>
            <span className="relative">
              Audit My Follow-Ups
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10"></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
