'use client';

import { X, Save, Settings2 } from 'lucide-react';
import AutomationStatusBadge from './StatusBadge';
import ChannelSelector from './ChannelSelector';
import TemplateEditor from './TemplateEditor';
import { getChannelLabel, getTriggerLabel } from './constants';

function PanelContent({
  rule,
  form,
  onFormChange,
  templateRules,
  cloudinaryConfig,
  onCloudinaryChange,
  onUploadMedia,
  onSave,
  saving,
  onClose
}) {
  if (!rule || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[320px] p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Settings2 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Select an automation</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">Choose a rule from the list to configure channels, templates, and settings.</p>
      </div>
    );
  }

  const hasChannelConfig = ['instant_acknowledgement', 'lost_lead_reengagement'].includes(rule.type) || form.channel;

  return (
    <>
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{rule.name}</h3>
              <AutomationStatusBadge rule={rule} size="xs" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{rule.description}</p>
            <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-slate-400">
              <span>{getTriggerLabel(rule)}</span>
              {form.channel && (
                <>
                  <span>·</span>
                  <span>{getChannelLabel({ config: form })}</span>
                </>
              )}
            </div>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {hasChannelConfig && (
          <ChannelSelector value={form.channel} onChange={(channel) => onFormChange({ ...form, channel })} />
        )}

        {(hasChannelConfig || rule.type === 'follow_up_reminder') ? (
          <TemplateEditor
            form={form}
            onChange={onFormChange}
            rule={rule}
            templateRules={templateRules}
            cloudinaryConfig={cloudinaryConfig}
            onCloudinaryChange={onCloudinaryChange}
            onUploadMedia={onUploadMedia}
          />
        ) : (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This automation runs automatically with built-in logic. Toggle it on or off from the list — no template configuration needed.
            </p>
            {rule.type === 'auto_assign' && (
              <p className="text-[11px] text-slate-500 mt-2">Assignment: {rule.config?.assignmentRule || 'round-robin'}</p>
            )}
          </div>
        )}
      </div>

      {(hasChannelConfig || rule.type === 'follow_up_reminder') && (
        <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save settings
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}

export default function AutomationSettingsPanel({
  rule,
  form,
  onFormChange,
  templateRules,
  cloudinaryConfig,
  onCloudinaryChange,
  onUploadMedia,
  onSave,
  saving,
  mobile = false,
  onClose
}) {
  const panel = (
    <PanelContent
      rule={rule}
      form={form}
      onFormChange={onFormChange}
      templateRules={templateRules}
      cloudinaryConfig={cloudinaryConfig}
      onCloudinaryChange={onCloudinaryChange}
      onUploadMedia={onUploadMedia}
      onSave={onSave}
      saving={saving}
      onClose={onClose}
    />
  );

  if (mobile) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
        <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
        <aside className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          {panel}
        </aside>
      </div>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col h-[calc(100vh-180px)] sticky top-[140px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {panel}
    </aside>
  );
}
