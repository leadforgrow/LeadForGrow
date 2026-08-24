'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Users,
  Workflow,
  BarChart3,
  Layout,
  Globe,
  Lightbulb,
  Check,
  ArrowRight,
} from 'lucide-react';
import { LANDING } from './landingStyles';
import { HubSpotOutlineButton, HubSpotPrimaryButton } from './HubSpotButtons';

const HUBS = [
  {
    icon: MessageCircle,
    title: 'WhatsApp Hub',
    features: ['Unified inbox with CRM context', 'AI reply drafting', 'Broadcast & sequences'],
    href: '/product/crm',
    featured: false,
  },
  {
    icon: Users,
    title: 'CRM Hub',
    features: ['Pipeline & lead scoring', 'Team assignment rules', 'Full conversation history'],
    href: '/product/crm',
    featured: false,
  },
  {
    icon: Workflow,
    title: 'Automation Hub',
    features: ['Meta Lead Ads routing', 'Timed follow-ups', 'Webhook triggers'],
    href: '/product/automation',
    featured: false,
  },
  {
    icon: BarChart3,
    title: 'Analytics Hub',
    features: ['Source & agent reports', 'Conversion tracking', 'Export to Excel'],
    href: '/product/analytics',
    featured: true,
  },
  {
    icon: Layout,
    title: 'Builder Hub',
    features: ['No-code landing pages', 'Lead capture forms', 'Custom domains'],
    href: '/product/builder',
    featured: false,
  },
  {
    icon: Globe,
    title: 'Agency Hub',
    features: ['Multi-client dashboards', 'White-label CRM', 'Consolidated billing'],
    href: '/agencies/overview',
    featured: false,
  },
  {
    icon: Lightbulb,
    title: 'Insights Hub',
    features: ['Smart lead routing', 'Auto-qualification', 'Reply suggestions'],
    href: '/product/automation',
    featured: false,
  },
  {
    icon: Users,
    title: 'Small Business Bundle',
    features: ['Everything to get started', 'Free trial included', '15-min setup'],
    href: '/pricing',
    featured: false,
  },
];

export default function ProductHubsSection({ onGetStarted, onWatchDemo }) {
  return (
    <section className="relative py-16 md:py-24 bg-[#F5F8FA] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] bg-cover bg-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=60)`,
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#F5F8FA]/92 pointer-events-none" aria-hidden />

      <div className={`relative ${LANDING.containerWide}`}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="xl:col-span-5"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#CBD6E2] px-3 py-1 text-xs font-medium text-[#33475B] mb-6">
              <Check className="h-3.5 w-3.5 text-[#FF5C35]" />
              Trusted by 1,100+ businesses
            </span>
            <h2 className={LANDING.heading}>
              Growing a business is hard. LeadForGrow makes it easier.
            </h2>
            <p className={`mt-5 ${LANDING.body}`}>
              Disconnected tools and data slow you down. LeadForGrow connects everything — and
              everyone — in one place to make growing a business easier than you think.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <HubSpotPrimaryButton onClick={onWatchDemo}>Get a demo</HubSpotPrimaryButton>
              <HubSpotOutlineButton onClick={onGetStarted}>Get started free</HubSpotOutlineButton>
            </div>
          </motion.div>

          <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HUBS.map((hub, i) => {
              const Icon = hub.icon;
              return (
                <motion.div
                  key={hub.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-xl border border-[#CBD6E2] p-5 transition-colors hover:border-[#FF5C35]/40 ${
                    hub.featured ? 'bg-[#EEF2F6]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-5 w-5 text-[#FF5C35]" strokeWidth={1.75} />
                    <h3 className="text-base font-bold text-[#33475B]">{hub.title}</h3>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {hub.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[#516f90]">
                        <Check className="h-4 w-4 shrink-0 text-[#FF5C35] mt-0.5" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={hub.href}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#33475B] hover:text-[#FF5C35] transition-colors"
                  >
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
