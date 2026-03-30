'use client';

import { useEffect, useState } from 'react';
import { Bot, Copy, Check, MessageSquare, Sparkles, Code, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Chatbot from '@/app/components/Chatbot';
import Heading from '@/app/components/ui/Heading';

export default function ChatbotPage() {
  const [businessId, setBusinessId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('userid');
      if (!userId) return;
      const res = await fetch(`/api/auth/me?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setBusinessId(data.data.businessId);
      }
    };
    fetchUser();
  }, []);

  const widgetCode = `<script>
  window.LFG_CHAT_CONFIG = {
    businessId: "${businessId}",
    position: "right"
  };
</script>
<script src="https://www.leadforgrow.com/chat-widget.js" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    toast.success('Widget code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-600" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Conversational AI</h1>
            <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Lead capture and qualification powered by LFG Chatbot</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Setup Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <Heading level={3} className="text-lg flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-600" />
                  Installation Code
                </Heading>
                <p className="text-sm text-slate-500 mt-1">
                  Copy and paste this code into your website's <code>&lt;head&gt;</code> or before the <code>&lt;/body&gt;</code> tag.
                </p>
              </div>
              <div className="p-6 bg-slate-900 relative group">
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre className="text-sm text-indigo-300 font-mono overflow-x-auto">
                  {widgetCode}
                </pre>
              </div>
              <div className="p-6 bg-indigo-50 border-t border-indigo-100">
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900">Works with any website</h4>
                    <p className="text-xs text-indigo-700 mt-1">
                      Compatible with WordPress, Shopify, Webflow, React, HTML, and more.
                      Your leads will automatically appear in your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <Heading level={3} className="text-lg mb-6">How it works</Heading>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-600 text-sm">01</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Identity Capture</h4>
                    <p className="text-xs text-slate-500 mt-1">The bot asks for Name, Email, and Phone one by one to ensure maximum completion rate.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-purple-600 text-sm">02</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Contextual Questions</h4>
                    <p className="text-xs text-slate-500 mt-1">It gathers specific project details (Interest, Budget, Timeline) through a natural conversation.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-emerald-600 text-sm">03</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Lead Tagging</h4>
                    <p className="text-xs text-slate-500 mt-1">Automatically classifies leads into 'Technical' or 'Sales' support based on user choice.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
              <Sparkles className="w-8 h-8 mb-4 text-indigo-200" />
              <Heading level={3} className="text-lg mb-2 !text-white">Lead Intelligence</Heading>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Bot-captured leads include the full transcript and metadata. You can view all user responses directly in the lead detail page under "Chatbot Interaction".
              </p>
              <button
                onClick={() => window.location.href = '/automation/leads'}
                className="mt-6 w-full py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors"
              >
                View Bot Leads
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Live Preview
              </p>
              <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative min-h-[500px]">
                <Chatbot isPreview={true} businessId={businessId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
