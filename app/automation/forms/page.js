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
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FormsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

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
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Create New Form
        </button>
      </div>

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
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Contact Form, Quote Request"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optional)</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
  const submissionUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/forms/submit`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Embed Code & Integration</h2>
        
        {/* Embed Code */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-slate-700">Embed Code (HTML)</label>
            <button
              onClick={() => onCopy(form.embedCode)}
              className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-200 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm">
            <code>{form.embedCode}</code>
          </pre>
        </div>

        {/* API Endpoint */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-slate-700">API Endpoint</label>
            <button
              onClick={() => {
                navigator.clipboard.writeText(submissionUrl);
                toast.success('API endpoint copied!');
              }}
              className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg font-medium text-sm hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </button>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="text-sm font-mono text-slate-700 break-all">{submissionUrl}</p>
          </div>
        </div>

        {/* Form Token */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">Form Token (Keep Secret)</label>
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
            <p className="text-sm font-mono text-orange-900 break-all">{form.token}</p>
          </div>
          <p className="text-xs text-slate-500 mt-2">⚠️ This token authenticates form submissions. Do not share publicly.</p>
        </div>

        {/* Example cURL */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-3">Example API Call (cURL)</label>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs">
            <code>{`curl -X POST ${submissionUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${form.token}",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "message": "I'm interested in your services"
  }'`}</code>
          </pre>
        </div>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
