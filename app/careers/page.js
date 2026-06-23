'use client';

import Link from 'next/link';
import { MapPin, Heart, Rocket, Users } from 'lucide-react';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

const JOBS = [
  { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Remote · India', type: 'Full-time' },
  { title: 'Product Designer', team: 'Design', location: 'Remote · India', type: 'Full-time' },
  { title: 'Customer Success Manager', team: 'Success', location: 'Remote · India', type: 'Full-time' },
  { title: 'Growth Marketing Lead', team: 'Marketing', location: 'Remote · India', type: 'Full-time' },
];

const BENEFITS = ['Remote-first culture', 'Competitive equity', 'Learning budget', 'Flexible hours', 'Health support', 'Annual offsite'];

export default function CareersPage() {
  return (
    <MarketingShell>
      <section className={`${MARKETING.section} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className={`${MARKETING.container} relative max-w-3xl`}>
          <p className={MARKETING.overline}>Careers</p>
          <h1 className={`${MARKETING.h1} mt-3 mb-5`}>Build the future of revenue ops.</h1>
          <p className={MARKETING.bodyLarge}>We&apos;re a small, focused team solving a big problem — helping businesses never lose a lead again.</p>
        </div>
      </section>

      <section className={MARKETING.sectionTight}>
        <div className={`${MARKETING.container} grid lg:grid-cols-3 gap-12`}>
          <div className="lg:col-span-1 space-y-6">
            <div>
              <Heart className="w-6 h-6 text-emerald-600 mb-3" />
              <h2 className={MARKETING.h3}>Culture</h2>
              <p className={`${MARKETING.body} mt-2 text-sm`}>Ownership, craft, and customer obsession. We ship fast but never compromise on quality.</p>
            </div>
            <div>
              <Users className="w-6 h-6 text-emerald-600 mb-3" />
              <h2 className={MARKETING.h3}>Benefits</h2>
              <ul className="mt-3 space-y-2">
                {BENEFITS.map((b) => <li key={b} className="text-sm text-[#64748B] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{b}</li>)}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className={`${MARKETING.h2} mb-6`}>Open roles</h2>
            <div className="space-y-4">
              {JOBS.map((job) => (
                <Link key={job.title} href="/contact" className={`${MARKETING.card} ${MARKETING.cardHover} block p-6`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#111827]">{job.title}</p>
                      <p className="text-sm text-[#64748B] mt-1">{job.team} · {job.location}</p>
                    </div>
                    <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 w-fit">{job.type}</span>
                  </div>
                </Link>
              ))}
            </div>
            <p className="mt-8 text-sm text-[#64748B]">Don&apos;t see a fit? Email <a href="mailto:careers@leadforgrow.com" className="text-emerald-700 font-medium">careers@leadforgrow.com</a></p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
