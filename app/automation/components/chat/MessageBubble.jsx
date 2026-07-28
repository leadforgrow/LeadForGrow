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
    <div className={`flex ${outgoing ? 'justify-end' : 'justify-start'} mb-[3px] px-1`}>
      <div
        className={`relative max-w-[75%] pl-2.5 pr-2 py-1.5 text-sm shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] ${
          outgoing
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tr-none'
            : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tl-none'
        }`}
      >
        {/* WhatsApp bubble tail */}
        <span
          className={`absolute top-0 w-2 h-3 overflow-hidden ${outgoing ? '-right-1.5' : '-left-1.5'}`}
          aria-hidden
        >
          <span
            className={`absolute top-0 block w-3 h-3 rotate-45 ${
              outgoing
                ? 'right-1 bg-[#d9fdd3] dark:bg-[#005c4b]'
                : 'left-1 bg-white dark:bg-[#202c33]'
            }`}
          />
        </span>

        {message.subject && message.type === 'email' && (
          <p className="text-xs font-semibold mb-1 text-[#111b21]/80 dark:text-[#e9edef]/80">{message.subject}</p>
        )}
        {hasMedia && <MediaContent message={message} />}
        {bodyText && (
          <p className="leading-[1.35] whitespace-pre-wrap break-words pr-10">{bodyText}</p>
        )}
        <div className={`flex items-center justify-end gap-1 -mt-1 float-right ${outgoing ? 'text-[#667781] dark:text-[#aebac1]' : 'text-[#667781] dark:text-[#8696a0]'}`}>
          <span className="text-[10px] leading-none tabular-nums">{time}</span>
          {outgoing && (
            message.status === 'sending' ? (
              <Clock className="w-3.5 h-3.5" />
            ) : message.status === 'failed' ? (
              <span className="text-[9px] text-red-500">Failed</span>
            ) : message.status === 'read' ? (
              <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
            ) : message.status === 'delivered' ? (
              <CheckCheck className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(MessageBubble);
