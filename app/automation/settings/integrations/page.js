'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, ChevronLeft, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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
      apiKey: '',
      phoneNumberId: ''
    }
  });

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-3xl font-black text-slate-900">Integrations</h1>
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
        {/* Email Integration */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 italic">Email Automation (SMTP)</h2>
              <p className="text-sm text-slate-500">Connect your custom business mail to send automated responses.</p>
              
              {/* Titan Sync Helper */}
              {integrations.email.enabled && (
                <button 
                  onClick={() => {
                    const domain = 'leadforgrow.online';
                    setIntegrations({
                      ...integrations,
                      email: {
                        ...integrations.email,
                        host: 'smtp.titan.email',
                        port: 465,
                        username: `sales@${domain}`,
                        fromEmail: `sales@${domain}`,
                        fromName: 'LeadForGrow'
                      }
                    });
                    toast.success('Settings synced to leadforgrow.online');
                  }}
                  className="mt-2 text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-wider hover:bg-blue-100 transition-all"
                >
                  ⚡ One-Click Sync: leadforgrow.online
                </button>
              )}
            </div>
            <div className="ml-auto">
              <button 
                onClick={() => setIntegrations({...integrations, email: { ...integrations.email, enabled: !integrations.email.enabled }})}
                className={`w-16 h-8 rounded-full transition-all relative ${integrations.email.enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${integrations.email.enabled ? 'translate-x-9' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>

          {integrations.email.enabled && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">SMTP Host</label>
                    <input 
                      type="text" 
                      placeholder="e.g. smtp.titan.email"
                      value={integrations.email.host}
                      onChange={(e) => setIntegrations({...integrations, email: {...integrations.email, host: e.target.value}})}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Username / Email</label>
                    <input 
                    type="text" 
                    placeholder="sales@yourdomain.com"
                    value={integrations.email.username}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIntegrations({
                        ...integrations, 
                        email: {
                          ...integrations.email, 
                          username: val,
                          fromEmail: val // Auto-sync to prevent domain mismatch
                        }
                      });
                    }}
                    className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold"
                  />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={integrations.email.password}
                      onChange={(e) => setIntegrations({...integrations, email: {...integrations.email, password: e.target.value}})}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2">Port</label>
                      <input 
                        type="number" 
                        placeholder="465"
                        value={integrations.email.port}
                        onChange={(e) => setIntegrations({...integrations, email: {...integrations.email, port: parseInt(e.target.value)}})}
                        className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 mb-2">Encryption</label>
                      <div className="p-4 bg-slate-50 rounded-xl text-slate-500 font-bold text-sm">
                        {integrations.email.port === 465 ? 'SSL/TLS' : 'STARTTLS'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">From Email (Display)</label>
                    <input 
                      type="text" 
                      placeholder="sales@yourdomain.com"
                      value={integrations.email.fromEmail}
                      onChange={(e) => setIntegrations({...integrations, email: {...integrations.email, fromEmail: e.target.value}})}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 mb-2">From Name (Display)</label>
                    <input 
                      type="text" 
                      placeholder="Your Company Name"
                      value={integrations.email.fromName}
                      onChange={(e) => setIntegrations({...integrations, email: {...integrations.email, fromName: e.target.value}})}
                      className="w-full bg-slate-50 border-0 rounded-xl p-4 text-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>Verify your settings before saving</span>
                </div>
                <button
                  onClick={async () => {
                    const tid = toast.loading('Testing connection...');
                    try {
                      const userId = localStorage.getItem('userid');
                      const res = await fetch(`/api/business/settings/test-email?userId=${userId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(integrations.email)
                      });
                      const data = await res.json();
                      if (data.success) {
                        toast.success(data.message, { id: tid });
                      } else {
                        toast.error(data.error || 'Connection failed', { id: tid });
                      }
                    } catch (e) {
                      toast.error('Could not reach server', { id: tid });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Test Connection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Titan Performance & Troubleshooting Guide */}
        {integrations.email.enabled && (
          <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <RefreshCw className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold italic">Titan Mail Help Checklist</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-indigo-400 shrink-0">1</div>
                    <p className="text-sm text-slate-300">
                      <strong className="text-white">Enable SMTP Access:</strong> Log in to <a href="https://webmail.titan.email" target="_blank" className="text-indigo-400 underline">Titan Webmail</a>, 
                      go to <strong className="text-white italic">Settings &gt; Mailbox &gt; Advanced</strong> and ensure "IMAP/SMTP Access" is <strong>ON</strong>.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-indigo-400 shrink-0">2</div>
                    <p className="text-sm text-slate-300">
                      <strong className="text-white">No HiddenSpaces:</strong> Copy-pasting often adds a "blank space" at the end. 
                      Delete the password and <strong>type it manually</strong>.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-indigo-400 shrink-0">3</div>
                    <p className="text-sm text-slate-300">
                      <strong className="text-white">Domain Match:</strong> Ensure the <strong className="text-white italic">Username</strong> and 
                      <strong className="text-white italic">From Email</strong> are exactly the same (leadforgrow.online).
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-indigo-400 shrink-0">4</div>
                    <p className="text-sm text-slate-300">
                      <strong className="text-white">Port Swap:</strong> If Port 465 fails, try changing it to <strong className="text-white text-lg">587</strong> and 
                      click Test Connection again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Integration */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">WhatsApp Business API</h2>
              <p className="text-sm text-slate-500">Connect to the official Meta WhatsApp API for fully automated messaging.</p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-emerald-800 font-bold mb-1">Semi-Automated Enabled by Default</p>
              <p className="text-xs text-emerald-700 leading-relaxed">
                You can already use WhatsApp templates manually from the Lead Detail page. 
                Configure the API below only if you want <strong>fully hands-off</strong> automation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
