'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SettingsTabs, SettingsCard, SettingsField, SettingsInput, SettingsToggle, SettingsSelect } from '../../components/settings/SettingsCard';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TABS = [
  { id: 'cloud', label: 'Cloud API' },
  { id: 'interakt', label: 'Interakt' },
  { id: 'templates', label: 'Templates' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'auto-replies', label: 'Auto Replies' },
  { id: 'rules', label: 'Conversation Rules' }
];

export default function WhatsAppSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'cloud';
  const [cloud, setCloud] = useState({ phoneNumberId: '', businessAccountId: '', verifyToken: 'lfg_secure_token', enabled: true });
  const [interakt, setInterakt] = useState({ apiKey: '', enabled: false });
  const [autoReplies, setAutoReplies] = useState({ welcome: true, away: true, welcomeMessage: 'Hi! Thanks for reaching out. We will respond shortly.' });
  const [rules, setRules] = useState({ assignOnFirstMessage: true, createLeadOnUnknown: true, businessHoursOnly: false });

  const setTab = (id) => router.replace(`/automation/settings/whatsapp?tab=${id}`);
  const copyWebhook = () => { navigator.clipboard.writeText('https://leadforgrow.com/api/webhooks/meta/demo'); toast.success('Webhook URL copied'); };

  return (
    <div className="space-y-5">
      <SettingsTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'cloud' && (
        <SettingsCard title="WhatsApp Cloud API" description="Meta Business Platform configuration (frontend preview)">
          <SettingsToggle enabled={cloud.enabled} onChange={(v) => setCloud({ ...cloud, enabled: v })} label="Enable WhatsApp Cloud API" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <SettingsField label="Phone Number ID"><SettingsInput value={cloud.phoneNumberId} onChange={(e) => setCloud({ ...cloud, phoneNumberId: e.target.value })} placeholder="1029384..." /></SettingsField>
            <SettingsField label="Business Account ID"><SettingsInput value={cloud.businessAccountId} onChange={(e) => setCloud({ ...cloud, businessAccountId: e.target.value })} placeholder="1234567..." /></SettingsField>
            <SettingsField label="Verify Token" className="sm:col-span-2"><SettingsInput value={cloud.verifyToken} onChange={(e) => setCloud({ ...cloud, verifyToken: e.target.value })} /></SettingsField>
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg mt-4">OAuth and API credentials will connect here when backend is enabled.</p>
        </SettingsCard>
      )}

      {tab === 'interakt' && (
        <SettingsCard title="Interakt" description="WhatsApp BSP integration for Indian businesses">
          <SettingsToggle enabled={interakt.enabled} onChange={(v) => setInterakt({ ...interakt, enabled: v })} label="Enable Interakt" />
          <SettingsField label="API Key" className="mt-4"><SettingsInput type="password" value={interakt.apiKey} onChange={(e) => setInterakt({ ...interakt, apiKey: e.target.value })} placeholder="Enter Interakt API key" /></SettingsField>
        </SettingsCard>
      )}

      {tab === 'templates' && (
        <SettingsCard title="Message templates" description="Approved WhatsApp templates for outbound messaging">
          <div className="space-y-2">
            {['hello_world', 'follow_up_reminder', 'appointment_confirmation', 'payment_link'].map((t) => (
              <div key={t} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div><p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t}</p><p className="text-xs text-slate-500">Approved · Marketing</p></div>
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">Active</span>
              </div>
            ))}
          </div>
        </SettingsCard>
      )}

      {tab === 'webhooks' && (
        <SettingsCard title="Webhook settings" description="Receive inbound messages and delivery events">
          <SettingsField label="Callback URL">
            <div className="flex gap-2">
              <SettingsInput readOnly value="https://leadforgrow.com/api/webhooks/meta/demo" className="font-mono text-xs" />
              <button type="button" onClick={copyWebhook} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600"><Copy className="w-4 h-4" /></button>
            </div>
          </SettingsField>
          <SettingsField label="Subscribed events" className="mt-4">
            <SettingsTagList items={['messages', 'message_deliveries', 'message_reads']} />
          </SettingsField>
        </SettingsCard>
      )}

      {tab === 'auto-replies' && (
        <SettingsCard title="Auto replies" description="Automatic responses outside business hours">
          <div className="space-y-4">
            <SettingsToggle enabled={autoReplies.welcome} onChange={(v) => setAutoReplies({ ...autoReplies, welcome: v })} label="Send welcome message" />
            <SettingsToggle enabled={autoReplies.away} onChange={(v) => setAutoReplies({ ...autoReplies, away: v })} label="Away message outside hours" />
            <SettingsField label="Welcome message"><SettingsInput value={autoReplies.welcomeMessage} onChange={(e) => setAutoReplies({ ...autoReplies, welcomeMessage: e.target.value })} /></SettingsField>
          </div>
        </SettingsCard>
      )}

      {tab === 'rules' && (
        <SettingsCard title="Conversation rules" description="How inbound WhatsApp messages are handled">
          <div className="space-y-2">
            <SettingsToggle enabled={rules.assignOnFirstMessage} onChange={(v) => setRules({ ...rules, assignOnFirstMessage: v })} label="Auto-assign agent on first message" />
            <SettingsToggle enabled={rules.createLeadOnUnknown} onChange={(v) => setRules({ ...rules, createLeadOnUnknown: v })} label="Create lead for unknown numbers" />
            <SettingsToggle enabled={rules.businessHoursOnly} onChange={(v) => setRules({ ...rules, businessHoursOnly: v })} label="Queue messages outside business hours" />
          </div>
        </SettingsCard>
      )}
    </div>
  );
}

function SettingsTagList({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-md">{item}</span>
      ))}
    </div>
  );
}
