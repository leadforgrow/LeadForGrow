'use client';

import { memo } from 'react';
import {
  Check, CheckCheck, Clock, StickyNote, Download, FileText,
} from 'lucide-react';
import { formatFileSize } from '@/lib/omnichannel/mediaTypes';

function MediaContent({ message }) {
  const { type, content } = message;
  const url = content?.mediaUrl;
  const fileName = content?.fileName || 'attachment';
  const mimeType = content?.mimeType || '';

  if (!url && type === 'text') return null;

  if (type === 'image' || mimeType.startsWith('image/')) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mb-1">
        <img src={url} alt={fileName} className="max-w-full rounded-lg max-h-64 object-cover" loading="lazy" />
      </a>
    );
  }

  if (type === 'video' || mimeType.startsWith('video/')) {
    return (
      <video src={url} controls className="max-w-full rounded-lg max-h-64 mb-1" preload="metadata">
        <track kind="captions" />
      </video>
    );
  }

  if (type === 'audio' || mimeType.startsWith('audio/')) {
    return (
      <audio src={url} controls className="w-full min-w-[200px] mb-1" preload="metadata" />
    );
  }

  if (type === 'document' || url) {
    return (
      <a
        href={url}
        download={fileName}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2.5 mb-1 rounded-lg bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 transition-colors"
      >
        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">{fileName}</p>
          {content?.fileSize && <p className="text-[10px] text-slate-500">{formatFileSize(content.fileSize)}</p>}
        </div>
        <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </a>
    );
  }

  return null;
}

function MessageBubble({ message }) {
  if (message.isInternal) {
    return (
      <div className="flex justify-center my-2">
        <div className="max-w-[85%] px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
          <span className="flex items-center gap-1 font-medium text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">
            <StickyNote className="w-3 h-3" /> Internal note
          </span>
          <p className="whitespace-pre-wrap break-words">{message.content?.body}</p>
        </div>
      </div>
    );
  }

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
  const hasMedia = message.type !== 'text' || message.content?.mediaUrl;
  const bodyText = message.content?.body || message.content?.caption;

  return (
    <div className={`flex ${outgoing ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
          outgoing
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-slate-800 dark:text-slate-100 border border-emerald-100 dark:border-emerald-900 rounded-br-md'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md'
        }`}
      >
        {message.subject && message.type === 'email' && (
          <p className="text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">{message.subject}</p>
        )}
        {hasMedia && <MediaContent message={message} />}
        {bodyText && (
          <p className="leading-relaxed whitespace-pre-wrap break-words">{bodyText}</p>
        )}
        <div className={`flex items-center justify-end gap-1 mt-1 ${outgoing ? 'text-emerald-700/60' : 'text-slate-400'}`}>
          <span className="text-[10px] tabular-nums">{time}</span>
          {outgoing && (
            message.status === 'sending' ? (
              <Clock className="w-3 h-3" />
            ) : message.status === 'failed' ? (
              <span className="text-[9px] text-red-500">Failed</span>
            ) : message.status === 'read' ? (
              <CheckCheck className="w-3 h-3 text-blue-500" />
            ) : message.status === 'delivered' ? (
              <CheckCheck className="w-3 h-3" />
            ) : (
              <Check className="w-3 h-3" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(MessageBubble);
