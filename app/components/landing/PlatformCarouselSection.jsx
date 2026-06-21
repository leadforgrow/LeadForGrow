'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LANDING } from './landingStyles';
import { LANDING_IMAGES } from './hubspotLandingImages';

const SLIDES = [
  {
    title: "A CRM that's really smart.",
    body: "LeadForGrow's Smart CRM is the single source of truth that connects WhatsApp, Meta leads, and your pipeline.",
    image: LANDING_IMAGES.platformCrm,
    label: 'Smart CRM',
  },
  {
    title: 'Automation that never sleeps.',
    body: 'Rule-based routing, timed follow-ups, and AI-drafted replies keep every lead warm — without manual busywork.',
    image: LANDING_IMAGES.platformAutomation,
    label: 'Automation Hub',
  },
  {
    title: 'WhatsApp-native inbox.',
    body: 'Reply from one inbox with full lead context, assignment tracking, and team permissions built in.',
    image: LANDING_IMAGES.platformWhatsApp,
    label: 'WhatsApp Hub',
  },
];

export default function PlatformCarouselSection() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const prev = () => setIndex((i) => (i === 0 ? SLIDES.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === SLIDES.length - 1 ? 0 : i + 1));

  return (
    <section className="relative bg-white py-16 md:py-24 lg:py-28 overflow-hidden">
      <div className={`${LANDING.containerWide}`}>
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-16">
          <h2 className={LANDING.headingCenter}>
            LeadForGrow&apos;s unified revenue platform
          </h2>
          <p className={`mt-5 ${LANDING.subheading} text-center max-w-2xl mx-auto`}>
            Connected data and tools make it easier to capture, qualify, and close every lead across
            your business.
          </p>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35 }}
              className="order-2 lg:order-1"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#FF5C35] mb-3">
                {slide.label}
              </p>
              <h3 className={LANDING.headingSm}>{slide.title}</h3>
              <p className={`mt-4 ${LANDING.body}`}>{slide.body}</p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={slide.image}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="order-1 lg:order-2 relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#CBD6E2] shadow-[0_8px_40px_rgba(51,71,91,0.12)]"
            >
              <Image src={slide.image} alt={slide.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5C35]/20 via-transparent to-[#2563EB]/10" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#CBD6E2] bg-white text-[#33475B] hover:border-[#FF5C35] hover:text-[#FF5C35] transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={SLIDES[i].label}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-8 bg-[#33475B]' : 'w-2 bg-[#CBD6E2] hover:bg-[#94A3B8]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#CBD6E2] bg-white text-[#33475B] hover:border-[#FF5C35] hover:text-[#FF5C35] transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
