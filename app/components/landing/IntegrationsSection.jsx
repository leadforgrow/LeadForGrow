'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { LANDING } from './landingStyles';
import { LANDING_IMAGES } from './hubspotLandingImages';

const INTEGRATIONS = [
  'Meta Lead Ads',
  'WhatsApp',
  'Google Calendar',
  'Razorpay',
  'Stripe',
  'Twilio',
  'Zapier',
  'Webhooks',
];

export default function IntegrationsSection() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className={LANDING.containerWide}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-[#CBD6E2] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[280px]"
        >
          <div className="p-8 md:p-12 flex flex-col justify-center bg-[#F5F8FA]">
            <h2 className="text-xl md:text-2xl font-bold text-[#33475B] leading-snug">
              Works with the tools you already use. 50+ integrations.
            </h2>
            <Link
              href="/automation/integrations"
              className="mt-4 inline-block w-fit text-[#33475B] font-semibold border-b-2 border-[#FF5C35] pb-0.5 hover:text-[#FF5C35] transition-colors"
            >
              See all app integrations
            </Link>
            <div className="mt-8 flex flex-wrap gap-2">
              {INTEGRATIONS.map((name) => (
                <span
                  key={name}
                  className="rounded-md bg-white border border-[#CBD6E2] px-3 py-1.5 text-xs font-semibold text-[#516f90]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div className="relative min-h-[220px] lg:min-h-0">
            <Image
              src={LANDING_IMAGES.integrations}
              alt="Team using integrated business tools"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#F5F8FA]/30 lg:to-white/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
