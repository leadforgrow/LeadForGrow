'use client';

import React, { useState } from 'react';
import {
  Check,
  ArrowRight,
  Globe,
  Info,
  X,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PricingSection() {
  const [growthOption, setGrowthOption] = useState('call'); // 'call' or 'whatsapp'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const plans = [
    {
      name: 'DFY — Done For You',
      tagline: 'managed execution',
      setupFee: '₹20,000 (Setup)',
      price: '₹4,999',
      period: '/ mo',
      features: [
        'Custom DFU website built & published',
        'Product/photo upload + copywriting',
        'Domain connection + SSL set up',
        'WhatsApp / Call / Form integration',
        'Daily notifications (WhatsApp/Email)',
        'Maintenance & Priority support'
      ],
      description: 'Setup sits between common single-site build costs and agency quotes; monthly covers hosting, SSL, and ongoing DFU labor & SLAs.',
      popular: true
    },
    {
      name: "Starter",
      tagline: 'for solo founders',
      price: "2,999",
      period: "/ mo",
      features: [
        "1 website with custom domain",
        "Unlimited leads capture",
        "Automation  (email)",
        "call & WhatsApp manual",
        "1 form builder",
        "Email support"
      ],
      description: 'Get online and start capturing enquiries professionally. Positioned for small businesses who currently spend on maintenance.'
    },
    {
      name: "Growth",
      tagline: 'for growing SMBs',
      price: "7,999",
      period: "/ mo",
      featured: true,
      tag: "Most Popular",
      features: [
        "Up to 3 websites / landing funnels",
        "Full lead dashboard & form builder",
        "Automated notifications (WA + Email)",
        "FollowUpSure system",
        "Lead assignment and pipelines",
        "8 team seats"
      ],
      description: 'Convert more enquiries by automating follow-ups and recovery. A replacement for paying separate maintenance + a simple CRM.'
    },
    {
      name: "Pro (Agency)",
      tagline: 'for agencies & teams',
      price: "14,999",
      period: "/ mo",
      features: [
        "Up to 20 sites / client accounts",
        "Multi-client view (Clients tab)",
        "Advanced reporting & timelines",
        "Advanced automations & hooks",
        "White-label options (Emails)",
        "20 team seats"
      ],
      description: 'Built for agencies managing multiple clients and teams. Reflects replacement of multiple tools and matches agency budgets.'
    }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleConfirmPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      localStorage.setItem('userPlan', selectedPlan.name);
      toast.success(`${selectedPlan.name} plan activated successfully!`);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div id="pricing" className="bg-white dark:bg-black text-slate-600 dark:text-slate-400 antialiased py-32 border-t border-slate-50 dark:border-slate-900 transition-colors duration-500" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Top Section */}
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 dark:text-white mb-6">
            One system to capture, follow up, and manage leads
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            Websites, forms, automation, and recovery &mdash; designed for serious businesses.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 items-stretch mb-32">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[24px] p-8 transition-all duration-500 ${plan.featured
                ? 'bg-[#fcfcff] dark:bg-indigo-950/20 ring-1 ring-indigo-500/20 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)]'
                : 'bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800'
                }`}
            >
              {plan.tag && (
                <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 text-slate-500 dark:text-slate-400 px-4 py-1 rounded-full text-[11px] font-medium tracking-wide shadow-sm">
                  {plan.tag}
                </div>
              )}

              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{plan.name}</h3>
                    <p className="text-[10px] uppercase font-medium tracking-widest text-slate-400 dark:text-slate-500">{plan.tagline}</p>
                  </div>
                  <div className="relative group/info">
                    <Info className="w-4 h-4 text-slate-300 dark:text-slate-700 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-3 w-56 p-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 z-50 pointer-events-none">
                      <p className="text-[11px] leading-relaxed text-slate-200 font-medium">
                        {plan.description}
                      </p>
                      <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
                    </div>
                  </div>
                </div>

                {plan.setupFee && (
                  <div className="text-indigo-600 dark:text-indigo-400 font-medium text-[10px] uppercase tracking-wider mb-1">{plan.setupFee}</div>
                )}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-normal text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-light text-xs">{plan.period}</span>
                </div>
              </div>

              {/* Growth Selector - More Compact */}
              {plan.name === 'Growth' && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-500 border-y border-slate-50 dark:border-slate-800/50 py-4">
                  {/* Segmented Control */}
                  <div className="p-1 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-1 mb-3">
                    <button
                      onClick={() => setGrowthOption('call')}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-normal transition-all ${growthOption === 'call'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                      AI Call
                    </button>
                    <button
                      onClick={() => setGrowthOption('whatsapp')}
                      className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-normal transition-all ${growthOption === 'whatsapp'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                      WhatsApp
                    </button>
                  </div>

                  <div className="min-h-[44px]">
                    <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100/30 dark:border-emerald-900/20">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-normal font-medium">
                        {growthOption === 'call'
                          ? 'Includes 150 AI call minutes.'
                          : 'Includes 1,000 WhatsApp messages.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features - Slimmed down font size */}
              <div className="flex-1 space-y-3.5 mb-8">
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
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5 opacity-60" />
                      <span className={`text-[13px] font-normal leading-tight ${isGreen ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                        {feature}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-3.5 rounded-xl font-normal text-[14px] transition-all flex items-center justify-center gap-2 ${plan.featured
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/10 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
              >
                Get Started
              </button>
              {plan.name === 'Pro (Agency)' && (
                <div className="mt-4 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100/30 dark:border-emerald-800/30">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                    Recommended for agencies looking to scale client delivery and white-label operations.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enterprise Section */}
        <div className="text-center pt-16 mt-16 max-w-xl mx-auto border-t border-slate-50 dark:border-slate-900">
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-8 font-normal">
            Need custom workflows, limits, or enterprise support?
          </p>
          <a
            href="mailto:sales@leadforgrow.online"
            className="inline-flex items-center gap-2 text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium px-8 py-3 rounded-full bg-slate-50 dark:bg-slate-900 ring-1 ring-slate-200/50 dark:ring-slate-800"
          >
            Contact Sales <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>

      {/* Re-integrated Payment Modal with Dark Mode Support */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="p-10 sm:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                  <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Secure Payment</h3>
                  <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Activate {selectedPlan.name}</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Selected Tier</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {selectedPlan.price}<span className="text-sm font-normal text-slate-400 ml-1">{selectedPlan.period}</span>
                  </span>
                </div>
              </div>

              <button
                className={`w-full py-5 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-3 ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 dark:shadow-none'}`}
                onClick={handleConfirmPay}
                disabled={isProcessing || isSuccess}
              >
                {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isSuccess ? <CheckCircle2 className="w-5 h-5" /> : 'Confirm & Activate'}
              </button>

              <p className="mt-4 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                Protected by 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
