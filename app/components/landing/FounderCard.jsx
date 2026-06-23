import { ArrowRight, Linkedin } from 'lucide-react';

export default function FounderCard({ founder, compact = false }) {
  if (compact) {
    return (
      <article className="flex flex-col rounded-2xl border border-[#B8B8B8] bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D2EDD0] to-[#86EFAC] text-sm font-bold text-[#14532D]">
            {founder.initials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold text-[#111827]">{founder.name}</h3>
            <p className="text-xs font-semibold text-emerald-700">{founder.role}</p>
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-[#64748B]">{founder.bio}</p>
      </article>
    );
  }

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)] ${
        founder.highlight
          ? 'border-emerald-300 ring-1 ring-emerald-200/80'
          : 'border-emerald-100/80'
      }`}
    >
      {founder.highlight && (
        <span className="absolute -top-3 left-6 rounded-full bg-[#111827] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          CTO
        </span>
      )}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D2EDD0] to-[#86EFAC] text-lg font-bold text-[#14532D] shadow-inner">
          {founder.initials}
        </div>
        <a
          href={founder.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] transition-colors hover:border-emerald-300 hover:bg-[#ECFDF5] hover:text-emerald-700"
          aria-label={`${founder.name} on LinkedIn`}
        >
          <Linkedin className="h-5 w-5" />
        </a>
      </div>
      <h3 className="text-xl font-bold text-[#111827]">{founder.name}</h3>
      <p className="mt-1 text-sm font-semibold text-emerald-700">{founder.role}</p>
      <p className="mt-0.5 text-xs font-medium text-[#64748B]">{founder.company}</p>
      {founder.expertise?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {founder.expertise.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mt-4 flex-grow text-[15px] leading-relaxed text-[#4B5563]">{founder.bio}</p>
      <a
        href={founder.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#111827] transition-colors group-hover:text-emerald-700"
      >
        Connect on LinkedIn
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </a>
    </article>
  );
}
