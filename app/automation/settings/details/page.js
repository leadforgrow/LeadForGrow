'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Globe, 
  Briefcase, 
  Image as ImageIcon,
  Save,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BusinessDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessData, setBusinessData] = useState({
    businessName: '',
    industry: '',
    website: '',
    logo: ''
  });

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/business/settings?userId=${userId}`);
      const data = await res.json();

      if (data.success) {
        setBusinessData({
          businessName: data.data.businessName || '',
          industry: data.data.industry || '',
          website: data.data.website || '',
          logo: data.data.logo || ''
        });
      } else {
        toast.error('Failed to load business details');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching business data:', error);
      toast.error('Error connection to server');
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/business/settings?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessData)
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Business details updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update details');
      }
      setSaving(false);
    } catch (error) {
      console.error('Error saving business data:', error);
      toast.error('Failed to save settings');
      setSaving(false);
    }
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Business Details</h1>
        <p className="text-slate-600">Manage your core business identity and branding</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Business Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Business Name
              </label>
              <input 
                required
                type="text"
                value={businessData.businessName}
                onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                placeholder="Acme Corp"
                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-900"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Industry
              </label>
              <select 
                value={businessData.industry}
                onChange={(e) => setBusinessData({ ...businessData, industry: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-900 h-[54px]"
              >
                <option value="">Select Industry</option>
                <option value="Agency">Agency</option>
                <option value="SaaS">SaaS</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Website URL
              </label>
              <input 
                type="url"
                value={businessData.website}
                onChange={(e) => setBusinessData({ ...businessData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-900"
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Logo URL
              </label>
              <input 
                type="text"
                value={businessData.logo}
                onChange={(e) => setBusinessData({ ...businessData, logo: e.target.value })}
                placeholder="https://cdn.example.com/logo.png"
                className="w-full px-5 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <button 
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tip Card */}
      <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex gap-4 items-start">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-1">Branding Tip</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your business name and logo will appear on your lead capture forms and dashboard. Using consistent branding helps build trust with your leads.
          </p>
        </div>
      </div>
    </div>
  );
}
