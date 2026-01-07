'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, 
  MessageCircle, 
  Code,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Plus,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function IntegrationsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('YOUR_ID');
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('userid');
    if (id) {
      setUserId(id);
      fetchForms(id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchForms = async (uid) => {
    try {
      const res = await fetch(`/api/forms?userId=${uid}`);
      const data = await res.json();
      if (data.success) {
        setForms(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching forms:', error);
      setLoading(false);
    }
  };

  const scriptTag = `<script src="https://api.leadforgrow.com/v1/lfg.js" data-id="${userId}"></script>`;

  const integrations = [
    {
      name: 'LeadForGrow Website Forms',
      description: `You have ${forms.length} active form${forms.length !== 1 ? 's' : ''} capturing leads.`,
      icon: Code,
      status: forms.length > 0 ? 'Active' : 'Setup Required',
      type: 'Source',
      color: 'indigo',
      action: () => router.push('/automation/forms')
    },
    {
      name: 'WhatsApp Button Clicks',
      description: 'Capture lead data when someone clicks your WhatsApp chat button.',
      icon: MessageCircle,
      status: 'Coming Soon',
      type: 'Source',
      color: 'emerald',
      action: () => toast('WhatsApp integration coming soon!', { icon: '🚀' })
    },
    {
      name: 'Call Request Button',
      description: 'Automated call back requests from your mobile website visitors.',
      icon: PhoneCall,
      status: 'Coming Soon',
      type: 'Source',
      color: 'blue',
      action: () => toast('Call request integration coming soon!', { icon: '📞' })
    },
    {
      name: 'External Website Form',
      description: 'Connect your existing forms via script or webhook integration.',
      icon: Globe,
      status: 'Available',
      type: 'Website',
      color: 'purple',
      action: () => router.push('/automation/forms')
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Lead Sources</h1>
        <p className="text-lg text-slate-600">Connect where your enquiries come from to start the automation.</p>
      </div>

      {/* Forms Quick Stats */}
      {forms.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Forms Are Live! 🎉</h2>
              <p className="text-indigo-100 mb-4">
                You have {forms.length} active form{forms.length !== 1 ? 's' : ''} with{' '}
                {forms.reduce((sum, f) => sum + f.submissionCount, 0)} total submissions
              </p>
              <button
                onClick={() => router.push('/automation/forms')}
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
              >
                Manage Forms
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Code className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {integrations.map((item) => {
          const Icon = item.icon;
          const isActive = item.status === 'Active';
          const isAvailable = item.status === 'Available';
          
          return (
            <div key={item.name} className={`bg-white rounded-[32px] p-8 border-2 transition-all group ${
              isActive ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-slate-100 hover:border-slate-200'
            }`}>
              <div className="flex items-start justify-between mb-8">
                <div className={`w-16 h-16 bg-${item.color}-100 rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-8 h-8 text-${item.color}-600`} />
                </div>
                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : isAvailable
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.name}</h3>
              <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {item.type}
                </span>
                <button 
                  onClick={item.action}
                  className={`flex items-center gap-2 text-sm font-bold ${
                    isActive || isAvailable ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  {isActive ? 'Manage' : isAvailable ? 'Setup Now' : 'Coming Soon'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Script Section */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold">Universal Tracking Script</h2>
          </div>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Copy this script once and paste it into your website's <code>&lt;head&gt;</code> tag. 
            It will automatically enable all selected sources and tracking.
          </p>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 font-mono text-sm mb-8 border border-white/10 text-indigo-300 overflow-x-auto">
            <code>
              {scriptTag}
            </code>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(scriptTag);
              toast.success('Script copied to clipboard!');
            }}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-xl shadow-indigo-900/20"
          >
            Copy My Unique Script
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
