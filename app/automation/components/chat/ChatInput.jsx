'use client';

import { useState, useRef } from 'react';
import { Send, Smile, Paperclip, Sparkles, Hand } from 'lucide-react';
import { QUICK_EMOJIS } from './constants';

export default function ChatInput({
  canSend,
  templates = [],
  aiSuggestion,
  onSend,
  onIntervene
}) {
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !canSend) return;
    const ok = await onSend(text.trim());
    if (ok) setText('');
  };

  if (!canSend) {
    return (
      <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
        <button
          type="button"
          onClick={onIntervene}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-violet-700 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-950/60"
        >
          <Hand className="w-4 h-4" /> Take over chat to reply
        </button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      {aiSuggestion && (
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={() => setText(aiSuggestion)}
            className="w-full text-left px-3 py-2 text-xs rounded-lg bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 text-slate-600 dark:text-slate-400 hover:border-blue-300 transition-colors"
          >
            <span className="font-medium text-blue-700 dark:text-blue-400 flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" /> Suggested reply
            </span>
            {aiSuggestion.slice(0, 120)}{aiSuggestion.length > 120 ? '…' : ''}
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 px-3 pt-2 text-slate-500">
        <div className="relative">
          <button type="button" onClick={() => { setEmojiOpen(!emojiOpen); setTemplatesOpen(false); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Smile className="w-4 h-4" />
          </button>
          {emojiOpen && (
            <div className="absolute bottom-full left-0 mb-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg grid grid-cols-4 gap-1 z-20">
              {QUICK_EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => { setText((t) => t + e); setEmojiOpen(false); }} className="text-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">{e}</button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={() => fileRef.current?.click()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <Paperclip className="w-4 h-4" />
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={() => {}} />
        {templates.length > 0 && (
          <div className="relative ml-auto">
            <button type="button" onClick={() => { setTemplatesOpen(!templatesOpen); setEmojiOpen(false); }} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
              Templates
            </button>
            {templatesOpen && (
              <div className="absolute bottom-full right-0 mb-1 w-56 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20">
                {templates.map((t) => (
                  <button
                    key={t.id || t.name}
                    type="button"
                    onClick={() => { setText(t.body || ''); setTemplatesOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <span className="font-medium block">{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 pt-2">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 resize-none text-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-h-32 min-h-[42px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2.5 rounded-xl bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
