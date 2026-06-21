'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LANDING } from './landingStyles';
import { LANDING_IMAGES } from './hubspotLandingImages';

const TABS = [
  {
    id: 'enterprise',
    label: 'Enterprise',
    stat1: { value: '12', label: 'months to scale pipeline from thousands to millions' },
    stat2: { value: '5', label: 'point increase in customer satisfaction scores' },
    image: LANDING_IMAGES.caseStudy,
  },
  {
    id: 'mid',
    label: 'Mid-Sized Business',
    stat1: { value: '3×', label: 'more follow-ups sent with automation enabled' },
    stat2: { value: '38s', label: 'average lead response time across channels' },
    image: LANDING_IMAGES.officeTeam,
  },
  {
    id: 'small',
    label: 'Small Business',
    stat1: { value: '15', label: 'minutes to go live with WhatsApp + Meta leads' },
    stat2: { value: '2M+', label: 'leads processed on the platform' },
    image: LANDING_IMAGES.product,
  },
];

export default function CaseStudiesSection() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <section className={`${LANDING.section} bg-white`}>
      <div className={LANDING.containerWide}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-10">
          <div className="lg:col-span-7">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#516f90] border border-[#CBD6E2] px-2 py-1 mb-4">
              Case Studies
            </span>
            <h2 className={LANDING.heading}>
              Remarkable results for every size business
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pt-8">
            <p className={LANDING.body}>
              Scale your business with LeadForGrow. The proof is in our customers&apos; success.
            </p>
            <Link
              href="/resources/case-studies"
              className="mt-5 inline-flex items-center justify-center rounded-[3px] border border-[#33475B] px-5 py-2.5 text-sm font-semibold text-[#33475B] hover:bg-[#F5F8FA] transition-colors"
            >
              See all case studies
            </Link>
          </div>
        </div>

        <div className="flex gap-6 border-b border-[#CBD6E2] mb-10 overflow-x-auto">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 pb-3 text-sm font-semibold transition-colors border-b-[3px] -mb-px ${
                active === i
                  ? 'border-[#FF5C35] text-[#33475B]'
                  : 'border-transparent text-[#516f90] hover:text-[#33475B]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-[#CBD6E2] bg-white shadow-[0_4px_24px_rgba(51,71,91,0.08)] overflow-hidden"
          >
            <div className="relative aspect-[21/9] min-h-[200px]">
              <Image src={tab.image} alt={tab.label} fill className="object-cover" sizes="100vw" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#CBD6E2]">
              <div className="p-8 md:p-10 text-center sm:text-left">
                <p className="font-[family-name:var(--font-landing-serif)] text-5xl md:text-6xl font-bold text-[#33475B]">
                  {tab.stat1.value}
                </p>
                <p className="mt-2 text-sm text-[#516f90] leading-relaxed max-w-xs">{tab.stat1.label}</p>
              </div>
              <div className="p-8 md:p-10 text-center sm:text-left">
                <p className="font-[family-name:var(--font-landing-serif)] text-5xl md:text-6xl font-bold text-[#33475B]">
                  {tab.stat2.value}
                </p>
                <p className="mt-2 text-sm text-[#516f90] leading-relaxed max-w-xs">{tab.stat2.label}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="mt-10 text-center text-lg font-bold text-[#33475B]">
          Trusted by high-growth teams across India
        </p>
      </div>
    </section>
  );
}
