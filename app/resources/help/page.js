'use client';

import React from 'react';
import MarketingLayout from '@/app/components/MarketingLayout';
import { Search, Book, Shield, Zap, Wrench, ChevronRight } from 'lucide-react';

export default function HelpCenter() {
  const categories = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Getting Started",
      count: 12,
      articles: ["Setting up your first funnel", "Connecting custom domains", "Understanding the dashboard"]
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Builder & Forms",
      count: 24,
      articles: ["Using the drag-and-drop editor", "Customizing lead capture widgets", "Form validation rules"]
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: "Automation Rules",
      count: 18,
      articles: ["Setting up round-robin assignment", "Configuring email notifications", "Webhook integrations"]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Account & Security",
      count: 8,
      articles: ["Managing team permissions", "Updating billing information", "Two-factor authentication"]
    }
  ];

  return (
    <MarketingLayout 
      title="How can we help?" 
      subtitle="Search our comprehensive guides and tutorials to master the LeadForGrow platform."
    >
      <div className="max-w-3xl mx-auto mb-20">
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search className="w-6 h-6" />
          </div>
          <input 
            type="text" 
            placeholder="Search for articles (e.g. 'how to connect domain')"
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] py-6 pl-16 pr-8 text-lg text-slate-900 dark:text-white outline-none focus:border-indigo-600 dark:focus:border-indigo-600 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900/50 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 hover:border-indigo-600 transition-colors group">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{cat.count} Articles</span>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 underline decoration-transparent group-hover:decoration-indigo-600 transition-all">{cat.title}</h3>
            
            <div className="space-y-4 mb-8">
              {cat.articles.map((article, aIdx) => (
                <a key={aIdx} href="#" className="flex items-center justify-between text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group/link">
                  <span className="text-lg">{article}</span>
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover/link:opacity-100 transition-all transform translate-x-0 group-hover/link:translate-x-1" />
                </a>
              ))}
            </div>
            
            <button className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2 group/btn">
              Explore All <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] p-12 text-center border border-slate-100 dark:border-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Still need help?</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
          Our support team is available 24/7. Reach out via chat or email and we'll get you sorted.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/contact" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold shadow-xl shadow-slate-900/10 active:scale-95 transition">
            Contact Support
          </a>
          <button className="bg-white dark:bg-transparent text-slate-900 dark:text-white px-8 py-4 rounded-xl font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition active:scale-95">
            Live Chat
          </button>
        </div>
      </div>
    </MarketingLayout>
  );
}
