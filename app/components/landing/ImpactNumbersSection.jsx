'use client';

import { motion } from 'framer-motion';
import { LANDING } from './landingStyles';

const STATS = [
  { value: '2M+', label: 'Leads processed', sub: 'across WhatsApp and Meta channels' },
  { value: '38s', label: 'Average response time', sub: 'compared to 4+ hours industry average' },
  { value: '3×', label: 'More follow-ups sent', sub: 'with automated sequences enabled' },
];

export default function ImpactNumbersSection() {
  return (
    <section className={`relative overflow-hidden ${LANDING.section} bg-[#F5F8FA]`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=60)',
        }}
        aria-hidden
      />

      <div className={`relative ${LANDING.container}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Stats cards */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`${LANDING.card} p-6 md:p-8 max-w-sm`}
              >
                <p className="font-[family-name:var(--font-landing-serif)] text-4xl md:text-5xl font-bold text-[#FF5C35] tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-2 text-base font-bold text-[#111827]">{stat.label}</p>
                <p className="mt-1 text-sm text-[#64748B] leading-relaxed">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className={LANDING.heading}>Our impact in numbers</h2>
            <p className={`mt-6 ${LANDING.body}`}>
              LeadForGrow helps businesses across India respond faster, follow up consistently, and close more deals. These numbers reflect real outcomes from teams using our platform every day.
            </p>
            <p className={`mt-4 ${LANDING.body}`}>
              From real estate agencies to education consultancies, our customers see measurable improvements in lead conversion within the first 30 days.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
