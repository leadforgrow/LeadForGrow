'use client';

import { Settings as SettingsIcon, Bell, Globe, Download, Shield, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Heading from '@/app/components/ui/Heading';

export default function SettingsPage() {
  const router = useRouter();
  return (
    <div className="px-8 py-10 min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">Settings</h1>
          <p className="text-xs text-slate-500 font-medium">Configure your workspace and business preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            icon: SettingsIcon,
            title: 'Business Details',
            description: 'Update your company information and contact details',
            color: 'indigo',
            link: '/automation/settings/details'
          },
          {
            icon: Bell,
            title: 'Notifications',
            description: 'Configure how and when you receive notifications',
            color: 'purple',
            link: '/automation/settings/notifications'
          },
          {
            icon: Globe,
            title: 'Integrations',
            description: 'Connect WhatsApp, Email, and other services',
            color: 'emerald',
            link: '/automation/settings/integrations'
          },
          {
            icon: Download,
            title: 'Data Export',
            description: 'Download your leads and activity data',
            color: 'blue'
          },
          {
            icon: Shield,
            title: 'Agency Automation SDK',
            description: 'Deploy global workflows across all client nodes',
            color: 'rose',
            link: '/agency/automation',
            agencyOnly: true
          }
        ].filter(i => !i.agencyOnly || (typeof window !== 'undefined' && localStorage.getItem('userPlan')?.toLowerCase().includes('agency'))).map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              onClick={() => item.link && router.push(item.link)}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group flex items-start justify-between"
            >
              <div className="flex-1">
                <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${item.color}-600`} />
                </div>
                <Heading level={3} className="text-lg mb-2">{item.title}</Heading>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors mt-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
