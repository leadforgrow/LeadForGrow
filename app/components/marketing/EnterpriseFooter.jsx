'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { FOOTER_SECTIONS, FOOTER_SOCIAL, FOOTER_LEGAL } from '@/lib/marketing/footerLinks';
import { MARKETING } from '@/lib/marketing/designTokens';

const HIDE_PREFIXES = ['/automation', '/agency', '/s/', '/chatbot-iframe', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/magic-link', '/invite', '/two-factor', '/session-expired', '/account-locked', '/user/login', '/user/register'];

export default function EnterpriseFooter({ forceShow = false }) {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (!forceShow && HIDE_PREFIXES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <footer className="relative overflow-hidden border-t border-emerald-100/60 bg-gradient-to-b from-[#FAFDFA] via-white to-[#EEF8ED]/40">
      <div className="pointer-events-none absolute -right-[10%] top-[5%] h-[320px] w-[320px] rounded-full bg-emerald-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-[8%] bottom-[10%] h-[280px] w-[280px] rounded-full bg-[#D2EDD0]/30 blur-3xl" />

      <div className={`relative ${MARKETING.containerWide} py-14 lg:py-20`}>
        {/* Top band */}
        <div className="flex flex-col gap-8 border-b border-emerald-100/70 pb-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <img src="/image.png" alt="" className="h-9 w-10 object-contain" />
              <span className="text-xl font-bold font-[family-name:var(--font-plus-jakarta)]">
                Lead<span className="text-emerald-700">For</span>Grow
              </span>
            </Link>
            <p className="text-sm text-[#64748B] leading-relaxed">
              The revenue operating system for teams who refuse to let leads slip through the cracks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/register" className={MARKETING.btnPrimary}>
              Start free trial
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className={MARKETING.btnOutline}>
              Talk to sales
            </Link>
          </div>
        </div>

        {/* Link grid */}
        <div className="grid grid-cols-2 gap-10 pt-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.id}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#111827]">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#64748B] transition-colors hover:text-emerald-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social + legal */}
        <div className="mt-14 flex flex-col gap-6 border-t border-emerald-100/70 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-4">
            {FOOTER_SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#64748B] hover:text-emerald-700 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {FOOTER_LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-[#94A3B8] hover:text-emerald-700 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <p>© {year} LeadForGrow. All rights reserved.</p>
          <p>
            Built in India ·{' '}
            <a href="https://scaledesktechnology.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700">
              ScaleDesk Technology
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
