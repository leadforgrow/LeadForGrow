'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, MessageCircle, X, Minus, Headphones, TrendingUp } from 'lucide-react';
import { DEFAULT_CHATBOT_CONFIG } from '@/lib/chatbot/defaults';

function darken(hex, amount = 0.12) {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return hex || '#0f766e';
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) * (1 - amount)) | 0;
  const g = Math.max(0, ((n >> 8) & 255) * (1 - amount)) | 0;
  const b = Math.max(0, (n & 255) * (1 - amount)) | 0;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default function Chatbot({
  businessId = '696956dde910b99089019e29',
  position = 'right',
  isPreview = false,
  previewConfig = null,
}) {
  const [widgetConfig, setWidgetConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(!isPreview);
  const [isOpen, setIsOpen] = useState(isPreview);
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState({
    name: '', email: '', phone: '', responses: [], supportType: '', supportMessage: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef(null);
  const startedRef = useRef(false);
  const leadRef = useRef(leadData);
  leadRef.current = leadData;

  const cfg = useMemo(() => {
    if (isPreview && previewConfig) return previewConfig;
    if (widgetConfig?.active) return widgetConfig;
    if (isPreview) {
      return {
        active: true,
        businessName: 'Your Business',
        appearance: DEFAULT_CHATBOT_CONFIG.appearance,
        messages: DEFAULT_CHATBOT_CONFIG.messages,
        flow: DEFAULT_CHATBOT_CONFIG.flow,
      };
    }
    return null;
  }, [isPreview, previewConfig, widgetConfig]);

  const flow = cfg?.flow || DEFAULT_CHATBOT_CONFIG.flow;
  const questions = useMemo(() => (flow.questions || []).filter(Boolean), [flow.questions]);
  const supportStep = 3 + questions.length;
  const messageStep = supportStep + (flow.askSupportType ? 1 : 0);

  const primary = cfg?.appearance?.primaryColor || '#0f766e';
  const primaryDark = darken(primary);
  const botName = cfg?.appearance?.botName || 'Support';
  const subtitle = cfg?.appearance?.subtitle || 'Typically replies in a few minutes';
  const showBranding = cfg?.appearance?.showBranding !== false;
  const pos = cfg?.appearance?.position || position;

  useEffect(() => {
    if (isPreview || !businessId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/public/chatbot/config?businessId=${businessId}`);
        const json = await res.json();
        if (!cancelled && json.success) setWidgetConfig(json.data);
      } catch {
        if (!cancelled) setWidgetConfig({ active: false });
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [businessId, isPreview]);

  useEffect(() => {
    if (!cfg) return;
    setMessages([{ type: 'bot', text: cfg.messages?.greeting || DEFAULT_CHATBOT_CONFIG.messages.greeting }]);
    setStep(0);
    setLeadData({ name: '', email: '', phone: '', responses: [], supportType: '', supportMessage: '' });
    setSubmitted(false);
  }, [cfg?.messages?.greeting, previewConfig]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const addMessage = useCallback((text, type = 'bot') => {
    setMessages((prev) => [...prev, { type, text }]);
  }, []);

  const notifyParent = (action) => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'LFG_CHAT_MSG', action }, '*');
    }
  };

  const openChat = () => {
    setIsOpen(true);
    notifyParent('open');
    if (!startedRef.current && !isPreview) {
      startedRef.current = true;
      fetch('/api/public/chatbot/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, event: 'conversation_started' }),
      }).catch(() => {});
    }
  };

  const afterContact = () => {
    if (questions.length) return { text: questions[0], next: 3 };
    if (flow.askSupportType) return { text: 'Do you need Technical Support or Sales Support?', next: supportStep };
    return { text: 'Tell us briefly about your requirement:', next: messageStep };
  };

  const handleSend = async (overrideText) => {
    const userText = (overrideText ?? inputValue).trim();
    if (!userText || submitted) return;

    addMessage(userText, 'user');
    setInputValue('');
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 650));

    let nextStep = step;
    let botResponse = '';

    if (step === 0) {
      setLeadData((prev) => ({ ...prev, name: userText }));
      if (flow.collectEmail) {
        botResponse = `Nice to meet you, ${userText}! What's your email address?`;
        nextStep = 1;
      } else if (flow.collectPhone) {
        botResponse = `Thanks, ${userText}! What's the best phone number to reach you?`;
        nextStep = 2;
      } else {
        ({ text: botResponse, next: nextStep } = afterContact());
      }
    } else if (step === 1) {
      if (!userText.includes('@') || !userText.includes('.')) {
        addMessage("That doesn't look like a valid email. Could you try again?");
        setIsTyping(false);
        return;
      }
      setLeadData((prev) => ({ ...prev, email: userText }));
      if (flow.collectPhone) {
        botResponse = 'Great! And your phone number?';
        nextStep = 2;
      } else {
        ({ text: botResponse, next: nextStep } = afterContact());
      }
    } else if (step === 2) {
      setLeadData((prev) => ({ ...prev, phone: userText }));
      ({ text: botResponse, next: nextStep } = afterContact());
    } else if (step >= 3 && step < supportStep) {
      const qIdx = step - 3;
      setLeadData((prev) => ({
        ...prev,
        responses: [...prev.responses, { question: questions[qIdx], answer: userText }],
      }));
      if (qIdx < questions.length - 1) {
        botResponse = questions[qIdx + 1];
        nextStep = step + 1;
      } else if (flow.askSupportType) {
        botResponse = 'Almost done — do you need Technical Support or Sales Support?';
        nextStep = supportStep;
      } else {
        botResponse = 'Please share a brief message about your requirement:';
        nextStep = messageStep;
      }
    } else if (step === supportStep && flow.askSupportType) {
      const type = userText.toLowerCase().includes('tech') ? 'technical' : 'sales';
      setLeadData((prev) => ({ ...prev, supportType: type }));
      botResponse = 'Please write a brief message about your requirement:';
      nextStep = messageStep;
    } else if (step === messageStep) {
      const current = leadRef.current;
      const finalLead = { ...current, supportMessage: userText, businessId };
      botResponse = cfg?.messages?.thankYou || DEFAULT_CHATBOT_CONFIG.messages.thankYou;
      nextStep = messageStep + 1;
      setSubmitted(true);
      setLeadData((prev) => ({ ...prev, supportMessage: userText }));

      const transcript = [...messages, { type: 'user', text: userText }, { type: 'bot', text: botResponse }];

      if (!isPreview) {
        try {
          await fetch('/api/public/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...finalLead, transcript }),
          });
        } catch (err) {
          console.error('[Chatbot] Submit failed:', err);
        }
      }
    }

    setIsTyping(false);
    if (botResponse) addMessage(botResponse);
    setStep(nextStep);
  };

  if (!isPreview && (configLoading || !cfg?.active)) return null;

  const posClass = isPreview
    ? `absolute bottom-4 ${pos === 'left' ? 'left-4' : 'right-4'}`
    : `fixed bottom-6 ${pos === 'left' ? 'left-6' : 'right-6'} z-[9999]`;

  const showQuickReplies = step === supportStep && flow.askSupportType && !submitted;
  const showInput = !submitted && !showQuickReplies;

  return (
    <div className={`${posClass} font-sans`}>
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          aria-label="Open chat"
          className="group relative w-[60px] h-[60px] text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: `linear-gradient(145deg, ${primary}, ${primaryDark})` }}
        >
          <MessageCircle className="w-7 h-7" strokeWidth={2} />
          <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
        </button>
      )}

      {isOpen && (
        <div
          className={`${isPreview ? 'w-[340px] h-[520px]' : 'w-[380px] h-[600px] max-h-[85vh]'} bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80`}
        >
          <div
            className="px-4 py-3.5 text-white flex items-center justify-between flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${primary}, ${primaryDark})` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {botName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{botName}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                  <span className="text-[11px] text-white/80 truncate">{subtitle}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button type="button" onClick={() => { setIsOpen(false); notifyParent('close'); }} className="p-2 hover:bg-white/10 rounded-lg">
                <Minus className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => { setIsOpen(false); notifyParent('close'); }} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/80">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white mr-2 flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: primary }}
                  >
                    {botName.charAt(0)}
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.type === 'user'
                      ? 'text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-slate-800 rounded-2xl rounded-bl-md border border-slate-100 shadow-sm'
                  }`}
                  style={msg.type === 'user' ? { backgroundColor: primary } : undefined}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
            {showQuickReplies && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button type="button" onClick={() => handleSend('Technical Support')} className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                  <Headphones className="w-3.5 h-3.5" /> Technical
                </button>
                <button type="button" onClick={() => handleSend('Sales Support')} className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                  <TrendingUp className="w-3.5 h-3.5" /> Sales
                </button>
              </div>
            )}

            {showInput && (
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-white disabled:opacity-40"
                  style={{ backgroundColor: primary }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}

            {submitted && <p className="text-center text-xs text-slate-500 py-2 font-medium">Conversation complete</p>}

            {showBranding && (
              <a href="https://www.leadforgrow.com" target="_blank" rel="noopener noreferrer" className="block text-center mt-2 text-[10px] text-slate-400 hover:text-slate-600">
                Powered by LeadForGrow
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
