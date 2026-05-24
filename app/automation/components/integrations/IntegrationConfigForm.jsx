'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function IntegrationConfigForm({ integration, onSubmit, submitting, submitLabel = 'Save & connect' }) {
  const [values, setValues] = useState({});
  const [showSecrets, setShowSecrets] = useState({});

  useEffect(() => {
    const initial = {};
    for (const field of integration?.fields || []) {
      initial[field.key] = integration?.credentials?.[field.key] ?? field.default ?? '';
    }
    setValues(initial);
  }, [integration?.id, integration?.credentials]);

  const handleChange = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(values);
  };

  if (!integration?.fields?.length) return null;

  const isOAuth = integration.authType === 'oauth';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {integration.fields.map((field) => {
        if (field.readOnly) {
          return (
            <div key={field.key}>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">{field.label}</label>
              <p className="text-sm text-slate-700 dark:text-slate-300">{values[field.key] || '—'}</p>
            </div>
          );
        }

        const isSecret = field.type === 'password' || field.secret;
        const inputType = isSecret && !showSecrets[field.key] ? 'password' : field.type === 'number' ? 'number' : 'text';

        return (
          <div key={field.key}>
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
              {field.label}{field.required ? ' *' : ''}
            </label>
            {field.type === 'select' ? (
              <select
                value={values[field.key] ?? field.default ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <div className="relative">
                <input
                  type={inputType}
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || field.label}
                  required={field.required}
                  disabled={submitting}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-9"
                />
                {isSecret && (
                  <button
                    type="button"
                    onClick={() => setShowSecrets((s) => ({ ...s, [field.key]: !s[field.key] }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecrets[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!isOAuth && (
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
        >
          {submitting ? 'Connecting…' : submitLabel}
        </button>
      )}
    </form>
  );
}
