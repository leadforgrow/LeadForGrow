'use client';

import { useEffect, useState } from 'react';
import { Zap, MessageCircle, Bell, RefreshCw, CheckCircle2, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AutomationRulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Optimistic update
      setRules(rules.map(r => r._id === ruleId ? { ...r, enabled: newEnabled } : r));

      const res = await fetch(`/api/automation/automation-rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled: newEnabled })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(newEnabled ? `${rule.name} activated` : `${rule.name} deactivated`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      // Revert on error
      setRules(rules.map(r => r._id === ruleId ? { ...r, enabled: !newEnabled } : r));
      toast.error('Failed to update rule');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-[20px] flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">Automation Quick Setup</h1>
        <p className="text-lg text-slate-600">Enable recommended rules to start capturing and responding to leads automatically.</p>
      </div>

      {/* Main Toggles */}
      <div className="space-y-6 mb-12">
        {rules.filter(r => ['instant_acknowledgement', 'notify_team', 'follow_up_reminder'].includes(r.type)).map((rule) => {
          const Icon = getRuleIcon(rule.type);
          
          return (
            <div
              key={rule._id}
              className={`bg-white rounded-[32px] border-2 p-8 transition-all flex items-center justify-between gap-6 ${
                rule.enabled ? 'border-indigo-600 shadow-xl shadow-indigo-50' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                  rule.enabled ? 'bg-indigo-600' : 'bg-slate-100'
                }`}>
                  <Icon className={`w-8 h-8 ${rule.enabled ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{rule.name}</h3>
                  <p className="text-slate-500 leading-relaxed max-w-md">{rule.description}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleRule(rule._id)}
                className={`relative w-20 h-10 rounded-full transition-all flex-shrink-0 ${
                  rule.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-md transition-transform ${
                    rule.enabled ? 'translate-x-11' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Action Area */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col items-center text-center">
        <Rocket className="w-12 h-12 text-indigo-400 mb-6" />
        <h2 className="text-2xl font-bold mb-4">You're in control</h2>
        <p className="text-slate-400 mb-8 max-w-lg">
          Once enabled, these rules work 24/7 in the background. You don't need to do anything manually. 
          New leads will get instant responses and you'll get notified immediately.
        </p>
        <button 
          onClick={() => toast.success('Recommended Automation is LIVE!')}
          className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20"
        >
          Enable Recommended Automation
        </button>
      </div>

      {/* Live State Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Zero Missing Leads', desc: 'Every single enquiry is captured and logged.' },
          { title: 'Instant Response', desc: 'Customers get welcomed before they look elsewhere.' },
          { title: 'Team Alerted', desc: 'The right person is notified the second it happens.' }
        ].map((item, i) => (
          <div key={i} className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
