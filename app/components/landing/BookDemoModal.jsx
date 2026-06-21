'use client';

import { useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';

export const BOOK_DEMO_URL = 'https://leadforgrow.com/book/lets-connect';

const POPUP_FEATURES = 'noopener,noreferrer,width=960,height=720,scrollbars=yes,resizable=yes';

/** Opens booking in a popup window. Returns null if the browser blocked it. */
export function openBookDemoPopup() {
  return window.open(BOOK_DEMO_URL, 'leadforgrow-book-demo', POPUP_FEATURES);
}

export default function BookDemoModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const openInNewTab = () => {
    window.open(BOOK_DEMO_URL, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#111827]/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-demo-title"
        className="relative w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#111827]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Book a demo</p>
        <h3
          id="book-demo-title"
          className="mt-2 pr-8 text-xl font-extrabold tracking-tight text-[#111827]"
          style={{ fontFamily: 'var(--font-plus-jakarta)' }}
        >
          Schedule your demo
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[#64748B]">
          The booking page opens in a new window because it cannot be embedded here. Click below to
          continue to our scheduling page.
        </p>

        <button
          type="button"
          onClick={openInNewTab}
          className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#111827] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-black"
        >
          Open booking page
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        <a
          href={BOOK_DEMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block text-center text-sm text-emerald-700 hover:text-emerald-800"
        >
          Or open in a new tab
        </a>
      </div>
    </div>
  );
}
