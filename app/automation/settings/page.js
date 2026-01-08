'use client';

import { Settings as SettingsIcon, Bell, Globe, Download, Shield, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Configure your business preferences</p>
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
            color: 'purple'
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
          }
        ].map((item, idx) => {
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
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors mt-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
