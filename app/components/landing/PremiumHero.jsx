'use client';

import { ArrowRight } from 'lucide-react';
import HeroStepDivider from './HeroStepDivider';

const CUSTOMER_LOGOS = [
  { src: '/scaledesk_technology_logo.jpg', alt: 'Scaledesk Technology' },
  { src: '/homie4u.png', alt: 'Homie4U' },
  { src: '/logo%20(1).webp', alt: 'LeadForGrow partner' },
];

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[600px] lg:max-w-[540px]">
      <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-400/20 via-cyan-400/15 to-violet-500/20 blur-3xl" />
      <img
        src="/edited-photo.png"
        alt="LeadForGrow CRM dashboard"
        className="relative w-full h-auto object-contain drop-shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
      />
    </div>
  );
}

export default function PremiumHero({ onGetStarted, onBookDemo }) {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[40px] sm:bottom-[48px] bg-[#D2EDD0]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[40px] sm:bottom-[48px] overflow-hidden">
        <div className="absolute -left-[10%] top-[15%] h-[420px] w-[55%] rounded-[100%] bg-[#c5e4c2]/60" />
        <div className="absolute -right-[5%] top-[5%] h-[380px] w-[50%] rounded-[100%] bg-[#e8f5e6]/80" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10 xl:gap-16">
          <div className="max-w-[540px] pl-5 sm:pl-5">
            <h1 className="landing-headline">
              Turn Leads Into,
              <br />
              Customers With AI
            </h1>

            <p className="landing-subhead mt-5 sm:mt-6">
              LeadForGrow helps businesses capture leads, automate conversations across
              WhatsApp, Instagram, Email, and Web Chat, manage sales pipelines, and convert
              more prospects with AI—all from one intelligent platform.
            </p>

            <div className="mt-8 ml-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center justify-center  bg-[#1a1a1a] px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-black"
              >
                Start Free Trial
              </button>
              <button
                type="button"
                onClick={onBookDemo}
                className="group inline-flex items-center gap-2  border-[#D4D4D4] bg-white px-6 py-3.5 text-[15px] font-medium text-[#1a1a1a] transition-colors hover:border-[#BDBDBD]"
              >
                Book a Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="mt-10 ml-7  flex items-start gap-4">
              <div className="flex -space-x-2.5 pt-1 shrink-0">
                {CUSTOMER_LOGOS.map((logo) => (
                  <div
                    key={logo.src}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="landing-stat">1100+</p>
                <p className="landing-stat-caption mt-1 max-w-[220px]">
                  Growing businesses trust LeadForGrow for sales automation.
                </p>
              </div>
            </div>
          </div>

          <div className="relative lg:pl-2">
            <HeroVisual />
          </div>
        </div>
      </div>

      <HeroStepDivider />
    </section>
  );
}
