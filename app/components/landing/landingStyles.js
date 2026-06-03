/** Shared landing page design tokens & content */

/** Single page background — light airy blue-white across all sections */
export const LANDING_PAGE_BG = 'bg-[#f4f8ff] dark:bg-[#070a12]';
export const LANDING_PAGE_BG_HEX = '#f4f8ff';
export const LANDING_PAGE_BG_DARK_HEX = '#070a12';

export const LANDING = {
  section: 'landing-section',
  container: 'max-w-7xl mx-auto px-6',
  overline: 'text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400',
  heading: 'text-2xl sm:text-3xl lg:text-[2.125rem] font-bold tracking-[-0.02em] text-slate-900 dark:text-white',
  subheading: 'text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed',
  card: 'rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
  cardHover: 'transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:border-slate-300/90 dark:hover:border-slate-700',
};

/** @deprecated Import from @/app/components/pricing/pricingData */
export { PRICING_PLANS, TRUST_BADGES as PRICING_TRUST } from '@/app/components/pricing/pricingData';
