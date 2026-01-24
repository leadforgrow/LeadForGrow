'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Mail, X, ChevronRight, Sparkles, Zap, Settings, Phone, CreditCard } from 'lucide-react';

export default function AIChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hi — need help with leads, automation, or setup?',
      options: [
        '🛠️ Get help with setup',
        '⚡ Automate lead follow-ups',
        '📊 Understand pricing',
        '📞 Talk to sales'
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const popupRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle Close on ESC and Click Outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e) => {
      // If we clicked inside the trigger button (which effectively toggles state), don't close here
      // But standard "click outside modal" logic:
      if (popupRef.current && !popupRef.current.contains(e.target) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = async (option) => {
    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: option }]);
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      let botResponse = { type: 'bot', text: '', options: [] };

      switch (option) {
        case '🛠️ Get help with setup':
          botResponse.text = "Setup is straightforward:\n1. **Create Account**: Sign up instantly.\n2. **Connect**: Link your Ad accounts or Website forms.\n3. **Map Fields**: Match lead inputs to our CRM.\n\nWould you like a guide?";
          botResponse.options = ['View Setup Guide', 'Back to Menu'];
          break;
        case '⚡ Automate lead follow-ups':
          botResponse.text = "Our core feature. We connect with:\n• WhatsApp Business API\n• Email (SMTP/Gmail)\n• SMS Providers\n\nYou define the triggers, we send the messages instantly.";
          botResponse.options = ['See Integrations', 'Back to Menu'];
          break;
        case '📊 Understand pricing':
          botResponse.text = "Flexible plans for your growth:\n• **Starter**: ₹999/mo\n• **Growth**: ₹14,999/mo\n• **Pro**: ₹24,999/mo\n\nNo hidden fees. Cancel anytime.";
          botResponse.options = ['Compare Plans', 'Start Free Trial', 'Back to Menu'];
          break;
        case '📞 Talk to sales':
          botResponse.text = "Let's find the best solution for you.\n\nEmail: contact@leadforgrow.com\nOr book a quick 15-min chat below.";
          botResponse.options = ['📅 Book a Slot', 'Back to Menu'];
          break;
        case '📅 Book a Slot':
          window.open('https://calendly.com/leadforgrow/30min', '_blank');
          botResponse.text = "Opening our calendar for you...";
          botResponse.options = ['Back to Menu'];
          break;
        case 'Compare Plans':
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
          botResponse.text = "Scrolled to pricing table.";
          botResponse.options = ['Back to Menu'];
          break;
        case 'Start Free Trial':
          window.location.href = '/user/register';
          botResponse.text = "Redirecting...";
          break;
        case 'Back to Menu':
          botResponse.text = "How can we assist you?";
          botResponse.options = [
            '🛠️ Get help with setup',
            '⚡ Automate lead follow-ups',
            '📊 Understand pricing',
            '📞 Talk to sales'
          ];
          break;
        default:
          botResponse.text = "I'm here to help.";
          botResponse.options = ['Back to Menu'];
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="font-sans antialiased z-[9999]">
      {/* Trigger Button - Floating Bottom Right */}
      {!isOpen && (
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
          className="fixed bottom-8 right-8 z-[9999] group flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 hover:bg-indigo-700 hover:shadow-indigo-500/30 px-5 py-3 h-14"
          aria-label="Open Help"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wide">Help & Support</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          ref={popupRef}
          className="fixed bottom-8 right-8 z-[9999] w-[360px] h-[580px] max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200 origin-bottom-right"
        >

          {/* Header */}
          <div className="bg-white dark:bg-slate-900 p-4 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight">Help & Support</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">LeadForGrow Team</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-300`}>

                {/* Bubble */}
                <div
                  className={`max-w-[88%] p-3.5 rounded-xl text-[14px] leading-relaxed ${msg.type === 'user'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 pl-0 pt-0'
                    }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Options (if bot) */}
                {msg.type === 'bot' && msg.options && (
                  <div className="mt-1 flex flex-col gap-2 w-full max-w-[95%]">
                    {msg.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionClick(opt)}
                        className="group flex items-center justify-between w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-600 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm font-medium text-left shadow-sm hover:shadow-md"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing */}
            {isTyping && (
              <div className="flex items-start animate-in fade-in duration-300 pl-0">
                <div className="px-0 py-2 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce delay-150"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
            <div className="flex justify-center items-center gap-1.5 opacity-40 hover:opacity-80 transition-opacity cursor-default">
              <Sparkles className="w-3 h-3" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Ask LeadForGrow
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
