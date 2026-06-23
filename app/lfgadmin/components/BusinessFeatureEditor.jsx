'use client';

import { FEATURE_FLAGS, QUOTA_FIELDS } from '@/lib/business/featureCatalog';

export default function BusinessFeatureEditor({ formData, onFieldChange }) {
  const flags = formData.featureFlags || {};
  const quotas = formData.quotas || {};

  const setFlag = (key, enabled) => {
    onFieldChange('featureFlags', { ...flags, [key]: enabled });
  };

  const setQuota = (key, value) => {
    onFieldChange('quotas', { ...quotas, [key]: Number(value) || 0 });
  };

  const groups = FEATURE_FLAGS.reduce((acc, f) => {
    if (!acc[f.group]) acc[f.group] = [];
    acc[f.group].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6 mt-4 border-t border-slate-200 dark:border-slate-700 pt-5">
      <div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Quotas & limits</h4>
        <p className="text-xs text-slate-500 mb-3">Override plan defaults — applies immediately on save.</p>
        <div className="grid grid-cols-2 gap-3">
          {QUOTA_FIELDS.map((q) => (
            <div key={q.key}>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">{q.label}</label>
              <input
                type="number"
                min={0}
                value={quotas[q.key] ?? ''}
                onChange={(e) => setQuota(q.key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{group}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((f) => {
              const enabled = flags[f.key] !== undefined ? flags[f.key] : f.default;
              return (
                <label
                  key={f.key}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    enabled
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                  }`}
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => setFlag(f.key, !enabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`}
                    />
                  </button>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
