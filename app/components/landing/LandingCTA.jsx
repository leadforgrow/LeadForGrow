'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { LANDING } from './landingStyles';

const TRUST_LOGOS = ['Homies4u', 'ScaleDesk', 'PMKR', 'CXO', 'CollegeBazzar'];

export default function LandingCTA() {
  return (
    <section className="landing-section-tight pb-16">
      <div className={LANDING.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-900 px-6 py-12 md:px-12 md:py-14"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(37,99,235,0.25),transparent_55%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
                Stop losing leads to delayed follow-ups.
              </h2>
              <p className="text-slate-400 text-sm mt-3 max-w-md leading-relaxed">
                Your competitors automate. Join teams using LeadForGrow to reply in seconds, route intelligently, and close more on WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link
                  href="/user/register"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  Start free trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-600 text-white rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors"
                >
                  Book a demo
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Free onboarding · No setup fees · Cancel anytime
              </div>
            </div>

            {/* Mini CRM visual */}
            <div className="hidden lg:block">
              <div className="rounded-xl border border-slate-700/80 bg-slate-800/60 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] font-medium text-slate-400">Live · 3 leads processing</span>
                </div>
                <div className="space-y-2">
                  {[
                    { event: 'Meta lead received', time: 'Just now', color: 'text-blue-400' },
                    { event: 'WhatsApp auto-reply sent', time: '12s ago', color: 'text-blue-400' },
                    { event: 'Assigned to Amit K.', time: '18s ago', color: 'text-blue-400' },
                    { event: 'Deal moved to Qualified', time: '2m ago', color: 'text-amber-400' },
                  ].map((e) => (
                    <motion.div
                      key={e.event}
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-700/50"
                    >
                      <span className={`text-xs font-medium ${e.color}`}>{e.event}</span>
                      <span className="text-[10px] text-slate-500">{e.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {TRUST_LOGOS.map((name) => (
                  <span key={name} className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
