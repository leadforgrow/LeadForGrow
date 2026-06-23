'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authFetch } from '@/lib/apiClient';
import { SettingsTabs, SettingsCard, SettingsField, SettingsInput, SettingsToggle, SettingsSelect } from '../../components/settings/SettingsCard';
import { DEFAULT_DEAL_STAGES } from '@/lib/crm/pipelineStages';
import { PAYMENT_ON_CONFIRM_MODES } from '@/lib/crm/crmSettings';

const TABS = [
  { id: 'pipeline', label: 'Pipeline Behavior' },
  { id: 'stages', label: 'Lead Stages' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'templates', label: 'Templates' },
  { id: 'reminders', label: 'Reminders' },
];

export default function CRMSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'pipeline';
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  const setTab = (id) => router.replace(`/automation/settings/crm?tab=${id}`);

  useEffect(() => {
    authFetch('/api/automation/settings/crm')
      .then((r) => r.json())
      .then((d) => { if (d.success) setConfig(d.data); })
      .catch(() => toast.error('Failed to load CRM settings'));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await authFetch('/api/automation/settings/crm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('CRM settings saved');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return <div className="p-8 text-center text-slate-500">Loading CRM settings…</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
      <SettingsTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'pipeline' && (
        <SettingsCard title="Pipeline control" description="Salespeople control stages. LeadForGrow automates everything around each stage.">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Stages are never changed automatically by workflows. Only your team (or payment confirmation, if enabled below) can move a lead forward.
          </p>
          <SettingsField label="When payment gateway confirms payment">
            <SettingsSelect
              value={config.paymentOnConfirm || PAYMENT_ON_CONFIRM_MODES.NOTIFY_SALES}
              onChange={(e) => setConfig({ ...config, paymentOnConfirm: e.target.value })}
            >
              <option value={PAYMENT_ON_CONFIRM_MODES.NOTIFY_SALES}>Notify salesperson to manually confirm Won</option>
              <option value={PAYMENT_ON_CONFIRM_MODES.AUTO_MOVE_WON}>Automatically move to Won</option>
            </SettingsSelect>
          </SettingsField>
          <SettingsToggle
            enabled={config.requireLostReason !== false}
            onChange={(v) => setConfig({ ...config, requireLostReason: v })}
            label="Require lost reason when marking Lost"
          />
          <SettingsToggle
            enabled={config.runAiQualificationOnNewLead !== false}
            onChange={(v) => setConfig({ ...config, runAiQualificationOnNewLead: v })}
            label="Run AI qualification on new leads"
          />
        </SettingsCard>
      )}

      {tab === 'stages' && (
        <SettingsCard title="Pipeline stages" description="12-stage enterprise sales pipeline (read-only)">
          <ol className="space-y-2">
            {DEFAULT_DEAL_STAGES.map((s) => (
              <li key={s.key} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="font-medium text-slate-800 dark:text-slate-200">{s.label}</span>
                <span className="text-xs text-slate-400">{s.probability}% probability</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-slate-500 mt-4">
            Customize deal pipeline labels in <a href="/automation/pipelines" className="text-blue-600 hover:underline">Deal Pipeline settings</a>.
          </p>
        </SettingsCard>
      )}

      {tab === 'tasks' && (
        <SettingsCard title="New lead automation" description="Tasks and messages created around stages — not stage changes">
          <SettingsToggle
            enabled={config.autoCreateFollowUpTask !== false}
            onChange={(v) => setConfig({ ...config, autoCreateFollowUpTask: v })}
            label="Auto-create first follow-up task on new lead"
          />
          <SettingsField label="Default follow-up due (hours)">
            <SettingsInput
              type="number"
              value={config.defaultFollowUpHours ?? 24}
              onChange={(e) => setConfig({ ...config, defaultFollowUpHours: +e.target.value })}
            />
          </SettingsField>
          <SettingsToggle
            enabled={config.sendWelcomeWhatsApp !== false}
            onChange={(v) => setConfig({ ...config, sendWelcomeWhatsApp: v })}
            label="Send welcome WhatsApp on new lead"
          />
          <SettingsToggle
            enabled={config.sendWelcomeEmail !== false}
            onChange={(v) => setConfig({ ...config, sendWelcomeEmail: v })}
            label="Send welcome email on new lead"
          />
        </SettingsCard>
      )}

      {tab === 'notifications' && (
        <SettingsCard title="Team notifications">
          <SettingsToggle
            enabled={config.notifyTeamOnNewLead !== false}
            onChange={(v) => setConfig({ ...config, notifyTeamOnNewLead: v })}
            label="Notify team on new lead"
          />
        </SettingsCard>
      )}

      {tab === 'templates' && (
        <SettingsCard title="Message templates" description="Variables: {{customer_name}}, {{meeting_date}}, {{meeting_time}}, {{meeting_link}}, {{salesperson}}, {{company}}">
          {[
            ['welcomeEmail', 'Welcome email'],
            ['welcomeWhatsApp', 'Welcome WhatsApp'],
            ['meetingEmail', 'Meeting invitation email'],
            ['meetingWhatsApp', 'Meeting WhatsApp'],
            ['quotationEmail', 'Quotation email'],
            ['quotationWhatsApp', 'Quotation WhatsApp'],
            ['paymentReminderEmail', 'Payment reminder email'],
            ['paymentReminderWhatsApp', 'Payment reminder WhatsApp'],
          ].map(([key, label]) => (
            <SettingsField key={key} label={label}>
              <textarea
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 min-h-[80px]"
                value={config.templates?.[key] || ''}
                onChange={(e) => setConfig({
                  ...config,
                  templates: { ...(config.templates || {}), [key]: e.target.value },
                })}
                placeholder="Leave blank to use default template"
              />
            </SettingsField>
          ))}
        </SettingsCard>
      )}

      {tab === 'reminders' && (
        <SettingsCard title="Meeting & payment reminders">
          <SettingsToggle
            enabled={config.meetingReminders?.hours24 !== false}
            onChange={(v) => setConfig({ ...config, meetingReminders: { ...config.meetingReminders, hours24: v } })}
            label="24 hours before meeting"
          />
          <SettingsToggle
            enabled={config.meetingReminders?.hours1 !== false}
            onChange={(v) => setConfig({ ...config, meetingReminders: { ...config.meetingReminders, hours1: v } })}
            label="1 hour before meeting"
          />
          <SettingsToggle
            enabled={config.meetingReminders?.minutes10 !== false}
            onChange={(v) => setConfig({ ...config, meetingReminders: { ...config.meetingReminders, minutes10: v } })}
            label="10 minutes before meeting"
          />
          <SettingsField label="Payment reminder interval (days)">
            <SettingsInput
              type="number"
              value={config.paymentReminderDays ?? 3}
              onChange={(e) => setConfig({ ...config, paymentReminderDays: +e.target.value })}
            />
          </SettingsField>
        </SettingsCard>
      )}
    </div>
  );
}
