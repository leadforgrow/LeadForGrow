'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { LANDING } from './landingStyles';
import LandingSectionBg from './LandingSectionBg';

const FAQS = [
  {
    q: 'Does LeadForGrow support WhatsApp Business API?',
    a: 'Yes. We integrate with the official Meta WhatsApp Business API. Connect your number, use approved templates, and manage team conversations from one inbox.',
  },
  {
    q: 'How does onboarding work?',
    a: 'Most teams go live in under 15 minutes. Connect WhatsApp, import leads, set routing rules, and launch your first automation — with free onboarding on Growth and above.',
  },
  {
    q: 'Can I migrate from my existing CRM?',
    a: 'Yes. Import leads via CSV, connect your lead sources, and our team helps map your pipeline stages during onboarding.',
  },
  {
    q: 'What integrations are supported?',
    a: 'Meta Lead Ads, website forms, webhooks, Google Sheets, and custom API integrations on Pro and Agency plans.',
  },
  {
    q: 'How does AI automation work?',
    a: 'AI drafts WhatsApp replies, triggers follow-up sequences, and scores lead intent — always with human approval before sending on sensitive flows.',
  },
  {
    q: 'Is my data secure and private?',
    a: 'All data is encrypted in transit and at rest. We follow enterprise security practices with tenant isolation and role-based access control.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <LandingSectionBg variant="slate" sectionClass={LANDING.section}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-8">
          <p className={LANDING.overline}>FAQ</p>
          <h2 className={`${LANDING.heading} mt-2`}>Questions before you start</h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className={`${LANDING.card} overflow-hidden`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <p className="text-center mt-6 text-sm text-slate-500">
          Still have questions?{' '}
          <Link href="/contact" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Book a demo
          </Link>
        </p>
      </div>
    </LandingSectionBg>
  );
}
