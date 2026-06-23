'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, MessageCircle, UserPlus, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { TRUST_BADGES } from './pricingData';
import { MARKETING } from '@/lib/marketing/designTokens';

const EVENTS = [
  { icon: UserPlus, label: 'New lead received', sub: 'Meta Ads · 2s ago' },
  { icon: MessageCircle, label: 'Auto WhatsApp reply sent', sub: 'Template · 12s ago' },
  { icon: UserPlus, label: 'Lead assigned to Priya', sub: 'Round-robin · 18s ago' },
  { icon: Calendar, label: 'Follow-up scheduled', sub: 'Tomorrow 10:00 AM' },
  { icon: Trophy, label: 'Deal moved to Won', sub: '₹1.2L · Pipeline' },
];

export default function PricingHero() {
  return (
    <section className={`${MARKETING.section} relative overflow-hidden pt-28 sm:pt-32`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#D2EDD0] via-[#EEF8ED] to-white" />
      <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className={`${MARKETING.container} relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
        <div>
          <p className={MARKETING.overline}>Pricing</p>
          <h1 className={`${MARKETING.h1} mt-3`}>
            Recover more revenue without hiring more people.
          </h1>
          <p className={`${MARKETING.bodyLarge} mt-5 max-w-xl`}>
            LeadForGrow automates follow-ups, lead routing, WhatsApp conversations, and sales workflows — so your team converts faster.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-[#374151] shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className={MARKETING.btnPrimary}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className={MARKETING.btnOutline}>Book Demo</Link>
          </div>
        </div>

        <div className={`${MARKETING.glass} rounded-3xl p-5 lg:p-6`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-100/80">
            <div>
              <p className="text-xs font-semibold text-[#111827]">Revenue dashboard</p>
              <p className="text-[11px] text-[#64748B]">Live pipeline · Today</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="space-y-2 mb-5">
            {EVENTS.map((ev, i) => {
              const Icon = ev.icon;
              return (
                <motion.div
                  key={ev.label}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-center gap-3 rounded-xl border border-emerald-100/60 bg-white/70 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                    <Icon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#111827] truncate">{ev.label}</p>
                    <p className="text-[10px] text-[#64748B]">{ev.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white/80 p-4">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">Revenue recovered</p>
                <p className="text-2xl font-bold text-[#111827] tabular-nums">₹4.8L</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5" /> +34%
              </span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {[35, 42, 38, 55, 48, 62, 58, 72, 68, 85].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm bg-emerald-600/90"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.04, duration: 0.4 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
