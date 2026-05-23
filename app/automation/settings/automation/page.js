'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SettingsTabs, SettingsCard, SettingsField, SettingsInput, SettingsToggle, SettingsSelect } from '../../components/settings/SettingsCard';
import { MOCK_AUTOMATION } from '../../hooks/useSettings';

const TABS = [
  { id: 'defaults', label: 'Defaults' },
  { id: 'hours', label: 'Working Hours' },
  { id: 'sla', label: 'SLA Rules' },
  { id: 'followup', label: 'Follow-up' },
  { id: 'assignment', label: 'Assignment' },
  { id: 'ai', label: 'AI Suggestions' }
];

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function AutomationSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'defaults';
  const [config, setConfig] = useState(MOCK_AUTOMATION);
  const [aiEnabled, setAiEnabled] = useState(true);

  const setTab = (id) => router.replace(`/automation/settings/automation?tab=${id}`);

  return (
    <div className="space-y-5">
      <SettingsTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'defaults' && (
        <SettingsCard title="Automation defaults" description="Default behaviors for new automations">
          <div className="space-y-2">
            <SettingsToggle enabled={config.defaults.autoAssign} onChange={(v) => setConfig({ ...config, defaults: { ...config.defaults, autoAssign: v } })} label="Auto-assign new leads" />
            <SettingsToggle enabled={config.defaults.createTaskOnNewLead} onChange={(v) => setConfig({ ...config, defaults: { ...config.defaults, createTaskOnNewLead: v } })} label="Create task on new lead" />
            <SettingsToggle enabled={config.defaults.sendWelcomeWhatsApp} onChange={(v) => setConfig({ ...config, defaults: { ...config.defaults, sendWelcomeWhatsApp: v } })} label="Send welcome WhatsApp" />
          </div>
        </SettingsCard>
      )}

      {tab === 'hours' && (
        <SettingsCard title="Working hours" description="When automations and assignments are active">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <SettingsField label="Start time"><SettingsInput type="time" value={config.workingHours.start} onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, start: e.target.value } })} /></SettingsField>
            <SettingsField label="End time"><SettingsInput type="time" value={config.workingHours.end} onChange={(e) => setConfig({ ...config, workingHours: { ...config.workingHours, end: e.target.value } })} /></SettingsField>
          </div>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button key={d} type="button" onClick={() => {
                const days = config.workingHours.days.includes(d) ? config.workingHours.days.filter((x) => x !== d) : [...config.workingHours.days, d];
                setConfig({ ...config, workingHours: { ...config.workingHours, days } });
              }} className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize ${config.workingHours.days.includes(d) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>{d}</button>
            ))}
          </div>
        </SettingsCard>
      )}

      {tab === 'sla' && (
        <SettingsCard title="SLA rules" description="Response time targets for your team">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SettingsField label="First response (min)"><SettingsInput type="number" value={config.sla.firstResponse} onChange={(e) => setConfig({ ...config, sla: { ...config.sla, firstResponse: +e.target.value } })} /></SettingsField>
            <SettingsField label="Follow-up (min)"><SettingsInput type="number" value={config.sla.followUp} onChange={(e) => setConfig({ ...config, sla: { ...config.sla, followUp: +e.target.value } })} /></SettingsField>
            <SettingsField label="Escalation (min)"><SettingsInput type="number" value={config.sla.escalation} onChange={(e) => setConfig({ ...config, sla: { ...config.sla, escalation: +e.target.value } })} /></SettingsField>
          </div>
        </SettingsCard>
      )}

      {tab === 'followup' && (
        <SettingsCard title="Follow-up rules" description="Automated follow-up sequences">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsField label="Max attempts"><SettingsInput type="number" value={config.followUp.maxAttempts} onChange={(e) => setConfig({ ...config, followUp: { ...config.followUp, maxAttempts: +e.target.value } })} /></SettingsField>
            <SettingsField label="Interval (hours)"><SettingsInput type="number" value={config.followUp.intervalHours} onChange={(e) => setConfig({ ...config, followUp: { ...config.followUp, intervalHours: +e.target.value } })} /></SettingsField>
          </div>
          <p className="text-xs text-slate-500 mt-3">Channels: {config.followUp.channels.join(', ')}</p>
        </SettingsCard>
      )}

      {tab === 'assignment' && (
        <SettingsCard title="Assignment logic" description="How leads are routed to team members">
          <SettingsField label="Strategy">
            <SettingsSelect value={config.assignment.strategy} onChange={(e) => setConfig({ ...config, assignment: { ...config.assignment, strategy: e.target.value } })}>
              <option value="round_robin">Round Robin</option>
              <option value="solo_owner">Solo Owner</option>
              <option value="load_balanced">Load Balanced</option>
            </SettingsSelect>
          </SettingsField>
          <SettingsToggle enabled={config.assignment.respectWorkingHours} onChange={(v) => setConfig({ ...config, assignment: { ...config.assignment, respectWorkingHours: v } })} label="Respect working hours" />
        </SettingsCard>
      )}

      {tab === 'ai' && (
        <SettingsCard title="AI suggestions" description="Smart recommendations during lead handling">
          <SettingsToggle enabled={aiEnabled} onChange={setAiEnabled} label="Enable AI suggestions" description="Suggest replies, next actions, and lead insights" />
        </SettingsCard>
      )}
    </div>
  );
}
