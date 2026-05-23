'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Check, Timer, ShieldCheck, Repeat2 } from 'lucide-react';
import AmbientBackground from './AmbientBackground';
import CrmCommandCenter from './CrmCommandCenter';
import MagneticButton from './MagneticButton';
import { fadeUp } from './motionConfig';

const ROTATING_WORDS = ['deals', 'revenue', 'conversions', 'customers'];

const OUTCOMES = [
  { icon: Timer, value: '<60s', label: 'First WhatsApp reply', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  { icon: ShieldCheck, value: '0', label: 'Leads lost to delay', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
  { icon: Repeat2, value: '3×', label: 'More follow-ups sent', color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
];

const PROOF_POINTS = [
  'WhatsApp + Meta leads in one inbox',
  'Auto-assign & instant follow-ups',
  'Live in 15 minutes, no developer',
];

function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ROTATING_WORDS.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative inline-block min-w-[11ch] text-left align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_WORDS[index]}
          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
      <span className="invisible">{ROTATING_WORDS[0]}</span>
    </span>
  );
}

export default function PremiumHero({ onGetStarted, onWatchDemo }) {
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      <AmbientBackground />

      {/* Headline glow */}
      <div className="pointer-events-none absolute left-[5%] top-[28%] h-[420px] w-[420px] rounded-full bg-blue-500/[0.06] blur-[100px] dark:bg-blue-600/[0.1]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* LEFT */}
          <div>
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="text-[2.35rem] font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]"
            >
              Turn Lead enquiries into{' '}
              <RotatingWord />
              <span className="text-slate-900 dark:text-white"> — before your competitor does.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-relaxed"
            >
              Most teams lose 40% of leads simply because replies are too slow.
              LeadForGrow captures every message, assigns it instantly, and runs follow-ups on autopilot — so you close more without adding headcount.
            </motion.p>

            {/* Quick wins */}
            <motion.ul
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.18}
              className="mt-7 space-y-2.5"
            >
              {PROOF_POINTS.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
                  className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {point}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.26}
              className="mt-9 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3"
            >
              <MagneticButton onClick={onGetStarted} className="!px-7 !py-4 !text-[15px]">
                Start free trial <ArrowRight className="w-4 h-4" />
              </MagneticButton>
              <MagneticButton variant="secondary" onClick={onWatchDemo} className="!px-6 !py-4">
                <Play className="w-4 h-4 fill-current" /> See it in 90 sec
              </MagneticButton>
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.32}
              className="mt-3 text-xs text-slate-400 dark:text-slate-500"
            >
              Free 14-day trial · Setup in 15 min · Cancel anytime
            </motion.p>

            {/* Outcome metrics */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.38}
              className="mt-10 grid grid-cols-3 gap-3 max-w-lg"
            >
              {OUTCOMES.map((m, i) => {
                const Icon = m.icon;
                return (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md px-3 py-3.5 shadow-sm hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-800/40 transition-all duration-300"
                  >
                    <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg mb-2 ${m.color}`}>
                      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">{m.value}</p>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">{m.label}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:pl-2"
            style={{ perspective: '1400px' }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="absolute -inset-8 bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-violet-500/10 rounded-full blur-3xl" />
              <CrmCommandCenter />
            </motion.div>

            {/* Floating urgency chip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -left-2 top-[18%] z-20 hidden sm:block"
            >
              <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-3 py-2 shadow-lg">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Just now</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-0.5">Lead replied in 47s</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="absolute -right-1 bottom-[22%] z-20 hidden sm:block"
            >
              <div className="rounded-xl border border-blue-200/80 dark:border-blue-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-3 py-2 shadow-lg">
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">AI routed</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-0.5">Deal moved to Won</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
