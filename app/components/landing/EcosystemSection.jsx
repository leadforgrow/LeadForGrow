'use client';

import {
  ArrowRight,
  BookOpen,
  Code2,
  LayoutGrid,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

const PRODUCTS = [
  {
    id: 'crm',
    name: 'LeadForGrow CRM',
    description: 'AI-powered CRM for lead management and automation.',
    status: 'Live',
    href: 'https://crm.leadforgrow.com',
    icon: LayoutGrid,
    iconColor: 'text-emerald-600',
  },
  {
    id: 'hrm',
    name: 'LeadForGrow HRM',
    description: 'Employee management, attendance, payroll, and performance.',
    status: 'Preview',
    href: 'https://hrm.leadforgrow.com',
    icon: Users,
    iconColor: 'text-violet-600',
  },
  {
    id: 'lms',
    name: 'LeadForGrow LMS',
    description: 'Create courses and manage learning programs at scale.',
    status: 'Preview',
    href: 'https://lms.leadforgrow.com',
    icon: BookOpen,
    iconColor: 'text-blue-600',
  },
  {
    id: 'tavvr',
    name: 'LeadForGrow Tavvr',
    description: 'Restaurant OS for ordering, kitchen ops, and analytics.',
    status: 'Preview',
    href: 'https://tavvr.leadforgrow.com',
    icon: UtensilsCrossed,
    iconColor: 'text-orange-600',
  },
  {
    id: 'scaledesk',
    name: 'ScaleDesk Technology',
    description: 'Custom software, AI automation, and enterprise consulting.',
    status: 'Services',
    href: 'https://scaledesktechnology.com',
    icon: Code2,
    iconColor: 'text-slate-700',
  },
];

function ProductCard({ product }) {
  const Icon = product.icon;

  return (
    <a
      href={product.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full min-w-[220px] flex-col rounded-[18px] border border-[#ECECEC] bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_4px_12px_rgba(15,23,42,0.02)] transition-all duration-[250ms] ease-out hover:-translate-y-1 hover:border-[#D4D4D4] hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_8px_20px_rgba(15,23,42,0.05)] lg:min-w-0"
    >
      <Icon className={`h-[22px] w-[22px] shrink-0 ${product.iconColor}`} strokeWidth={1.75} />

      <h3 className="mt-5 text-[18px] font-semibold leading-snug tracking-[-0.02em] text-[#111827]">
        {product.name}
      </h3>

      <p className="mt-2 flex-1 text-[14px] leading-[1.55] text-[#6B7280]">
        {product.description}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F0F0F0] pt-4">
        <span className="text-[11px] font-medium uppercase tracking-[2px] text-[#9CA3AF]">
          {product.status}
        </span>
        <ArrowRight
          className="h-3.5 w-3.5 text-[#9CA3AF] transition-transform duration-[250ms] ease-out group-hover:translate-x-1 group-hover:text-[#6B7280]"
          strokeWidth={2}
        />
      </div>
    </a>
  );
}

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="max-h-[420px] overflow-hidden bg-white py-10 sm:py-11">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
            Our Ecosystem
          </p>
          <h2
            className="mt-2 text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.03em] text-[#111827] sm:text-[1.75rem]"
            style={{ fontFamily: 'var(--font-plus-jakarta)' }}
          >
            Explore the LeadForGrow Ecosystem.
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#6B7280]">
            One intelligent platform powering CRM, HR, learning, restaurants, and custom software.
          </p>
        </div>

        <div className="mt-8 hidden grid-cols-5 gap-5 lg:grid">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="-mx-6 mt-8 flex gap-4 overflow-x-auto px-6 pb-1 lg:hidden">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="w-[min(240px,78vw)] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
