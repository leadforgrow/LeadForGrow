'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, ChevronLeft, Save, CheckCircle2, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/ui/Heading';

export default function IntegrationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [integrations, setIntegrations] = useState({
    email: {
      enabled: false,
      provider: 'smtp',
      host: '',
      port: 465,
      username: '',
      password: '',
      fromEmail: '',
      fromName: ''
    },
    whatsapp: {
      enabled: false,
      provider: 'meta',
      apiKey: '',
      interaktApiKey: '',
      phoneNumberId: '',
      businessAccountId: '',
      appSecret: '',
      verifyToken: ''
    }
  });
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/business/settings?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.data.integrationCredentials) {
        setIntegrations({
          email: { ...integrations.email, ...data.data.integrationCredentials.email },
          whatsapp: { ...integrations.whatsapp, ...data.data.integrationCredentials.whatsapp }
        });
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load integrations');
      setLoading(false);
    }
  };

  useEffect(() => {
    const plan = localStorage.getItem('userPlan') || 'free';
    setUserPlan(plan);
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/business/settings?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          userId,
          integrationCredentials: integrations
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Integrations updated successfully');
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors mr-1"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Integrations Hub</h1>
            <p className="text-xs text-slate-500 font-medium">Configure credentials for external communication channels</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="space-y-8">
        {/* Email Integration - Hostinger & Resend Focused */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <Heading level={3} className="text-xl italic">Hostinger Business Mail</Heading>
              <p className="text-sm text-slate-500 font-medium">Power your lead recovery with Hostinger and Resend API.</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setIntegrations({ ...integrations, email: { ...integrations.email, enabled: !integrations.email.enabled } })}
                className={`w-16 h-8 rounded-full transition-all relative ${integrations.email.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${integrations.email.enabled ? 'translate-x-9' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>

          {integrations.email.enabled && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Hostinger Guide Section */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <div className="flex items-center gap-2 mb-4 text-slate-900">
                  <RefreshCw className="w-5 h-5 text-indigo-500" />
                  <Heading level={4} className="text-base">How to connect Hostinger Mail</Heading>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-medium text-slate-400 uppercase mb-2 tracking-widest">Step 1: Get Details</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Log in to your <strong>Hostinger hPanel</strong>, go to <span className="italic">Emails &gt; Business Mail</span> and note your email address.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-medium text-slate-400 uppercase mb-2 tracking-widest">Step 2: Connect</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Enter your Hostinger email below. Our system will use <strong>Resend API</strong> to bridge your communications.
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuration Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">Primary Mailbox (Login)</label>
                    <input
                      type="text"
                      placeholder="primary@yourcompany.com"
                      value={integrations.email.username}
                      onChange={(e) => setIntegrations({ ...integrations, email: { ...integrations.email, username: e.target.value } })}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium tracking-widest">Use your main Hostinger account email here.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">Sender Alias (Optional)</label>
                    <input
                      type="text"
                      placeholder="alias@yourcompany.com"
                      value={integrations.email.fromEmail}
                      onChange={(e) => setIntegrations({ ...integrations, email: { ...integrations.email, fromEmail: e.target.value } })}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium tracking-widest">If you want to send from an alias, enter it here.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">Hostinger Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={integrations.email.password}
                      onChange={(e) => setIntegrations({ ...integrations, email: { ...integrations.email, password: e.target.value } })}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sales Team"
                      value={integrations.email.fromName}
                      onChange={(e) => setIntegrations({ ...integrations, email: { ...integrations.email, fromName: e.target.value } })}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                  </div>
                </div>
                <div className="bg-indigo-50/50 rounded-2xl p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-slate-900">Security Validation</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We validate your Hostinger credentials via SMTP to ensure ownership. Once verified, your mail is bridged through <strong>Resend</strong> for 99.9% deliverability.
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>Enter password to verify connection</span>
                </div>
                <button
                  onClick={async () => {
                    const tid = toast.loading('Validating Hostinger & Sending Test via Resend...');
                    try {
                      const userId = localStorage.getItem('userid');
                      const res = await fetch(`/api/business/settings/test-email?userId=${userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          emailSettings: integrations.email,
                          testRecipient: integrations.email.fromEmail || integrations.email.username
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        toast.success('Test email sent successfully!', { id: tid });
                      } else {
                        toast.error(data.error || 'Verification failed', { id: tid });
                      }
                    } catch (e) {
                      toast.error('Could not reach server', { id: tid });
                    }
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  Test Hostinger Connect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Integration */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <Heading level={3} className="text-xl italic">WhatsApp Business Integration</Heading>
              <p className="text-sm text-slate-500 font-medium">Connect your Meta WhatsApp API or Interakt for full automation.</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, enabled: !integrations.whatsapp.enabled } })}
                className={`w-16 h-8 rounded-full transition-all relative ${integrations.whatsapp.enabled ? 'bg-emerald-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${integrations.whatsapp.enabled ? 'translate-x-9' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>

          {integrations.whatsapp.enabled && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Provider Selection */}
              <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, provider: 'meta' } })}
                  className={`py-3 rounded-xl font-medium transition-all ${integrations.whatsapp.provider === 'meta' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Meta API (Cloud)
                </button>
                <button
                  onClick={() => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, provider: 'interakt' } })}
                  className={`py-3 rounded-xl font-medium transition-all ${integrations.whatsapp.provider === 'interakt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Interakt
                </button>
              </div>

              {integrations.whatsapp.provider === 'meta' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">Meta API Key (Permanent Access Token)</label>
                      <input
                        type="password"
                        placeholder="EAAG..."
                        value={integrations.whatsapp.apiKey}
                        onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, apiKey: e.target.value } })}
                        className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">Phone Number ID</label>
                      <input
                        type="text"
                        placeholder="1029384..."
                        value={integrations.whatsapp.phoneNumberId}
                        onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, phoneNumberId: e.target.value } })}
                        className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">WhatsApp Business Account ID</label>
                      <input
                        type="text"
                        placeholder="1234567..."
                        value={integrations.whatsapp.businessAccountId}
                        onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, businessAccountId: e.target.value } })}
                        className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">App Secret</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={integrations.whatsapp.appSecret}
                        onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, appSecret: e.target.value } })}
                        className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">Webhook Verify Token</label>
                      <input
                        type="text"
                        placeholder="lfg_secure_token"
                        value={integrations.whatsapp.verifyToken}
                        onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, verifyToken: e.target.value } })}
                        className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                      />
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium tracking-widest">Set this same token in Meta Developer Portal Webhook settings.</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl p-6 flex flex-col justify-center">
                    <p className="text-xs text-emerald-800 leading-relaxed mb-4 font-medium uppercase tracking-widest">
                      Using the <strong>Official Meta Cloud API</strong> provides direct connectivity.
                    </p>
                    <ul className="text-xs text-emerald-700 space-y-2 list-disc pl-4 font-medium uppercase tracking-widest">
                      <li>Permanent Access Token required</li>
                      <li>Webhook URL: https://leadforgrow.com/api/webhooks/meta/{typeof window !== 'undefined' ? localStorage.getItem('userid') : ''}</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium uppercase text-slate-400 mb-2 tracking-widest">Interakt API Key</label>
                      <input
                        type="password"
                        placeholder="Enter your Interakt API Key"
                        value={integrations.whatsapp.interaktApiKey}
                        onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, interaktApiKey: e.target.value } })}
                        className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                      />
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium tracking-widest">Found in Settings &gt; Developer Setting in Interakt Dashboard.</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-slate-900">Interakt Verified</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium uppercase tracking-widest">
                      <strong>Interakt</strong> simplifies WhatsApp automation. Enter your API key above to sync your lead follow-up.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" />
                  <span>Verify connection before saving</span>
                </div>
                <button
                  onClick={async () => {
                    const tid = toast.loading(`Validating ${integrations.whatsapp.provider === 'interakt' ? 'Interakt' : 'Meta'} Connection...`);
                    try {
                      const userId = localStorage.getItem('userid');
                      const res = await fetch(`/api/business/settings/test-whatsapp?userId=${userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          whatsappSettings: integrations.whatsapp
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        toast.success('WhatsApp connection verified!', { id: tid });
                      } else {
                        toast.error(data.error || 'Verification failed', { id: tid });
                      }
                    } catch (e) {
                      toast.error('Could not reach server', { id: tid });
                    }
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  Test {integrations.whatsapp.provider === 'interakt' ? 'Interakt' : 'Meta'} Connection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
