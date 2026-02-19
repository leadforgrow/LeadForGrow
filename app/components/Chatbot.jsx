'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X, ChevronRight, User, Mail, Phone, Headphones, BarChart3, Bot } from 'lucide-react';

const Chatbot = ({ businessId = '696956dde910b99089019e29', position = 'right', isPreview = false }) => {
  const [isOpen, setIsOpen] = useState(isPreview);
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi there! 👋 Welcome to our site. May I know your name?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    responses: [],
    supportType: '',
    supportMessage: ''
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const questions = [
    "What services are you primarily interested in?",
    "How did you hear about us?",
    "What is your estimated budget for this project?",
    "How soon are you looking to get started?",
    "Is there anything specific you'd like us to know before we call?"
  ];

  const addMessage = (text, type = 'bot') => {
    setMessages(prev => [...prev, { type, text }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    addMessage(userText, 'user');
    setInputValue('');
    setIsTyping(true);

    setTimeout(async () => {
      let nextStep = step;
      let botResponse = '';

      if (step === 0) {
        // Name
        setLeadData(prev => ({ ...prev, name: userText }));
        botResponse = `Nice to meet you, ${userText}! Can you please share your email address?`;
        nextStep = 1;
      } else if (step === 1) {
        // Email
        if (!userText.includes('@')) {
          botResponse = "That doesn't look like a valid email. Please try again.";
          setIsTyping(false);
          addMessage(botResponse);
          return;
        }
        setLeadData(prev => ({ ...prev, email: userText }));
        botResponse = "Thank you! And what's your phone number?";
        nextStep = 2;
      } else if (step === 2) {
        // Phone
        setLeadData(prev => ({ ...prev, phone: userText }));
        botResponse = `Got it! Now, a few quick questions to help us serve you better. ${questions[0]}`;
        nextStep = 3;
      } else if (step >= 3 && step < 3 + questions.length) {
        // Questions loop
        const questionIdx = step - 3;
        setLeadData(prev => ({
          ...prev,
          responses: [...prev.responses, { question: questions[questionIdx], answer: userText }]
        }));

        if (questionIdx < questions.length - 1) {
          botResponse = questions[questionIdx + 1];
          nextStep = step + 1;
        } else {
          botResponse = "Great! One last thing: Do you need Technical Support or Sales Support?";
          nextStep = 3 + questions.length;
        }
      } else if (step === 3 + questions.length) {
        // Support Type
        const type = userText.toLowerCase().includes('tech') ? 'technical' : 'sales';
        setLeadData(prev => ({ ...prev, supportType: type }));
        botResponse = "Please write a brief message about your requirement:";
        nextStep = step + 1;
      } else if (step === 4 + questions.length) {
        // Support Message & Final Submission
        const finalData = {
          ...leadData,
          supportMessage: userText,
          businessId
        };
        setLeadData(finalData);

        // Final Message
        botResponse = "Our team will contact you shortly. Thank you!";
        nextStep = step + 1;

        // Submit to API (Skip in preview mode)
        if (isPreview) {
          console.log('[Chatbot Preview] Lead data captured:', finalData);
        } else {
          try {
            await fetch('/api/public/chatbot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(finalData)
            });
          } catch (error) {
            console.error('Failed to submit chatbot lead:', error);
          }
        }
      }

      setIsTyping(false);
      if (botResponse) addMessage(botResponse);
      setStep(nextStep);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={`${isPreview ? 'relative w-full h-full min-h-[500px]' : `fixed bottom-32 ${position === 'left' ? 'left-6' : 'right-6'} z-[9999]`} font-sans`}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            window.parent.postMessage({ type: 'LFG_CHAT_MSG', action: 'open' }, '*');
          }}
          className="w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
        >
          <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`${isPreview ? 'w-full h-full' : 'w-[380px] h-[580px]'} bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 transition-all animate-in slide-in-from-bottom-10 fade-in duration-300`}>
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span className="text-[10px] text-indigo-100 font-medium uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                window.parent.postMessage({ type: 'LFG_CHAT_MSG', action: 'close' }, '*');
              }}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.type === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            {step === 3 + questions.length ? (
              <div className="grid grid-cols-2 gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <button
                  onClick={() => { setInputValue('Technical Support'); handleSend(); }}
                  className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 rounded-xl text-xs font-semibold transition-all group"
                >
                  <Headphones className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Technical
                </button>
                <button
                  onClick={() => { setInputValue('Sales Support'); handleSend(); }}
                  className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 rounded-xl text-xs font-semibold transition-all group"
                >
                  <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Sales
                </button>
              </div>
            ) : step <= 5 + questions.length ? (
              <div className="relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-1.5 w-9 h-9 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:bg-slate-300 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-slate-500 font-medium">
                Our team will be in touch soon! ✨
              </div>
            )}
            <a href="https://www.leadforgrow.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 mt-3 opacity-50 hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-black font-bold">Powered by LeadForGrow</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
