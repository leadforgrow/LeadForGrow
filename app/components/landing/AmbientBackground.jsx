'use client';

import { motion } from 'framer-motion';
import { LANDING_PAGE_BG } from './landingStyles';

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute inset-0 ${LANDING_PAGE_BG}`} />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.18] dark:opacity-[0.1] scale-105"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f4f8ff]/65 via-[#f4f8ff]/50 to-[#f4f8ff]/70 dark:from-[#070a12]/80 dark:via-[#070a12]/70 dark:to-[#070a12]/88" />
      <div className="absolute top-[-20%] left-[-10%] h-[70%] w-[60%] rounded-full bg-blue-400/[0.08] blur-[120px] dark:bg-blue-600/[0.12]" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[50%] w-[45%] rounded-full bg-sky-400/[0.06] blur-[100px] dark:bg-sky-600/[0.1]" />

      <div
        className="absolute inset-0 opacity-[0.28] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)',
        }}
      />

      <svg className="absolute inset-0 h-full w-full opacity-[0.1] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
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
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-blue-500/25 dark:bg-blue-400/15"
          style={{ left: `${8 + (i * 7.5) % 85}%`, top: `${12 + (i * 11) % 75}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
