'use client';

import { motion } from 'framer-motion';
import { Star, MessageSquareText, Target, LineChart } from 'lucide-react';
import LandingSectionBg from './LandingSectionBg';

const SMART_FEATURES = [
  {
    icon: Star,
    title: 'Smart lead scoring',
    description: 'Prioritize hot leads based on source, engagement, and response patterns.',
  },
  {
    icon: MessageSquareText,
    title: 'Reply templates',
    description: 'Context-aware WhatsApp drafts that match your tone and offer history.',
  },
  {
    icon: Target,
    title: 'Intent detection',
    description: 'Spot buying signals in chat and auto-update pipeline stages.',
  },
  {
    icon: LineChart,
    title: 'Revenue forecasting',
    description: 'Predict close rates and pipeline value from real conversation data.',
  },
];

export default function AIFeaturesSection() {
  return (
    <LandingSectionBg variant="aurora">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Built for sales teams</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Everything your team needs to close faster
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            WhatsApp inbox, routing, and follow-ups in one place — so reps spend less time on admin and more time selling.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SMART_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="landing-card p-5 hover:border-blue-300/60 dark:hover:border-blue-700/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </LandingSectionBg>
  );
}
