'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Youtube, Facebook, Twitter, Linkedin } from 'lucide-react';

export default function Footer({ forceShow = false }) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const isLanding = pathname === '/';

  if (!forceShow && (pathname.startsWith('/automation') || pathname.startsWith('/s/') || pathname.includes('/chatbot-iframe'))) return null;

  const footerData = {
    product: [
      { label: 'Lead Management (CRM)', href: '/product/crm' },
      { label: 'Automation & Follow-ups', href: '/product/automation' },
      { label: 'Lead Capture Forms', href: '/product/forms' },
      { label: 'Analytics & Reporting', href: '/product/analytics' },
      { label: 'Website & Funnel Builder', href: '/product/builder' },
    ],
    company: [
      { label: 'About Us', href: '/resources/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Case Studies', href: '/resources/case-studies' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact Sales', href: '/contact' },
    ],
    resources: [
      { label: 'How It Works', href: '/resources/how-it-works' },
      { label: 'Use Cases', href: '/resources/use-cases' },
      { label: 'Help Center', href: '/resources/help' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
    agencies: [
      { label: 'Agency Platform', href: '/agencies/overview' },
      { label: 'White-Label Solution', href: '/agencies/white-label' },
      { label: 'Manage Multiple Clients', href: '/agencies/clients' },
      { label: 'Become a Partner', href: '/agencies/partner' },
    ],
  };

  return (
    <footer className="relative overflow-hidden border-t border-emerald-100/80 bg-gradient-to-b from-[#FAFDFA] via-white to-[#EEF8ED]/50">
      <div className="pointer-events-none absolute -right-[8%] top-[8%] h-[240px] w-[240px] rounded-full bg-[#D2EDD0]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-[6%] bottom-[12%] h-[200px] w-[200px] rounded-full bg-[#ECFDF5]/60 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-6 border-b border-emerald-100/80 pb-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src="/image.png" alt="LeadForGrow" className="h-8 w-9 object-contain" />
            <span className="text-xl font-bold text-[#111827]">
              Lead<span className="text-emerald-700">For</span>Grow
            </span>
          </div>

          <div className="flex items-center gap-4">
            {[
              { icon: Youtube, href: 'https://www.youtube.com/@ScaleDeskTechnologies', label: 'YouTube' },
              { icon: Facebook, href: 'https://www.facebook.com/leadforgrow', label: 'Facebook' },
              { icon: Twitter, href: 'https://x.com/leadforgrow', label: 'X' },
              { icon: Linkedin, href: 'https://www.linkedin.com/showcase/leadforgrow', label: 'LinkedIn' },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] transition-colors hover:border-emerald-200 hover:bg-[#ECFDF5] hover:text-emerald-800"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <a
            href="/user/register"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            Start free trial
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-10 md:grid-cols-4 lg:gap-12">
          {Object.entries(footerData).map(([title, items]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-bold capitalize text-[#111827]">
                {title === 'agencies' ? 'For Agencies' : title}
              </h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-[#64748B] transition-colors hover:text-emerald-700"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-emerald-100/80 pt-6 sm:flex-row">
          <p className="text-sm text-[#64748B]">© {currentYear} LeadForGrow. All rights reserved.</p>
          <p className="text-sm text-[#94A3B8]">
            {isLanding ? 'Built for modern sales teams.' : 'Built for businesses, agencies, and global teams.'}
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-[#94A3B8]">
          Powered by{' '}
          <a
            href="https://scaledesktechnology.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#64748B] transition-colors hover:text-emerald-700"
          >
            scaledesktechnology.com
          </a>
        </p>
      </div>
    </footer>
  );
}
