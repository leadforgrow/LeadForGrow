'use client';

import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { useState } from 'react';
import LandingNavbar from '@/app/components/landing/LandingNavbar';
import { FEATURE_CATEGORIES, featureArticles } from './featureData';

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All'
      ? featureArticles
      : featureArticles.filter((article) => article.category === activeCategory);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <LandingNavbar />

      <section className="relative overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-gradient-to-b from-[#EEF8ED] via-[#FAFDFA] to-white" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Learn</p>
          <h1
            className="mt-3 text-[2rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-[#111827] sm:text-[2.5rem]"
            style={{ fontFamily: 'var(--font-plus-jakarta)' }}
          >
            Platform & Automation Guides
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#64748B]">
            Explore how LeadForGrow helps you capture leads, automate conversations, and close more
            deals—with CRM, AI, and multi-channel workflows in one platform.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {FEATURE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeCategory === category
                  ? 'bg-[#111827] text-white'
                  : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:border-emerald-200 hover:bg-[#FAFDFA] hover:text-emerald-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-all hover:border-emerald-200 hover:shadow-[0_8px_28px_rgba(5,150,105,0.08)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-[12px] text-[#94A3B8]">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readTime}
                </span>
              </div>
              <h2
                className="mt-4 text-lg font-bold tracking-tight text-[#111827] group-hover:text-emerald-800"
                style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              >
                {article.title}
              </h2>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[#64748B]">{article.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                Read guide
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
