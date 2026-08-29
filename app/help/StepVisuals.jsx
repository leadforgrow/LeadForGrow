'use client';

import {
  Globe, Link2, Copy, Send, CheckCircle2, Upload, MessageCircle, Mail,
  Key, Webhook, PlayCircle, LayoutDashboard, ImagePlus, Building2,
  Phone, MapPin, Hash, Receipt, FileText, ArrowRight, Sparkles, Tag,
  Users, Filter, ShieldCheck, CreditCard, PhoneCall, Zap, GitBranch,
  Settings, ChevronRight, ListChecks, Palette, Clock, Timer,
} from 'lucide-react';
import {
  WhatsAppIcon, InstagramIcon, GmailIcon,
} from '@/app/automation/components/chat/BrandIcons';

/**
 * Per-step topic icons.
 * Keyed strings mapped to Lucide (or brand) icon components. Keeps
 * lib/help/guides.js free of imports — it stays plain data.
 */
const ICON_MAP = {
  // Generic
  globe: Globe, link: Link2, copy: Copy, send: Send, check: CheckCheck,
  upload: Upload, message: MessageCircle, mail: Mail, key: Key,
  webhook: Webhook, play: PlayCircle, dashboard: LayoutDashboard,
  image: ImagePlus, building: Building2, phone: Phone, address: MapPin,
  hash: Hash, receipt: Receipt, file: FileText, arrow: ArrowRight,
  sparkles: Sparkles, tag: Tag, users: Users, filter: Filter,
  shield: ShieldCheck, card: CreditCard, callphone: PhoneCall,
  zap: Zap, branch: GitBranch, settings: Settings, next: ChevronRight,
  list: ListChecks, palette: Palette, clock: Clock, timer: Timer,
  // Real brand marks
  whatsapp: WhatsAppIcon, instagram: InstagramIcon, gmail: GmailIcon,
};

function CheckCheck(props) { return <CheckCircle2 {...props} />; }

/**
 * StepIcon — the coloured circle that replaces the plain "1 / 2 / 3" number.
 * Tone maps to the step's topic; falls back to blue.
 */
export function StepIcon({ icon = 'next', tone = 'blue' }) {
  const Comp = ICON_MAP[icon] || ICON_MAP.next;
  const wrapper = TONE_WRAPPER[tone] || TONE_WRAPPER.blue;
  // Brand icons carry their own colour — otherwise inherit the tone
  const isBrand = ['whatsapp', 'instagram', 'gmail'].includes(icon);
  return (
    <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${wrapper.ring} ${wrapper.bg}`}>
      {isBrand ? (
        icon === 'gmail'
          ? <Comp size={18} />
          : icon === 'whatsapp'
            ? <Comp size={18} className="text-[#25D366]" />
            : <Comp size={18} className="text-[#DD2A7B]" />
      ) : (
        <Comp className={`w-4 h-4 ${wrapper.text}`} strokeWidth={2.2} />
      )}
    </span>
  );
}

const TONE_WRAPPER = {
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950/40',       text: 'text-blue-600 dark:text-blue-400',       ring: 'ring-blue-200/60 dark:ring-blue-900/40' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200/60 dark:ring-emerald-900/40' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-950/40',     text: 'text-amber-600 dark:text-amber-400',     ring: 'ring-amber-200/60 dark:ring-amber-900/40' },
  violet:  { bg: 'bg-violet-50 dark:bg-violet-950/40',   text: 'text-violet-600 dark:text-violet-400',   ring: 'ring-violet-200/60 dark:ring-violet-900/40' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-950/40',       text: 'text-rose-600 dark:text-rose-400',       ring: 'ring-rose-200/60 dark:ring-rose-900/40' },
  slate:   { bg: 'bg-slate-100 dark:bg-slate-800',       text: 'text-slate-600 dark:text-slate-400',     ring: 'ring-slate-200 dark:ring-slate-700' },
};

/**
 * StepVisual — inline UI mockup for a step. Each `kind` renders a small,
 * hand-built panel that matches LFG's or the external tool's actual UI.
 * Purely visual: no interaction, no fetches — cheap to render and safe SSR.
 *
 * data shape depends on `kind`, documented below each case.
 */
export function StepVisual({ kind, data = {} }) {
  switch (kind) {

    // { url: string, title?: string }
    case 'browser':
      return (
        <div className="mt-3 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="flex-1 mx-2 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-[11px] text-slate-500 font-mono truncate">
              {data.url}
            </div>
          </div>
          {data.title && (
            <div className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{data.title}</div>
          )}
        </div>
      );

    // { fields: [{ label, value?, placeholder? }] }
    case 'form':
      return (
        <div className="mt-3 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 p-3 space-y-2">
          {(data.fields || []).map((f, i) => (
            <div key={i}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">{f.label}</div>
              <div className={`h-8 px-3 flex items-center rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono ${f.value ? 'text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800' : 'text-slate-400 bg-white dark:bg-slate-900'}`}>
                {f.value || f.placeholder || 'paste here'}
              </div>
            </div>
          ))}
        </div>
      );

    // { text: string, direction?: 'in' | 'out', tail?: string }
    case 'whatsapp':
      return (
        <div className="mt-3 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
          <div className="p-4 bg-[#efeae2] dark:bg-[#0b141a]">
            <div className={`flex ${data.direction === 'in' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm shadow-sm ${
                data.direction === 'in'
                  ? 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-tl-none'
                  : 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 rounded-tr-none'
              }`}>
                <p className="whitespace-pre-wrap leading-snug">{data.text}</p>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 text-right mt-1">
                  {data.tail || '19:32'} <span className="text-[#53bdeb]">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    // { label, kind?: 'primary' | 'secondary', icon? }
    case 'button': {
      const Icon = data.icon ? (ICON_MAP[data.icon] || ArrowRight) : null;
      const style = data.kind === 'secondary'
        ? 'bg-white text-slate-800 border border-slate-200'
        : 'bg-emerald-600 text-white border border-emerald-600';
      return (
        <div className="mt-3">
          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold ${style}`}>
            {Icon && <Icon className="w-4 h-4" />}
            {data.label}
          </div>
        </div>
      );
    }

    // { steps: [{ label, done? }] }  — a mini progress checklist
    case 'checklist':
      return (
        <div className="mt-3 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 p-3">
          <ul className="space-y-1.5">
            {(data.steps || []).map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className={`w-3.5 h-3.5 ${s.done ? 'text-emerald-600' : 'text-slate-300'}`} />
                <span className={s.done ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    // { item: string, description?: string, icon? }  — mock sidebar nav item highlighted
    case 'nav': {
      const Icon = data.icon ? (ICON_MAP[data.icon] || ChevronRight) : ChevronRight;
      return (
        <div className="mt-3 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-950 p-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-500/40">
            <Icon className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-semibold text-white">{data.item}</span>
            {data.description && <span className="ml-auto text-[10px] text-blue-200">{data.description}</span>}
          </div>
        </div>
      );
    }

    // { amount: string, business: string, link: string }
    case 'payment-link':
      return (
        <div className="mt-3 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500">Pay {data.business}</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">₹{data.amount}</div>
            </div>
            <div className="text-xs text-blue-600 font-mono truncate max-w-[140px]">{data.link || 'rzp.io/i/abc123'}</div>
          </div>
        </div>
      );

    // { title, subtitle, actions?: [{ label, kind }] } — a mock bill card
    case 'bill-card':
      return (
        <div className="mt-3 rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Bill</div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">{data.title || 'PG-2026-001'}</div>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">Sent</span>
            </div>
            <div className="text-xs text-slate-500 mt-2">{data.subtitle || 'Total ₹3,400 · sent to Daksh'}</div>
          </div>
          {data.actions?.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
              {data.actions.map((a, i) => (
                <div key={i} className={`text-[11px] px-2.5 py-1 rounded-md font-semibold ${
                  a.kind === 'primary' ? 'bg-emerald-600 text-white'
                    : a.kind === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-white text-slate-700 border border-slate-200'
                }`}>{a.label}</div>
              ))}
            </div>
          )}
        </div>
      );

    // { text }
    case 'toast':
      return (
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {data.text || 'Saved'}
        </div>
      );

    default:
      return null;
  }
}
