import { Check, Info, X, CreditCard, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const plans = [
    {
      name: 'DFY — Done For You',
      tagline: 'one-time + managed',
      setupFee: '₹20,000 (Setup)',
      priceMonthly: '₹4,999',
      priceYearly: '₹54,999',
      features: [
        'Custom DFU website built & published',
        'Product/photo upload + copywriting',
        'Domain connection + SSL set up',
        'WhatsApp / Call / Form integration',
        'Lead capture & Leads table',
        'Daily notifications (WhatsApp/Email)',
        '2 small changes/mo + maintenance',
        'Priority support'
      ],
      why: 'Setup sits between common single-site build costs and agency quotes in India; monthly covers hosting, SSL, support, and the “we-manage-it” promise (ongoing DFU labor & SLAs). Maintenance cost: ₹5k.',
      popular: true
    },
    {
      name: 'Starter',
      tagline: 'for solo founders',
      priceMonthly: '₹2,999',
      priceYearly: '₹29,990',
      features: [
        '1 website (template) + hosting',
        'Unlimited leads capture',
        'Basic notifications (email)',
        'Form & WhatsApp notifications',
        'Basic analytics (visitors/submissions)',
        '1 user account',
        'Domain connect included',
        'Email support (48-72 hr)'
      ],
      why: 'Positioned below common maintenance pricing (~₹2.5k–₹7k) to get fast conversions among small Indian businesses who currently spend on maintenance.',
      popular: false
    },
    {
      name: 'Growth',
      tagline: 'for growing SMBs',
      priceMonthly: '₹7,999',
      priceYearly: '₹79,990',
      features: [
        'Up to 3 websites / landing funnels',
        'Full lead dashboard & form builder',
        'Automated notifications (WA + Email)',
        'Basic automation (assign, tag)',
        'Analytics (page conversion)',
        'CSV export',
        '3 team seats',
        'Monthly health check'
      ],
      why: 'Matches what Indian SMBs expect to pay for real value—a replacement for paying separate maintenance + a simple CRM.',
      popular: false
    },
    {
      name: 'Pro',
      tagline: 'for agencies & teams',
      priceMonthly: '₹14,999',
      priceYearly: '₹149,990',
      features: [
        'Up to 10 sites / client accounts',
        'Multi-client view (Clients tab)',
        'Advanced reporting & lead lifecycle',
        'Advanced automations & hooks',
        'White-label options (Emails)',
        'API access (basic)',
        '10 team seats',
        'Priority live support & onboarding'
      ],
      why: 'Targets agencies with higher ARPU—pricing reflects replacement of multiple tools (builder + CRM + notifications) and matches mid-market agency budgets.',
      popular: false
    }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirmPay = () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Store the plan name in localStorage
      localStorage.setItem('userPlan', selectedPlan.name);

      toast.success(`${selectedPlan.name} plan saved successfully!`);

      // Reset after 3 seconds
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
      }, 3000);
    }, 2000);
  };

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
          <div className="max-w-2xl mx-auto mb-16 text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic border-x border-indigo-600/20 px-8">
            LeadForGrow is an investment in revenue persistence. Most teams recover the annual cost of the system within the first 3 missed leads they successfully capture. Choose the tier that matches your current growth volume.
          </div>

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
              className={`bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative group ${plan.popular
                ? 'border-2 border-indigo-600 dark:border-indigo-500'
                : 'border border-slate-100 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500'
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest z-10">Popular</div>
              )}

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{plan.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.tagline}</p>
                  </div>

                  {/* Info Tooltip */}
                  <div className="relative group/info">
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-indigo-600">
                      <Info className="w-4 h-4" />
                    </button>
                    {/* Tooltip Content */}
                    <div className="absolute right-0 bottom-full mb-3 w-64 p-4 bg-slate-900 dark:bg-indigo-950 text-white rounded-2xl shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 translate-y-2 group-hover/info:translate-y-0 z-50 pointer-events-none">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Why this price?</p>
                      <p className="text-[11px] leading-relaxed text-slate-200 italic font-medium">"{plan.why}"</p>
                      <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-slate-900 dark:bg-indigo-950 rotate-45"></div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  {plan.setupFee && (
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-tighter mb-1">{plan.setupFee}</div>
                  )}
                  <div className="text-3xl font-black text-slate-900 dark:text-white transition-colors">
                    {billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {billingCycle === 'monthly' ? '/mo' : '/yr'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                        <Check className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-normal">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-[10px] tracking-widest uppercase transition-all duration-300 active:scale-95 mt-auto ${plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-200 dark:group-hover:shadow-none'
                    }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Transition Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Order Summary</h3>
                  <p className="text-2xl font-serif text-slate-900 dark:text-white leading-tight">Secure Checkout</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Selected Plan</span>
                    <span className="text-slate-900 dark:text-white font-bold">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Billing Cycle</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">
                      {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-slate-900 dark:text-white font-bold">Total Amount</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium leading-relaxed">
                    We are moving to payment... Hang tight while we prepare your secure connection.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  className={`w-full py-5 px-8 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isSuccess
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
                    }`}
                  onClick={handleConfirmPay}
                  disabled={isProcessing || isSuccess}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Plan Activated
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                  Secure encrypted transactions powered by LFG.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
