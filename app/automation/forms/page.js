'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Copy, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink,
  Code,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FormsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    const plan = localStorage.getItem('userPlan') || 'free';
    setUserPlan(plan);
  }, []);


  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const userId = localStorage.getItem('userid');
      if (!userId) {
        toast.error('Please login to continue');
        router.push('/user/login');
        return;
      }

      const res = await fetch(`/api/forms?userId=${userId}`);
      const data = await res.json();

      if (data.success) {
        setForms(data.data);
      } else {
        toast.error(data.error);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
      setLoading(false);
    }
  };

  const createForm = async (formData) => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/forms?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Form created successfully!');
        setForms([data.data, ...forms]);
        setShowCreateModal(false);
      } else {
        if (data.requiresUpgrade) {
          toast.error(data.error + ' Upgrade your plan to create more forms.');
        } else {
          toast.error(data.error);
        }
      }
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Failed to create form');
    }
  };

  const copyEmbedCode = (embedCode) => {
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  const copyFormUrl = (token) => {
    const url = `${window.location.origin}/api/forms/submit?token=${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Form submission URL copied!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-900 font-medium">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Lead Capture Forms</h1>
          <p className="text-lg text-slate-600">Create and manage forms to capture leads from anywhere</p>
        </div>
        <button
          onClick={() => {
            if (userPlan === 'trial' && forms.length >= 1) {
              toast.error('Maximum 1 form allowed in free trial');
              return;
            }
            setShowCreateModal(true);
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Create New Form
        </button>
      </div>

      {userPlan === 'trial' && (
        <div className="mb-8 bg-blue-50 border border-blue-100 p-4 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-800">
             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
               <AlertCircle className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="font-bold">Free Trial Active</p>
               <p className="text-sm text-blue-600">You can create up to 1 lead capture form during your trial.</p>
             </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">{forms.length} / 1 FORMS</p>
            <div className="w-32 h-2 bg-blue-100 rounded-full mt-1 overflow-hidden">
               <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.min(forms.length * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      )}


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">{forms.length}</h3>
          <p className="text-sm text-slate-600 font-medium">Active Forms</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">
            {forms.reduce((sum, f) => sum + f.submissionCount, 0)}
          </h3>
          <p className="text-sm text-slate-600 font-medium">Total Submissions</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-1">
            {forms.filter(f => f.submissionCount > 0).length}
          </h3>
          <p className="text-sm text-slate-600 font-medium">Forms with Leads</p>
        </div>
      </div>

      {/* Forms List */}
      {forms.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Code className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No forms yet</h3>
          <p className="text-slate-600 mb-6">Create your first form to start capturing leads</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Your First Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {forms.map((form) => (
            <div key={form._id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-slate-900">{form.name}</h3>
                    {form.active ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mb-4">{form.description || 'No description'}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-slate-900">{form.submissionCount}</span>
                      <span className="text-slate-500">submissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-900">{form.fields.length}</span>
                      <span className="text-slate-500">fields</span>
                    </div>
                    {form.lastSubmissionAt && (
                      <div className="text-slate-500">
                        Last submission: {new Date(form.lastSubmissionAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedForm(form);
                      setShowEmbedModal(true);
                    }}
                    className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-200 transition-colors"
                    title="View Embed Code"
                  >
                    <Code className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => copyFormUrl(form.token)}
                    className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-200 transition-colors"
                    title="Copy Submission URL"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Fields Preview */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Form Fields</p>
                <div className="flex flex-wrap gap-2">
                  {form.fields.map((field, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm">
                      <span className="font-medium text-slate-900">{field.label}</span>
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      <span className="text-slate-400 ml-2 text-xs">({field.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateModal && (
        <CreateFormModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createForm}
        />
      )}

      {/* Embed Code Modal */}
      {showEmbedModal && selectedForm && (
        <EmbedCodeModal
          form={selectedForm}
          onClose={() => {
            setShowEmbedModal(false);
            setSelectedForm(null);
          }}
          onCopy={copyEmbedCode}
        />
      )}
    </div>
  );
}

// Create Form Modal Component
function CreateFormModal({ onClose, onCreate }) {
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      name: formName,
      description: formDescription
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">Form Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              placeholder="e.g., Contact Form, Quote Request"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              placeholder="Describe what this form is for..."
              rows="3"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Create Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Embed Code Modal Component
function EmbedCodeModal({ form, onClose, onCopy }) {
  const [tab, setTab] = useState('html');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const submissionUrl = `${baseUrl}/api/forms/submit`;
  
  // Simplified 3-line embed code
  const simpleEmbedCode = `<!-- LeadForGrow Widget -->
<div data-lfg-token="${form.token}"></div>
<script src="${baseUrl}/lfg-widget.js" async></script>`;

  const reactCode = `import React, { useState, useEffect, useRef } from 'react';

// Copy this component to your React project
const LeadForGrowWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const timerRef = useRef(null);

  const config = {
    token: "${form.token}",
    baseUrl: "${baseUrl}"
  };

  const startTimer = (delay) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!isSubmitted && !isOpen) setIsOpen(true);
    }, delay);
  };

  useEffect(() => {
    startTimer(30000);
    return () => clearTimeout(timerRef.current);
  }, [isSubmitted, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (!isSubmitted) startTimer(45000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    const data = { token: config.token };
    new FormData(e.target).forEach((v, k) => data[k] = v);

    try {
      const resp = await fetch(\`\${config.baseUrl}/api/forms/submit\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const res = await resp.json();
      if (res.success) {
        setIsSubmitted(true);
        setSuccess(true);
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        alert(res.error || 'Failed to send');
      }
    } catch (err) {
      alert('Error connecting to server');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Badge */}
      <div 
        onClick={() => setIsOpen(true)}
        style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#4F46E5', color: 'white', width: '60px', height: '60px', borderRadius: '50%', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 9999 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M11.07,12.85c0.77-1.39,2.25-2.21,3.11-3.44c0.91-1.29,0.4-3.7-2.18-3.7c-1.69,0-2.52,1.28-2.87,2.34L6.54,6.96 C7.25,4.83,9.18,3,12.19,3c4.1,0,6.21,3.12,4.84,6.03l-0.01,0.01c-0.6,1.28-2.1,2.42-2.98,3.41c-0.84,0.93-0.92,1.65-1.02,2.55 h-3C11.02,14.28,11.07,13.62,11.07,12.85z M13.84,19.33c0,1.29-1.05,2.34-2.34,2.34s-2.34-1.05-2.34-2.34s1.05-2.34,2.34-2.34 S13.84,18.04,13.84,19.33z"/></svg>
      </div>

      {/* Modal Overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 9998, opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '450px', position: 'relative', boxShadow: '0 20px 60px -12px rgba(0,0,0,0.15)' }}>
          <div onClick={handleClose} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', fontSize: '24px' }}>&times;</div>
          
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>✅ Success!</h3>
              <p style={{ marginTop: '10px', color: '#64748b' }}>Thank you! We'll get back to you soon.</p>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: '#000000' }}>Contact Us</h3>
              <p style={{ fontSize: '14px', color: '#000000', opacity: 0.7, marginBottom: '24px' }}>Share your details and we'll get in touch!</p>
              <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Full Name" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#000000' }} />
                <input type="email" name="email" placeholder="Email Address" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#000000' }} />
                <input type="tel" name="phone" placeholder="Phone Number" required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#000000' }} />
                <textarea name="message" placeholder="Message" rows="3" style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#000000' }}></textarea>
                <button type="submit" disabled={isSending} style={{ width: '100%', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontWeight: 600, cursor: 'pointer', opacity: isSending ? 0.7 : 1 }}>
                  {isSending ? 'Sending...' : 'Submit'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadForGrowWidget;`;

  const hostedLink = `${baseUrl}/test-form.html?token=${form.token}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Embed Widget</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-100 mb-6">
          <button 
            onClick={() => setTab('html')}
            className={`pb-3 font-bold text-sm transition-all ${tab === 'html' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
          >
            HTML / WEBSITE
          </button>
          <button 
            onClick={() => setTab('react')}
            className={`pb-3 font-bold text-sm transition-all ${tab === 'react' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
          >
            REACT JS
          </button>
          <button 
            onClick={() => setTab('api')}
            className={`pb-3 font-bold text-sm transition-all ${tab === 'api' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
          >
            API / WEBHOOK
          </button>
          <button 
            onClick={() => setTab('hosted')}
            className={`pb-3 font-bold text-sm transition-all ${tab === 'hosted' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
          >
            HOSTED LINK
          </button>
        </div>
        
        {tab === 'hosted' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">Public Form Link</h3>
                    <div className="group relative">
                      <AlertCircle className="w-4 h-4 text-slate-400 cursor-help" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-50 pointer-events-none">
                        This is a standalone link for your form. You can use it in ads, social media bios, or emails. No website integration needed.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-900 rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Use this link for Facebook ads, Instagram ads, WhatsApp, Google ads, or anywhere you can share a link. No website required.
                  </p>
                  
                  <div className="bg-white border border-indigo-200 p-3 rounded-lg flex items-center gap-2 mb-3">
                    <input 
                      type="text" 
                      readOnly 
                      value={hostedLink} 
                      className="flex-1 text-sm text-slate-600 bg-transparent outline-none font-mono"
                    />
                    <button
                      onClick={() => onCopy(hostedLink)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                  
                  <a 
                    href={hostedLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    Test Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'html' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-slate-700">Simple Embed (Recommended)</label>
                <button
                  onClick={() => onCopy(simpleEmbedCode)}
                  className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-200 transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Code
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-2">Paste this at the end of your body tag. It handles the design, popups, and logic automatically.</p>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm">
                <code>{simpleEmbedCode}</code>
              </pre>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">Legacy Embed (Full Source)</label>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs max-h-40 opacity-70">
                <code>{form.embedCode}</code>
              </pre>
            </div>
          </div>
        )}

        {tab === 'react' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-slate-700">LeadForGrowWidget.jsx</label>
              <button
                onClick={() => onCopy(reactCode)}
                className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-200 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy React Component
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs max-h-[400px]">
              <code>{reactCode}</code>
            </pre>
          </div>
        )}

        {tab === 'api' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">Form Token (Secret)</label>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-center justify-between">
                <code className="text-sm font-mono text-orange-900 break-all">{form.token}</code>
                <button onClick={() => { navigator.clipboard.writeText(form.token); toast.success('Token copied!'); }} className="text-orange-600 hover:text-orange-700">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">API Endpoint</label>
              <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                <code className="text-sm font-mono text-slate-700 break-all">{submissionUrl}</code>
                <button onClick={() => { navigator.clipboard.writeText(submissionUrl); toast.success('URL copied!'); }} className="text-slate-600 hover:text-slate-700">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">cURL Example</label>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs">
                <code>{`curl -X POST ${submissionUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${form.token}",
    "name": "John Doe",
    "phone": "9876543210"
  }'`}</code>
              </pre>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}
