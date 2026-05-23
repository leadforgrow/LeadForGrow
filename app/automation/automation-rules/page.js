'use client';

import { Suspense, useState } from 'react';
import { useAutomationRules } from '../hooks/useAutomationRules';
import AutomationHeader from '../components/automation/AutomationHeader';
import AutomationList from '../components/automation/AutomationList';
import AutomationSettingsPanel from '../components/automation/AutomationSettingsPanel';
import CreateAutomationModal from '../components/automation/CreateAutomationModal';
import AutomationSkeleton from '../components/automation/AutomationSkeleton';

function AutomationRulesContent() {
  const ws = useAutomationRules();
  const [mobilePanel, setMobilePanel] = useState(false);

  const handleSelect = (rule) => {
    ws.selectRule(rule);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobilePanel(true);
    }
  };

  if (ws.loading) return <AutomationSkeleton />;

  return (
    <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950">
      <div className="px-4 sm:px-6 pb-8">
        <AutomationHeader
          total={ws.allRules.length}
          activeCount={ws.activeCount}
          search={ws.search}
          onSearchChange={ws.setSearch}
          statusFilter={ws.statusFilter}
          onStatusFilterChange={ws.setStatusFilter}
          refreshing={ws.refreshing}
          onRefresh={ws.refresh}
          onCreate={() => ws.setShowCreateModal(true)}
        />

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <AutomationList
              rules={ws.rules}
              selectedId={ws.selectedRule?._id}
              onSelect={handleSelect}
              onToggle={ws.toggleRule}
            />
          </div>

          <div className="lg:col-span-2">
            <AutomationSettingsPanel
              rule={ws.selectedRule}
              form={ws.editForm}
              onFormChange={ws.setEditForm}
              templateRules={ws.templateRules}
              cloudinaryConfig={ws.cloudinaryConfig}
              onCloudinaryChange={ws.saveCloudinaryConfig}
              onUploadMedia={ws.uploadHeaderMedia}
              onSave={ws.saveEdit}
              saving={ws.saving}
            />
          </div>
        </div>
      </div>

      {mobilePanel && ws.selectedRule && (
        <AutomationSettingsPanel
          mobile
          rule={ws.selectedRule}
          form={ws.editForm}
          onFormChange={ws.setEditForm}
          templateRules={ws.templateRules}
          cloudinaryConfig={ws.cloudinaryConfig}
          onCloudinaryChange={ws.saveCloudinaryConfig}
          onUploadMedia={ws.uploadHeaderMedia}
          onSave={ws.saveEdit}
          saving={ws.saving}
          onClose={() => setMobilePanel(false)}
        />
      )}

      <CreateAutomationModal
        open={ws.showCreateModal}
        form={ws.createForm}
        onChange={ws.setCreateForm}
        onClose={() => ws.setShowCreateModal(false)}
        onSubmit={ws.createRule}
      />
    </div>
  );
}

export default function AutomationRulesPage() {
  return (
    <Suspense fallback={<AutomationSkeleton />}>
      <AutomationRulesContent />
    </Suspense>
  );
}
