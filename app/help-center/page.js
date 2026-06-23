'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen, MessageCircle, Video } from 'lucide-react';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

const CATEGORIES = [
  { title: 'Getting Started', articles: ['Create your account', 'Connect WhatsApp', 'Import leads', 'Invite your team'] },
  { title: 'CRM & Pipeline', articles: ['Manage leads', 'Deal stages', 'Custom fields', 'Bulk actions'] },
  { title: 'Automation', articles: ['Build a sequence', 'Set up triggers', 'Broadcast campaigns', 'Test workflows'] },
  { title: 'Inbox & Channels', articles: ['Unified inbox', 'Email sync', 'Template messages', 'Team assignment'] },
  { title: 'Billing & Account', articles: ['Plans & pricing', 'Upgrade plan', 'Team permissions', 'Export data'] },
];

const POPULAR = ['How to connect WhatsApp Business API', 'Setting up automation for new leads', 'Importing leads from Excel'];

export default function HelpCenterPage() {
  const [query, setQuery] = useState('');

  return (
    <MarketingShell>
      <section className={`${MARKETING.section} ${MARKETING.gradientHero}`}>
        <div className={`${MARKETING.container} text-center max-w-2xl mx-auto`}>
          <p className={MARKETING.overline}>Help Center</p>
          <h1 className={`${MARKETING.h1} mt-3 mb-6`}>How can we help?</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-emerald-200 bg-white shadow-lg shadow-emerald-900/5 text-[#111827] focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>
      </section>

      <section className={MARKETING.sectionTight}>
        <div className={MARKETING.container}>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#64748B] mb-4">Popular articles</h2>
          <div className="grid sm:grid-cols-3 gap-3 mb-12">
            {POPULAR.map((a) => (
              <Link key={a} href="/documentation" className={`${MARKETING.card} ${MARKETING.cardHover} p-4 text-sm font-medium text-[#374151]`}>{a}</Link>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.title} className={`${MARKETING.card} p-6`}>
                <BookOpen className="w-5 h-5 text-emerald-600 mb-3" />
                <h3 className={MARKETING.h3}>{cat.title}</h3>
                <ul className="mt-4 space-y-2">
                  {cat.articles.map((a) => (
                    <li key={a}>
                      <Link href="/documentation" className="text-sm text-[#64748B] hover:text-emerald-700 transition-colors">{a}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-4">
            <Link href="/contact" className={`${MARKETING.card} p-6 flex items-center gap-4 hover:border-emerald-300 transition-colors`}>
              <MessageCircle className="w-8 h-8 text-emerald-600" />
              <div><p className="font-semibold">Contact support</p><p className="text-sm text-[#64748B]">Get help from our team</p></div>
            </Link>
            <Link href="/guides" className={`${MARKETING.card} p-6 flex items-center gap-4 hover:border-emerald-300 transition-colors`}>
              <Video className="w-8 h-8 text-emerald-600" />
              <div><p className="font-semibold">Video tutorials</p><p className="text-sm text-[#64748B]">Watch step-by-step guides</p></div>
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
