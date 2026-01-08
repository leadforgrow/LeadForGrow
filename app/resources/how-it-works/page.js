'use client';

import React from 'react';
import MarketingLayout from '@/app/components/MarketingLayout';
import { MousePointer2, Settings, Zap, Users } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <MousePointer2 className="w-8 h-8" />,
      title: "1. Build Your Funnel",
      desc: "Use our drag-and-drop builder to create stunning websites and lead capture forms in minutes. Choose from 50+ high-converting templates designed for agencies.",
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "2. Set Automation Rules",
      desc: "Define what happens when a lead is captured. Set follow-ups, assign team members, and trigger webhooks to sync with your existing stack.",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "3. Launch & Capture",
      desc: "Deploy your site with one click. Our intelligent widgets handle the engagement with auto-popups (30s initial, 45s recurring) to maximize capture rates.",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "4. Scale Your Agency",
      desc: "Manage all clients and leads from one dashboard. Use detailed analytics to prove ROI and close more deals using our built-in CRM.",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
    }
  ];

  return (
    <MarketingLayout 
      title="How LeadForGrow Works" 
      subtitle="From building high-converting funnels to automating your entire agency follow-up system."
    >
      <div className="space-y-32">
        {steps.map((step, idx) => (
          <div key={idx} className={`flex flex-col lg:flex-row items-center gap-16 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
            <div className="flex-1 space-y-8">
              <div className={`w-20 h-20 ${step.color} rounded-[2rem] flex items-center justify-center shadow-xl`}>
                {step.icon}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                {step.title}
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                {step.desc}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Step {idx + 1}</span>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative group">
                {/* Visual Placeholder for Step App Screenshot */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-300 dark:text-slate-700 font-bold text-lg uppercase tracking-widest">Platform Preview {idx + 1}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-slate-900 dark:bg-indigo-900/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to automate your agency?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-12">
              Join 500+ agencies who use LeadForGrow to run their entire lead management operation on autopilot.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <button className="bg-indigo-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-indigo-700 transition shadow-2xl shadow-indigo-500/20">
                Start Free Trial
              </button>
              <button className="bg-white/10 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white/20 transition backdrop-blur-sm border border-white/10">
                Book Managed Setup
              </button>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </MarketingLayout>
  );
}
