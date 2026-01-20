'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function AccessControl({ children }) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userPlan, setUserPlan] = useState('');

  useEffect(() => {
    const plan = localStorage.getItem('userPlan');
    setUserPlan(plan || '');
    
    // Check if user has Growth plan or higher, or any Agency plan
    const allowedPlans = ['growth', 'pro', 'dfy — done for you'];
    const lowerPlan = (plan || '').toLowerCase();
    const hasStandardAccess = allowedPlans.some(p => lowerPlan.includes(p));
    const isAgency = lowerPlan.includes('agency');
    
    setHasAccess(hasStandardAccess || isAgency);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-900 font-medium">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-slate-100">
            {/* Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-200">
              <Lock className="w-12 h-12 text-white" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Automation Service
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
              Unlock powerful lead management and automation features with the Growth plan or higher.
            </p>

            {/* Current Plan */}
            {userPlan && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-2xl mb-8">
                <span className="text-sm text-slate-500 font-medium">Current Plan:</span>
                <span className="text-sm text-slate-900 font-bold">{userPlan}</span>
              </div>
            )}

            {/* Features */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8 text-left">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-900">What you'll get:</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Complete lead management dashboard',
                  'Automated follow-up reminders',
                  'Team collaboration & assignment',
                  'WhatsApp & Email automation',
                  'Business insights & reports',
                  'Never miss a lead again'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/user/home#pricing')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
              >
                Upgrade to Growth Plan
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/user/home')}
                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg border-2 border-slate-200 hover:border-indigo-600 hover:bg-slate-50 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
