'use client';
import { CheckCircle2, ExternalLink, X } from 'lucide-react';

export default function SuccessNotification({ isOpen, onClose, meetLink }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Setup Call Scheduled! 🎉
          </h3>

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Check your email for the meeting link and details. We're excited to help you set up your revenue system!
          </p>

          {/* Meet link button */}
          <a
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
          >
            <ExternalLink className="w-5 h-5" />
            Open Meeting Link
          </a>

          {/* Secondary text */}
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            The link has also been sent to your email
          </p>
        </div>

        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </div>
    </div>
  );
}
