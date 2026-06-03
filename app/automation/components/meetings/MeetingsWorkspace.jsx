'use client';

import { Loader2 } from 'lucide-react';
import { useMeetingsWorkspace } from '../../hooks/useMeetingsWorkspace';
import MeetingsDashboard from './MeetingsDashboard';
import CreateMeetingWizard from './CreateMeetingWizard';

export default function MeetingsWorkspace() {
  const ws = useMeetingsWorkspace();

  if (ws.loading && ws.mode === 'dashboard') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[#f8f9fc] dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (ws.mode === 'create') {
    return (
      <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950">
        <CreateMeetingWizard
          step={ws.wizardStep}
          draft={ws.draft}
          onChange={ws.setDraft}
          onNext={() => ws.setWizardStep((s) => Math.min(4, s + 1))}
          onBack={() => ws.setWizardStep((s) => Math.max(1, s - 1))}
          onCancel={() => ws.setMode('dashboard')}
          onPublish={ws.publishMeeting}
          saving={ws.saving}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950">
      <MeetingsDashboard
        dashboard={ws.dashboard}
        onCreate={ws.startCreate}
        onNoShow={ws.markNoShow}
        onComplete={ws.completeBooking}
      />
    </div>
  );
}
