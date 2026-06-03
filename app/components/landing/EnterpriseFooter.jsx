'use client';

import Link from 'next/link';

const LINKS = {
  Product: [
    { label: 'WhatsApp CRM', href: '/user/home#product-tour' },
    { label: 'Automation', href: '/user/home#product-tour' },
    { label: 'Pipeline', href: '/user/home#product-tour' },
    { label: 'Pricing', href: '/user/home#pricing' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/resources/about' },
  ],
  Integrations: [
    { label: 'Meta Lead Ads', href: '/contact' },
    { label: 'WhatsApp API', href: '/contact' },
    { label: 'Webhooks', href: '/contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '/contact' },
    { label: 'API docs', href: '/contact' },
    { label: 'Status', href: '/contact' },
    { label: 'Blog', href: '/resources/about' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Security', href: '/contact' },
  ],
};

export default function EnterpriseFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050508]">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6 mb-10">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Lead<span className="text-blue-600">ForGrow</span>
            </Link>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed max-w-[200px]">
              WhatsApp revenue CRM for modern Indian businesses.
            </p>
          </div>
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">{title}</p>
              <ul className="space-y-2">
                {items.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} LeadForGrow. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">Built for teams who cannot afford to lose a lead.</p>
        </div>
      </div>
    </footer>
  );
}
