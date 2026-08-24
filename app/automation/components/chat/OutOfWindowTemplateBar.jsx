'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw, Send, Loader2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';

/**
 * Rendered inside the inbox when the WhatsApp 24-hour customer-care window is
 * closed. Meta only allows approved templates in this state — this bar swaps
 * out the free-text reply box for an approved-template picker + send.
 */
export default function OutOfWindowTemplateBar({ leadName, lead, onSend }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pick, setPick] = useState('');
  const [headerMediaUrl, setHeaderMediaUrl] = useState('');
  const [variableValues, setVariableValues] = useState([]);
  const [sending, setSending] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/automation/whatsapp-templates?status=APPROVED');
      const data = await res.json();
      if (data.success) setTemplates(data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const selected = useMemo(() => {
    if (!pick) return null;
    const [name, lang] = pick.split('|');
    return templates.find((t) => t.name === name && t.language === lang);
  }, [pick, templates]);

  useEffect(() => {
    // Auto-fill from the template's saved media URL if any
    const header = selected?.components?.find((c) => c.type === 'HEADER');
    if (header?.example?.header_media_url && !headerMediaUrl) {
      setHeaderMediaUrl(header.example.header_media_url);
    }
    if (!selected) setHeaderMediaUrl('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?._id]);

  const headerNeedsMedia = (() => {
    const header = selected?.components?.find((c) => c.type === 'HEADER');
    return header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format);
  })();

  const bodyText = selected?.components?.find((c) => c.type === 'BODY')?.text || '';
  const varCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length;

  // When the template changes, pre-fill variable inputs with sensible defaults from the lead
  useEffect(() => {
    if (varCount === 0) { setVariableValues([]); return; }
    const firstName = String(lead?.name || leadName || 'Customer').split(' ')[0];
    const defaults = Array.from({ length: varCount }, (_, i) => {
      if (i === 0) return firstName;
      return '';
    });
    setVariableValues(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?._id, varCount]);

  const allVarsFilled = variableValues.every((v) => String(v || '').trim());
  const canSend = selected && (!headerNeedsMedia || headerMediaUrl.trim()) && allVarsFilled;

  const handleSend = async () => {
    if (!selected) return;
    setSending(true);
    try {
      await onSend({
        name: selected.name,
        language: selected.language,
        headerMediaUrl: headerMediaUrl || undefined,
        variables: variableValues.length ? variableValues.map((v) => String(v || '').trim() || 'Customer') : undefined,
      });
      toast.success('Template sent');
      setPick('');
      setHeaderMediaUrl('');
      setVariableValues([]);
    } catch (e) {
      toast.error(e.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/20 p-4 space-y-3">
      <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
        <Clock className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">24-hour reply window closed</p>
          <p className="text-amber-700 dark:text-amber-400 mt-0.5">
            {leadName ? `${leadName} hasn't messaged you in the last 24 hours. ` : 'This chat is outside the 24h window. '}
            Meta only allows <strong>approved templates</strong> to reopen conversation.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          disabled={loading || templates.length === 0}
          className="flex-1 min-w-[220px] px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-sm"
        >
          <option value="">
            {loading ? 'Loading templates…' : templates.length === 0 ? 'No approved templates — build one first' : '— Choose an approved template —'}
          </option>
          {templates.map((t) => (
            <option key={t._id} value={`${t.name}|${t.language}`}>
              {t.name} · {t.language} · {t.category}
            </option>
          ))}
        </select>
        <button type="button" onClick={fetchTemplates} title="Refresh"
          className="p-2 rounded-lg border border-amber-300 hover:bg-amber-100">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {selected && (
        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
          {selected.components?.find((c) => c.type === 'BODY')?.text || '(no body)'}
        </div>
      )}

      {selected && headerNeedsMedia && (
        <input
          value={headerMediaUrl}
          onChange={(e) => setHeaderMediaUrl(e.target.value)}
          placeholder="Media URL for template header (https://…)"
          className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white dark:bg-slate-900 text-xs font-mono"
        />
      )}

      {selected && varCount > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Fill template variables ({varCount})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: varCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-500 shrink-0 w-8">{`{{${i + 1}}}`}</span>
                <input
                  value={variableValues[i] || ''}
                  onChange={(e) => {
                    const next = [...variableValues];
                    next[i] = e.target.value;
                    setVariableValues(next);
                  }}
                  placeholder={i === 0 ? "Recipient's first name" : `Value for {{${i + 1}}}`}
                  className="flex-1 px-2 py-1.5 rounded-lg border border-amber-300 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <a href="/automation/whatsapp-templates" className="text-[11px] text-amber-700 hover:underline">
          + Build a new template
        </a>
        <button type="button" onClick={handleSend} disabled={!canSend || sending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed">
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Send template
        </button>
      </div>

      {!canSend && selected && (
        <p className="text-[11px] text-amber-700">
          {headerNeedsMedia && !headerMediaUrl.trim()
            ? `${selected.components.find((c) => c.type === 'HEADER').format.toLowerCase()} URL required for this template's header`
            : !allVarsFilled
              ? `Fill all ${varCount} template variable${varCount === 1 ? '' : 's'} above`
              : ''}
        </p>
      )}
    </div>
  );
}

/**
 * Detect whether the 24h WhatsApp window is open based on the most recent
 * incoming message. Returns true if within window OR if channel is not WhatsApp.
 */
export function useIsWithin24hWindow(chat, messages) {
  return useMemo(() => {
    if (!chat) return true;
    if ((chat.channel || 'whatsapp') !== 'whatsapp') return true;
    // Intervened / template convos still allow free-text within the window
    const lastIncoming = [...(messages || [])]
      .reverse()
      .find((m) => m.direction === 'incoming');
    if (!lastIncoming?.timestamp) return false;
    const ageMs = Date.now() - new Date(lastIncoming.timestamp).getTime();
    return ageMs < 24 * 60 * 60 * 1000;
  }, [chat, messages]);
}
