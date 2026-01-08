'use client';

import React from 'react';
import MarketingLayout from '@/app/components/MarketingLayout';

export default function TermsOfService() {
  const terms = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using LeadForGrow, you agree to be bound by these Terms of Service. If you do not agree, you may not use our platform or services."
    },
    {
      title: "2. Account Registration",
      content: "You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and any activities that occur under your credentials."
    },
    {
      title: "3. Usage Limits & Subscription",
      content: "Certain features of the service are subject to usage limits based on your subscription plan (e.g., number of leads, websites, or automation rules). We reserve the right to upgrade or modify plans with prior notice."
    },
    {
      title: "4. Prohibited Conduct",
      content: "You may not use LeadForGrow for any illegal activities, spamming, or violating the rights of others. We reserve the right to terminate accounts that violate these terms."
    },
    {
      title: "5. Limitation of Liability",
      content: "LeadForGrow is provided 'as is' without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service."
    }
  ];

  return (
    <MarketingLayout 
      title="Terms of Service" 
      subtitle="Please read these terms carefully before using the LeadForGrow platform."
      maxWidth="4xl"
    >
      <div className="bg-white dark:bg-slate-900/40 rounded-3xl p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-slate-500 dark:text-slate-400 mb-12 italic">Last Updated: January 8, 2026</p>
          
          {terms.map((term, idx) => (
            <div key={idx} className="mb-12 last:mb-0">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{term.title}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                {term.content}
              </p>
            </div>
          ))}
          
          <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Need clarification on our terms?</p>
            <a href="mailto:legal@leadforgrow.online" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              legal@leadforgrow.online
            </a>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
