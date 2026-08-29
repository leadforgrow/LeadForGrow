import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGuide, HELP_GUIDES, HELP_CATEGORIES } from '@/lib/help/guides';
import {
  ArrowLeft, ArrowRight, Clock, CheckCircle2, Lightbulb, AlertCircle,
  Rocket, MessageCircle, Workflow, IndianRupee, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import { WhatsAppIcon, InstagramIcon, GmailIcon } from '@/app/automation/components/chat/BrandIcons';
import { StepIcon, StepVisual } from '../StepVisuals';

/**
 * Guide detail page — kept aligned with /help (HelpCenterClient) so the
 * transition between index and detail feels like one product, not two.
 * Same dark hero + light body pattern.
 */

// Icons chosen for semantic specificity — same set as /help index.
// Workflow shows the actual node-graph shape of an automation.
// IndianRupee makes the money section instantly readable in the Indian market.
// SlidersHorizontal (mixer controls) reads more concretely than a generic gear.
const CATEGORY_META = {
  'get-started':   { Icon: Rocket,             tone: 'blue',    tint: 'from-blue-500/20 to-blue-500/5',       ring: 'ring-blue-500/20' },
  'communication': { Icon: MessageCircle,      tone: 'emerald', tint: 'from-emerald-500/20 to-emerald-500/5', ring: 'ring-emerald-500/20' },
  'automation':    { Icon: Workflow,           tone: 'amber',   tint: 'from-amber-500/20 to-amber-500/5',     ring: 'ring-amber-500/20' },
  'commerce':      { Icon: IndianRupee,        tone: 'violet',  tint: 'from-violet-500/20 to-violet-500/5',   ring: 'ring-violet-500/20' },
  'settings':      { Icon: SlidersHorizontal,  tone: 'slate',   tint: 'from-slate-500/20 to-slate-500/5',     ring: 'ring-slate-500/20' },
};
const TONE_TEXT = {
  blue: 'text-blue-600 dark:text-blue-400', emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400', violet: 'text-violet-600 dark:text-violet-400',
  slate: 'text-slate-600 dark:text-slate-400',
};
const TONE_BG_SOFT = {
  blue: 'bg-blue-50 dark:bg-blue-950/40', emerald: 'bg-emerald-50 dark:bg-emerald-950/40',
  amber: 'bg-amber-50 dark:bg-amber-950/40', violet: 'bg-violet-50 dark:bg-violet-950/40',
  slate: 'bg-slate-100 dark:bg-slate-800',
};

export function generateStaticParams() {
  return HELP_GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: 'Not found · LeadForGrow' };
  return { title: `${guide.title} · LeadForGrow Help`, description: guide.summary };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const category = HELP_CATEGORIES.find((c) => c.id === guide.category);
  const meta = CATEGORY_META[guide.category] || CATEGORY_META['settings'];
  const Icon = meta.Icon;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-slate-950 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
          }}
        />
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[380px] rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,0.55), transparent)' }}
        />

        <div className="relative max-w-3xl mx-auto px-4 pt-6 pb-12 sm:pt-8 sm:pb-16">
          {/* Top strip */}
          <div className="flex items-center justify-between mb-10 sm:mb-14">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold">
              <span className="w-7 h-7 rounded-lg bg-white text-slate-950 flex items-center justify-center text-sm">L</span>
              LeadForGrow
            </Link>
            <Link href="/help" className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" /> All guides
            </Link>
          </div>

          {/* Category chip + title — brandIcon override wins over Lucide */}
          <div className="flex items-center gap-2 mb-3">
            <GuideBrandChip brandIcon={guide.brandIcon} meta={meta} Icon={Icon} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {category?.label}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-white">
            {guide.title}
          </h1>
          <p className="text-slate-300 mt-3 text-base sm:text-lg leading-relaxed">{guide.summary}</p>
          <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {guide.time}</span>
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Prerequisites */}
        {guide.prereqs?.length > 0 && (
          <section className="mb-8">
            <SectionLabel>Before you start</SectionLabel>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
              <ul className="space-y-2">
                {guide.prereqs.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Steps */}
        <section className="mb-8">
          <SectionLabel>Steps</SectionLabel>
          <ol className="relative space-y-6">
            {/* Vertical rail behind icons — clarifies the step sequence */}
            <div aria-hidden className="absolute left-[17px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800" />
            {guide.steps.map((step, i) => (
              <li key={i} className="relative flex gap-4">
                {/* Topic icon per step (falls back to a generic arrow if
                    the guide data hasn't set one). White plate behind so the
                    icon sits above the vertical rail without a break. */}
                <div className="relative z-10 bg-white dark:bg-slate-950 p-0.5 rounded-2xl">
                  <StepIcon icon={step.icon} tone={step.tone || 'blue'} />
                </div>
                <div className="flex-1 min-w-0 pt-1 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Step {i + 1}</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-[15px] mt-0.5">{step.title}</p>
                  {step.body && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{step.body}</p>}
                  {step.code && (
                    <pre className="mt-3 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto ring-1 ring-slate-800">
                      {step.code}
                    </pre>
                  )}
                  {step.visual && <StepVisual kind={step.visual.kind} data={step.visual.data || step.visual} />}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Tips */}
        {guide.tips?.length > 0 && (
          <section className="mb-8">
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Tips
              </h2>
              <ul className="space-y-2.5">
                {guide.tips.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Common issues */}
        {guide.commonIssues?.length > 0 && (
          <section className="mb-8">
            <SectionLabel>Common issues</SectionLabel>
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {guide.commonIssues.map((ci, i) => (
                  <li key={i} className="p-4 flex gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{ci.problem}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{ci.fix}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Related */}
        {guide.related?.length > 0 && (
          <section className="mb-8">
            <SectionLabel>Related guides</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guide.related.map((slug) => {
                const g = HELP_GUIDES.find((x) => x.slug === slug);
                if (!g) return null;
                return (
                  <Link
                    key={slug}
                    href={`/help/${slug}`}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-md transition"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{g.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{g.summary}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 shrink-0 transition" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom nav */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link href="/help" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" /> All guides
          </Link>
          <a
            href="https://wa.me/916366966120"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Still stuck? WhatsApp us
          </a>
        </div>
      </article>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
      {children}
    </h2>
  );
}

/**
 * Guide chip in the dark hero. Prefers the guide's own `brandIcon` (real
 * WhatsApp / Instagram / Gmail mark or a small cluster) over the category's
 * generic Lucide icon so the reader instantly sees "this guide is about
 * that specific product".
 */
function GuideBrandChip({ brandIcon, meta, Icon }) {
  if (brandIcon === 'whatsapp') {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center shadow-sm">
        <WhatsAppIcon size={18} className="text-white" />
      </div>
    );
  }
  if (brandIcon === 'instagram') {
    return (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center shadow-sm">
        <InstagramIcon size={18} className="text-white" />
      </div>
    );
  }
  if (brandIcon === 'gmail') {
    return (
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
        <GmailIcon size={18} />
      </div>
    );
  }
  if (brandIcon === 'cluster') {
    const dot = 'w-7 h-7 rounded-full ring-2 ring-slate-950 flex items-center justify-center';
    return (
      <div className="flex items-center -space-x-2">
        <div className={`${dot} bg-[#25D366]`}><WhatsAppIcon size={14} className="text-white" /></div>
        <div className={`${dot} bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]`}><InstagramIcon size={14} className="text-white" /></div>
        <div className={`${dot} bg-white`}><GmailIcon size={14} /></div>
      </div>
    );
  }
  // Fallback: category's Lucide icon in the tinted chip
  return (
    <div className={`w-8 h-8 rounded-lg ${TONE_BG_SOFT[meta.tone]} flex items-center justify-center`}>
      <Icon className={`w-4 h-4 ${TONE_TEXT[meta.tone]}`} />
    </div>
  );
}
