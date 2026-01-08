'use client';

import React from 'react';
import MarketingLayout from '@/app/components/MarketingLayout';
import { Home, Briefcase, Rocket, Globe, Building2, BarChart3 } from 'lucide-react';

export default function UseCases() {
  const cases = [
    {
      icon: <Home className="w-8 h-8" />,
      title: "Real Estate Agencies",
      desc: "Capture buyer intent with stunning virtual tour funnels. Automatically assign leads to agents based on property type and neighborhood.",
      features: ["Property Widgets", "Agent Round-Robin", "Auto-Followup"]
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Marketing Agencies",
      desc: "The ultimate tool for fulfillment. Build client funnels, track every lead, and deliver real-time reports to prove your value instantly.",
      features: ["White-Label Dashboards", "Webhook Support", "Multi-Client Management"]
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Service Businesses",
      desc: "Turn your local service (Plumbing, HVAC, Legal) into a 24/7 lead machine. Never miss a middle-of-the-night emergency inquiry again.",
      features: ["Instant SMS Alerts", "Service-Based Forms", "24/7 Auto-Reply"]
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "SaaS & Digital Products",
      desc: "Nurture trial signups and demo requests with intelligent follow-up sequences. Maximize conversion from visitor to paying customer.",
      features: ["A/B Tested Popups", "Product Integration", "Lead Scoring"]
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "B2B Professional Services",
      desc: "Manage complex sales cycles with our CRM. Track touchpoints, set reminders for follow-ups, and keep your pipeline moving.",
      features: ["Consultation Forms", "Task Management", "Email Integration"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Educational Institutes",
      desc: "Manage student inquiries, course admissions and webinar registrations efficiently. Automate the nurturing process for high-value enrollments.",
      features: ["Program Waivers", "Enrollment Tracking", "Parent/Student CRM"]
    }
  ];

  return (
    <MarketingLayout 
      title="Tailored for Your Growth" 
      subtitle="Discover how different industries use LeadForGrow to solve their specific lead management challenges."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cases.map((useCase, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group flex flex-col h-full">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
              {useCase.icon}
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              {useCase.title}
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 flex-grow">
              {useCase.desc}
            </p>
            
            <div className="space-y-3 pt-6 border-t border-slate-50 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Features</p>
              <div className="flex flex-wrap gap-2">
                {useCase.features.map((feat, fIdx) => (
                  <span key={fIdx} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Don't see your industry?</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-2xl mx-auto font-light">
          LeadForGrow is flexible enough to handle any lead capture and management workflow. 
          Contact us for a custom solution tailored to your business model.
        </p>
        <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-bold hover:scale-105 transition shadow-xl active:scale-95">
          Schedule Custom Demo
        </button>
      </div>
    </MarketingLayout>
  );
}
