'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, ChevronLeft, Save, CheckCircle2, AlertCircle, RefreshCw, Globe, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

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
    },
    facebookAds: {
      enabled: false,
      pageId: '',
      accessToken: '',
      verifyToken: ''
    }
  });
  const [userPlan, setUserPlan] = useState('free');
  const [currentBusiness, setCurrentBusiness] = useState({ businessId: '', businessName: '' });
  const [copied, setCopied] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [selectedTestTemplate, setSelectedTestTemplate] = useState('');



  useEffect(() => {
    fetchIntegrations();
    fetchCurrentBusiness();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/templates?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.manual) {
        const metaTemplates = data.manual.filter(t => t.isMetaTemplate);
        setAvailableTemplates(metaTemplates);
        if (metaTemplates.length > 0) setSelectedTestTemplate(metaTemplates[0].name);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchCurrentBusiness = async () => {
    try {
      const res = await fetch('/api/business/current');
      const data = await res.json();
      if (data.success) {
        setCurrentBusiness({
          businessId: data.businessId,
          businessName: data.businessName
        });
      }
    } catch (error) {
      console.error('Error fetching business context:', error);
    }
  };


  const fetchIntegrations = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/business/settings?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.data.integrationCredentials) {
        setIntegrations({
          email: { ...integrations.email, ...data.data.integrationCredentials.email },
          whatsapp: { ...integrations.whatsapp, ...data.data.integrationCredentials.whatsapp },
          facebookAds: { ...integrations.facebookAds, ...data.data.integrationCredentials.facebookAds }
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
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors mr-1"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Globe className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Integrations Hub</h1>
            <p className="text-base text-slate-500 font-medium">Configure credentials for external communication channels</p>
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
              <h3 className="text-2xl font-bold text-slate-900">Hostinger Business Mail</h3>
              <p className="text-base text-slate-500 font-medium">Power your lead recovery with Hostinger and Resend API.</p>
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
                <div className="flex items-center gap-3 mb-6 text-slate-900">
                  <RefreshCw className="w-6 h-6 text-indigo-500" />
                  <h4 className="text-xl font-bold">How to connect Hostinger Mail</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-widest">Step 1: Get Details</p>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">
                      Log in to your <strong>Hostinger hPanel</strong>, go to <span className="italic">Emails &gt; Business Mail</span> and note your email address.
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-widest">Step 2: Connect</p>
                    <p className="text-base text-slate-600 leading-relaxed font-medium">
                      Enter your Hostinger email below. Our system will use <strong>Resend API</strong> to bridge your communications.
                    </p>
                  </div>
                </div>
              </div>

              {/* Configuration Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Primary Mailbox (Login)</label>
                    <input
                      type="text"
                      placeholder="primary@yourcompany.com"
                      value={integrations.email.username}
                      onChange={(e) => setIntegrations({ ...integrations, email: { ...integrations.email, username: e.target.value } })}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                    <p className="text-xs text-slate-400 mt-2 uppercase font-bold tracking-widest">Use your main Hostinger account email here.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Sender Alias (Optional)</label>
                    <input
                      type="text"
                      placeholder="alias@yourcompany.com"
                      value={integrations.email.fromEmail}
                      onChange={(e) => setIntegrations({ ...integrations, email: { ...integrations.email, fromEmail: e.target.value } })}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 text-black"
                    />
                    <p className="text-xs text-slate-400 mt-2 uppercase font-bold tracking-widest">If you want to send from an alias, enter it here.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Hostinger Password</label>
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
                <div className="bg-indigo-50/50 rounded-2xl p-6 flex flex-col justify-center border border-indigo-100/50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                    <span className="text-lg font-bold text-slate-900">Security Validation</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
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
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-slate-900">WhatsApp Business Integration</h3>
                {integrations.whatsapp.enabled && integrations.whatsapp.apiKey ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5" /> Setup Required
                  </span>
                )}
              </div>
              <p className="text-base text-slate-500 font-medium">Connect your Meta WhatsApp API or Interakt for full automation.</p>
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

              {integrations.whatsapp.provider === 'meta' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* Meta Setup Guide - NEW */}
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 text-slate-900">
                      <RefreshCw className="w-6 h-6 text-emerald-500" />
                      <h4 className="text-xl font-bold">Meta Developer Portal Setup</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-2 tracking-widest">Step 1: Webhook</p>
                        <p className="text-base text-slate-600 leading-relaxed font-bold">
                          In Meta Dashboard, go to <span className="text-emerald-600 font-bold">WhatsApp &gt; Configuration</span>. Click Edit on Callback URL.
                        </p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-2 tracking-widest">Step 2: Token</p>
                        <p className="text-base text-slate-600 leading-relaxed font-bold">
                          Enter the <span className="text-emerald-600 font-bold">Verify Token</span> you set below and our Callback URL.
                        </p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-2 tracking-widest">Step 3: Fields</p>
                        <p className="text-base text-slate-600 leading-relaxed font-bold">
                          Under Webhook Fields, click <span className="font-bold">Manage</span> and subscribe to <span className="text-emerald-600 font-bold">messages</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Meta API Key (Permanent Access Token)</label>
                        <input
                          type="password"
                          placeholder="EAAG..."
                          value={integrations.whatsapp.apiKey}
                          onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, apiKey: e.target.value } })}
                          className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Phone Number ID</label>
                        <input
                          type="text"
                          placeholder="1029384..."
                          value={integrations.whatsapp.phoneNumberId}
                          onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, phoneNumberId: e.target.value } })}
                          className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">WhatsApp Business Account ID</label>
                        <input
                          type="text"
                          placeholder="1234567..."
                          value={integrations.whatsapp.businessAccountId}
                          onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, businessAccountId: e.target.value } })}
                          className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">App Secret</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={integrations.whatsapp.appSecret}
                          onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, appSecret: e.target.value } })}
                          className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Webhook Verify Token</label>
                        <input
                          type="text"
                          placeholder="lfg_secure_token"
                          value={integrations.whatsapp.verifyToken}
                          onChange={(e) => setIntegrations({ ...integrations, whatsapp: { ...integrations.whatsapp, verifyToken: e.target.value } })}
                          className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 text-black shadow-inner"
                        />
                        <p className="text-xs text-slate-400 mt-2 uppercase font-bold tracking-widest">Create a secure string here and paste it in Meta Dashboard Step 2.</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 shadow-sm">
                        <p className="text-sm text-indigo-900 font-bold mb-3 uppercase tracking-widest">💡 Quick Links</p>
                        <a
                          href="https://developers.facebook.com/apps"
                          target="_blank"
                          className="text-sm text-indigo-600 font-bold uppercase tracking-widest hover:underline flex items-center gap-2"
                        >
                          Meta Developer Dashboard <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="bg-white border-2 border-emerald-100 rounded-3xl p-8 shadow-xl shadow-emerald-50/50 relative overflow-hidden group hover:border-emerald-200 transition-all">
                        <div className="absolute top-0 right-0 p-2 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-4 rounded-bl-2xl">Your Unique Endpoint</div>
                        <label className="block text-xs font-bold text-emerald-600 uppercase mb-4 tracking-widest">Meta Callback URL</label>
                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 group-hover:border-emerald-100 transition-all">
                          <code className="flex-1 bg-transparent px-4 py-3 text-base font-mono text-slate-800 break-all">
                            https://leadforgrow.com/api/webhooks/meta/{currentBusiness.businessId || 'loading...'}
                          </code>
                          <button
                            onClick={() => {
                              const url = `https://leadforgrow.com/api/webhooks/meta/${currentBusiness.businessId}`;
                              navigator.clipboard.writeText(url);
                              setCopied(true);
                              toast.success('Webhook URL copied!');
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100 flex items-center gap-2"
                          >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            <span className="text-xs font-bold uppercase">{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="mt-4 text-xs text-slate-400 font-bold uppercase tracking-widest">Paste this URL into Meta Dashboard &gt; Configuration &gt; Callback URL.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {integrations.whatsapp.provider === 'interakt' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
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

              {/* NEW: Real Message Test Tool */}
              <div className="pt-6 border-t border-slate-100">
                <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><MessageCircle className="w-24 h-24" /></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold uppercase tracking-wider">Delivery Test Tool</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-4 uppercase font-bold tracking-widest">Send a real WhatsApp to verify end-to-end delivery</p>

                    <div className="flex flex-col md:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Mobile with country code (e.g. 919876543210)"
                        id="test-phone-input"
                        className="flex-1 bg-white/10 border-0 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500 text-white"
                      />
                      <select
                        value={selectedTestTemplate}
                        onChange={(e) => setSelectedTestTemplate(e.target.value)}
                        className="bg-white/10 border-0 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 text-white min-w-[200px] outline-none"
                      >
                        <option value="" className="text-slate-900">-- Select Template --</option>
                        {availableTemplates.map(t => (
                          <option key={t.id} value={t.name} className="text-slate-900">{t.name}</option>
                        ))}
                        <option value="hello_world" className="text-slate-900">hello_world (Default)</option>
                      </select>
                      <button
                        onClick={async () => {
                          const phone = document.getElementById('test-phone-input').value;
                          if (!phone) return toast.error('Enter a phone number first');

                          const tid = toast.loading('Sending real test message...');
                          try {
                            const userId = localStorage.getItem('userid');
                            const res = await fetch(`/api/business/settings/test-whatsapp?userId=${userId}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                whatsappSettings: integrations.whatsapp,
                                testPhone: phone,
                                testTemplate: selectedTestTemplate
                              })
                            });
                            const data = await res.json();
                            if (data.success) {
                              toast.success(data.message, { id: tid });
                            } else {
                              toast.error(data.error || 'Test failed', { id: tid });
                              if (data.details) console.error('Test Error Details:', data.details);
                            }
                          } catch (e) {
                            toast.error('Could not reach server', { id: tid });
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        Send Test WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Meta Lead Ads Integration */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Globe className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-slate-900">Meta Lead Ads</h3>
                {integrations.facebookAds?.enabled && integrations.facebookAds?.accessToken ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5" /> Setup Required
                  </span>
                )}
              </div>
              <p className="text-base text-slate-500 font-medium">Sync leads directly from your Facebook and Instagram Lead Forms.</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setIntegrations({ ...integrations, facebookAds: { ...integrations.facebookAds, enabled: !integrations.facebookAds.enabled } })}
                className={`w-16 h-8 rounded-full transition-all relative ${integrations.facebookAds?.enabled ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${integrations.facebookAds?.enabled ? 'translate-x-9' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>

          {integrations.facebookAds?.enabled && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-6 text-slate-900">
                  <RefreshCw className="w-6 h-6 text-blue-500" />
                  <h4 className="text-xl font-bold">Meta Ads Webhook Setup</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-widest">Step 1: App Setup</p>
                    <p className="text-base text-slate-600 leading-relaxed font-bold">
                      Create a Meta App and add <span className="text-blue-600">Webhooks</span> product. Select <span className="font-bold">Page</span> as the object.
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-widest">Step 2: Connect</p>
                    <p className="text-base text-slate-600 leading-relaxed font-bold">
                      Enter the <span className="text-blue-600 font-bold">Verify Token</span> below and our Callback URL in Meta Dashboard.
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-widest">Step 3: Fields</p>
                    <p className="text-base text-slate-600 leading-relaxed font-bold">
                      Subscribe to the <span className="text-blue-600 font-bold">leadgen</span> field in the Page webhook settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Page Access Token</label>
                    <input
                      type="password"
                      placeholder="EAAG..."
                      value={integrations.facebookAds.accessToken}
                      onChange={(e) => setIntegrations({ ...integrations, facebookAds: { ...integrations.facebookAds, accessToken: e.target.value } })}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Page ID</label>
                    <input
                      type="text"
                      placeholder="1029384..."
                      value={integrations.facebookAds.pageId}
                      onChange={(e) => setIntegrations({ ...integrations, facebookAds: { ...integrations.facebookAds, pageId: e.target.value } })}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-widest">Webhook Verify Token</label>
                    <input
                      type="text"
                      placeholder="lfg_ads_secure"
                      value={integrations.facebookAds.verifyToken}
                      onChange={(e) => setIntegrations({ ...integrations, facebookAds: { ...integrations.facebookAds, verifyToken: e.target.value } })}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 text-black shadow-inner"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white border-2 border-blue-100 rounded-3xl p-8 shadow-xl shadow-blue-50/50 relative overflow-hidden group hover:border-blue-200 transition-all">
                    <div className="absolute top-0 right-0 p-2 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest px-4 rounded-bl-2xl">Ads Endpoint</div>
                    <label className="block text-xs font-bold text-blue-600 uppercase mb-4 tracking-widest">Meta Callback URL</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 group-hover:border-blue-100 transition-all">
                      <code className="flex-1 bg-transparent px-4 py-3 text-base font-mono text-slate-800 break-all">
                        https://leadforgrow.com/api/webhooks/meta/{currentBusiness.businessId}
                      </code>
                      <button
                        onClick={() => {
                          const url = `https://leadforgrow.com/api/webhooks/meta/${currentBusiness.businessId}`;
                          navigator.clipboard.writeText(url);
                          toast.success('Webhook URL copied!');
                        }}
                        className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 flex items-center gap-2"
                      >
                        <Copy className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase">Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" />
                  <span>Verify token handshake in Meta Dashboard</span>
                </div>
                <button
                  onClick={async () => {
                    const tid = toast.loading('Testing Ads integration status...');
                    // Add a test endpoint if needed, but for now we'll just check if fields are filled
                    setTimeout(() => {
                      if (integrations.facebookAds.accessToken && integrations.facebookAds.pageId) {
                        toast.success('Ads configuration ready for Meta verification!', { id: tid });
                      } else {
                        toast.error('Please fill in all Ads credentials', { id: tid });
                      }
                    }, 1000);
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  Verify Setup Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
