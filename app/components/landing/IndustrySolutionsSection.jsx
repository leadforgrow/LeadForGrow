'use client';

import { motion } from 'framer-motion';
import { Building2, GraduationCap, HeartPulse, Landmark, Plane, Shield } from 'lucide-react';
import Link from 'next/link';
import LandingSectionBg from './LandingSectionBg';

const INDUSTRIES = [
  { icon: Building2, name: 'Real Estate', href: '/industries/real-estate', color: 'blue' },
  { icon: GraduationCap, name: 'Education', href: '/industries/education', color: 'sky' },
  { icon: HeartPulse, name: 'Healthcare', href: '/industries/healthcare', color: 'blue' },
  { icon: Landmark, name: 'Banking & Finance', href: '/industries/fintech', color: 'amber' },
  { icon: Shield, name: 'Insurance', href: '/industries/insurance', color: 'cyan' },
  { icon: Plane, name: 'Travel', href: '/industries/travel', color: 'cyan' },
];

const COLOR = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400',
};

export default function IndustrySolutionsSection() {
  return (
    <LandingSectionBg variant="photo-team">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Industry solutions</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Built for your vertical, not generic SaaS
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Pre-built pipelines, templates, and automations tailored to how your industry sells.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDUSTRIES.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={item.href}
                  className="landing-card block p-5 hover:border-blue-300/60 dark:hover:border-blue-700/60 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${COLOR[item.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Tailored workflows & templates →</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </LandingSectionBg>
  );
}
