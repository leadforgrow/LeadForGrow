'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useLeadDetail } from '../../hooks/useLeadDetail';
import LeadDetailSkeleton from '../../components/leads/detail/LeadDetailSkeleton';
import LeadDetailHeader from '../../components/leads/detail/LeadDetailHeader';
import LeadDetailProfile from '../../components/leads/detail/LeadDetailProfile';
import LeadDetailWorkspace from '../../components/leads/detail/LeadDetailWorkspace';
import ChatbotTranscript from '../../components/leads/detail/ChatbotTranscript';

export default function LeadDetailPage({ params }) {
  const { id } = use(params);
  const detail = useLeadDetail(id);
  const [sendingChat, setSendingChat] = useState(false);

  if (detail.loading) return <LeadDetailSkeleton />;

  if (!detail.lead) {
    return (
      <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Lead not found</h2>
          <Link href="/automation/leads" className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to leads
          </Link>
        </div>
      </div>
    );
  }

  const handleSendWhatsApp = async (message) => {
    setSendingChat(true);
    try {
      return await detail.sendWhatsApp(message);
    } finally {
      setSendingChat(false);
    }
  };

  const handleTemplate = (template) => {
    const msg = detail.renderTemplate(template.body);
    if (template.channel === 'email' && detail.lead.email) {
      window.open(`mailto:${detail.lead.email}?body=${encodeURIComponent(msg)}`, '_blank');
        } else {
      detail.openWhatsApp(msg);
    }
  };

  return (
    <div className="min-h-full bg-[#f8f9fc] dark:bg-slate-950">
      <div className="px-4 sm:px-6 pb-8">
        <LeadDetailHeader
          lead={detail.lead}
          intelligence={detail.intelligence}
          updating={detail.updating}
          onCall={detail.initiateCall}
          onWhatsApp={() => detail.openWhatsApp()}
          onWon={() => detail.updateStatus('converted')}
          onLost={() => detail.updateStatus('lost')}
          onDelete={detail.deleteLead}
        />

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <LeadDetailProfile
            lead={detail.lead}
            intelligence={detail.intelligence}
            teamMembers={detail.teamMembers}
            showHistory={detail.showHistory}
            onShowHistoryChange={detail.setShowHistory}
            onStatusChange={detail.updateStatus}
            onAssign={detail.assignLead}
            templates={detail.templates}
            onTemplate={handleTemplate}
            onCall={detail.initiateCall}
            onWhatsApp={() => detail.openWhatsApp()}
          />

          <div className="space-y-6">
            {detail.lead.source === 'bot' && (
              <ChatbotTranscript lead={detail.lead} />
            )}
            <LeadDetailWorkspace
            lead={detail.lead}
            tasks={detail.tasks}
            teamMembers={detail.teamMembers}
            updating={detail.updating}
            sendingChat={sendingChat}
            onSendWhatsApp={handleSendWhatsApp}
            onAddNote={detail.addNote}
            onCreateTask={detail.createTask}
            onCompleteTask={detail.completeTask}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
