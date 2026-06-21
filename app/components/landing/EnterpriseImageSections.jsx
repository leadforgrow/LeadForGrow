'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check } from 'lucide-react';
import EnterpriseButton from './EnterpriseButton';
import { LANDING } from './landingStyles';
import { fadeUp } from './motionConfig';

import { LANDING_IMAGES } from './hubspotLandingImages';

const IMAGES = LANDING_IMAGES;

export function PeoplePurposeSection() {
  return (
    <section className={`${LANDING.section} bg-white`}>
      <div className={LANDING.container}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={IMAGES.people}
                alt="LeadForGrow team collaborating on lead automation"
                width={900}
                height={600}
                className="w-full h-auto object-cover aspect-[3/2]"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <h2 className={LANDING.heading}>The people and purpose at LeadForGrow</h2>
            <p className={`mt-6 ${LANDING.body}`}>
              We believe every business deserves enterprise-grade lead management — without enterprise complexity or cost. Our team builds software that works as hard as your sales team does.
            </p>
            <p className={`mt-4 ${LANDING.body}`}>
              From solo founders to multi-location agencies, we help teams capture, qualify, and convert leads across WhatsApp, Meta, and web — automatically.
            </p>
            <div className="mt-8">
              <EnterpriseButton href="/user/register">Find your plan</EnterpriseButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function ProductValueSection() {
  const checklist = [
    'Unified WhatsApp inbox with full CRM context',
    'Meta Lead Ads integration with instant routing',
    'Automated follow-up sequences and reminders',
    'Pipeline analytics and team performance reports',
  ];

  return (
    <section className={`${LANDING.section} bg-[#F8FAFC]`}>
      <div className={LANDING.container}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <h2 className={LANDING.heading}>
              Creating CRM software that works as hard as you do
            </h2>
            <p className={`mt-6 ${LANDING.body}`}>
              LeadForGrow combines lead capture, WhatsApp conversations, and sales automation in one platform — so your team spends less time on admin and more time closing deals.
            </p>
            <ul className="mt-8 space-y-3">
              {checklist.map((item) => (
                <li key={item} className={LANDING.checkItem}>
                  <span className="enterprise-check">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <EnterpriseButton href="/user/register">Start free trial</EnterpriseButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
              <Image
                src={IMAGES.product}
                alt="Sales team reviewing CRM pipeline on laptop"
                width={900}
                height={600}
                className="w-full h-auto object-cover aspect-[3/2]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function TeamCultureSection() {
  return (
    <section className={`${LANDING.section} bg-white`}>
      <div className={LANDING.container}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={IMAGES.team}
                alt="LeadForGrow customer success team"
                width={900}
                height={600}
                className="w-full h-auto object-cover aspect-[3/2]"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <h2 className={LANDING.heading}>Built for teams who move fast</h2>
            <p className={`mt-6 ${LANDING.body}`}>
              Whether you are a growing startup or an established agency managing dozens of clients, LeadForGrow scales with your business — from first lead to full revenue operations.
            </p>
            <p className={`mt-4 ${LANDING.body}`}>
              Our platform is designed for the way modern sales teams actually work: mobile-first, WhatsApp-native, and always connected to your pipeline.
            </p>
            <div className="mt-8">
              <EnterpriseButton href="/contact">Talk to sales</EnterpriseButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
