'use client';

import { memo } from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

function MessageBubble({ message }) {
  if (message.direction === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="px-3 py-1 text-[11px] text-slate-500 bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 rounded-full shadow-sm">
          {message.content?.body}
        </span>
      </div>
    );
  }

  const outgoing = message.direction === 'outgoing';
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex ${outgoing ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
          outgoing
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-slate-800 dark:text-slate-100 border border-emerald-100 dark:border-emerald-900 rounded-br-md'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md'
        }`}
      >
        <p className="leading-relaxed whitespace-pre-wrap break-words">{message.content?.body || message.text}</p>
        <div className={`flex items-center justify-end gap-1 mt-1 ${outgoing ? 'text-emerald-700/60' : 'text-slate-400'}`}>
          <span className="text-[10px] tabular-nums">{time}</span>
          {outgoing && (
            message.status === 'sending' ? (
              <Clock className="w-3 h-3" />
            ) : message.status === 'read' ? (
              <CheckCheck className="w-3 h-3 text-blue-500" />
            ) : (
              <CheckCheck className="w-3 h-3" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(MessageBubble);
