'use client';

import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight,
  Briefcase,
  Building2,
  Mail,
  X,
  Zap,
  Users,
  Sparkles,
  Clock,
  Shield
} from 'lucide-react';
import UserNavbar from '@/app/user/Header';
import Footer from '@/app/components/Footer';

export default function PricingPage() {
  const [planType, setPlanType] = useState('business');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const businessPlans = [
    {
      name: "Free Trial",
      description: "Feel the lost revenue pressure. See what follow-ups can do.",
      price: "0",
      period: "/ 7 days",
      cta: "Start Free Trial",
      tagline: "Try Before You Buy",
      badge: "🆓 No Credit Card",
      limits: "Up to 50 leads • 1 user",
      features: [
        "Lead capture forms",
        "Lead dashboard",
        "Tasks & follow-ups",
        "SLA tracking (view only)",
        "Basic reports",
        "Email automation (welcome only)"
      ],
      excluded: [
        "No WhatsApp automation",
        "No team features"
      ]
    },
    {
      name: "Starter",
      description: "Cheap enough to start. Powerful enough to lock you in.",
      price: "999",
      period: "/ month",
      cta: "Get Started",
      tagline: "For Solo Founders",
      badge: "🌱 Perfect Entry",
      limits: "Up to 500 leads/month • 1 user",
      features: [
        "Lead capture forms",
        "Lead management dashboard",
        "Tasks & reminders",
        "SLA tracking",
        "Email automation (welcome + follow-up)",
        "Manual WhatsApp & call logs",
        "Basic reports"
      ]
    },
    {
      name: "Growth",
      description: "Cheaper than hiring 1 sales guy. This is your money plan.",
      price: "2,999",
      period: "/ month",
      cta: "Start Growing",
      featured: true,
      tag: "Most Popular",
      tagline: "For Small Teams",
      badge: "🚀 Best Value",
      limits: "Up to 2,000 leads/month • 3 users",
      features: [
        "Everything in Starter, plus:",
        "WhatsApp automation (API-based)",
        "Advanced automation rules",
        "Auto follow-ups",
        "Lead ownership & assignment",
        "SLA breach alerts",
        "Revenue at risk dashboard",
        "Source-wise conversion tracking",
        "Email + WhatsApp templates",
        "Team performance view"
      ]
    },
    {
      name: "Pro",
      description: "For agencies, sales teams, and high-intent businesses.",
      price: "5,999",
      period: "/ month",
      cta: "Go Pro",
      tagline: "For Sales Teams",
      badge: "🧠 Power Users",
      limits: "Up to 6,000 leads/month • 8 users",
      features: [
        "Everything in Growth, plus:",
        "Round-robin lead assignment",
        "Multi-pipeline / service tracking",
        "Advanced reports & exports",
        "Call recovery workflows",
        "Custom automation rules",
        "Integrations (webhooks, API)",
        "Priority support"
      ],
      note: "WhatsApp API cost: pass-through"
    }
  ];

  const agencyPlans = [
    {
      name: "Agency Starter",
      tagline: "Small Agencies Starting Right",
      price: "4,999",
      period: "/ month",
      cta: "Start Agency Plan",
      badge: "🌱 Replaces Chaos",
      description: "Replaces Google Sheets + WhatsApp chaos with real operations.",
      limits: "5 clients • 3,000 leads/month • 5 seats",
      features: [
        "Client-wise dashboards",
        "Lead capture & ingestion",
        "Task & follow-up enforcement",
        "SLA tracking",
        "Email automation",
        "Manual WhatsApp logging",
        "Basic reports"
      ]
    },
    {
      name: "Agency Growth",
      tagline: "Managing Real Outcomes",
      price: "8,999",
      period: "/ month",
      cta: "Scale Your Agency",
      featured: true,
      tag: "Most Popular",
      badge: "🚀 Best ROI",
      description: "Feels worth it, not enterprise shock. This is the sweet spot.",
      limits: "15 clients • 10,000 leads/month • 12 seats",
      features: [
        "Everything in Starter, plus:",
        "WhatsApp automation (API)",
        "Advanced automation rules",
        "SLA breach alerts",
        "Client health monitoring",
        "Revenue & conversion tracking",
        "Performance analytics",
        "Invoicing & collections tracking",
        "Advanced reports & exports"
      ]
    },
    {
      name: "Agency Pro",
      tagline: "Growing & Mid-Size Agencies",
      price: "14,999",
      period: "/ month",
      cta: "Power Your Agency",
      badge: "🧠 Full Control",
      description: "White-label ready with advanced intelligence & priority support.",
      limits: "30 clients • 25,000 leads/month • 25 seats",
      features: [
        "Everything in Growth, plus:",
        "White-label client access",
        "Advanced intelligence dashboards",
        "Custom automation rules",
        "API & webhook access",
        "Priority SLA logic",
        "Audit logs",
        "Priority support"
      ]
    }
  ];

  const activePlans = planType === 'business' ? businessPlans : agencyPlans;

  const addOns = planType === 'business' ? [
    { label: "Extra 1,000 leads", price: "₹500" },
    { label: "Extra user", price: "₹299/user" },
    { label: "White-label (agencies)", price: "₹3,999/month" },
    { label: "Custom domain forms", price: "₹499/month" }
  ] : [
    { label: "Extra client", price: "₹399/client" },
    { label: "Extra 5,000 leads", price: "₹1,000" },
    { label: "Extra team seat", price: "₹249/seat" },
    { label: "White-label branding", price: "Included in Pro" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white text-slate-600 antialiased selection:bg-indigo-100 selection:text-indigo-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <UserNavbar />

      <main className="max-w-[1400px] mx-auto px-6 pt-40 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" />
            India-First Pricing
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.1]">
            Pricing that makes<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">sense for India</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Founder-practical pricing. No enterprise shock. Cancel anytime.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex p-1.5 bg-white rounded-2xl border-2 border-slate-100 shadow-lg">
            <button 
              onClick={() => setPlanType('business')}
              className={`flex items-center gap-3 px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                planType === 'business' 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-200' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Briefcase className="w-5 h-5" /> Businesses
            </button>
            <button 
              onClick={() => setPlanType('agency')}
              className={`flex items-center gap-3 px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                planType === 'agency' 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-200' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Building2 className="w-5 h-5" /> Agencies
            </button>
          </div>
        </div>

        {/* Annual Discount Banner */}
        <div className="max-w-3xl mx-auto mb-12 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
          <p className="text-emerald-900 font-bold text-lg">
            <Clock className="w-5 h-5 inline mr-2" />
            Annual billing: Get <span className="text-2xl font-black">2 months FREE</span>
          </p>
        </div>

        {/* Pricing Grid */}
        <div className={`grid gap-8 mb-20 ${
          activePlans.length === 4 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {activePlans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col rounded-3xl p-8 transition-all duration-500 ${
                plan.featured 
                  ? 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 ring-2 ring-indigo-300 shadow-2xl shadow-indigo-200/50 scale-[1.05] z-10' 
                  : 'bg-white border-2 border-slate-100 hover:border-slate-200 hover:shadow-xl'
              }`}
            >
              {/* Tag */}
              {plan.tag && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {plan.tag}
                </div>
              )}

              {/* Badge */}
              <div className="mb-4">
                <span className="inline-block text-2xl">{plan.badge}</span>
              </div>

              {/* Header */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                  {plan.tagline}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{plan.name}</h3>
                
                {/* Price */}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-lg font-black text-slate-400">₹</span>
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">
                    {plan.price}
                  </span>
                  <span className="text-slate-500 font-bold text-sm ml-1">{plan.period}</span>
                </div>

                {/* Limits */}
                <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg inline-block mb-4">
                  {plan.limits}
                </p>

                {/* Description */}
                <p className="text-sm leading-relaxed text-slate-600 font-medium border-l-4 border-indigo-200 pl-4 italic">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      feature.includes('Everything in') 
                        ? 'text-purple-500' 
                        : 'text-emerald-500'
                    } stroke-[2.5px]`} />
                    <span className={`text-sm leading-snug ${
                      feature.includes('Everything in') 
                        ? 'font-bold text-slate-700' 
                        : 'text-slate-600'
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
                
                {/* Excluded features */}
                {plan.excluded && plan.excluded.map((item, i) => (
                  <div key={`ex-${i}`} className="flex items-start gap-3 opacity-50">
                    <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-slate-400 stroke-[2.5px]" />
                    <span className="text-sm leading-snug text-slate-500 line-through">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Note */}
              {plan.note && (
                <p className="text-xs text-slate-500 italic mb-4 bg-slate-50 px-3 py-2 rounded-lg">
                  {plan.note}
                </p>
              )}

              {/* CTA */}
              <button 
                onClick={() => {
                  setSelectedPlan(plan);
                  setShowModal(true);
                }}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 group ${
                  plan.featured
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-300 hover:shadow-xl hover:shadow-indigo-400'
                    : 'bg-slate-900 text-white hover:bg-black shadow-md hover:shadow-xl'
                } active:scale-95`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Add-Ons Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-10">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-amber-500" />
              <h3 className="text-2xl font-black text-slate-900">Add-Ons</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addOns.map((addon, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 px-6 py-4 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 text-sm">{addon.label}</span>
                  <span className="font-black text-indigo-600 text-sm">{addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DFY Section (Business Only) */}
        {planType === 'business' && (
          <div className="max-w-5xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight">Done-For-You</h3>
                    <p className="text-indigo-300 text-sm font-bold">Website + System + Results</p>
                  </div>
                </div>

                <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-3xl">
                  For founders who want <span className="font-black text-white">zero effort, full execution</span>. We build your website, set up your automation, and get you results.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-2">Setup Fee</p>
                    <p className="text-3xl font-black text-white">₹25,000 – ₹75,000</p>
                    <p className="text-sm text-slate-400 mt-2">One-time investment</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-2">Monthly</p>
                    <p className="text-3xl font-black text-white">₹3,999<span className="text-lg text-slate-400">/month</span></p>
                    <p className="text-sm text-slate-400 mt-2">Ongoing support</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {[
                    "Business website (conversion-optimized)",
                    "Lead capture forms setup",
                    "WhatsApp + Email automation",
                    "Follow-up strategy design",
                    "SLA rules & recovery logic",
                    "Team setup & training",
                    "Custom templates",
                    "Dashboard customization",
                    "Monthly performance review",
                    "Priority WhatsApp support"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5 stroke-[2.5px]" />
                      <span className="text-sm text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSelectedPlan({ name: 'Done-For-You Package' });
                    setShowModal(true);
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-600/50 flex items-center gap-3 group active:scale-95"
                >
                  Get DFY Package
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enterprise / Custom */}
        <div className="text-center pt-16 border-t-2 border-slate-100">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Shield className="w-4 h-4" />
            {planType === 'business' ? 'Enterprise Needs?' : 'Large Agency?'}
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-4">
            {planType === 'business' ? 'Custom Enterprise' : 'Agency Custom'}
          </h3>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {planType === 'business' 
              ? 'Need dedicated infrastructure, custom SLAs, or security requirements? Let\'s talk.' 
              : 'Managing 30+ clients? Need custom limits and dedicated support? We\'ve got you.'}
          </p>
          <button 
            onClick={() => {
              setSelectedPlan({ 
                name: planType === 'business' ? 'Custom Enterprise' : 'Agency Custom (₹25,000+/month)' 
              });
              setShowModal(true);
            }}
            className="inline-flex items-center gap-3 bg-slate-900 text-white hover:bg-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all group active:scale-95"
          >
            Talk to Specialist
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      <Footer />

      {/* Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center relative">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                <Mail className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Ready to Scale?</h3>
              <p className="text-sm text-slate-600 font-medium mb-8 leading-relaxed max-w-sm mx-auto">
                Reach out to activate <span className="text-indigo-600 font-black">{selectedPlan?.name}</span> and discuss your requirements.
              </p>

              <div className="bg-gradient-to-br from-slate-50 to-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Primary Contact</p>
                <a href="mailto:contact@leadforgrow.com" className="text-xl font-black text-indigo-600 hover:text-indigo-700 transition-colors">
                  contact@leadforgrow.com
                </a>
              </div>

              <div className="space-y-3">
                <a 
                  href={`mailto:contact@leadforgrow.com?subject=Inquiry for ${selectedPlan?.name}&body=Hi LeadForGrow Team,%0A%0AI'm interested in the ${selectedPlan?.name}. Here are my requirements:%0A%0A[Tell us your needs here]`}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-300 hover:shadow-xl transition-all flex items-center justify-center gap-3 group active:scale-95"
                >
                  Send Email Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Back to Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}