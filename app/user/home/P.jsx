'use client';

import React, { useState } from 'react';
import {
  Check,
  ArrowRight,
  Globe,
  Info,
  X,
  CreditCard,
  CheckCircle2,
  Briefcase,
  Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PricingSection() {
  const [planType, setPlanType] = useState('business'); // 'business' or 'agency'
  const [growthOption, setGrowthOption] = useState('call'); // 'call' or 'whatsapp'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const businessPlans = [
    {
      name: "Starter",
      tagline: 'for solo founders',
      price: "2,999",
      period: "/ mo",
      features: [
        "1 website with custom domain",
        "Unlimited leads capture",
        "Automation (email)",
        "Call & WhatsApp manual logs",
        "1 form builder",
        "Email support"
      ],
      description: 'Get online and start capturing enquiries professionally. Best for small businesses.',
      color: 'indigo'
    },
    {
      name: "Growth",
      tagline: 'for growing SMBs',
      price: "7,999",
      period: "/ mo",
      featured: true,
      tag: "Most Popular",
      features: [
        "Up to 3 websites / funnels",
        "Full lead dashboard",
        "Automated notifications (WA + Email)",
        "FollowUpSure system",
        "Lead assignment and pipelines",
        "8 team seats"
      ],
      description: 'Convert more enquiries with automation. Replaces multiple simple CRMs.',
      color: 'indigo'
    },
    {
      name: 'DFY — Done For You',
      tagline: 'managed execution',
      setupFee: '₹20,000 (Setup)',
      price: '₹4,999',
      period: '/ mo',
      features: [
        'Custom DFU website built',
        'Product upload + copywriting',
        'Domain connection + SSL',
        'WhatsApp / Call / Form setup',
        'Daily notifications',
        'Priority support'
      ],
      description: 'Full setup and maintenance. We do the heavy lifting for you.',
      color: 'indigo'
    }
  ];

  const agencyPlans = [
    {
      name: "Agency Starter",
      tagline: '🟢 Freelancers / Small Agencies',
      price: "9,999",
      period: "/ mo",
      features: [
        "Up to 5 client accounts",
        "Lead capture + follow-ups",
        "Client-wise pipelines",
        "Basic reporting",
        "Up to 5 team members",
        "Activity timeline",
        "Client notes"
      ],
      description: 'Low entry, covers real agency use. Easy "yes" decision for freelancers.',
      why: 'Covers real agency use at a low entry price point.',
      color: 'emerald'
    },
    {
      name: "Agency Growth",
      tagline: '🔵 Best Value / Main Plan',
      price: "14,999",
      period: "/ mo",
      featured: true,
      tag: "Best Plan",
      features: [
        "Up to 20 client accounts",
        "Multi-client dashboard",
        "Advanced reporting & timelines",
        "Advanced follow-up automations",
        "Client-wise team control",
        "Invoicing & billing tracking",
        "Up to 20 team seats",
        "Exportable PDF/CSV reports"
      ],
      description: 'Covers 90% of agencies. Easy to justify vs revenue gained.',
      why: 'Replaces multiple tools. Absolutely fair price for the value.',
      color: 'blue'
    },
    {
      name: "Agency Pro",
      tagline: '🔴 Performance Agencies',
      price: "24,999",
      period: "/ mo",
      features: [
        "Up to 40 client accounts",
        "Everything in Growth",
        "Priority support",
        "Higher lead limits",
        "Advanced automation rules",
        "Client health status",
        "Performance comparison"
      ],
      description: 'Clear upgrade path. Anchors Growth as the ultimate value choice.',
      why: 'For high-growth agencies managing large client volumes.',
      color: 'rose'
    }
  ];

  const activePlans = planType === 'business' ? businessPlans : agencyPlans;

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
      toast.success(`${selectedPlan.name} plan activated!`);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div id="pricing" className="bg-white dark:bg-black text-slate-600 dark:text-slate-400 antialiased py-32 border-t border-slate-50 dark:border-slate-900 transition-colors duration-500" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="max-w-[1280px] mx-auto px-6">

        {/* Header & Toggle */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif text-slate-900 dark:text-white mb-8 tracking-tight">
            Plans that pay for themselves.
          </h2>

          <div className="inline-flex p-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8">
            <button
              onClick={() => setPlanType('business')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium transition-all ${planType === 'business' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500'}`}
            >
              <Briefcase className="w-4 h-4" /> Businesses
            </button>
            <button
              onClick={() => setPlanType('agency')}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium transition-all ${planType === 'agency' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500'}`}
            >
              <Building2 className="w-4 h-4" /> Agencies
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 ${planType === 'agency' ? 'max-w-7xl mx-auto' : 'max-w-6xl mx-auto'}`}>
          {activePlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[2.5rem] p-10 transition-all duration-500 ${plan.featured
                ? 'bg-[#fcfcff] dark:bg-indigo-950/20 ring-1 ring-indigo-500/20 shadow-2xl scale-105 z-10'
                : 'bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800'
                }`}
            >
              {plan.tag && (
                <div className={`absolute top-[-14px] left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 px-6 py-1.5 rounded-full text-[12px] font-semibold uppercase tracking-widest shadow-sm ${planType === 'agency' ? 'text-blue-500' : 'text-indigo-500'}`}>
                  {plan.tag}
                </div>
              )}

              <div className="mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2">{plan.tagline}</p>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                  </div>
                  <div className="relative group/info">
                    <Info className="w-4 h-4 text-slate-300 dark:text-slate-700 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-3 w-64 p-5 bg-slate-900 dark:bg-slate-800 text-white rounded-3xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 z-50 pointer-events-none">
                      <p className="text-[12px] leading-relaxed text-slate-200 font-medium">
                        {plan.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm font-medium text-slate-400">₹</span>
                  <span className="text-5xl font-semibold text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-medium text-sm tracking-tight">{plan.period}</span>
                </div>
                {plan.setupFee && (
                  <div className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-semibold uppercase tracking-widest mb-4">{plan.setupFee}</div>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, i) => {
                  const isGreen = feature.includes('client accounts') ||
                    feature.includes('pipelines') ||
                    feature.includes('automations') ||
                    feature.includes('reporting');

                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`mt-1 flex-shrink-0 ${isGreen ? 'text-emerald-500' : 'text-indigo-500 opacity-60'}`}>
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </div>
                      <span className={`text-[14px] leading-snug ${isGreen ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-400 font-normal'}`}>
                        {feature}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-5 rounded-2xl font-semibold text-[14px] uppercase tracking-widest transition-all ${plan.featured
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-2xl shadow-indigo-600/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                Choose {plan.name.split(' ')[0]}
              </button>

              {plan.why && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                    Why? {plan.why}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enterprise Section */}
        <div className="text-center pt-24 border-t dark:border-slate-900">
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            Need custom workflows, specialized limits, or enterprise support?
          </p>
          <a
            href="mailto:sales@leadforgrow.com"
            className="inline-flex items-center gap-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-2xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
          >
            Connect With Sales <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="p-12 sm:p-16">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                  <CreditCard className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold uppercase tracking-[0.3em]">Checkout</h3>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{selectedPlan.name}</p>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-widest">Plan Cost</span>
                  <div className="text-right">
                    <span className="text-2xl font-semibold text-slate-900 dark:text-white">₹{selectedPlan.price}</span>
                    <span className="text-xs font-medium text-slate-400 block tracking-tight">{selectedPlan.period}</span>
                  </div>
                </div>
                {selectedPlan.setupFee && (
                  <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-widest">Setup One-time</span>
                    <span className="text-xl font-medium text-indigo-600 dark:text-indigo-400">{selectedPlan.setupFee.split(' ')[0]}</span>
                  </div>
                )}
              </div>

              <button
                className={`w-full py-6 rounded-2xl font-semibold text-xs tracking-[0.2em] uppercase transition-all shadow-2xl flex items-center justify-center gap-4 ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-none' : 'bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white shadow-slate-200 dark:shadow-none'}`}
                onClick={handleConfirmPay}
                disabled={isProcessing || isSuccess}
              >
                {isProcessing ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : isSuccess ? <CheckCircle2 className="w-6 h-6" /> : 'Confirm Activation'}
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <p className="text-center text-[8px] text-slate-400 font-semibold uppercase tracking-[0.4em]">
                  Encrypted via 256-bit SSL
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
