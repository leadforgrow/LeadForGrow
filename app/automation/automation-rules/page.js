'use client';

import { useEffect, useState } from 'react';
import { 
  Zap, 
  MessageCircle, 
  Bell, 
  RefreshCw, 
  CheckCircle2, 
  Rocket, 
  Settings, 
  Save, 
  X, 
  ChevronRight,
  Mail,
  Smartphone,
  History,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AutomationRulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Cloudinary Config (Persisted in localStorage for convenience)
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: '',
    uploadPreset: ''
  });

  useEffect(() => {
    // Load saved Cloudinary config
    const saved = localStorage.getItem('lfg_cloudinary');
    if (saved) setCloudinaryConfig(JSON.parse(saved));
  }, []);

  const saveCloudinaryConfig = (key, value) => {
    const newConfig = { ...cloudinaryConfig, [key]: value };
    setCloudinaryConfig(newConfig);
    localStorage.setItem('lfg_cloudinary', JSON.stringify(newConfig));
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const userId = localStorage.getItem('userid');
      if (!userId) {
        toast.error('Please login to continue');
        return;
      }
      const res = await fetch(`/api/automation/automation-rules?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setRules(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to load rules');
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId) => {
    const rule = rules.find(r => r._id === ruleId);
    if (!rule) return;

    const newEnabled = !rule.enabled;
    const userId = localStorage.getItem('userid');

    try {
      setRules(rules.map(r => r._id === ruleId ? { ...r, enabled: newEnabled } : r));

      const res = await fetch(`/api/automation/automation-rules?userId=${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ userId, ruleId, enabled: newEnabled })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(newEnabled ? `${rule.name} activated` : `${rule.name} deactivated`);
    } catch (error) {
      setRules(rules.map(r => r._id === ruleId ? { ...r, enabled: !newEnabled } : r));
      toast.error('Failed to update rule');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setEditForm({
      name: rule.name,
      description: rule.description,
      channel: rule.config?.channel || 'both',
      messageTemplate: rule.config?.messageTemplate || '',
      whatsappTemplate: rule.config?.whatsappTemplate || '',
      whatsappTemplateName: rule.config?.whatsappTemplateName || '',
      whatsappHeaderMedia: rule.config?.whatsappHeaderMedia || '',
      delayHours: rule.config?.delayHours || 0,
      emailSubject: rule.config?.emailSubject || ''
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    const userId = localStorage.getItem('userid');
    try {
      const res = await fetch(`/api/automation/automation-rules?userId=${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ 
          userId, 
          ruleId: editingRule._id,
          name: editForm.name,
          description: editForm.description,
          config: {
            ...editingRule.config,
            channel: editForm.channel,
            messageTemplate: editForm.messageTemplate,
            whatsappTemplate: editForm.whatsappTemplate,
            whatsappTemplateName: editForm.whatsappTemplateName,
            whatsappHeaderMedia: editForm.whatsappHeaderMedia,
            delayHours: editForm.delayHours,
            emailSubject: editForm.emailSubject
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setRules(rules.map(r => r._id === editingRule._id ? data.data : r));
        setEditingRule(null);
        toast.success('Rule updated successfully');
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const getRuleIcon = (type) => {
    const icons = {
      'instant_acknowledgement': MessageCircle,
      'notify_team': Bell,
      'follow_up_reminder': RefreshCw
    };
    return icons[type] || Zap;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* SaaS Premium Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Automation Cloud</h1>
          <p className="text-slate-500">Manage rules that work for your business 24/7.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Cloud Engine Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules Explorer */}
        <div className="lg:col-span-2 space-y-4">
          {rules.map((rule) => {
            const Icon = getRuleIcon(rule.type);
            const isSelected = editingRule?._id === rule._id;
            
            return (
              <div
                key={rule._id}
                className={`group bg-white rounded-[24px] border-2 p-6 transition-all hover:shadow-xl ${
                  isSelected ? 'border-indigo-600' : 'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      rule.enabled ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {rule.name}
                        {rule.executionCount > 0 && (
                          <span className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {rule.executionCount} Runs
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{rule.description}</p>
                      
                      {/* Configuration Preview */}
                      {rule.enabled && (
                        <div className="flex items-center gap-4 mt-4 text-xs font-medium">
                          {rule.config?.channel && (
                            <span className="flex items-center gap-1.5 text-indigo-600">
                              {rule.config.channel === 'email' ? <Mail className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                              {rule.config.channel.toUpperCase()}
                            </span>
                          )}
                          <span className="text-slate-400">•</span>
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <History className="w-3.5 h-3.5" />
                            {!rule.config?.delayHours || rule.config.delayHours === 0 ? 'Instant' : `${rule.config.delayHours}h Delay`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-indigo-600"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleRule(rule._id)}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        rule.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          rule.enabled ? 'translate-x-8' : 'translate-x-1'
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Property Panel (Editor) */}
        <div className="lg:col-span-1">
          {editingRule ? (
            <div className="bg-white rounded-[32px] border-2 border-slate-100 p-8 sticky top-8 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900">Configure Rule</h2>
                <button 
                  onClick={() => setEditingRule(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Response Channel</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['email', 'whatsapp', 'both'].map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setEditForm({ ...editForm, channel: ch })}
                        className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                          editForm.channel === ch 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                            : 'border-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {ch.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {['email', 'both'].includes(editForm.channel) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Subject</label>
                    <input
                      type="text"
                      value={editForm.emailSubject}
                      onChange={(e) => setEditForm({ ...editForm, emailSubject: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl outline-none transition-all font-medium text-slate-900"
                      placeholder="e.g. Thanks for reaching out!"
                    />
                  </div>
                )}

                {['email', 'both'].includes(editForm.channel) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Template</label>
                    <textarea
                      rows={4}
                      value={editForm.messageTemplate}
                      onChange={(e) => setEditForm({ ...editForm, messageTemplate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl outline-none transition-all font-medium text-slate-900 resize-none"
                      placeholder="Use {{name}} for dynamic names..."
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['name', 'serviceInterest', 'phone'].map(tag => (
                        <button 
                          key={tag}
                          onClick={() => setEditForm({ ...editForm, messageTemplate: editForm.messageTemplate + ` {{${tag}}}` })}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {['whatsapp', 'both'].includes(editForm.channel) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MessageCircle className="w-3 h-3 text-emerald-500" />
                      WhatsApp Message
                    </label>
                    <textarea
                      rows={4}
                      value={editForm.whatsappTemplate}
                      onChange={(e) => setEditForm({ ...editForm, whatsappTemplate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-medium text-slate-900 resize-none"
                      placeholder="Enter WhatsApp message..."
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['name', 'serviceInterest', 'phone'].map(tag => (
                        <button 
                          key={tag}
                          onClick={() => setEditForm({ ...editForm, whatsappTemplate: (editForm.whatsappTemplate || '') + ` {{${tag}}}` })}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">Template Name (Optional)</label>
                    <input
                      type="text"
                      value={editForm.whatsappTemplateName}
                      onChange={(e) => setEditForm({ ...editForm, whatsappTemplateName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-medium text-slate-900 text-sm"
                      placeholder="e.g. welcome_message"
                    />
                    <p className="text-[10px] text-slate-400 mt-2">Required for first contact with new leads on Interakt.</p>

                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-4">Header Media (Video/Image)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editForm.whatsappHeaderMedia}
                        onChange={(e) => setEditForm({ ...editForm, whatsappHeaderMedia: e.target.value })}
                        className="flex-1 px-4 py-2 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none transition-all font-medium text-slate-900 text-sm"
                        placeholder="https://... or upload file"
                      />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-xl flex items-center justify-center transition-colors">
                        <span className="text-xs font-bold">Upload</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="video/*,image/*"
                          onChange={async (e) => {
                             const file = e.target.files[0];
                             if (!file) return;
                             
                             const formData = new FormData();
                             formData.append('file', file);
                             
                             toast.loading('Uploading media...');
                             
                             try {
                               let fullUrl = '';
                               
                               // 1. Try Cloudinary (Preferred for Large Files)
                               if (cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset) {
                                  const cloudData = new FormData();
                                  cloudData.append('file', file);
                                  cloudData.append('upload_preset', cloudinaryConfig.uploadPreset);
                                  
                                  const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`, {
                                    method: 'POST',
                                    body: cloudData
                                  });
                                  const cloudJson = await cloudRes.json();
                                  
                                  if (cloudJson.secure_url) {
                                    fullUrl = cloudJson.secure_url;
                                  } else {
                                    throw new Error(cloudJson.error?.message || 'Cloudinary upload failed');
                                  }
                               } 
                               // 2. Fallback to Local/Vercel (Small Files Only)
                               else {
                                 if (file.size > 4.5 * 1024 * 1024) {
                                   throw new Error('File too large for local upload (>4.5MB). Please enter Cloudinary details below.');
                                 }
                                 const req = await fetch('/api/upload', { method: 'POST', body: formData });
                                 const res = await req.json();
                                 if (res.success) {
                                   fullUrl = `${window.location.origin}${res.url}`;
                                 } else {
                                   throw new Error(res.error || 'Upload failed');
                                 }
                               }
                               
                               setEditForm(prev => ({ ...prev, whatsappHeaderMedia: fullUrl }));
                               toast.dismiss();
                               toast.success('Media uploaded successfully!');
                               
                             } catch (err) {
                               toast.dismiss();
                               toast.error(err.message || 'Upload error');
                             }
                          }}
                        />
                      </label>
                    </div>
                    
                    {/* Cloudinary Settings Toggle */}
                    <div className="mt-3 p-3 bg-slate-100 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">⚡ Enable Large Video Uploads (Cloudinary)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                           type="text" 
                           placeholder="Cloud Name"
                           className="text-xs px-2 py-1.5 rounded border border-slate-300"
                           value={cloudinaryConfig.cloudName}
                           onChange={(e) => saveCloudinaryConfig('cloudName', e.target.value)}
                        />
                         <input 
                           type="text" 
                           placeholder="Upload Preset (Unsigned)"
                           className="text-xs px-2 py-1.5 rounded border border-slate-300"
                           value={cloudinaryConfig.uploadPreset}
                           onChange={(e) => saveCloudinaryConfig('uploadPreset', e.target.value)}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Use Cloudinary to bypass the 4.5MB upload limit. 
                        <a href="https://cloudinary.com/documentation/upload_presets" target="_blank" className="underline hover:text-indigo-600 ml-1">Get keys here</a>
                      </p>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-2">Required if your template has a video or image header.</p>

                  </div>
                )}

                {editingRule.type === 'follow_up_reminder' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Delay (Hours)</label>
                    <input
                      type="number"
                      value={editForm.delayHours}
                      onChange={(e) => setEditForm({ ...editForm, delayHours: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl outline-none transition-all font-medium text-slate-900"
                    />
                  </div>
                )}

                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[32px] p-8 border-2 border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <Settings className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Configuration Required</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                Select a rule to customize its behavior, change messaging, or adjust timings.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-left p-3 bg-white rounded-xl border border-slate-100">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <p className="text-[11px] text-slate-600 font-medium">Verify your SMTP settings to ensure emails send correctly.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
