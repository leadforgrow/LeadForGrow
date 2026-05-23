'use client';

import { Suspense, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useChatInbox } from '../hooks/useChatInbox';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import CRMProfilePanel from '../components/chat/CRMProfilePanel';

function ChatInboxContent() {
  const inbox = useChatInbox();
  const [mobileView, setMobileView] = useState('list');
  const [profileOpen, setProfileOpen] = useState(false);

  const canSend = inbox.selectedChat?.status === 'intervened';
  const aiSuggestion = inbox.intelligence?.nextAction?.action
    ? `Hi ${inbox.selectedChat?.leadId?.name?.split(' ')[0] || 'there'}, ${inbox.intelligence.nextAction.action.toLowerCase()}.`
    : null;

  return (
    <div className="flex h-[calc(100vh-0px)] bg-[#f8f9fc] dark:bg-slate-950 overflow-hidden">
      {/* Left inbox — wider list panel */}
      <div
        className={`${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex h-full flex-shrink-0 w-full lg:w-[380px] xl:w-[420px] 2xl:w-[460px]`}
      >
        <ChatSidebar
          conversations={inbox.conversations}
          selectedId={inbox.selectedChat?._id}
          filter={inbox.filter}
          onFilterChange={inbox.setFilter}
          search={inbox.search}
          onSearchChange={inbox.setSearch}
          onSelect={(chat) => {
            inbox.selectChat(chat);
            setMobileView('chat');
          }}
          loading={inbox.loading}
        />
      </div>

      {/* Center chat */}
      <main
        className={`flex flex-col flex-1 min-w-0 bg-[#eef0f3] dark:bg-slate-900/50 ${
          mobileView === 'chat' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <ChatHeader
          chat={inbox.selectedChat}
          showBack={mobileView === 'chat'}
          onBack={() => setMobileView('list')}
          onCall={inbox.initiateCall}
          onAssign={inbox.assignChat}
          onSchedule={() => {}}
          onWon={() => inbox.updateLeadStatus('converted')}
          onLost={() => inbox.updateLeadStatus('lost')}
          onProfile={() => setProfileOpen(true)}
          onIntervene={inbox.intervene}
        />

        {inbox.selectedChat ? (
          <>
            <MessageList messages={inbox.messages} loading={inbox.messagesLoading} />
            <ChatInput
              canSend={canSend}
              templates={inbox.templates}
              aiSuggestion={aiSuggestion}
              onSend={inbox.sendMessage}
              onIntervene={inbox.intervene}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">WhatsApp Inbox</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">Select a conversation to view messages and manage the lead.</p>
          </div>
        )}
      </main>

      {/* Right — 25% desktop */}
      <CRMProfilePanel
        chat={inbox.selectedChat}
        leadDetail={inbox.leadDetail}
        intelligence={inbox.intelligence}
        teamMembers={inbox.teamMembers}
        onStatusChange={inbox.updateLeadStatus}
        onAssign={inbox.assignChat}
        onAddNote={inbox.addNote}
      />

      {/* Mobile profile drawer */}
      {profileOpen && inbox.selectedChat && (
        <CRMProfilePanel
          mobile
          chat={inbox.selectedChat}
          leadDetail={inbox.leadDetail}
          intelligence={inbox.intelligence}
          teamMembers={inbox.teamMembers}
          onStatusChange={inbox.updateLeadStatus}
          onAssign={inbox.assignChat}
          onAddNote={inbox.addNote}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}

export default function ChatInboxPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ChatInboxContent />
    </Suspense>
  );
}
