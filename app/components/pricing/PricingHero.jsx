'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, MessageCircle, UserPlus, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { TRUST_BADGES } from './pricingData';

const EVENTS = [
  { icon: UserPlus, label: 'New lead received', sub: 'Meta Ads · 2s ago', color: 'text-slate-700' },
  { icon: MessageCircle, label: 'Auto WhatsApp reply sent', sub: 'Template · 12s ago', color: 'text-blue-700' },
  { icon: UserPlus, label: 'Lead assigned to Priya', sub: 'Round-robin · 18s ago', color: 'text-slate-700' },
  { icon: Calendar, label: 'Follow-up scheduled', sub: 'Tomorrow 10:00 AM', color: 'text-slate-600' },
  { icon: Trophy, label: 'Deal moved to Won', sub: '₹1.2L · Pipeline', color: 'text-emerald-700' },
];

export default function PricingHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#fafbfc]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(15,23,42,0.04),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(37,99,235,0.05),transparent_50%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-4">
              Revenue Operating System
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-[-0.03em] text-slate-900 leading-[1.12]">
              Recover more revenue without hiring more people.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              LeadForGrow automates follow-ups, lead routing, WhatsApp conversations, and sales workflows — so your team converts faster.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/user/register"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(15,23,42,0.15)] hover:bg-slate-800 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Book Demo
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Revenue dashboard</p>
                  <p className="text-[11px] text-slate-500">Live pipeline · Today</p>
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
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.35, duration: 0.45 }}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100">
                        <Icon className={`w-4 h-4 ${ev.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{ev.label}</p>
                        <p className="text-[10px] text-slate-500">{ev.sub}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Revenue recovered</p>
                    <motion.p
                      className="text-2xl font-bold text-slate-900 tabular-nums"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.2 }}
                    >
                      ₹4.8L
                    </motion.p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <TrendingUp className="w-3.5 h-3.5" /> +34%
                  </span>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {[35, 42, 38, 55, 48, 62, 58, 72, 68, 85].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-sm bg-slate-900/80"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 2.4 + i * 0.06, duration: 0.4 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
