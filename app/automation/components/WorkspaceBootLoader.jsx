'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MessageCircle, BarChart3, Users, Zap } from 'lucide-react';

const MESSAGES = [
  'Preparing your workspace',
  'Syncing conversations',
  'Loading sales dashboard',
  'Connecting automations',
  'Fetching lead intelligence',
  'Initializing CRM engine',
  'Preparing analytics',
];

const STAGES = [
  { id: 'workspace', label: 'Workspace loaded', icon: Users },
  { id: 'integrations', label: 'Integrations synced', icon: Zap },
  { id: 'dashboard', label: 'Dashboard ready', icon: BarChart3 },
];

const spring = { type: 'spring', stiffness: 80, damping: 22, mass: 0.9 };
const exitSpring = { type: 'spring', stiffness: 120, damping: 28 };

function FloatingCard({ className, children, delay = 0, floatY = 8 }) {
  return (
    <motion.div
      className={`absolute rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg shadow-blue-500/5 ${className}`}
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -floatY, 0],
      }}
      transition={{
        opacity: { ...spring, delay },
        scale: { ...spring, delay },
        y: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    >
      {children}
    </motion.div>
  );
}

function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#f8f9fc] dark:bg-[#070b14]" />
      <motion.div
        className="absolute -top-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-[25%] -right-[15%] w-[65%] h-[65%] rounded-full bg-violet-400/15 dark:bg-violet-600/10 blur-[120px]"
        animate={{ x: [0, -35, 0], y: [0, -25, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-cyan-300/10 dark:bg-cyan-500/5 blur-[100px]"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/30 dark:bg-blue-300/20"
          style={{ left: `${8 + (i * 7.5) % 85}%`, top: `${12 + (i * 11) % 75}%` }}
          animate={{ opacity: [0.15, 0.5, 0.15], y: [0, -12 - (i % 3) * 4, 0] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function CrmVisualization() {
  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[380px] aspect-square mx-auto">
      <motion.div
        className="absolute inset-[18%] rounded-full border border-blue-200/30 dark:border-blue-500/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-[28%] rounded-full border border-dashed border-violet-200/40 dark:border-violet-500/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
      />

      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/25"
        animate={{ scale: [1, 1.04, 1], boxShadow: ['0 0 40px rgba(59,130,246,0.2)', '0 0 60px rgba(99,102,241,0.35)', '0 0 40px rgba(59,130,246,0.2)'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-white font-bold text-lg sm:text-xl tracking-tight">LFG</span>
        <motion.div
          className="absolute inset-0 rounded-2xl ring-2 ring-white/20"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <FloatingCard className="top-[8%] left-[4%] px-3 py-2 hidden sm:block" delay={0.2}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <MessageCircle className="w-3 h-3 text-emerald-500" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">WhatsApp</p>
            <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">3 new leads</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="top-[12%] right-[2%] px-3 py-2.5" delay={0.5} floatY={6}>
        <div className="flex items-end gap-1 h-8">
          {[40, 65, 45, 80, 55].map((h, i) => (
            <motion.div
              key={i}
              className="w-2 rounded-sm bg-gradient-to-t from-blue-600/60 to-blue-400/80"
              initial={{ height: 4 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 1.2, delay: 0.8 + i * 0.15, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1.5 }}
            />
          ))}
        </div>
        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">Revenue pulse</p>
      </FloatingCard>

      <FloatingCard className="bottom-[18%] left-[0%] px-3 py-2" delay={0.35} floatY={10}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-[9px] font-bold text-white">AK</div>
          <div>
            <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200">Aisha K.</p>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400">Hot lead · ₹2.4L</p>
          </div>
        </div>
      </FloatingCard>

      <FloatingCard className="bottom-[10%] right-[6%] px-3 py-2 hidden sm:block" delay={0.65}>
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-blue-500" />
          <p className="text-[10px] font-medium text-slate-700 dark:text-slate-300">Team synced</p>
        </div>
      </FloatingCard>

      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-blue-500/60"
          style={{
            top: `${25 + i * 18}%`,
            left: `${20 + i * 15}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

export default function WorkspaceBootLoader({ complete = false, onFinished }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [exiting, setExiting] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const delta = now - last;
      last = now;
      setProgress((p) => {
        const cap = complete ? 100 : 88;
        const speed = complete ? 0.35 : 0.045;
        const next = Math.min(cap, p + delta * speed * 0.08);
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [complete]);

  useEffect(() => {
    const stages = [];
    if (progress >= 28) stages.push('workspace');
    if (progress >= 58) stages.push('integrations');
    if (progress >= 82) stages.push('dashboard');
    setCompletedStages(stages);
  }, [progress]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setExiting(true);
    setTimeout(() => onFinished?.(), 520);
  }, [onFinished]);

  useEffect(() => {
    if (complete && progress >= 99) {
      finish();
    }
  }, [complete, progress, finish]);

  return (
    <AnimatePresence onExitComplete={() => {}}>
      {!exiting && (
        <motion.div
          key="boot-loader"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.02 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <AmbientBackground />

          <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
            <CrmVisualization />

            <div className="mt-6 sm:mt-8 w-full max-w-sm text-center">
              <div className="h-6 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200"
                    initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {MESSAGES[messageIndex]}
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      …
                    </motion.span>
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="mt-5 h-1 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-violet-500 to-blue-500"
                  style={{ width: `${progress}%` }}
                  transition={exitSpring}
                />
              </div>

              <div className="mt-5 space-y-2">
                {STAGES.map((stage, i) => {
                  const done = completedStages.includes(stage.id);
                  const Icon = stage.icon;
                  return (
                    <motion.div
                      key={stage.id}
                      className="flex items-center gap-2.5 text-left"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: done ? 1 : 0.35, x: 0 }}
                      transition={{ ...spring, delay: i * 0.08 }}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                        done ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {done ? <Check className="w-3 h-3" strokeWidth={2.5} /> : <Icon className="w-2.5 h-2.5" />}
                      </div>
                      <span className={`text-xs font-medium ${done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                        {stage.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.p
              className="mt-8 text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              LeadForGrow
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
