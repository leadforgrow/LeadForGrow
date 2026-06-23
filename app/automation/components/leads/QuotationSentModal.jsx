'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500';

export default function QuotationSentModal({ open, leadName, onConfirm, onCancel, saving }) {
  const [quotationUrl, setQuotationUrl] = useState('');
  const [quotationMessage, setQuotationMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) {
      setQuotationUrl('');
      setQuotationMessage('');
    }
  }, [open]);

  if (!open || !mounted) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quotationUrl.trim()) return;
    onConfirm({ quotationUrl: quotationUrl.trim(), quotationMessage: quotationMessage.trim() });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={saving ? undefined : onCancel} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Send quotation</h3>
          <button type="button" onClick={onCancel} disabled={saving} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload or link the quotation for <span className="font-medium">{leadName || 'this lead'}</span>
          </p>
          <div>
            <label className="text-xs font-medium text-slate-500">Quotation PDF URL *</label>
            <input
              type="url"
              required
              placeholder="https://... or cloud storage link"
              className={`${inputCls} mt-1`}
              value={quotationUrl}
              onChange={(e) => setQuotationUrl(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 mt-1">Paste a link to your quotation PDF</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Optional message</label>
            <textarea
              rows={3}
              placeholder="Additional note for the customer..."
              className={`${inputCls} mt-1 resize-none`}
              value={quotationMessage}
              onChange={(e) => setQuotationMessage(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} disabled={saving} className="flex-1 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700">Cancel</button>
            <button type="submit" disabled={saving || !quotationUrl.trim()} className="flex-1 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Sending…' : 'Send quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
