'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, UserPlus, MessageCircle, PhoneMissed, Home,
  GraduationCap, Calendar, RotateCcw, Sparkles, Target, GitBranch
} from 'lucide-react';
import { SEQUENCE_CATEGORIES, TRIGGER_TYPES } from '@/lib/sequences/constants';

const ICON_MAP = {
  UserPlus, MessageCircle, PhoneMissed, Home, GraduationCap, Calendar, RotateCcw, Sparkles, Target, GitBranch,
};

export default function SequenceCreationWizard({
  step, draft, onChange, onNext, onBack, onCancel, onFinish, templates,
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to sequences
      </button>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}>{s}</div>
            <span className={`text-xs font-medium hidden sm:block ${step >= s ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              {s === 1 ? 'Details & trigger' : 'Choose template'}
            </span>
            {s === 1 && <div className={`flex-1 h-0.5 ${step > 1 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Name your sequence</h2>
              <p className="text-sm text-slate-500 mt-1">Start with basics — you can refine the workflow in the builder.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Sequence name</label>
                <input
                  value={draft.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  placeholder="e.g. New Lead WhatsApp Nurture"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  rows={2}
                  placeholder="What does this sequence do?"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Category</label>
                  <select
                    value={draft.category}
                    onChange={(e) => onChange({ category: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    {SEQUENCE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Trigger</label>
                  <select
                    value={draft.triggerType}
                    onChange={(e) => onChange({ triggerType: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    {TRIGGER_TYPES.map((t) => (
                      <option key={t.triggerKey} value={t.triggerKey}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onNext}
                disabled={!draft.name?.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose a template</h2>
              <p className="text-sm text-slate-500 mt-1">Start from a proven flow or blank canvas.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {templates.map((tpl) => {
                const Icon = ICON_MAP[tpl.icon] || GitBranch;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => onFinish(tpl.id)}
                    className="group text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tpl.gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{tpl.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{tpl.description}</p>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => onFinish('blank')}
                className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 text-left transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <GitBranch className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Blank workflow</h3>
                <p className="text-xs text-slate-500 mt-1">Start from scratch with drag & drop</p>
              </button>
            </div>
            <button type="button" onClick={onBack} className="mt-6 text-sm text-slate-500 hover:text-slate-700">
              ← Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
