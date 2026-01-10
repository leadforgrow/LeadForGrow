'use client';
import { X } from 'lucide-react';
import { useState } from 'react';

export default function TrustPopup({ isOpen, onClose, userName, onScheduleCall }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleScheduleCall = async () => {
    setIsLoading(true);
    await onScheduleCall();
    setIsLoading(false);
  };

  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Content */}
        <div className="p-12">
          {/* Personalized greeting */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-white mb-4 leading-tight">
              👋 Hi {firstName}, before anything — let's talk.
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              We don't believe in taking payments before understanding your business.
              First, we'll quickly understand how your leads come in,
              then show you exactly how LeadForGrow fits your flow — step by step.
            </p>
          </div>

          {/* Trust bullets */}
          <div className="space-y-4 mb-10">
            {[
              'No payment required to talk',
              '5-minute live walkthrough with a real human',
              'We help you with setup — you\'re not alone'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300">{item}</p>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <button
            onClick={handleScheduleCall}
            disabled={isLoading}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xl font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? 'Scheduling...' : 'Join a 5-Minute Setup Call'}
          </button>

          {/* Secondary reassurance */}
          <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Takes less time than checking your email.
          </p>
        </div>

        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>
    </div>
  );
}
