'use client';

const STATS = [
  { value: '1,100+', label: 'Businesses onboarded', sub: 'across India and global markets' },
  { value: '38s', label: 'Avg. response time', sub: 'vs. 4+ hours industry average' },
  { value: '15 min', label: 'Time to go live', sub: 'connect channels & first automation' },
  { value: '99.9%', label: 'Enterprise uptime SLA', sub: 'priority support & dedicated onboarding' },
];

export default function LandingImpactSection() {
  return (
    <section className="relative bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Impact</p>
          <h2
            className="mt-3 text-[1.75rem] font-extrabold tracking-[-0.03em] text-[#111827] sm:text-[2.15rem]"
            style={{ fontFamily: 'var(--font-plus-jakarta)' }}
          >
            Built for measurable sales outcomes
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-[#FAFDFA] to-white p-5 text-center sm:p-6"
            >
              <p
                className="text-2xl font-extrabold tracking-tight text-[#111827] sm:text-[2rem]"
                style={{ fontFamily: 'var(--font-plus-jakarta)' }}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#111827]">{stat.label}</p>
              <p className="mt-1 text-[12px] leading-snug text-[#64748B]">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
