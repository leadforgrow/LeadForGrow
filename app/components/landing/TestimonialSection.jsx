'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import LandingSectionBg from './LandingSectionBg';

const TESTIMONIALS = [
  {
    quote: 'We went from 4-hour lead response times to under 60 seconds. Our conversion rate doubled in the first month.',
    name: 'Rahul Mehta',
    role: 'Founder, EduPrime',
  },
  {
    quote: 'The WhatsApp inbox + automation rules replaced three separate tools. My team actually uses it every day.',
    name: 'Priya Sharma',
    role: 'Sales Head, PropVault',
  },
  {
    quote: 'Setup took 15 minutes. Meta leads flow straight into WhatsApp with auto-assign to my agents.',
    name: 'Anita Desai',
    role: 'Director, MediCare Plus',
  },
];

export default function TestimonialSection() {
  return (
    <LandingSectionBg variant="warm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Customer stories</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Teams that switched never looked back</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="landing-card p-6"
            >
              <Quote className="w-8 h-8 text-blue-200 dark:text-blue-900 mb-4" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </LandingSectionBg>
  );
}
