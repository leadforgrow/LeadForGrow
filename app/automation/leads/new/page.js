'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MessageSquare,
  Briefcase,
  UserPlus,
  Tag,
  Globe,
  Signal,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authFetch, getAuthToken } from '@/lib/apiClient';
import { PRIORITY_CONFIG, SOURCE_OPTIONS } from '../../components/leads/constants';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const MANUAL_SOURCES = SOURCE_OPTIONS.filter((s) => s.value && !['whatsapp', 'bot'].includes(s.value));

function SectionCard({ title, subtitle, step, children }) {
  return (
    <section className="bg-white dark:bg-slate-900/80 border border-emerald-100/90 dark:border-emerald-950/50 rounded-2xl shadow-[0_2px_12px_rgba(5,150,105,0.06)] overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-emerald-50 dark:border-emerald-950/40 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[11px] font-bold text-white shadow-sm">
            {step}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h2>
            {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({ label, icon: Icon, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-800/55 dark:text-emerald-500/70 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-emerald-600/70" strokeWidth={2} />}
        {label}
        {required && <span className="text-red-500 normal-case">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all';

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceInterest: '',
    source: 'manual',
    message: '',
    priority: 'medium',
    tags: [],
  });

  const set = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || formData.tags.includes(tag)) return;
    set('tags', [...formData.tags, tag]);
    setTagInput('');
  };

  const removeTag = (tag) => set('tags', formData.tags.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setLoading(true);
    try {
      if (!getAuthToken()) {
        toast.error('Please login to continue');
        router.push('/user/register?mode=login');
        return;
      }

      const res = await authFetch('/api/automation/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          whatsapp: formData.phone,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Lead created successfully');
        router.push(data.data?._id ? `/automation/leads/${data.data._id}` : '/automation/leads');
      } else {
        toast.error(data.error || 'Failed to create lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#FAFDFA] dark:bg-[#0a120f]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">
        <Link
          href="/automation/leads"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Leads
        </Link>

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100/90 dark:border-emerald-900/40 bg-white dark:bg-slate-900 shadow-[0_4px_24px_rgba(5,150,105,0.08)] mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 opacity-[0.97]" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-emerald-400/20 blur-xl" />
          <div className="relative px-6 sm:px-8 py-7 sm:py-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-md shadow-lg">
                <UserPlus className="h-7 w-7 text-white" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/80 mb-1">
                  CRM · Manual entry
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Add New Lead</h1>
                <p className="text-emerald-50/90 text-sm mt-1.5 leading-relaxed max-w-md">
                  Register an enquiry and sync it to your pipeline, inbox, and activity feed.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {['Pipeline sync', 'Team assignment', 'Activity log'].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-200" strokeWidth={2.5} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <SectionCard step="1" title="Contact details" subtitle="Primary identity and reach channels">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Full name" icon={User} required>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Saurabh Singh"
                  className={inputClass}
                  autoComplete="name"
                />
              </Field>
              <Field label="Phone" icon={Phone} required hint="Used for WhatsApp and call follow-ups">
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                  autoComplete="tel"
                />
              </Field>
              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="name@company.com"
                  className={inputClass}
                  autoComplete="email"
                />
              </Field>
              <Field label="Service interest" icon={Briefcase}>
                <input
                  type="text"
                  value={formData.serviceInterest}
                  onChange={(e) => set('serviceInterest', e.target.value)}
                  placeholder="e.g. CRM setup, SEO"
                  className={inputClass}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard step="2" title="Lead context" subtitle="Source, priority, and internal notes">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-5">
              <Field label="Source" icon={Globe}>
                <select
                  value={formData.source}
                  onChange={(e) => set('source', e.target.value)}
                  className={inputClass}
                >
                  {MANUAL_SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority" icon={Signal}>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => {
                    const active = formData.priority === p;
                    const cfg = PRIORITY_CONFIG[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set('priority', p)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                          active
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        {cfg?.label || p}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            <Field label="Tags" icon={Tag} hint="Press Enter to add a tag">
              <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-emerald-500/70 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                }}
                placeholder="e.g. hot, enterprise, referral"
                className={inputClass}
              />
            </Field>

            <div className="mt-5">
              <Field label="Notes" icon={MessageSquare}>
                <textarea
                  value={formData.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="Context, requirements, or first conversation summary..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </SectionCard>

          {/* Sticky footer */}
          <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-emerald-100/90 dark:border-emerald-950/50 bg-white/95 dark:bg-[#0a120f]/95 backdrop-blur-md px-4 sm:px-6 py-4 shadow-[0_-4px_24px_rgba(5,150,105,0.06)]">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Syncs to pipeline, inbox, and dashboard
              </p>
              <div className="flex items-center gap-3 ml-auto w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => router.push('/automation/leads')}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] ring-1 ring-emerald-700/20"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" strokeWidth={2} />
                  )}
                  {loading ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
