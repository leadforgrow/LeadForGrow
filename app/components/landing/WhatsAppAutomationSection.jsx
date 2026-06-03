'use client';

import { motion } from 'framer-motion';
import { Zap, MessageCircle, Users, Clock, ChevronRight } from 'lucide-react';
import { LANDING } from './landingStyles';
import LandingSectionBg from './LandingSectionBg';

const FEATURES = [
  { icon: Zap, title: 'Instant lead reply', desc: 'Meta lead ads → WhatsApp message in under 60 seconds.' },
  { icon: MessageCircle, title: 'Team inbox', desc: 'Shared inbox with assign, read status, and CRM context.' },
  { icon: Clock, title: 'Sequences & reminders', desc: 'Automated follow-ups so no lead goes cold.' },
  { icon: Users, title: 'Round-robin assign', desc: 'Distribute leads fairly across your sales team.' },
];

const TIMELINE = [
  { step: '01', label: 'Meta lead arrives', detail: 'Form submission synced instantly', status: 'done' },
  { step: '02', label: 'WhatsApp auto reply', detail: 'Welcome template sent in 12s', status: 'done' },
  { step: '03', label: 'Assigned to team', detail: 'Round-robin → Priya S.', status: 'done' },
  { step: '04', label: 'Follow-up scheduled', detail: 'Reminder set for +24 hours', status: 'active' },
  { step: '05', label: 'Deal created', detail: 'Pipeline stage: Qualified', status: 'pending' },
];

export default function WhatsAppAutomationSection() {
  return (
    <LandingSectionBg variant="sky" sectionClass={LANDING.section}>
      <div className={LANDING.container}>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className={LANDING.overline}>WhatsApp automation</p>
            <h2 className={`${LANDING.heading} mt-2 mb-3`}>
              Turn every lead into a conversation — instantly
            </h2>
            <p className={`${LANDING.subheading} mb-6`}>
              Connect Meta Business API, capture leads from ads and forms, and trigger welcome messages, templates, and follow-ups automatically.
            </p>
            <div className="space-y-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{f.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`${LANDING.card} p-5`}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Automation timeline</span>
              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">Live</span>
            </div>
            <div className="space-y-0">
              {TIMELINE.map((item, i) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        item.status === 'done'
                          ? 'bg-blue-600 text-white'
                          : item.status === 'active'
                            ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.status === 'done' ? '✓' : item.step}
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`w-px flex-1 min-h-[24px] ${item.status === 'done' ? 'bg-blue-300 dark:bg-blue-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    )}
                  </div>
                  <div className={`pb-4 flex-1 ${item.status === 'active' ? '' : ''}`}>
                    <p className={`text-xs font-semibold ${item.status === 'pending' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.detail}</p>
                    {item.status === 'active' && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-1 mt-1.5"
                      >
                        <ChevronRight className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] font-medium text-blue-600">Processing…</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </LandingSectionBg>
  );
}
