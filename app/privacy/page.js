'use client';

import React from 'react';
import MarketingLayout from '@/app/components/MarketingLayout';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, build a website, capture leads, or communicate with us. This may include your name, email address, business details, and billing information."
    },
    {
      title: "2. How We Use Information",
      content: "We use the information we collect to provide, maintain, and improve our services, including lead management automation, website building features, and analytics. We also use it to communicate with you about updates and support."
    },
    {
      title: "3. Content Ownership & Lead Data",
      content: "You retain all rights to the leads captured through your forms and the content of the websites you build on LeadForGrow. We process this data as a service provider on your behalf and do not sell your lead data to third parties."
    },
    {
      title: "4. Cookies and Tracking",
      content: "We use cookies and similar technologies to track activity on our service and hold certain information to improve user experience and analyze performance. You can control cookie settings in your browser."
    },
    {
      title: "5. Data Security",
      content: "We implement industry-standard security measures to protect your personal and business data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security."
    }
  ];

  return (
    <MarketingLayout 
      title="Privacy Policy" 
      subtitle="Your data security and privacy are our top priorities. Learn how we handle your information."
      maxWidth="4xl"
    >
      <div className="bg-white dark:bg-slate-900/40 rounded-3xl p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-slate-500 dark:text-slate-400 mb-12 italic">Last Updated: January 8, 2026</p>
          
          {sections.map((section, idx) => (
            <div key={idx} className="mb-12 last:mb-0">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{section.title}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                {section.content}
              </p>
            </div>
          ))}
          
          <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Questions about our privacy policy?</p>
            <a href="mailto:privacy@leadforgrow.online" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              privacy@leadforgrow.online
            </a>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
