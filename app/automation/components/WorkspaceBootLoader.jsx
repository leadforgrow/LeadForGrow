'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MessageCircle, BarChart3, Users, Zap } from 'lucide-react';

const MESSAGES = [
  'Preparing your workspace',
  'Syncing conversations',
  'Loading your pipeline',
  'Connecting automations',
  'Fetching lead data',
];

const STAGES = [
  { id: 'workspace', label: 'Workspace loaded', icon: Users },
  { id: 'integrations', label: 'Integrations synced', icon: Zap },
  { id: 'dashboard', label: 'Dashboard ready', icon: BarChart3 },
];

const ease = [0.22, 1, 0.36, 1];

function AmbientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#FAFDFA]" />
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(134, 239, 172, 0.22) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 80% 90%, rgba(16, 185, 129, 0.12) 0%, transparent 55%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}

function BrandLoader() {
  return (
    <div className="relative mx-auto flex h-[148px] w-[148px] items-center justify-center sm:h-[168px] sm:w-[168px]">
      {/* Outer orbit */}
      <motion.div
        className="absolute inset-0 rounded-[28px] border border-emerald-200/70"
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />

      {/* Spinning arc */}
      <svg className="absolute inset-[-6px] h-[calc(100%+12px)] w-[calc(100%+12px)]" viewBox="0 0 180 180">
        <motion.circle
          cx="90"
          cy="90"
          r="84"
          fill="none"
          stroke="url(#lfgArc)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="120 410"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '90px 90px' }}
        />
        <defs>
          <linearGradient id="lfgArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Soft glow */}
      <motion.div
        className="absolute inset-[14%] rounded-[22px] bg-emerald-400/10 blur-xl"
        animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo tile */}
      <motion.div
        className="relative flex h-[88px] w-[88px] items-center justify-center rounded-[22px] border border-emerald-100 bg-white shadow-[0_8px_32px_rgba(5,150,105,0.12),0_2px_8px_rgba(15,23,42,0.04)] sm:h-[96px] sm:w-[96px]"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src="/image.png"
          alt="LeadForGrow"
          className="h-11 w-11 object-contain sm:h-12 sm:w-12"
        />
      </motion.div>

      {/* Corner accents */}
      <motion.span
        className="absolute -right-1 top-6 flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-100 bg-white shadow-sm"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      >
        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
      </motion.span>
      <motion.span
        className="absolute -left-2 bottom-8 flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-100 bg-white shadow-sm"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <BarChart3 className="h-3 w-3 text-emerald-700" strokeWidth={2} />
      </motion.span>
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
    }, 2400);
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
        return Math.min(cap, p + delta * speed * 0.08);
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
    setTimeout(() => onFinished?.(), 480);
  }, [onFinished]);

  useEffect(() => {
    if (complete && progress >= 99) finish();
  }, [complete, progress, finish]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="boot-loader"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.5, ease }}
        >
          <AmbientBackground />

          <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
            <BrandLoader />

            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800/70"
                style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              >
                LeadForGrow
              </p>
              <div className="mt-3 h-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={messageIndex}
                    className="text-[15px] font-medium text-[#374151]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    {MESSAGES[messageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            <div className="mt-6 w-full max-w-[260px]">
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-emerald-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-emerald-400"
                  style={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 22 }}
                />
              </div>

              <div className="mt-5 space-y-2.5">
                {STAGES.map((stage, i) => {
                  const done = completedStages.includes(stage.id);
                  const Icon = stage.icon;
                  return (
                    <motion.div
                      key={stage.id}
                      className="flex items-center gap-2.5"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: done ? 1 : 0.4, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06, ease }}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                          done
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                            : 'bg-emerald-50 text-emerald-300'
                        }`}
                      >
                        {done ? (
                          <Check className="h-3 w-3" strokeWidth={2.5} />
                        ) : (
                          <Icon className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          done ? 'text-[#374151]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
