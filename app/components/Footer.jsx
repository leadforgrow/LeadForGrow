import React from 'react';
import { Mail, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerData = {
    product: [
      { label: 'Website & Funnel Builder', href: '/product/builder' },
      { label: 'Lead Capture Forms', href: '/product/forms' },
      { label: 'Lead Management (CRM)', href: '/product/crm' },
      { label: 'Automation & Follow-ups', href: '/product/automation' },
      { label: 'Analytics & Reporting', href: '/product/analytics' },
      { label: 'Custom Domain & Hosting', href: '/product/hosting' },
    ],
    services: [
      { label: 'Done-For-You Website', href: '/services/dfy-website' },
      { label: 'Lead System Setup', href: '/services/lead-setup' },
      { label: 'Automation Setup', href: '/services/automation-setup' },
      { label: 'Social Profile Setup', href: '/services/social-setup' },
      { label: 'Managed Growth Service', href: '/services/managed-growth' },
    ],
    agencies: [
      { label: 'Agency Platform', href: '/agencies/overview' },
      { label: 'Manage Multiple Clients', href: '/agencies/clients' },
      { label: 'White-Label Solution', href: '/agencies/white-label' },
      { label: 'Agency Pricing', href: '/agencies/pricing' },
      { label: 'Become a Partner', href: '/agencies/partner' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Case Studies', href: '/resources/case-studies' },
      { label: 'Blog', href: '/resources/blog' },
      { label: 'Contact Sales', href: '/contact' },
    ],
    support: [
      { label: 'Help Center', href: '/resources/help' },
      { label: 'How It Works', href: '/resources/how-it-works' },
      { label: 'Use Cases', href: '/resources/use-cases' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-black border-t border-slate-200 dark:border-slate-800">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* COLUMN 1 - LeadForGrow Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/image.png" alt="LeadForGrow" className="w-10 h-10" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">LeadForGrow</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Turn websites into lead-generating systems.
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              The Revenue Follow-Up Operating System (Rev-OS) for high-growth teams. We ensure every enquiry converts or is marked lost—automatically.
            </p>
            <a
              href="mailto:sales@leadforgrow.online"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium mb-8"
            >
              <Mail className="w-5 h-5" />
              sales@leadforgrow.online
            </a>

            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: 'https://x.com/leadforgrow', label: 'X (Twitter)' },
                { icon: Instagram, href: 'https://www.instagram.com/leadforgrow/', label: 'Instagram' },
                { icon: Youtube, href: 'https://www.youtube.com/@ScaleDeskTechnologies', label: 'YouTube' },
                { icon: Linkedin, href: 'https://www.linkedin.com/showcase/leadforgrow', label: 'LinkedIn' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all transform hover:-translate-y-1"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 2 - Product */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
              Product
            </h3>
            <ul className="space-y-3">
              {footerData.product.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>



          {/* COLUMN 4 - For Agencies */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
              For Agencies
            </h3>
            <ul className="space-y-3">
              {footerData.agencies.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 5 - Company */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {footerData.company.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 6 - Support */}
          <div className="lg:col-start-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">
              Support
            </h3>
            <ul className="space-y-3">
              {footerData.support.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © {currentYear} LeadForGrow. All rights reserved.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Built for businesses, agencies, and global teams.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}