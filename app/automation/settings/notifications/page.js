'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Mail, 
  Plus, 
  X, 
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email: {
      enabled: true,
      recipients: []
    },
    whatsapp: {
      enabled: false,
      recipients: []
    }
  });

  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const userId = localStorage.getItem('userid');
      if (!userId) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/business/settings?userId=${userId}`);
      const data = await res.json();

      if (data.success && data.data && data.data.settings && data.data.settings.notifications) {
        // Merge with defaults to ensure structure exists
        setSettings({
            email: {
                enabled: data.data.settings.notifications?.email?.enabled ?? true,
                recipients: data.data.settings.notifications?.email?.recipients || []
            },
            whatsapp: {
                enabled: data.data.settings.notifications?.whatsapp?.enabled ?? false,
                recipients: data.data.settings.notifications?.whatsapp?.recipients || []
            }
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/business/settings?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            notifications: settings
          }
        })
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Notification settings saved!');
      } else {
        toast.error(data.error || 'Failed to save');
      }
      setSaving(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
      setSaving(false);
    }
  };

  const addRecipient = (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    
    if (settings.email.recipients.includes(newEmail)) {
      toast.error('Email already added');
      return;
    }

    setSettings({
      ...settings,
      email: {
        ...settings.email,
        recipients: [...settings.email.recipients, newEmail]
      }
    });

    setNewEmail(''); // Clear input
  };

  const removeRecipient = (emailToRemove) => {
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        recipients: settings.email.recipients.filter(email => email !== emailToRemove)
      }
    });
  };

  const toggleEmailNotifs = () => {
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        enabled: !settings.email.enabled
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Notification Settings</h1>
        <p className="text-slate-600">Control who gets notified when new leads arrive</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Email Notifications Card */}
        <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Email Notifications</h3>
                <p className="text-slate-500 text-sm">Receive instant alerts for new leads</p>
              </div>
            </div>
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.email.enabled} 
                onChange={toggleEmailNotifs}
                className="sr-only peer" 
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="p-8 bg-slate-50/50">
            {settings.email.enabled ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Team Recruiting List
                  </label>
                  
                  {/* List of Recipients */}
                  <div className="space-y-3 mb-4">
                    {settings.email.recipients.length === 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            No recipients added. You won't receive notifications!
                        </div>
                    )}
                    {settings.email.recipients.map((email, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-indigo-200 transition-colors">
                        <span className="font-medium text-slate-700 ml-2">{email}</span>
                        <button 
                          onClick={() => removeRecipient(email)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Recipient */}
                  <form onSubmit={addRecipient} className="flex gap-3">
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={!newEmail}
                      className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </form>
                </div>
              </div>
            ) : (
                <div className="text-center py-6 text-slate-500">
                    Notifications are currently disabled. Toggle the switch above to enable them.
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          {saving ? 'Saving...' : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
