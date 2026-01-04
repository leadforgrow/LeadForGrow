import React, { useState } from 'react';
import { Check } from 'lucide-react';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      price: '₹5,000',
      users: '1 agency admin • up to 2 clients',
      features: [
        'No-code page builder',
        'Up to 5 pages',
        'Lead capture forms',
        'Basic analytics',
        'Platform subdomain',
        'Email support'
      ],
      popular: false
    },
    {
      name: 'Agency',
      price: '₹8,000',
      users: 'Up to 5 team users • 10 clients',
      features: [
        'Unlimited pages',
        'Client accounts',
        'Client-wise leads & analytics',
        'Custom domains',
        'Role & permission control',
        'URL shortener & tracking',
        'Email & live chat support'
      ],
      popular: true
    },
    {
      name: 'Pro Agency',
      price: '₹15,000',
      users: 'Up to 10 team users • 25 clients',
      features: [
        'Everything in Agency',
        'White-label branding',
        'Advanced analytics & reports',
        'Workflow automation (basic)',
        'Multiple custom domains',
        'Priority support'
      ],
      popular: false
    },
    {
      name: 'Enterprise',
      price: '₹22,000',
      users: 'Unlimited users • Unlimited clients',
      features: [
        'Full white-label solution',
        'Advanced workflows & automation',
        'Custom integrations',
        'Dedicated account manager',
        'SLA & onboarding support',
        'API access'
      ],
      popular: false
    }
  ];


  return (
    <div id="pricing" className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500 py-24 px-8 relative overflow-hidden border-t dark:border-slate-800">
      {/* Decorative circles */}
      <div className="absolute top-32 left-16 w-4 h-4 bg-teal-400 rounded-full opacity-30"></div>
      <div className="absolute top-64 right-32 w-4 h-4 bg-indigo-500 rounded-full opacity-30"></div>
      <div className="absolute bottom-32 right-16 w-6 h-6 bg-pink-500 rounded-full opacity-30"></div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 transition-colors">OUR PRICING</p>
          <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 dark:text-white mb-10 leading-tight transition-colors">
            No hidden charge,<br /> Choose your plan.
          </h2>

          {/* Toggle */}
          <div className="inline-flex bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-1.5 border border-slate-100 dark:border-slate-800 transition-colors">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-10 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 ${billingCycle === 'monthly'
                ? 'bg-indigo-600 text-white shadow-xl'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-10 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 ${billingCycle === 'yearly'
                ? 'bg-indigo-600 text-white shadow-xl'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem] p-10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden ${plan.popular
                ? 'border-2 border-indigo-600 dark:border-indigo-500 relative'
                : 'border border-slate-100 dark:border-slate-800'
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">Popular</div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 group-hover:text-indigo-600 transition-colors">{plan.name}</h3>

                <div className="space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-10">
                  <div className="text-4xl font-black text-slate-900 dark:text-white mb-2 transition-colors">{plan.price} <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/mo</span></div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.users}</p>
                </div>

                <button
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all duration-300 active:scale-95 ${plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  Sign up now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
