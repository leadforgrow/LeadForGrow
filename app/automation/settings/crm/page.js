'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SettingsTabs, SettingsCard, SettingsField, SettingsInput, SettingsToggle, SettingsTagList } from '../../components/settings/SettingsCard';
import CustomFieldBuilder from '../../components/settings/CustomFieldBuilder';
import { MOCK_STAGES, MOCK_SOURCES, MOCK_TAGS, MOCK_PIPELINES, MOCK_CUSTOM_FIELDS } from '../../hooks/useSettings';
import { Plus } from 'lucide-react';

const TABS = [
  { id: 'stages', label: 'Lead Stages' },
  { id: 'sources', label: 'Sources' },
  { id: 'fields', label: 'Custom Fields' },
  { id: 'tags', label: 'Tags' },
  { id: 'pipelines', label: 'Pipelines' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'notifications', label: 'Notifications' }
];

export default function CRMSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'stages';
  const [stages, setStages] = useState(MOCK_STAGES);
  const [sources, setSources] = useState(MOCK_SOURCES);
  const [tags, setTags] = useState(MOCK_TAGS);
  const [pipelines, setPipelines] = useState(MOCK_PIPELINES);
  const [taskSettings, setTaskSettings] = useState({ autoCreate: true, defaultDueHours: 24, remindBefore: 30 });
  const [notifications, setNotifications] = useState({ newLead: true, taskDue: true, whatsappMessage: true, dealWon: true, dailyDigest: false });

  const setTab = (id) => router.replace(`/automation/settings/crm?tab=${id}`);

  return (
    <div className="space-y-5">
      <SettingsTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'stages' && (
        <SettingsCard title="Lead stages" description="Define your sales pipeline stages in order">
          <SettingsTagList items={stages} colorClass="bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400" />
          <button type="button" onClick={() => { setStages([...stages, 'New Stage']); toast.success('Stage added (demo)'); }} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600">
            <Plus className="w-3.5 h-3.5" /> Add stage
          </button>
        </SettingsCard>
      )}

      {tab === 'sources' && (
        <SettingsCard title="Lead sources" description="Track where your leads originate">
          <SettingsTagList items={sources} colorClass="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" />
          <button type="button" onClick={() => { setSources([...sources, 'New Source']); toast.success('Source added (demo)'); }} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600">
            <Plus className="w-3.5 h-3.5" /> Add source
          </button>
        </SettingsCard>
      )}

      {tab === 'fields' && <CustomFieldBuilder fields={MOCK_CUSTOM_FIELDS} />}

      {tab === 'tags' && (
        <SettingsCard title="Tags" description="Organize leads with flexible tags">
          <SettingsTagList items={tags} onRemove={(i) => setTags(tags.filter((_, idx) => idx !== i))} />
          <button type="button" onClick={() => setTags([...tags, 'New Tag'])} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600">
            <Plus className="w-3.5 h-3.5" /> Add tag
          </button>
        </SettingsCard>
      )}

      {tab === 'pipelines' && (
        <SettingsCard title="Pipelines" description="Manage multiple sales pipelines">
          <div className="space-y-2">
            {pipelines.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.stages} stages{p.default ? ' · Default' : ''}</p>
                </div>
                <button type="button" className="text-xs font-medium text-blue-600">Edit</button>
              </div>
            ))}
          </div>
          <button type="button" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600"><Plus className="w-3.5 h-3.5" /> Add pipeline</button>
        </SettingsCard>
      )}

      {tab === 'tasks' && (
        <SettingsCard title="Task settings" description="Defaults for task creation and reminders">
          <div className="space-y-4">
            <SettingsToggle enabled={taskSettings.autoCreate} onChange={(v) => setTaskSettings({ ...taskSettings, autoCreate: v })} label="Auto-create follow-up task on new lead" />
            <SettingsField label="Default due time (hours)">
              <SettingsInput type="number" value={taskSettings.defaultDueHours} onChange={(e) => setTaskSettings({ ...taskSettings, defaultDueHours: +e.target.value })} />
            </SettingsField>
            <SettingsField label="Reminder before due (minutes)">
              <SettingsInput type="number" value={taskSettings.remindBefore} onChange={(e) => setTaskSettings({ ...taskSettings, remindBefore: +e.target.value })} />
            </SettingsField>
          </div>
        </SettingsCard>
      )}

      {tab === 'notifications' && (
        <SettingsCard title="Notification rules" description="Control when your team gets notified">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Object.entries({ newLead: 'New lead assigned', taskDue: 'Task due soon', whatsappMessage: 'New WhatsApp message', dealWon: 'Deal marked won', dailyDigest: 'Daily digest email' }).map(([key, label]) => (
              <SettingsToggle key={key} enabled={notifications[key]} onChange={(v) => setNotifications({ ...notifications, [key]: v })} label={label} />
            ))}
          </div>
        </SettingsCard>
      )}
    </div>
  );
}
