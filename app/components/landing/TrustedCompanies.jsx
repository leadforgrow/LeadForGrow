'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LandingSectionBg from './LandingSectionBg';

const COMPANIES = [
  { name: 'Homies4u', logo: '/homie4u.png', type: 'image' },
  { name: 'ScaleDesk Technology', logo: '/scaledesk_technology_logo.jpg', type: 'image' },
  { name: 'PMKR', type: 'text', style: 'font-extrabold tracking-[0.15em]' },
  { name: 'CXO', type: 'text', style: 'font-black tracking-tighter', accent: 'O' },
  { name: 'CollegeBazzar', type: 'text', style: 'font-bold tracking-tight' },
];

const VISIBLE_COUNT = 4;

function LogoItem({ company }) {
  if (company.type === 'image') {
    return (
      <img
        src={company.logo}
        alt={company.name}
        className="h-7 md:h-8 w-auto max-w-[140px] object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 mx-auto"
      />
    );
  }
  if (company.accent) {
    return (
      <span className={`text-xl md:text-2xl text-slate-600 dark:text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ${company.style}`}>
        CX<span className="text-blue-600">{company.accent}</span>
      </span>
    );
  }
  return (
    <span className={`text-base md:text-lg text-slate-600 dark:text-slate-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 ${company.style}`}>
      {company.name}
    </span>
  );
}

export default function TrustedCompanies() {
  const [start, setStart] = useState(0);

  const visible = Array.from({ length: VISIBLE_COUNT }, (_, i) => {
    return COMPANIES[(start + i) % COMPANIES.length];
  });

  const goPrev = () => {
    setStart((s) => (s - 1 + COMPANIES.length) % COMPANIES.length);
  };

  const goNext = () => {
    setStart((s) => (s + 1) % COMPANIES.length);
  };

  return (
    <LandingSectionBg
      variant="aurora"
      sectionClass="landing-section-tight border-y border-slate-200/70 dark:border-slate-800/70"
    >
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-6">
          Trusted by modern teams across India
        </p>

        <div className="flex items-center justify-center gap-4 md:gap-6">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous brands"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10 flex-1 max-w-3xl">
            {visible.map((company, i) => (
              <div key={`${company.name}-${start}-${i}`} className="flex items-center justify-center min-h-[40px]">
                <LogoItem company={company} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next brands"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </LandingSectionBg>
  );
}
