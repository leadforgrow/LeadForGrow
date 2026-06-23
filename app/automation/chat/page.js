'use client';

import { Suspense, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useChatInbox } from '../hooks/useChatInbox';
import ChatSidebar from '../components/chat/ChatSidebar';
import EmailFolderBar from '../components/chat/EmailFolderBar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import AiReplyBar from '../components/ai/AiReplyBar';
import CRMProfilePanel from '../components/chat/CRMProfilePanel';

function ChatInboxContent() {
  const inbox = useChatInbox();
  const [mobileView, setMobileView] = useState('list');
  const [profileOpen, setProfileOpen] = useState(false);
  const [emailFolder, setEmailFolder] = useState('inbox');

  const [aiReplyText, setAiReplyText] = useState(null);

  const canReply =
    inbox.selectedChat?.channel === 'whatsapp'
      ? inbox.selectedChat?.inboxStatus === 'intervened' || inbox.selectedChat?.status === 'intervened'
      : !!inbox.selectedChat;

  const aiSuggestion = inbox.intelligence?.nextAction?.action
    ? `Hi ${inbox.selectedChat?.leadId?.name?.split(' ')[0] || 'there'}, ${inbox.intelligence.nextAction.action.toLowerCase()}.`
    : null;

  const handleSearchResult = (result) => {
    if (result.type === 'conversation') {
      const match = inbox.conversations.find((c) => c._id === result.item._id) || result.item;
      inbox.selectChat(match);
      setMobileView('chat');
    } else if (result.type === 'lead') {
      const match = inbox.conversations.find(
        (c) => c.leadId?._id === result.item._id || c.leadId === result.item._id
      );
      if (match) {
        inbox.selectChat(match);
        setMobileView('chat');
      }
    }
    inbox.setSearch('');
  };

  return (
    <div className="flex h-[calc(100vh-0px)] bg-[#f8f9fc] dark:bg-slate-950 overflow-hidden">
      <div
        className={`${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex h-full flex-shrink-0 w-full lg:w-[380px] xl:w-[420px] 2xl:w-[460px]`}
      >
        <ChatSidebar
          conversations={inbox.conversations}
          selectedId={inbox.selectedChat?._id}
          filter={inbox.filter}
          onFilterChange={inbox.setFilter}
          channelFilter={inbox.channelFilter}
          onChannelFilterChange={inbox.setChannelFilter}
          search={inbox.search}
          onSearchChange={inbox.setSearch}
          searchResults={inbox.searchResults}
          onSelectSearchResult={handleSearchResult}
          onSelect={(chat) => {
            inbox.selectChat(chat);
            setMobileView('chat');
          }}
          loading={inbox.loading}
        />
      </div>

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
          onUpdateConversation={inbox.updateConversation}
          onClaim={inbox.claimConversation}
          onAction={inbox.conversationAction}
          currentUserId={inbox.currentUserId}
        />

        {inbox.selectedChat ? (
          <>
            {inbox.selectedChat?.channel === 'email' && (
              <EmailFolderBar active={emailFolder} onChange={setEmailFolder} />
            )}
            <MessageList
              messages={inbox.messages}
              loading={inbox.messagesLoading}
              hasMore={inbox.hasMoreMessages}
              onLoadMore={inbox.loadOlderMessages}
              loadingMore={inbox.loadingMore}
            />
            {canReply && (
              <AiReplyBar
                channel={inbox.selectedChat?.channel || 'whatsapp'}
                customerName={inbox.selectedChat?.leadId?.name}
                lastMessage={inbox.messages.filter((m) => m.direction === 'incoming').pop()?.content?.body}
                leadId={inbox.selectedChat?.leadId?._id || inbox.selectedChat?.leadId}
                conversationId={inbox.selectedChat?._id}
                onApply={(text) => setAiReplyText(text)}
                onSend={async (text) => inbox.sendMessage(text)}
              />
            )}
            <ChatInput
              canSend={canReply}
              hasSelection={!!inbox.selectedChat}
              channel={inbox.selectedChat?.channel || 'whatsapp'}
              templates={inbox.templates}
              aiSuggestion={aiReplyText || aiSuggestion}
              onSend={inbox.sendMessage}
              onIntervene={inbox.intervene}
              onSaveDraft={inbox.selectedChat?.channel === 'email' ? inbox.saveEmailDraft : undefined}
              emailSubject={inbox.emailSubject}
              onEmailSubjectChange={inbox.setEmailSubject}
              emailCc={inbox.emailCc}
              onEmailCcChange={inbox.setEmailCc}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Unified Inbox</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">WhatsApp, Instagram & Email — select a conversation to reply.</p>
          </div>
        )}
      </main>

      <CRMProfilePanel
        chat={inbox.selectedChat}
        leadDetail={inbox.leadDetail}
        conversationDetail={inbox.conversationDetail}
        intelligence={inbox.intelligence}
        teamMembers={inbox.teamMembers}
        labels={inbox.labels}
        onStatusChange={inbox.updateLeadStatus}
        onAssign={inbox.assignChat}
        onAddNote={inbox.addNote}
        onToggleLabel={inbox.toggleLabel}
      />

      {profileOpen && inbox.selectedChat && (
        <CRMProfilePanel
          mobile
          chat={inbox.selectedChat}
          leadDetail={inbox.leadDetail}
          conversationDetail={inbox.conversationDetail}
          intelligence={inbox.intelligence}
          teamMembers={inbox.teamMembers}
          labels={inbox.labels}
          onStatusChange={inbox.updateLeadStatus}
          onAssign={inbox.assignChat}
          onAddNote={inbox.addNote}
          onToggleLabel={inbox.toggleLabel}
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
