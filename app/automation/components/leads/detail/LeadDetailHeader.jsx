'use client';

import Link from 'next/link';
import { ChevronLeft, Phone, MessageSquare, ArrowRightLeft, XCircle, Trash2, MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import StatusBadge from '../StatusBadge';
import LeadScoreBadge from '../LeadScoreBadge';
import WhatsAppIndicator from '../WhatsAppIndicator';

export default function LeadDetailHeader({
  lead,
  intelligence,
  updating,
  onCall,
  onWhatsApp,
  onConvert,
  onLost,
  onDelete
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-[#f8f9fc]/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-6">
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/automation/leads"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" /> Leads
          </Link>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50 truncate">{lead.name}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <StatusBadge status={lead.status} size="xs" />
              <WhatsAppIndicator lead={lead} />
              <LeadScoreBadge intelligence={intelligence} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onCall}
            disabled={updating}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50"
          >
            <Phone className="w-4 h-4" /> Call
          </button>
          <button
            type="button"
            onClick={onWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </button>
          {lead.status !== 'converted' && (
            <button
              type="button"
              onClick={onConvert}
              disabled={updating}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg hover:bg-emerald-100"
            >
              <ArrowRightLeft className="w-4 h-4" /> Convert Lead
            </button>
          )}
          <button
            type="button"
            onClick={onLost}
            disabled={updating}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg"
          >
            <XCircle className="w-4 h-4" /> Lost
          </button>
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50">
                {lead.status !== 'converted' && (
                  <button
                    type="button"
                    onClick={() => { onConvert(); setMenuOpen(false); }}
                    className="sm:hidden w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Convert lead
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { onLost(); setMenuOpen(false); }}
                  className="sm:hidden w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Mark lost
                </button>
                <button
                  type="button"
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete lead
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
