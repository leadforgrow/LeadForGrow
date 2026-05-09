"use client";
import { useState, useEffect } from 'react';
import { Mail, Clock, Save, Info, AlertCircle, ArrowRight, LayoutTemplate, Plus, Trash2, MessageCircle, Edit3, CheckCircle, Search, Sparkles, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Heading from '@/app/components/ui/Heading';

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('library');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Automated Template States (Existing)
  const [welcomeTemplate, setWelcomeTemplate] = useState({
    subject: 'Welcome to LeadForGrow!',
    body: 'Hi {{lead.name}},\n\nThanks for your interest. We will be in touch shortly.\n\nBest,\nThe LeadForGrow Team',
    enabled: true
  });

  const [followUpTemplate, setFollowUpTemplate] = useState({
    subject: 'Just checking in...',
    body: 'Hi {{lead.name}},\n\nI wanted to follow up on my previous email. do you have any questions?\n\nBest,\n{{user.name}}',
    delayHours: 24,
    enabled: true
  });

  // New Library States (Manual Templates)
  const [manualTemplates, setManualTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deleteIds, setDeleteIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const placeholders = [
    { label: 'Lead Name', value: '{{lead.name}}' },
    { label: 'Lead Email', value: '{{lead.email}}' },
    { label: 'Lead Phone', value: '{{lead.phone}}' },
    { label: 'My Name', value: '{{user.name}}' },
    { label: 'Company Name', value: '{{business.name}}' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/automation/templates?userId=' + localStorage.getItem('userid'));
      const data = await res.json();

      if (data.success) {
        if (data.welcome) setWelcomeTemplate(data.welcome);
        if (data.followUp) setFollowUpTemplate(data.followUp);
        if (data.manual) setManualTemplates(data.manual);
      }
    } catch (error) {
      toast.error("Failed to load templates");
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
        manual: manualTemplates,
        deleteManualIds: deleteIds,
        userId: localStorage.getItem('userid')
      };

      const res = await fetch('/api/automation/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('All templates saved successfully!');
        setDeleteIds([]);
        fetchData(); // Refresh to get real IDs for new templates
      } else {
        toast.error('Failed to save templates');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const handleMetaSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/automation/templates/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: localStorage.getItem('userid') })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Meta templates synced!');
        fetchData();
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch (error) {
      toast.error('Connection error during sync');
    } finally {
      setSyncing(false);
    }
  };

  const addManualTemplate = () => {
    const newTemp = {
      name: 'New Custom Template',
      subject: 'Subject Line',
      body: 'Hi {{lead.name}}, ...',
      channel: 'whatsapp',
      enabled: true,
      isMetaTemplate: false,
      metaCategory: '',
      metaStatus: ''
    };
    setManualTemplates([newTemp, ...manualTemplates]);
    setEditingTemplate(newTemp);
    setActiveTab('editor');
  };

  const updateManualField = (index, field, value) => {
    const updated = [...manualTemplates];
    updated[index] = { ...updated[index], [field]: value };
    setManualTemplates(updated);
  };

  const deleteManualTemplate = (index) => {
    const template = manualTemplates[index];
    if (template.id) {
      setDeleteIds([...deleteIds, template.id]);
    }
    const updated = manualTemplates.filter((_, i) => i !== index);
    setManualTemplates(updated);
    if (editingTemplate === template) setEditingTemplate(null);
  };

  const insertToken = (token) => {
    navigator.clipboard.writeText(token);
    toast.success(`Copied ${token} to clipboard!`);
  };

  // Filter templates for search
  const filteredTemplates = manualTemplates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen">
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Message Library</h1>
            <p className="text-xs text-slate-500 font-medium">Standardized library for Email and WhatsApp communication</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleMetaSync}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold hover:bg-emerald-100 transition-all flex items-center gap-2"
          >
            <MessageCircle className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing Meta...' : 'Sync from Meta'}
          </button>
          <button
            onClick={addManualTemplate}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-95"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
            {saving ? 'Syncing...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="px-8 py-10 w-full flex flex-col lg:flex-row gap-8">

        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 space-y-6">
          <div className="space-y-1.5">
            <p className="px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Main Categories</p>
            <button
              onClick={() => setActiveTab('library')}
              className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 ${activeTab === 'library'
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
            >
              <LayoutTemplate className="w-5 h-5" />
              Manual Library
            </button>
            <button
              onClick={() => setActiveTab('welcome')}
              className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 ${activeTab === 'welcome'
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
            >
              <Sparkles className="w-5 h-5" />
              Auto: Welcome
            </button>
            <button
              onClick={() => setActiveTab('followup')}
              className={`w-full text-left px-5 py-3.5 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 ${activeTab === 'followup'
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-1'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
                }`}
            >
              <Clock className="w-5 h-5" />
              Auto: Follow-Up
            </button>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-indigo-100 transition-colors" />
            <h3 className="text-slate-900 font-medium flex items-center gap-2 text-[10px] mb-3 relative z-10 uppercase tracking-widest">
              <Info className="w-4 h-4 text-indigo-500" />
              SMART TOKENS
            </h3>
            <div className="space-y-2 relative z-10">
              {placeholders.slice(0, 3).map(p => (
                <button
                  key={p.label}
                  onClick={() => insertToken(p.value)}
                  className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-all flex justify-between items-center group/token"
                >
                  {p.label}
                  <span className="text-[10px] font-mono opacity-0 group-hover/token:opacity-40">{p.value}</span>
                </button>
              ))}
              <p className="text-[9px] text-slate-400 mt-2 leading-relaxed text-left px-1 font-medium">Click to copy token</p>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 min-w-0">

          {/* LIBRARY VIEW */}
          {activeTab === 'library' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-[20px] border border-slate-200 shadow-sm">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates by name or content..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 py-3"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template, index) => (
                  <div
                    key={index}
                    className={`group bg-white p-6 rounded-[28px] border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50 ${editingTemplate === template ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${template.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          {template.channel === 'whatsapp' ? <MessageCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                          <Heading level={3} className="text-base truncate max-w-[180px]">{template.name}</Heading>
                          {template.isMetaTemplate && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mt-1 uppercase tracking-tighter">
                              Meta Official • {template.metaCategory || 'Marketing'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!template.isMetaTemplate && (
                          <button
                            onClick={() => { setEditingTemplate(template); setActiveTab('library'); }}
                            className="p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
                            title="Edit Template"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!window.confirm('Are you sure you want to delete this template?')) return;
                            
                            const tid = toast.loading('Deleting template...');
                            try {
                              if (template.id) {
                                const res = await fetch(`/api/automation/templates/delete`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ 
                                    templateId: template.id,
                                    userId: localStorage.getItem('userid') 
                                  })
                                });
                                if (!(await res.json()).success) throw new Error('Failed');
                              }
                              
                              // Remove from local state
                              const updated = manualTemplates.filter((_, i) => manualTemplates.indexOf(template) !== i);
                              setManualTemplates(updated);
                              toast.success('Template deleted', { id: tid });
                            } catch (e) {
                              toast.error('Failed to delete', { id: tid });
                            }
                          }}
                          className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-400 hover:text-red-600 transition-all active:scale-90"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingTemplate === template ? (
                      <div className="space-y-4 animate-in zoom-in-95 duration-200">
                        <input
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                          value={template.name}
                          onChange={(e) => updateManualField(manualTemplates.indexOf(template), 'name', e.target.value)}
                          placeholder="Template Name"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateManualField(manualTemplates.indexOf(template), 'channel', 'whatsapp')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${template.channel === 'whatsapp' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                          >
                            WhatsApp
                          </button>
                          <button
                            onClick={() => updateManualField(manualTemplates.indexOf(template), 'channel', 'email')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${template.channel === 'email' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                          >
                            Email
                          </button>
                        </div>
                        {template.channel === 'email' && (
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={template.subject}
                            onChange={(e) => updateManualField(manualTemplates.indexOf(template), 'subject', e.target.value)}
                            placeholder="Email Subject"
                          />
                        )}
                        <textarea
                          className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          value={template.body}
                          onChange={(e) => updateManualField(manualTemplates.indexOf(template), 'body', e.target.value)}
                          placeholder="Your message content..."
                        />
                        <button
                          onClick={() => setEditingTemplate(null)}
                          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                          Done Editing
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 h-[60px]">
                          {template.body}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Ready to use</span>
                          </div>
                          <button
                            onClick={() => setEditingTemplate(template)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group/btn"
                          >
                            Customize
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <button
                  onClick={addManualTemplate}
                  className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[28px] flex flex-col items-start justify-start gap-4 text-slate-400 hover:bg-white hover:border-indigo-300 hover:text-indigo-500 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-slate-600 group-hover:text-indigo-600">Create New Template</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1">Add a custom message to your library</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* AUTOMATED VIEWS (MODERNIZED) */}
          {(activeTab === 'welcome' || activeTab === 'followup') && (
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-medium uppercase tracking-wider">Automated Flow</div>
                      <Heading level={2} className="text-2xl">{activeTab === 'welcome' ? 'Lead Welcome Email' : 'Follow-Up Sequence'}</Heading>
                    </div>
                    <p className="text-slate-500 font-medium">
                      {activeTab === 'welcome'
                        ? 'This message is sent instantly when a lead first lands in your dashboard.'
                        : 'Keep the conversation moving with a timed check-in if there is no response.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-600">Active</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={activeTab === 'welcome' ? welcomeTemplate.enabled : followUpTemplate.enabled}
                        onChange={(e) => activeTab === 'welcome'
                          ? setWelcomeTemplate({ ...welcomeTemplate, enabled: e.target.checked })
                          : setFollowUpTemplate({ ...followUpTemplate, enabled: e.target.checked })
                        }
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 ml-1">Email Subject</label>
                      <input
                        type="text"
                        value={activeTab === 'welcome' ? welcomeTemplate.subject : followUpTemplate.subject}
                        onChange={(e) => activeTab === 'welcome'
                          ? setWelcomeTemplate({ ...welcomeTemplate, subject: e.target.value })
                          : setFollowUpTemplate({ ...followUpTemplate, subject: e.target.value })
                        }
                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900 font-bold"
                        placeholder="A professional headline..."
                      />
                    </div>

                    {activeTab === 'followup' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 ml-1">Wait Duration (Hours)</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            min="0"
                            value={followUpTemplate.delayHours}
                            onChange={(e) => setFollowUpTemplate({ ...followUpTemplate, delayHours: parseInt(e.target.value) || 0 })}
                            className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900 font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="block text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">Message Blueprint</label>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        {showPreview ? 'Edit Raw Text' : 'View Computed Preview'}
                      </button>
                    </div>

                    <div className="relative group">
                      {showPreview ? (
                        <div className="w-full min-h-[300px] p-6 bg-slate-950 rounded-[32px] border border-slate-800 text-indigo-100 leading-relaxed font-medium">
                          {activeTab === 'welcome' ? welcomeTemplate.body : followUpTemplate.body}
                        </div>
                      ) : (
                        <textarea
                          value={activeTab === 'welcome' ? welcomeTemplate.body : followUpTemplate.body}
                          onChange={(e) => activeTab === 'welcome'
                            ? setWelcomeTemplate({ ...welcomeTemplate, body: e.target.value })
                            : setFollowUpTemplate({ ...followUpTemplate, body: e.target.value })
                          }
                          className="w-full min-h-[300px] px-6 py-6 rounded-[32px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-800 font-medium text-lg leading-relaxed placeholder:text-slate-300"
                          placeholder="Craft your high-converting message here..."
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
