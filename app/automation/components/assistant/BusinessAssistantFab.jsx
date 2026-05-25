'use client';

import { useBusinessAssistant } from '../../context/BusinessAssistantContext';
import { ASSISTANT_NAME, ASSISTANT_TAGLINE } from './constants';
import { GroviaMark } from './GroviaIcon';

export default function BusinessAssistantFab() {
  const { isOpen, toggle } = useBusinessAssistant();

  if (isOpen) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 pl-2.5 pr-4 py-2.5 rounded-2xl bg-[#0f1419] text-white shadow-xl shadow-black/30 border border-white/[0.08] hover:border-teal-500/30 hover:shadow-teal-900/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      aria-label={`Open ${ASSISTANT_NAME}`}
    >
      <div className="relative">
        <GroviaMark size="md" className="group-hover:bg-[#0f766e] transition-colors" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#0f1419]" />
      </div>
      <div className="text-left hidden sm:block">
        <p className="text-xs font-semibold leading-none tracking-tight">{ASSISTANT_NAME}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{ASSISTANT_TAGLINE}</p>
      </div>
    </button>
  );
}

/** Compact header trigger */
export function BusinessAssistantTrigger({ className = '' }) {
  const { open } = useBusinessAssistant();

  return (
    <button
      type="button"
      onClick={open}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all bg-[#0f1419] text-white border border-white/[0.08] hover:border-teal-500/30 hover:bg-[#151b22] ${className}`}
    >
      <GroviaMark size="sm" />
      <span className="hidden md:inline font-medium tracking-tight">{ASSISTANT_NAME}</span>
    </button>
  );
}
