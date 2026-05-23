'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  MessagesSquare,
  Kanban,
  Bot,
  Users,
  BarChart3,
  Clock,
} from 'lucide-react';

const MODULES = [
  {
    id: 'inbox',
    icon: MessagesSquare,
    title: 'WhatsApp Inbox',
    description: 'Unified conversations with CRM context on every message.',
    color: 'emerald',
    preview: '3 unread · 12s avg reply',
  },
  {
    id: 'pipeline',
    icon: Kanban,
    title: 'Lead Pipeline',
    description: 'Visual kanban with smart stages and drag-and-drop deals.',
    color: 'blue',
    preview: '24 active · 8 hot leads',
  },
  {
    id: 'automation',
    icon: Bot,
    title: 'AI Automation',
    description: 'Rules, sequences, and intelligent follow-ups on autopilot.',
    color: 'violet',
    preview: '6 rules live',
  },
  {
    id: 'team',
    icon: Users,
    title: 'Team Dashboard',
    description: 'Assign, track, and coach your sales team in real time.',
    color: 'indigo',
    preview: '4 agents online',
  },
  {
    id: 'reports',
    icon: BarChart3,
    title: 'Reports',
    description: 'Funnels, heatmaps, and revenue intelligence at a glance.',
    color: 'amber',
    preview: '+18% conversion',
  },
  {
    id: 'followup',
    icon: Clock,
    title: 'Follow-up System',
    description: 'Never miss a lead with scheduled tasks and reminders.',
    color: 'cyan',
    preview: '0 overdue tasks',
  },
];

const COLOR_MAP = {
  emerald: { icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400', glow: 'group-hover:shadow-emerald-500/10', bar: 'bg-emerald-500' },
  blue: { icon: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400', glow: 'group-hover:shadow-blue-500/10', bar: 'bg-blue-500' },
  violet: { icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400', glow: 'group-hover:shadow-violet-500/10', bar: 'bg-violet-500' },
  indigo: { icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400', glow: 'group-hover:shadow-indigo-500/10', bar: 'bg-indigo-500' },
  amber: { icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', glow: 'group-hover:shadow-amber-500/10', bar: 'bg-amber-500' },
  cyan: { icon: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400', glow: 'group-hover:shadow-cyan-500/10', bar: 'bg-cyan-500' },
};

function ModuleCard({ module, index }) {
  const [hover, setHover] = useState(false);
  const colors = COLOR_MAP[module.color];
  const Icon = module.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group relative rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 shadow-sm transition-all duration-500 hover:shadow-xl ${colors.glow} overflow-hidden`}
      style={{
        transform: hover ? 'perspective(800px) rotateX(2deg) rotateY(-2deg) translateY(-4px)' : 'perspective(800px) rotateX(0) rotateY(0)',
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s',
      }}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${colors.bar} opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${colors.icon}`}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{module.title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{module.description}</p>

      <motion.div
        initial={false}
        animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 8 }}
        className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800"
      >
        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{module.preview}</p>
      </motion.div>
    </motion.div>
  );
}

export default function FeatureModules() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden bg-[#f8f9fc] dark:bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-950/10 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Platform modules</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything your team needs.{' '}
            <span className="text-slate-400 dark:text-slate-500">One intelligent OS.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m, i) => (
            <ModuleCard key={m.id} module={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
