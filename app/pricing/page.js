'use client';

import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight,
  Globe,
  Briefcase,
  Building2,
  Mail,
  X
} from 'lucide-react';
import UserNavbar from '@/app/user/Header';
import Footer from '@/app/components/Footer';

export default function PricingPage() {
  const [planType, setPlanType] = useState('business');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const businessPlans = [
    {
      name: "Starter",
      description: "Get online and start capturing enquiries professionally.",
      price: "2,999",
      period: "/ month",
      cta: "Get Started",
      tagline: "For Solo Founders",
      features: [
        "1 website with custom domain",
        "Unlimited leads capture",
        "Basic notifications (email)",
        "Call & WhatsApp manual logs",
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
      tagline: "For Growing SMBs",
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
      name: "DFY — Done For You",
      description: "Full setup and managed execution for your business.",
      price: "4,999",
      setupFee: "₹20,000 Setup",
      period: "/ month",
      cta: "Contact for DFY",
      tagline: "Managed Execution",
      features: [
        "Custom DFU website built",
        "Product upload + copywriting",
        "Domain connection + SSL",
        "WhatsApp / Call / Form setup",
        "Daily notifications",
        "Priority support"
      ]
    }
  ];

  const agencyPlans = [
    {
      name: "Agency Starter",
      tagline: "🟢 For Small Agencies",
      price: "7,999",
      period: "/ month",
      cta: "Start Agency",
      description: "Covers real agency use at a low entry price point.",
      features: [
        "Up to 5 client accounts",
        "Lead capture + follow-ups",
        "Client-wise pipelines",
        "Basic reporting",
        "Up to 5 team members",
        "Activity timeline",
        "Client notes"
      ]
    },
    {
      name: "Agency Growth",
      tagline: "🔵 Best Value Plan",
      price: "14,999",
      period: "/ month",
      cta: "Start Growth",
      featured: true,
      tag: "Best Plan",
      description: "Covers 90% of agencies. Easy to justify vs revenue.",
      features: [
        "Up to 20 client accounts",
        "Multi-client dashboard",
        "Advanced reporting & timelines",
        "Advanced follow-up automations",
        "Client-wise team control",
        "Invoicing & billing tracking",
        "Up to 20 team seats",
        "Exportable PDF/CSV reports"
      ]
    },
    {
      name: "Agency Pro",
      tagline: "🔴 For Performance Agencies",
      price: "24,999",
      period: "/ month",
      cta: "Scale Agency",
      description: "Clear upgrade path for growing performance agencies.",
      features: [
        "Up to 40 client accounts",
        "Everything in Growth",
        "Priority support",
        "Higher lead limits",
        "Advanced automation rules",
        "Client health status",
        "Performance comparison"
      ]
    }
  ];

  const activePlans = planType === 'business' ? businessPlans : agencyPlans;

  return (
    <div className="min-h-screen bg-white text-slate-600 antialiased selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <UserNavbar />

      <main className="max-w-[1300px] mx-auto px-6 pt-48 pb-32">
        {/* Toggle UI */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif text-slate-900 mb-8 tracking-tighter">
            Pricing built for growth.
          </h1>
          
          <div className="inline-flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100 mb-12 shadow-inner">
            <button 
              onClick={() => setPlanType('business')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${planType === 'business' ? 'bg-white text-slate-900 shadow-xl ring-1 ring-slate-200' : 'text-slate-400'}`}
            >
              <Briefcase className="w-4 h-4" /> Businesses
            </button>
            <button 
              onClick={() => setPlanType('agency')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${planType === 'agency' ? 'bg-white text-slate-900 shadow-xl ring-1 ring-slate-200' : 'text-slate-400'}`}
            >
              <Building2 className="w-4 h-4" /> Agencies
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch mb-32">
          {activePlans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col rounded-[3rem] p-12 transition-all duration-500 ${
                plan.featured 
                ? 'bg-[#fcfcff] ring-1 ring-indigo-500/10 shadow-[0_40px_80px_-15px_rgba(79,70,229,0.1)] scale-105 z-10' 
                : 'bg-white border border-slate-100'
              }`}
            >
              {plan.tag && (
                <div className={`absolute top-[-16px] left-1/2 -translate-x-1/2 bg-white ring-1 ring-slate-100 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg ${planType === 'agency' ? 'text-blue-500' : 'text-indigo-500'}`}>
                  {plan.tag}
                </div>
              )}

              <div className="mb-10">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{plan.tagline}</p>
                <h2 className="text-2xl font-black text-slate-900 mb-6">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm font-black text-slate-400">₹</span>
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                  <span className="text-slate-400 font-bold ml-1 text-sm">{plan.period}</span>
                </div>
                {plan.setupFee && (
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block mb-4">{plan.setupFee}</p>
                )}
                <p className="text-[14px] leading-relaxed font-medium text-slate-500 mb-8 italic border-l-2 border-slate-100 pl-4">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-4 mb-12">
                {plan.features.map((feature, i) => {
                  const isGreen = feature.includes('client accounts') || 
                                feature.includes('pipelines') || 
                                feature.includes('automations') || 
                                feature.includes('timelines') ||
                                feature.includes('reporting');

                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className={`mt-1 flex-shrink-0 ${isGreen ? 'text-emerald-500' : 'text-indigo-500 opacity-40'}`}>
                        <Check className="w-5 h-5 stroke-[3px]" />
                      </div>
                      <span className={`text-[14px] leading-tight ${isGreen ? 'text-emerald-600 font-bold' : 'text-slate-500 font-medium'}`}>
                        {feature}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowModal(true);
                }}
                className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
                  plan.featured
                  ? 'bg-slate-900 text-white hover:bg-black shadow-2xl shadow-slate-200'
                  : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="text-center pt-24 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-8 font-bold uppercase tracking-widest">
            Custom needs?
          </p>
          <button 
            onClick={() => {
              setSelectedPlan({ name: 'Custom Enterprise' });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-3 text-slate-900 hover:text-indigo-600 transition-colors text-xs font-black uppercase tracking-widest bg-slate-50 px-10 py-5 rounded-2xl ring-1 ring-slate-200"
          >
            Connect With Agency Specialist <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      <Footer />

      {/* Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Mail className="w-10 h-10 text-indigo-600" />
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Ready to Scale?</h3>
              <p className="text-[15px] text-slate-500 font-medium mb-10 leading-relaxed max-w-[320px] mx-auto">
                Please reach out to our team to activate <span className="text-indigo-600 font-bold">{selectedPlan?.name}</span> and discuss your requirements.
              </p>

              <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Primary Contact</p>
                  <a href="mailto:contact@leadforgrow.com" className="text-xl font-black text-indigo-600 hover:underline">
                    contact@leadforgrow.com
                  </a>
                </div>

                <div className="flex flex-col gap-3">
                   <a 
                    href={`mailto:contact@leadforgrow.com?subject=Inquiry for ${selectedPlan?.name} Plan&body=Hi LeadForGrow Team,%0A%0AI'm interested in the ${selectedPlan?.name} plan. My business needs are: %0A%0A [Tell us your need here]`}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    Send Email Now <ArrowRight className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full py-4 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Back to Plans
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}