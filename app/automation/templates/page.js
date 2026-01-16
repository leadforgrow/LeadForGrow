"use client";
import { useState, useEffect } from 'react';
import { Mail, Clock, Save, Info, AlertCircle, ArrowRight, LayoutTemplate } from 'lucide-react';

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('welcome');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Template States
  const [welcomeTemplate, setWelcomeTemplate] = useState({
    subject: 'Welcome to LeadForGrow!',
    body: 'Hi {{lead.name}},\n\nThanks for your interest. We will be in touch shortly.\n\nBest,\nThe LeadForGrow Team',
    enabled: true
  });
  
  const [followUpTemplate, setFollowUpTemplate] = useState({
    subject: 'Just checking in...',
    body: 'Hi {{lead.name}},\n\nI wanted to follow up on my previous email. do you have any questions?\n\nBest,\n{{user.name}}',
    delayHours: 0,
    enabled: true
  });

  const placeholders = [
    { label: 'Lead Name', value: '{{lead.name}}' },
    { label: 'Lead Email', value: '{{lead.email}}' },
    { label: 'Lead Phone', value: '{{lead.phone}}' },
    { label: 'My Name', value: '{{user.name}}' },
    { label: 'Company Name', value: '{{business.name}}' },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/automation/templates?userId=' + localStorage.getItem('userid'));
      const data = await res.json();
      
      if (data.success) {
        if (data.welcome) setWelcomeTemplate(data.welcome);
        if (data.followUp) setFollowUpTemplate(data.followUp);
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        welcome: welcomeTemplate,
        followUp: followUpTemplate,
        userId: localStorage.getItem('userid')
      };

      const res = await fetch('/api/automation/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Templates saved successfully!');
      } else {
        alert('Failed to save templates.');
      }
    } catch (error) {
       console.error("Error saving:", error);
       alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const insertToken = (token) => {
    navigator.clipboard.writeText(token);
    alert(`Copied ${token} to clipboard! Paste it into the editor.`);
  };

  // Preview Data
  const previewData = {
    lead: { name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
    user: { name: 'Sarah Seller' },
    business: { name: 'Acme Corp' }
  };

  const getPreviewText = (text) => {
    let preview = text || '';
    preview = preview.replace(/{{lead.name}}/g, previewData.lead.name || '');
    preview = preview.replace(/{{lead.email}}/g, previewData.lead.email || '');
    preview = preview.replace(/{{lead.phone}}/g, previewData.lead.phone || '');
    preview = preview.replace(/{{user.name}}/g, previewData.user.name || '');
    preview = preview.replace(/{{business.name}}/g, previewData.business.name || '');
    return preview;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
             <LayoutTemplate className="w-6 h-6 text-indigo-600" />
             Email Templates
           </h1>
           <p className="text-slate-500 mt-1">Design and manage your automated email communications.</p>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={() => setShowPreview(!showPreview)} 
             className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            {showPreview ? 'Exit Preview' : 'Preview Changes'}
          </button>
          <button 
             onClick={handleSave} 
             disabled={saving}
             className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Templates'}
          </button>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-2">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 ${
              activeTab === 'welcome' 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
                : 'text-slate-600 hover:bg-white hover:shadow-sm'
            }`}
          >
            <Mail className="w-5 h-5" />
            Lead Welcome Email
          </button>
          <button
            onClick={() => setActiveTab('followup')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 ${
              activeTab === 'followup' 
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' 
                : 'text-slate-600 hover:bg-white hover:shadow-sm'
            }`}
          >
            <Clock className="w-5 h-5" />
            Follow-Up Email
          </button>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-blue-900 font-bold flex items-center gap-2 text-sm mb-2">
              <Info className="w-4 h-4" />
              Pro Tip
            </h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              Use personalization tokens like <code className="bg-white px-1 py-0.5 rounded border border-blue-200 text-blue-600 font-mono">{'{{lead.name}}'}</code> to increase engagement rates by up to 40%.
            </p>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               {activeTab === 'welcome' && (
                 <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                         <h2 className="text-xl font-bold text-slate-900">Lead Welcome Email</h2>
                         <p className="text-sm text-slate-500 mt-1">Sent automatically immediately after a new lead is captured.</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-sm font-medium text-slate-600">Status:</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input 
                             type="checkbox" 
                             className="sr-only peer"
                             checked={welcomeTemplate.enabled}
                             onChange={(e) => setWelcomeTemplate({...welcomeTemplate, enabled: e.target.checked})}
                           />
                           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                         </label>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Subject</label>
                        <input 
                          type="text" 
                          value={welcomeTemplate.subject}
                          onChange={(e) => setWelcomeTemplate({...welcomeTemplate, subject: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                          placeholder="Welcome to our service!"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                           <label className="block text-sm font-bold text-slate-700">Email Body</label>
                           <div className="flex gap-2 text-xs">
                             {placeholders.map(p => (
                               <button 
                                 key={p.label}
                                 onClick={() => insertToken(p.value)}
                                 className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200 transition-colors"
                                 title="Click to copy"
                               >
                                 {p.label}
                               </button>
                             ))}
                           </div>
                        </div>
                        {showPreview ? (
                            <div className="w-full h-64 p-4 bg-slate-50 rounded-lg border border-slate-200 overflow-y-auto whitespace-pre-wrap text-slate-800">
                                {getPreviewText(welcomeTemplate.body)}
                            </div>
                        ) : (
                            <textarea
                              value={welcomeTemplate.body}
                              onChange={(e) => setWelcomeTemplate({...welcomeTemplate, body: e.target.value})}
                              className="w-full h-64 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm text-slate-800"
                              placeholder="Write your email content here..."
                            />
                        )}
                      </div>
                    </div>
                 </div>
               )}

               {activeTab === 'followup' && (
                 <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                         <h2 className="text-xl font-bold text-slate-900">Follow-Up Email</h2>
                         <p className="text-sm text-slate-500 mt-1">Sent when a condition is met (e.g. status change or time delay).</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-sm font-medium text-slate-600">Status:</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input 
                             type="checkbox" 
                             className="sr-only peer"
                             checked={followUpTemplate.enabled}
                             onChange={(e) => setFollowUpTemplate({...followUpTemplate, enabled: e.target.checked})}
                           />
                           <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                         </label>
                       </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                       <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                       <div>
                         <h4 className="font-bold text-amber-900 text-sm">Trigger Condition</h4>
                         <p className="text-xs text-amber-800 mt-1">
                           This email will be triggered when you change a lead's status to <strong>"Follow Up"</strong>. (Set delay to 0 for immediate send)
                         </p>
                       </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Email Subject</label>
                          <input 
                            type="text" 
                            value={followUpTemplate.subject}
                            onChange={(e) => setFollowUpTemplate({...followUpTemplate, subject: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                            placeholder="Checking in..."
                          />
                        </div>
                        <div className="w-32">
                           <label className="block text-sm font-bold text-slate-700 mb-2">Delay (Hours)</label>
                           <input 
                            type="number" 
                            min="0"
                            value={followUpTemplate.delayHours}
                            onChange={(e) => setFollowUpTemplate({...followUpTemplate, delayHours: parseInt(e.target.value) || 0})}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                           <label className="block text-sm font-bold text-slate-700">Email Body</label>
                           <div className="flex gap-2 text-xs">
                             {placeholders.map(p => (
                               <button 
                                 key={p.label}
                                 onClick={() => insertToken(p.value)}
                                 className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200 transition-colors"
                                 title="Click to copy"
                               >
                                 {p.label}
                               </button>
                             ))}
                           </div>
                        </div>
                        {showPreview ? (
                            <div className="w-full h-64 p-4 bg-slate-50 rounded-lg border border-slate-200 overflow-y-auto whitespace-pre-wrap text-slate-800">
                                {getPreviewText(followUpTemplate.body)}
                            </div>
                        ) : (
                            <textarea
                              value={followUpTemplate.body}
                              onChange={(e) => setFollowUpTemplate({...followUpTemplate, body: e.target.value})}
                              className="w-full h-64 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm text-slate-800"
                              placeholder="Write your email content here..."
                            />
                        )}
                      </div>
                    </div>
                 </div>
               )}
             </div>
        </div>

      </div>
    </div>
  );
}
