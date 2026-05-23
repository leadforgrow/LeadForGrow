'use client';

import { motion } from 'framer-motion';

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#fafbfe] dark:bg-[#050508]" />
      <div className="absolute top-[-20%] left-[-10%] h-[70%] w-[60%] rounded-full bg-blue-400/[0.07] blur-[120px] dark:bg-blue-600/[0.12]" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[50%] w-[45%] rounded-full bg-violet-400/[0.06] blur-[100px] dark:bg-violet-600/[0.1]" />
      <div className="absolute top-[30%] right-[20%] h-[35%] w-[30%] rounded-full bg-cyan-400/[0.04] blur-[90px] dark:bg-cyan-500/[0.08]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)',
        }}
      />

      {/* AI signal lines */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.12] dark:opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M0 400 Q400 350 800 420 T1600 380"
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M0 600 Q500 550 1000 620 T2000 580"
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-blue-500/30 dark:bg-blue-400/20"
          style={{ left: `${8 + (i * 7.5) % 85}%`, top: `${12 + (i * 11) % 75}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
