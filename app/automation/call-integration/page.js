'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  PhoneCall, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Settings, 
  AlertCircle,
  Clock,
  CheckCircle2,
  BarChart,
  Link as LinkIcon,
  RefreshCcw,
  Play
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CallIntegrationPage() {
  const [usage, setUsage] = useState({
    callbacksUsed: 0,
    maxCallbacks: 50,
    secondsUsed: 0,
    maxSeconds: 3000,
    limitReached: false,
    connectedPhone: ''
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState({
    enabled: true,
    voiceId: 'en-US-Neural2-F',
    recordCalls: false,
    greetingMessage: 'Hello, I am the AI assistant.',
    enableSmsFollowup: true,
    telephony: {
      provider: 'vapi',
      apiKey: '',
      assistantId: '',
      phoneNumberId: ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [validationCode, setValidationCode] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const fetchUsage = useCallback(async () => {
    try {
      let bId = localStorage.getItem('businessId');
      const uId = localStorage.getItem('userid');

      if (!bId && uId) {
        const authRes = await fetch(`/api/auth/me?userId=${uId}`);
        const authData = await authRes.json();
        if (authData.success) {
          bId = authData.data.businessId;
          localStorage.setItem('businessId', bId); // Cache it
        }
      }

      if (!bId) return;

      const res = await fetch(`/api/automation/call-integration?businessId=${bId}`);
      const result = await res.json();
      
      if (result.success && result.data) {
        setUsage(prev => ({
          ...prev,
          ...result.data,
          maxCallbacks: 50,
          maxSeconds: 3000
        }));
        if (result.data.connectedPhone) {
          setPhoneInput(result.data.connectedPhone);
        }
        if (result.data.settings) {
          setSettings(result.data.settings);
        }
        if (result.data.quotas) {
          setUsage(prev => ({
            ...prev,
            maxCallbacks: result.data.quotas.maxCallbacks || 50,
            maxSeconds: result.data.quotas.maxCallSeconds || 3000
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!phoneInput) return toast.error('Please enter a phone number');

    setConnecting(true);
    try {
      let bId = localStorage.getItem('businessId');
      if (!bId) {
        const uId = localStorage.getItem('userid');
        const authRes = await fetch(`/api/auth/me?userId=${uId}`);
        const authData = await authRes.json();
        if (authData.success) bId = authData.data.businessId;
      }

      if (!bId) throw new Error('Business session not found');

      const res = await fetch('/api/automation/call-integration', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: bId, phone: phoneInput })
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success('Phone connected successfully');
        setUsage(prev => ({ ...prev, connectedPhone: phoneInput }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to connect phone');
    } finally {
      setConnecting(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const bId = localStorage.getItem('businessId');
      const res = await fetch('/api/automation/call-integration', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: bId, settings })
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Settings saved successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!testNumber) {
      toast.error('Enter the number you want to verify');
      return;
    }

    setVerifying(true);
    const toastId = toast.loading('Initiating verification call...');
    
    try {
      const businessId = localStorage.getItem('businessId');
      const res = await fetch('/api/automation/call-integration/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, phoneNumber: testNumber })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.alreadyVerified) {
          toast.success(data.message, { id: toastId });
          setValidationCode(null);
        } else {
          toast.success('Call triggered! See the code below.', { id: toastId });
          setValidationCode(data.validationCode);
        }
      } else {
        toast.error(data.error || 'Verification failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to trigger verification', { id: toastId });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const callbackPercentage = Math.min((usage.callbacksUsed / usage.maxCallbacks) * 100, 100);
  const secondsPercentage = Math.min((usage.secondsUsed / usage.maxSeconds) * 100, 100);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <h1 className="text-3xl font-black text-slate-900">AI Call Automation</h1>
             {usage.connectedPhone ? (
               <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                 Live
               </span>
             ) : (
               <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                 Setup Required
               </span>
             )}
          </div>
          <p className="text-slate-500">Intelligent missed call recovery with AI-powered callbacks.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchUsage}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            AI Integration Active
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Configuration
        </button>
      </div>

      {activeTab === 'overview' ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Status & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Connection Card */}
          <div className="bg-white rounded-[32px] border-2 border-slate-100 p-8 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <PhoneCall className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Telephony Connection</h2>
                  <p className="text-sm text-slate-500">Connect your business number to start recovering leads.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleConnect} className="relative z-10">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Enter your business mobile number (e.g. +1234567890)"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                  />
                  {usage.connectedPhone && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      CONNECTED
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={connecting}
                  className="px-8 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100 whitespace-nowrap"
                >
                  {connecting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5" />
                      {usage.connectedPhone ? 'Update Line' : 'Connect Line'}
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-indigo-100 transition-colors">
                <Zap className="w-5 h-5 text-indigo-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Instant Detection</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Missed calls are captured in real-time from your telephony provider.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-indigo-100 transition-colors">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Safety Constraints</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Strict 60s hard-cap and no record mode enabled for compliance.</p>
              </div>
            </div>

            {/* Subtle background pattern */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
          </div>

          {/* Workflow Visualization & Simulation */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Live Automation Flow
                </h2>
                
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={testNumber}
                        onChange={(e) => setTestNumber(e.target.value)}
                        placeholder="Your Number (e.g. +91...)"
                        className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none focus:border-indigo-500 w-40"
                      />
                      {usage.connectedPhone ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={async () => {
                            if (!testNumber) {
                              toast.error('Enter a test number first');
                              return;
                            }
                            const toastId = toast.loading(`Placing real test call to ${testNumber}...`);
                            try {
                              const businessId = localStorage.getItem('businessId');
                              const res = await fetch('/api/automation/call-integration/test', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                  businessId, 
                                  testNumber
                                })
                              });
                              const data = await res.json();
                              
                              if (res.ok) {
                                toast.success('Test call initiated successfully!', { id: toastId });
                                fetchUsage(); // Refresh
                              } else {
                                toast.error(data.error || 'Test call failed', { id: toastId });
                              }
                            } catch (err) {
                              toast.error('Failed to trigger test call', { id: toastId });
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/50"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Test Call
                        </button>
                        
                        {settings.telephony?.provider === 'twilio' && (
                          <button 
                            onClick={handleVerifyPhone}
                            disabled={verifying}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Verify Number
                          </button>
                        )}
                      </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Connect phone first</span>
                      )}
                    </div>
                    
                    {validationCode && (
                      <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg animate-pulse">
                            !
                          </div>
                          <div>
                            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Validation Code</p>
                            <p className="text-2xl font-black tracking-[0.2em] text-white leading-none">{validationCode}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setValidationCode(null)}
                          className="text-xs text-indigo-300 hover:text-white underline font-bold"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
              </div>

              <div className="flex items-center justify-between gap-4 mb-10">
                {[
                  { label: 'Missed', icon: Clock },
                  { label: 'AI Callback', icon: Zap },
                  { label: 'Extract', icon: Activity },
                  { label: 'New Lead', icon: CheckCircle2 }
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 flex-1 text-center relative">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-indigo-600 transition-all duration-300">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{step.label}</span>
                    {i < 3 && <div className="absolute top-6 left-[70%] w-[60%] h-[2px] bg-slate-800 hidden sm:block"></div>}
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                <a href="/automation/leads" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold text-slate-300 hover:text-white">
                  <CheckCircle2 className="w-4 h-4" />
                  View Generated Leads
                </a>
                <a href="/automation/reports" className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-bold text-slate-300 hover:text-white">
                  <BarChart className="w-4 h-4" />
                  View Activity Logs
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Usage & Limits */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] border-2 border-slate-100 p-8">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-indigo-600" />
              Usage Limits
            </h2>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-bold text-slate-900">Total Callbacks</span>
                  <span className="text-xs font-black text-indigo-600">{usage.callbacksUsed} / {usage.maxCallbacks}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${usage.callbacksUsed > usage.maxCallbacks * 0.8 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                    style={{ width: `${callbackPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-bold text-slate-900">AI Compute Time</span>
                  <span className="text-xs font-black text-indigo-600">{Math.round(usage.secondsUsed / 60)}m / {usage.maxSeconds / 60}m</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${usage.secondsUsed > usage.maxSeconds * 0.8 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                    style={{ width: `${secondsPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>



            <div className="mt-10 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                {usage.limitReached 
                  ? "Your monthly limit has been reached. Service is paused until the next billing cycle."
                  : "When limits are reached, the service will pause automatically to avoid overages. Upgrade for higher capacity."
                }
              </p>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[32px] p-6 text-white text-center">
             <h3 className="font-bold mb-2">Need a higher limit?</h3>
             <p className="text-xs text-indigo-100 mb-4 opacity-80">Contact sales for Enterprise plans with unlimited AI callbacks.</p>
             <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-sm hover:scale-[1.02] transition-transform">
               Upgrade Plan
             </button>
          </div>
        </div>
      </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 max-w-3xl">
          <div className="bg-white rounded-[32px] border-2 border-slate-100 p-8">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Settings className="w-6 h-6 text-indigo-600" />
              AI Agent Configuration
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              {/* General Toggle */}
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900">Enable AI Automation</h3>
                  <p className="text-sm text-slate-500 mt-1">Master switch for all incoming missed call handling.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.enabled} 
                    onChange={e => setSettings({...settings, enabled: e.target.checked})} 
                    className="sr-only peer" 
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Greeting */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Greeting Message</label>
                <textarea 
                  value={settings.greetingMessage}
                  onChange={e => setSettings({...settings, greetingMessage: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900 resize-none h-32"
                  placeholder="Hello, I am the AI assistant for..."
                />
                <p className="text-xs text-slate-500 mt-2 ml-2">Tip: Keep it short and friendly. Use {'{{businessName}}'} as a placeholder.</p>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">AI Voice Persona</label>
                <div className="grid grid-cols-2 gap-4">
                  {['en-US-Neural2-F', 'en-US-Neural2-M', 'en-GB-Neural2-A', 'en-AU-Neural2-B'].map((voice) => (
                    <div 
                      key={voice}
                      onClick={() => setSettings({...settings, voiceId: voice})}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${settings.voiceId === voice ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-100'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${settings.voiceId === voice ? 'border-indigo-600' : 'border-slate-300'}`}>
                        {settings.voiceId === voice && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{voice.split('-')[1]} ({voice.slice(-1)})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recording Toggle */}
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-slate-900">Record Calls</h3>
                   <p className="text-xs text-slate-500 mt-1">Save audio for quality assurance.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.recordCalls} 
                    onChange={e => setSettings({...settings, recordCalls: e.target.checked})} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Secure Credentials Section */}
              <div className="pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Provider Credentials (Vapi.ai / Twilio)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provider</label>
                    <select 
                      value={settings.telephony?.provider || 'vapi'}
                      onChange={e => setSettings({...settings, telephony: {...settings.telephony, provider: e.target.value}})}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold text-slate-900"
                    >
                      <option value="vapi">Vapi.ai (Recommended)</option>
                      <option value="twilio">Twilio Voice</option>
                      <option value="retell">Retell AI</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      {settings.telephony?.provider === 'twilio' ? 'Auth Token (Secure)' : 'API Key (Secure)'}
                    </label>
                    <input 
                      type="password"
                      value={settings.telephony?.apiKey || ''}
                      onChange={e => setSettings({...settings, telephony: {...settings.telephony, apiKey: e.target.value}})}
                      placeholder={settings.telephony?.provider === 'twilio' ? "Token..." : "sk-..."}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        {settings.telephony?.provider === 'twilio' ? 'Account SID' : 'Assistant ID'}
                      </label>
                      <input 
                        type="text"
                        value={settings.telephony?.assistantId || ''}
                        onChange={e => setSettings({...settings, telephony: {...settings.telephony, assistantId: e.target.value}})}
                        placeholder={settings.telephony?.provider === 'twilio' ? "AC..." : "UUID..."}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                         {settings.telephony?.provider === 'twilio' ? 'Twilio Phone Number' : 'Phone Number ID'}
                      </label>
                      <input 
                        type="text"
                        value={settings.telephony?.phoneNumberId || ''}
                        onChange={e => setSettings({...settings, telephony: {...settings.telephony, phoneNumberId: e.target.value}})}
                        placeholder={settings.telephony?.provider === 'twilio' ? "+1..." : "UUID..."}
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
  );
}



