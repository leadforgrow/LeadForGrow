'use client';

import { motion } from 'framer-motion';
import LandingSectionBg from './LandingSectionBg';

const INTEGRATIONS = [
  { name: 'Meta Lead Ads', category: 'Lead capture' },
  { name: 'WhatsApp Business', category: 'Messaging' },
  { name: 'Google Calendar', category: 'Scheduling' },
  { name: 'Stripe & Razorpay', category: 'Billing' },
  { name: 'Cloudinary', category: 'Media' },
  { name: 'Twilio Voice', category: 'Calling' },
  { name: 'Excel Export', category: 'Reports' },
  { name: 'Webhooks & API', category: 'Custom' },
];

export default function IntegrationsSection() {
  return (
    <LandingSectionBg variant="photo-workspace">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Integrations</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Connects with the tools you already use
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {INTEGRATIONS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="landing-card p-4 text-center"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">{item.category}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </LandingSectionBg>
  );
}
