'use client';

import { motion } from 'framer-motion';
import {
  GitBranch, Plus, Play, Users, CheckCircle2, Zap, Trash2, ChevronRight
} from 'lucide-react';

const STATUS_STYLES = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  paused: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  archived: 'bg-slate-100 text-slate-500',
};

export default function SequencesHomeView({ sequences, stats, onCreate, onSelect, onDelete }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium mb-3">
            <GitBranch className="w-3.5 h-3.5" />
            Workflow Automation
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sequences
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm max-w-lg">
            WhatsApp-first sales automation — nurture leads, recover missed calls, and qualify with AI.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Create sequence
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total sequences', value: stats.total, icon: GitBranch, color: 'blue' },
          { label: 'Active', value: stats.active, icon: Play, color: 'emerald' },
          { label: 'Enrolled leads', value: stats.enrolled, icon: Users, color: 'violet' },
          { label: 'Running now', value: stats.running, icon: Zap, color: 'amber' },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{s.label}</p>
              <s.icon className={`w-4 h-4 text-${s.color}-500`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {sequences.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/30">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
            <GitBranch className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No sequences yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Create your first workflow — guided templates for WhatsApp nurture, missed call recovery, and more.
          </p>
          <button type="button" onClick={onCreate} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Get started
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sequences.map((seq, i) => (
            <motion.button
              key={seq._id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect(seq)}
              className="group text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[seq.status] || STATUS_STYLES.draft}`}>
                  {seq.status}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{seq.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{seq.description || 'No description'}</p>
              <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-400">
                <span>{(seq.nodes?.length || seq.steps?.length || 0)} steps</span>
                <span>·</span>
                <span>{seq.analytics?.enrolled || 0} enrolled</span>
                {seq.analytics?.completed > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-emerald-500">
                      <CheckCircle2 className="w-3 h-3" /> {seq.analytics.completed}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-blue-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open builder <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${seq.name}"?`)) onDelete(seq._id); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
