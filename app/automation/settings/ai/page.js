'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SettingsTabs, SettingsCard, SettingsField, SettingsSelect, SettingsToggle } from '../../components/settings/SettingsCard';
import { MOCK_AI } from '../../hooks/useSettings';

const TABS = [
  { id: 'assistant', label: 'AI Assistant' },
  { id: 'replies', label: 'Reply Suggestions' },
  { id: 'scoring', label: 'Lead Scoring' },
  { id: 'insights', label: 'AI Insights' },
  { id: 'reporting', label: 'Reporting' }
];

export default function AISettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'assistant';
  const [config, setConfig] = useState(MOCK_AI);

  const setTab = (id) => router.replace(`/automation/settings/ai?tab=${id}`);

  return (
    <div className="space-y-5">
      <SettingsTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'assistant' && (
        <SettingsCard title="AI Assistant" description="Configure your CRM copilot">
          <SettingsToggle enabled={config.assistant.enabled} onChange={(v) => setConfig({ ...config, assistant: { ...config.assistant, enabled: v } })} label="Enable AI Assistant" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <SettingsField label="Tone">
              <SettingsSelect value={config.assistant.tone} onChange={(e) => setConfig({ ...config, assistant: { ...config.assistant, tone: e.target.value } })}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="concise">Concise</option>
              </SettingsSelect>
            </SettingsField>
            <SettingsField label="Language">
              <SettingsSelect value={config.assistant.language} onChange={(e) => setConfig({ ...config, assistant: { ...config.assistant, language: e.target.value } })}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </SettingsSelect>
            </SettingsField>
          </div>
        </SettingsCard>
      )}

      {tab === 'replies' && (
        <SettingsCard title="AI reply suggestions" description="Smart WhatsApp and email reply drafts">
          <SettingsToggle enabled={config.replies.enabled} onChange={(v) => setConfig({ ...config, replies: { ...config.replies, enabled: v } })} label="Enable reply suggestions" />
          <SettingsToggle enabled={config.replies.autoSuggest} onChange={(v) => setConfig({ ...config, replies: { ...config.replies, autoSuggest: v } })} label="Auto-suggest on new messages" />
          <SettingsToggle enabled={config.replies.requireApproval} onChange={(v) => setConfig({ ...config, replies: { ...config.replies, requireApproval: v } })} label="Require approval before sending" />
        </SettingsCard>
      )}

      {tab === 'scoring' && (
        <SettingsCard title="Lead scoring" description="AI-powered lead prioritization">
          <SettingsToggle enabled={config.scoring.enabled} onChange={(v) => setConfig({ ...config, scoring: { ...config.scoring, enabled: v } })} label="Enable lead scoring" />
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Scoring factors</p>
            <div className="flex flex-wrap gap-2">
              {config.scoring.factors.map((f) => (
                <span key={f} className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 rounded-md capitalize">{f.replace('_', ' ')}</span>
              ))}
            </div>
          </div>
        </SettingsCard>
      )}

      {tab === 'insights' && (
        <SettingsCard title="AI insights" description="Automated intelligence for your pipeline">
          <SettingsToggle enabled={config.insights.weeklyDigest} onChange={(v) => setConfig({ ...config, insights: { ...config.insights, weeklyDigest: v } })} label="Weekly AI digest" />
          <SettingsToggle enabled={config.insights.pipelineAlerts} onChange={(v) => setConfig({ ...config, insights: { ...config.insights, pipelineAlerts: v } })} label="Pipeline anomaly alerts" />
          <SettingsToggle enabled={config.insights.anomalyDetection} onChange={(v) => setConfig({ ...config, insights: { ...config.insights, anomalyDetection: v } })} label="Advanced anomaly detection" />
        </SettingsCard>
      )}

      {tab === 'reporting' && (
        <SettingsCard title="Reporting preferences" description="Default analytics configuration">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsField label="Default period">
              <SettingsSelect value={config.reporting.defaultPeriod} onChange={(e) => setConfig({ ...config, reporting: { ...config.reporting, defaultPeriod: e.target.value } })}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </SettingsSelect>
            </SettingsField>
            <SettingsField label="Currency">
              <SettingsSelect value={config.reporting.currency} onChange={(e) => setConfig({ ...config, reporting: { ...config.reporting, currency: e.target.value } })}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </SettingsSelect>
            </SettingsField>
          </div>
          <SettingsToggle enabled={config.reporting.includeTeamBreakdown} onChange={(v) => setConfig({ ...config, reporting: { ...config.reporting, includeTeamBreakdown: v } })} label="Include team breakdown by default" />
        </SettingsCard>
      )}
    </div>
  );
}
