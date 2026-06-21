'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { HubSpotOutlineButton } from './HubSpotButtons';
import { LANDING_IMAGES } from './hubspotLandingImages';

const AGENTS = [
  {
    title: 'WhatsApp Agent',
    description: 'Resolve most customer inquiries automatically with smart, on-brand replies.',
    image: LANDING_IMAGES.platformWhatsApp,
  },
  {
    title: 'Prospecting Agent',
    description: 'Spot buying signals, route hot leads, and launch personalized outreach instantly.',
    image: LANDING_IMAGES.platformAutomation,
    featured: true,
  },
  {
    title: 'Data Agent',
    description: 'Get instant answers about pipeline health, sources, and team performance.',
    image: LANDING_IMAGES.platformCrm,
  },
];

export default function AIAgentsSection() {
  return (
    <section
      className="relative py-16 md:py-24 lg:py-28 overflow-hidden"
      style={{ background: 'linear-gradient(105deg, #FEECE2 0%, #FFD4B8 55%, #FFB399 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-14">
          <h2 className="font-[family-name:var(--font-landing-serif)] text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] font-bold text-[#2E2E2E] leading-[1.1] max-w-xl">
            Built-in AI agents that work for you 24/7
          </h2>
          <p className="text-[#2E2E2E]/85 text-base md:text-lg max-w-md md:text-right leading-relaxed">
            LeadForGrow agents are your always-on teammates — qualifying leads, drafting replies, and
            keeping your pipeline moving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {AGENTS.map((agent, i) => (
            <motion.article
              key={agent.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl bg-white/90 backdrop-blur-sm overflow-hidden flex flex-col ${
                agent.featured
                  ? 'md:-mt-4 shadow-[0_20px_50px_rgba(46,46,46,0.15)] md:scale-[1.03]'
                  : 'shadow-[0_8px_30px_rgba(46,46,46,0.08)]'
              }`}
            >
              <div className="relative aspect-[4/3] bg-[#F5F0EB]">
                <Image
                  src={agent.image}
                  alt={agent.title}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              </div>
              <div className="p-6 pt-4">
                <h3 className="text-lg font-bold text-[#2E2E2E]">{agent.title}</h3>
                <p className="mt-2 text-sm text-[#516f90] leading-relaxed">{agent.description}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <HubSpotOutlineButton href="/product/automation" className="!border-[#2E2E2E] !text-[#2E2E2E] hover:!bg-white/50">
            Explore AI automation
          </HubSpotOutlineButton>
        </div>
      </div>
    </section>
  );
}
