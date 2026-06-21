'use client';

import { motion } from 'framer-motion';
import { LANDING } from './landingStyles';

const TESTIMONIALS = [
  {
    quote: 'We went from 4-hour lead response times to under 60 seconds. Our conversion rate doubled in the first month.',
    name: 'Rahul Mehta',
    role: 'Founder, EduPrime',
  },
  {
    quote: 'The WhatsApp inbox and automation rules replaced three separate tools. My team actually uses it every day.',
    name: 'Priya Sharma',
    role: 'Sales Head, PropVault',
  },
  {
    quote: 'Setup took 15 minutes. Meta leads flow straight into WhatsApp with auto-assign to my agents.',
    name: 'Anita Desai',
    role: 'Director, MediCare Plus',
  },
];

function QuoteMark() {
  return (
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" className="text-[#FF5C35] mb-5">
      <path
        d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0L16.8 4.8C12 5.6 9.6 8 9.6 12H16.8V24H0ZM11.2 24V14.4C11.2 6.4 16 1.6 25.6 0L28 4.8C23.2 5.6 20.8 8 20.8 12H28V24H11.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function TestimonialSection() {
  return (
    <section className={`relative ${LANDING.section} bg-[#F5F8FA] overflow-hidden`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=60)',
        }}
        aria-hidden
      />
      <div className={`relative ${LANDING.container}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className={LANDING.heading}>What our customers say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`${LANDING.card} p-7 md:p-8`}
            >
              <QuoteMark />
              <p className="text-[15px] text-[#4B5563] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
                <p className="text-sm font-bold text-[#111827]">{t.name}</p>
                <p className="text-sm text-[#64748B] mt-0.5">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
