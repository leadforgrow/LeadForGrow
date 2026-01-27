'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { useStaggerAnimation, useInView } from '@/app/hooks/useScrollAnimation';

export default function SafetyNet() {
  const { ref: cardsRef, visibleItems } = useStaggerAnimation(3, 200);
  const { ref: headerRef, inView: headerInView } = useInView({ threshold: 0.3 });

  const features = [
    {
      icon: ShieldAlert,
      title: "Automated Fallback",
      desc: "If a lead isn't claimed within 120 seconds, the system triggers an emergency SMS/WhatsApp sequence to keep the lead warm."
    },
    {
      icon: RefreshCw,
      title: "Recursive Follow-up",
      desc: "We don't just send one message. Our system follows a 7-day multi-channel cadence until you get a firm 'Yes' or 'No'."
    },
    {
      icon: CheckCircle2,
      title: "Human Validation",
      desc: "The second the lead replies, the system loops your team back in with full context, ensuring a seamless handoff."
    }
  ];

  return (
    <div className="py-24 bg-indigo-600 dark:bg-indigo-950 transition-colors overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header with Staggered Animation */}
        <div ref={headerRef} className="text-center mb-20 text-white">
          <p className={`text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4 transition-all duration-700 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
            Lead Insurance
          </p>
          <h2 className="text-5xl md:text-7xl font-serif leading-tight mb-8">
            <span className={`inline-block transition-all duration-700 delay-100 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
              The Lead Safety Net.
            </span>
          </h2>
          <p className={`text-xl text-indigo-100 font-medium max-w-2xl mx-auto opacity-80 leading-relaxed transition-all duration-700 delay-200 ${headerInView ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
            LeadForGrow isn't just about speed. It's about persistence. When your humans Sleep, Travel, or Forget—our Automated Safety Net takes over.
          </p>
        </div>

        {/* Feature Cards with Sequential Animation */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {features.map((item, i) => (
            <div
              key={i}
              className={`p-10 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-500 group ${visibleItems.includes(i)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
                }`}
            >
              {/* Icon with rotation animation */}
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <item.icon className={`w-6 h-6 ${i === 1 ? 'group-hover:animate-spin' : ''}`} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-indigo-100/70 font-medium leading-relaxed">{item.desc}</p>

              {/* Visual indicator showing automation flow */}
              {i < features.length - 1 && (
                <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-white/50 to-transparent"></div>
                  <div className="w-2 h-2 rounded-full bg-white/50 animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA with Glow Effect */}
        <div className="mt-20 text-center">
          <button className="group px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-xl hover:bg-slate-50 transition-all duration-300 shadow-2xl hover:shadow-white/20 active:scale-95 relative overflow-hidden">
            <span className="relative z-10">Secure My Lead Flow Today</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <p className="mt-6 text-indigo-200/50 text-xs font-bold uppercase tracking-widest opacity-0 animate-fade-in delay-700">
            Built for teams scaling from 10 to 1,000+ leads/month
          </p>
        </div>
      </div>

      {/* Stylized SVG Grid (Safety Net Visual) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Animated Background Blurs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl -translate-x-1/2 opacity-30 animate-glow-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 opacity-30 animate-glow-pulse delay-500"></div>
    </div>
  );
}
