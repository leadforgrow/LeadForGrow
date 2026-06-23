'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Send, Smile, Paperclip, Sparkles, Hand, StickyNote, MessageSquare,
  Bold, Italic, Link2, Clock, Save,
} from 'lucide-react';
import { QUICK_EMOJIS } from './constants';
import MediaAttachmentStrip from './MediaAttachmentStrip';
import { useMediaUpload } from '@/app/automation/hooks/useMediaUpload';

export default function ChatInput({
  canSend,
  hasSelection = false,
  channel = 'whatsapp',
  templates = [],
  aiSuggestion,
  onSend,
  onIntervene,
  onSaveDraft,
  emailSubject = '',
  onEmailSubjectChange,
  emailCc = '',
  onEmailCcChange,
}) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('message');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const editorRef = useRef(null);
  const { uploads, uploadFile, removeUpload, retryUpload, clearUploads } = useMediaUpload();

  const isNote = mode === 'note';
  const isEmail = channel === 'email' && !isNote;
  const readyUploads = uploads.filter((u) => u.status === 'done');

  const handleFiles = useCallback(async (files) => {
    for (const file of Array.from(files)) {
      try {
        await uploadFile(file);
      } catch {
        /* error shown in strip */
      }
    }
  }, [uploadFile]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) {
      e.preventDefault();
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const body = isEmail && editorRef.current ? editorRef.current.innerHTML : text;
    const plainText = isEmail ? editorRef.current?.innerText || text : text;
    if (!plainText.trim() && !readyUploads.length) return;
    if (!isNote && !canSend) return;
    if (isNote && !hasSelection) return;

    const payload = {
      isInternal: isNote,
      bodyHtml: isEmail ? body : undefined,
      subject: isEmail ? emailSubject : undefined,
      cc: isEmail && emailCc ? emailCc.split(',').map((e) => ({ email: e.trim() })).filter((c) => c.email) : undefined,
      scheduledAt: scheduleOpen && scheduledAt ? scheduledAt : undefined,
      attachments: readyUploads.map((u) => ({
        url: u.url,
        fileName: u.name,
        mimeType: u.mimeType,
        size: u.size,
      })),
      media: readyUploads[0]
        ? { url: readyUploads[0].url, mimeType: readyUploads[0].mimeType, fileName: readyUploads[0].name }
        : undefined,
    };

    const ok = await onSend(plainText.trim(), payload);
    if (ok) {
      setText('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      clearUploads();
      setScheduleOpen(false);
      setScheduledAt('');
    }
  };

  const composerShell = (children) => (
    <div
      className={`flex-shrink-0 border-t transition-colors ${
        dragOver ? 'border-blue-400 bg-blue-50/50' : isNote ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      {children}
    </div>
  );

  if (!canSend && !hasSelection) {
    return (
      <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center">
        <button type="button" onClick={onIntervene} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-violet-700 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900 rounded-lg hover:bg-violet-100">
          <Hand className="w-4 h-4" /> Take over chat to reply
        </button>
      </div>
    );
  }

  if (!canSend && hasSelection) {
    return composerShell(
      <>
        <div className="px-3 pt-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-amber-500 text-white">
            <StickyNote className="w-3 h-3" /> Note only
          </span>
        </div>
        <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 pt-2">
          <textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add internal note..." className="flex-1 resize-none text-sm px-4 py-2.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 max-h-32 min-h-[42px]" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }} />
          <button type="submit" disabled={!text.trim()} className="p-2.5 rounded-xl bg-amber-500 text-white disabled:opacity-40 hover:bg-amber-600"><Send className="w-4 h-4" /></button>
        </form>
      </>
    );
  }

  return composerShell(
    <>
      <div className="flex items-center gap-1 px-3 pt-2">
        <button type="button" onClick={() => setMode('message')} className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md ${!isNote ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <MessageSquare className="w-3 h-3" /> Reply
        </button>
        <button type="button" onClick={() => setMode('note')} className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md ${isNote ? 'bg-amber-500 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <StickyNote className="w-3 h-3" /> Note
        </button>
        {isEmail && onSaveDraft && (
          <button type="button" onClick={() => onSaveDraft({ subject: emailSubject, body: editorRef.current?.innerHTML, cc: emailCc })} className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded-md">
            <Save className="w-3 h-3" /> Save draft
          </button>
        )}
      </div>

      {isEmail && !isNote && (
        <div className="px-3 pt-2 space-y-1.5">
          <input type="text" value={emailSubject} onChange={(e) => onEmailSubjectChange?.(e.target.value)} placeholder="Subject" className="w-full text-sm px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
          <input type="text" value={emailCc} onChange={(e) => onEmailCcChange?.(e.target.value)} placeholder="CC (comma separated)" className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
          <div className="flex gap-1 text-slate-500">
            <button type="button" onClick={() => document.execCommand('bold')} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><Bold className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => document.execCommand('italic')} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><Italic className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => { const url = prompt('URL'); if (url) document.execCommand('createLink', false, url); }} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><Link2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      <MediaAttachmentStrip uploads={uploads} onRemove={removeUpload} onRetry={retryUpload} />

      {aiSuggestion && !isNote && (
        <div className="px-4 pt-2">
          <button type="button" onClick={() => { setText(aiSuggestion); if (editorRef.current) editorRef.current.innerText = aiSuggestion; }} className="w-full text-left px-3 py-2 text-xs rounded-lg bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 text-slate-600 hover:border-blue-300">
            <span className="font-medium text-blue-700 flex items-center gap-1 mb-0.5"><Sparkles className="w-3 h-3" /> Suggested reply</span>
            {aiSuggestion.slice(0, 120)}{aiSuggestion.length > 120 ? '…' : ''}
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 px-3 pt-2 text-slate-500">
        <div className="relative">
          <button type="button" onClick={() => { setEmojiOpen(!emojiOpen); setTemplatesOpen(false); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Smile className="w-4 h-4" /></button>
          {emojiOpen && (
            <div className="absolute bottom-full left-0 mb-1 p-2 bg-white dark:bg-slate-900 border rounded-xl shadow-lg grid grid-cols-4 gap-1 z-20">
              {QUICK_EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => { setText((t) => t + e); setEmojiOpen(false); }} className="text-lg p-1 hover:bg-slate-100 rounded">{e}</button>
              ))}
            </div>
          )}
        </div>
        {!isNote && (
          <button type="button" onClick={() => fileRef.current?.click()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Attach file">
            <Paperclip className="w-4 h-4" />
          </button>
        )}
        <input ref={fileRef} type="file" multiple className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
        {isEmail && (
          <button type="button" onClick={() => setScheduleOpen(!scheduleOpen)} className="p-2 rounded-lg hover:bg-slate-100" title="Schedule send"><Clock className="w-4 h-4" /></button>
        )}
        {!isNote && templates.length > 0 && (
          <div className="relative ml-auto">
            <button type="button" onClick={() => { setTemplatesOpen(!templatesOpen); setEmojiOpen(false); }} className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">Templates</button>
            {templatesOpen && (
              <div className="absolute bottom-full right-0 mb-1 w-56 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border rounded-xl shadow-lg z-20">
                {templates.map((t) => (
                  <button key={t.id || t.name} type="button" onClick={() => { setText(t.body || ''); if (editorRef.current) editorRef.current.innerText = t.body || ''; setTemplatesOpen(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b last:border-0">
                    <span className="font-medium block">{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {scheduleOpen && (
        <div className="px-3 pb-1">
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="text-xs px-2 py-1.5 border rounded-lg w-full" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 pt-2">
        {isEmail && !isNote ? (
          <div ref={editorRef} contentEditable suppressContentEditableWarning className="flex-1 text-sm px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-h-40 min-h-[80px] overflow-y-auto" />
        ) : (
          <textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} placeholder={isNote ? 'Add internal note...' : 'Type a message...'} className={`flex-1 resize-none text-sm px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 max-h-32 min-h-[42px] ${isNote ? 'bg-amber-50/50 border-amber-200 focus:ring-amber-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500/20'}`} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }} />
        )}
        <button type="submit" disabled={!text.trim() && !readyUploads.length && !(isEmail && editorRef.current?.innerText?.trim())} className={`p-2.5 rounded-xl text-white disabled:opacity-40 flex-shrink-0 ${isNote ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </>
  );
}
