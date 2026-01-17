'use client';

import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight,
  Globe
} from 'lucide-react';
import UserNavbar from '@/app/user/Header';
import Footer from '@/app/components/Footer';

export default function PricingPage() {
  const [growthOption, setGrowthOption] = useState('call'); // 'call' or 'whatsapp'

  const plans = [
    {
      name: "Starter",
      description: "Get online and start capturing enquiries professionally.",
      price: "2,999",
      period: "/ month",
      cta: "Get Started",
      featured: false,
      features: [
        "1 website with custom domain",
        "Unlimited leads capture",
        "Basic notifications (email)",
        "call & WhatsApp manual",
        "1 form builder",
        "Email support"
      ]
    },
    {
      name: "Growth",
      description: "Convert more enquiries by automating follow-ups and recovery.",
      price: "7,999",
      period: "/ month",
      cta: "Start Growth Plan",
      featured: true,
      tag: "Most Popular",
      features: [
        "Up to 3 websites / landing funnels",
        "Full lead dashboard & form builder",
        "Automated notifications (WA + Email)",
        "FollowUpSure system",
        "Lead assignment and pipelines",
        "8 team seats"
      ]
    },
    {
      name: "Pro (Agency)",
      description: "Built for agencies managing multiple clients and teams.",
      price: "14,999",
      period: "/ month",
      cta: "Start Agency Plan",
      featured: false,
      features: [
        "Up to 20 sites / client accounts",
        "Multi-client view (Clients tab)",
        "Advanced reporting & timelines",
        "Advanced automations & hooks",
        "White-label options (Emails)",
        "20 team seats"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-600 antialiased selection:bg-indigo-100 selection:text-indigo-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <UserNavbar />

      <main className="max-w-[1200px] mx-auto px-6 pt-48 pb-32">
        {/* Top Section */}
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 mb-6">
            One system to capture, follow up, and manage leads
          </h1>
          <p className="text-lg text-slate-500 font-normal leading-relaxed">
            Websites, forms, automation, and recovery &mdash; designed for serious businesses.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-32">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col rounded-[24px] p-10 transition-all duration-500 ${
                plan.featured 
                ? 'bg-[#fcfcff] ring-1 ring-indigo-500/20 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)]' 
                : 'bg-white border border-slate-100'
              }`}
            >
              {plan.tag && (
                <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-white ring-1 ring-slate-200 text-slate-500 px-4 py-1 rounded-full text-[11px] font-medium tracking-wide shadow-sm">
                  {plan.tag}
                </div>
              )}

              <div className="mb-10">
                <span className="text-sm font-medium text-slate-900 block mb-4">{plan.name}</span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-normal text-slate-900 tracking-tight">₹{plan.price}</span>
                  <span className="text-slate-400 font-light">{plan.period}</span>
                </div>
                <p className="text-[15px] leading-relaxed font-normal text-slate-500">
                  {plan.description}
                </p>
              </div>

              {/* Growth Selector */}
              {plan.name === 'Growth' && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
                  <p className="text-[13px] font-normal text-slate-500 mb-4">
                    Choose how you want to follow up and recover leads
                  </p>
                  
                  {/* Segmented Control */}
                  <div className="p-1 bg-slate-50 rounded-xl border border-slate-100 flex gap-1 mb-4">
                    <button 
                      onClick={() => setGrowthOption('call')}
                      className={`flex-1 py-2.5 px-2 rounded-lg text-[13px] font-normal transition-all ${
                        growthOption === 'call' 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Email + AI Call
                    </button>
                    <button 
                      onClick={() => setGrowthOption('whatsapp')}
                      className={`flex-1 py-2.5 px-2 rounded-lg text-[13px] font-normal transition-all ${
                        growthOption === 'whatsapp' 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Email + WhatsApp
                    </button>
                  </div>

                  {/* Helper Text */}
                  <div className="min-h-[60px] flex flex-col justify-center">
                    <p className="text-[12px] text-slate-400 mb-2">
                      {growthOption === 'call' ? 'Best for hospitals and call-driven businesses' : 'Best for coaching, education, and real estate'}
                    </p>
                    <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100/30 dark:border-emerald-900/20">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-normal font-medium">
                        {growthOption === 'call' 
                          ? 'Includes 150 AI call minutes.' 
                          : 'Includes 1,000 WhatsApp messages.'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-[11px] text-slate-400 font-light text-center cursor-default">
                    You can change this option anytime.
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="flex-1 space-y-4 mb-10 pt-2">
                {plan.features.map((feature, i) => {
                  const isGreen = [
                    'FollowUpSure system',
                    'Multi-client view (Clients tab)',
                    'White-label options (Emails)',
                    'Up to 20 sites / client accounts',
                    'Automated notifications (WA + Email)',
                    'Unlimited leads capture'
                  ].includes(feature);

                  return (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 opacity-60" />
                      <span className={`text-[14px] font-normal leading-tight ${isGreen ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                        {feature}
                      </span>
                    </div>
                  );
                })}

                {plan.name === 'Growth' && (
                  <div className="pt-6 mt-6 border-t border-slate-50">
                    <p className="text-[11px] text-slate-400 leading-relaxed text-center font-light italic">
                      Need both WhatsApp and AI call automation?<br/>
                      <a href="mailto:sales@leadforgrow.online" className="text-indigo-400 underline hover:text-indigo-600 transition-colors">Upgrade to Pro</a> or contact us.
                    </p>
                  </div>
                )}
              </div>

              {plan.name === 'Pro (Agency)' && (
                <div className="mt-4 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/30 dark:border-emerald-800/30">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                    Recommended for agencies looking to scale client delivery and white-label operations.
                  </p>
                </div>
              )}
              <a 
                href="/user/register"
                className={`w-full py-4 rounded-xl font-normal text-[15px] transition-all flex items-center justify-center gap-2 ${
                  plan.featured
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/10'
                  : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise Section */}
        <div className="text-center pt-16 mt-16 max-w-xl mx-auto border-t border-slate-50">
          <p className="text-[15px] text-slate-500 mb-8 font-normal">
            Need custom workflows, limits, or enterprise support?
          </p>
          <a 
            href="mailto:sales@leadforgrow.online"
            className="inline-flex items-center gap-2 text-slate-900 hover:text-indigo-600 transition-colors text-sm font-medium px-8 py-3 rounded-full bg-slate-50 ring-1 ring-slate-200/50"
          >
            Contact Sales <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
