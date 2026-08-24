'use client';

import { useRef, useState } from 'react';
import { LANDING } from './landingStyles';
import LandingSectionBg from './LandingSectionBg';
import { motion, useInView } from 'framer-motion';
import {
  MessagesSquare,
  Kanban,
  Workflow,
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
    color: 'blue',
    preview: '3 unread · 12s avg reply',
  },
  {
    id: 'pipeline',
    icon: Kanban,
    title: 'Lead Pipeline',
    description: 'Visual kanban with smart stages and drag-and-drop deals.',
    color: 'cyan',
    preview: '24 active · 8 hot leads',
  },
  {
    id: 'automation',
    icon: Workflow,
    title: 'Follow-up automation',
    description: 'Rules, sequences, and timed follow-ups on autopilot.',
    color: 'sky',
    preview: '6 rules live',
  },
  {
    id: 'team',
    icon: Users,
    title: 'Team Dashboard',
    description: 'Assign, track, and coach your sales team in real time.',
    color: 'cyan',
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
  blue: { icon: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400', glow: 'group-hover:shadow-blue-500/10', bar: 'bg-blue-500' },
  sky: { icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400', glow: 'group-hover:shadow-sky-500/10', bar: 'bg-sky-500' },
  cyan: { icon: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400', glow: 'group-hover:shadow-cyan-500/10', bar: 'bg-cyan-500' },
  amber: { icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', glow: 'group-hover:shadow-amber-500/10', bar: 'bg-amber-500' },
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
      className={`group relative rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] ${colors.glow} overflow-hidden`}
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
    <LandingSectionBg ref={ref} variant="aurora" sectionClass={`${LANDING.section} overflow-hidden`}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-10"
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
    </LandingSectionBg>
  );
}
