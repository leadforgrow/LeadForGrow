'use client';

import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import { LANDING } from './landingStyles';
import LandingSectionBg from './LandingSectionBg';

const ROWS = [
  {
    label: 'Response speed',
    lfg: { value: '<60 seconds', score: 95 },
    crm: { value: 'Hours / manual', score: 35 },
    manual: { value: 'Unpredictable', score: 15 },
  },
  {
    label: 'Automation',
    lfg: { value: 'Full WhatsApp CRM', score: 92 },
    crm: { value: 'Add-on plugins', score: 45 },
    manual: { value: 'None', score: 10 },
  },
  {
    label: 'Accountability',
    lfg: { value: 'Enforced tasks & SLAs', score: 88 },
    crm: { value: 'Self-governed', score: 40 },
    manual: { value: 'No tracking', score: 8 },
  },
  {
    label: 'Revenue visibility',
    lfg: { value: 'Real-time dashboard', score: 90 },
    crm: { value: 'Buried in reports', score: 50 },
    manual: { value: 'Invisible', score: 12 },
  },
  {
    label: 'Lead recovery',
    lfg: { value: 'Auto follow-up & dialer', score: 85 },
    crm: { value: 'Optional reminders', score: 38 },
    manual: { value: '50%+ lost', score: 5 },
  },
];

function ScoreBar({ score, dominant }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${dominant ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        />
      </div>
      <span className={`text-[10px] font-semibold w-8 text-right ${dominant ? 'text-blue-600' : 'text-slate-400'}`}>
        {score}%
      </span>
    </div>
  );
}

export default function RoiComparisonSection() {
  return (
    <LandingSectionBg variant="sky" sectionClass={LANDING.section}>
      <div className={LANDING.container}>
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-12">
          <p className={LANDING.overline}>Why LeadForGrow</p>
          <h2 className={`${LANDING.heading} mt-2`}>
            The missing layer between{' '}
            <span className="text-blue-600 dark:text-blue-400">enquiry and revenue</span>
          </h2>
          <p className={`${LANDING.subheading} mt-3`}>
            CRMs store data. LeadForGrow enforces the discipline that turns enquiries into closed deals.
          </p>
        </div>

        <div className={`${LANDING.card} overflow-hidden`}>
          {/* Header row */}
          <div className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Capability</div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">LeadForGrow</div>
            <div className="text-xs font-medium text-slate-400">Traditional CRM</div>
            <div className="text-xs font-medium text-slate-400">Manual / WhatsApp</div>
          </div>

          {ROWS.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-4 gap-4 px-5 py-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
            >
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 self-center">{row.label}</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={2.5} />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">{row.lfg.value}</span>
                </div>
                <ScoreBar score={row.lfg.score} dominant />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500">{row.crm.value}</span>
                </div>
                <ScoreBar score={row.crm.score} dominant={false} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs text-slate-500 italic">{row.manual.value}</span>
                </div>
                <ScoreBar score={row.manual.score} dominant={false} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </LandingSectionBg>
  );
}
