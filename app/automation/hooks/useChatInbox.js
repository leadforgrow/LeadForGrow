'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authFetch, getUserId } from '@/lib/apiClient';
import { computeLeadIntelligence } from '@/lib/leadIntelligence';
import { useRealtime, REALTIME_EVENTS } from '@/app/automation/hooks/useRealtime';

export function useChatInbox() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [leadDetail, setLeadDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [businessName, setBusinessName] = useState('us');
  const [conversationDetail, setConversationDetail] = useState(null);
  const [labels, setLabels] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const initialLeadId = useRef(searchParams.get('leadId'));
  const selectedLeadIdRef = useRef(null);
  selectedLeadIdRef.current = selectedChat?.leadId?._id;

  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = new URLSearchParams();
      if (channelFilter !== 'all') params.set('channel', channelFilter);
      if (filter === 'unread') params.set('inboxStatus', 'unread');
      else if (filter === 'intervened') params.set('inboxStatus', 'intervened');
      else if (filter === 'assigned') params.set('status', 'assigned');
      else if (filter === 'unassigned') params.set('status', 'unassigned');
      else if (filter === 'pinned') params.set('pinned', 'true');
      else if (filter === 'archived') params.set('archived', 'true');
      if (search) params.set('search', search);
      const res = await authFetch(`/api/automation/inbox/conversations?${params}`);
      const data = await res.json();
      if (data.success) {
        const normalized = (data.data || []).map((c) => ({
          ...c,
          status: c.inboxStatus || c.status,
        }));
        setConversations(normalized);
      }
    } catch {
      if (!silent) toast.error('Failed to load conversations');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filter, channelFilter, search]);

  const fetchMessages = useCallback(async (chat, showLoading = false) => {
    if (!chat) return;
    const leadId = chat.leadId?._id || chat.leadId;
    const conversationId = chat._id && !String(chat._id).startsWith('temp_') ? chat._id : null;
    try {
      if (showLoading) setMessagesLoading(true);
      const q = conversationId
        ? `conversationId=${conversationId}`
        : `leadId=${leadId}`;
      const res = await authFetch(`/api/automation/inbox/messages?${q}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
        setHasMoreMessages(data.hasMore || false);
      }
    } catch {
      if (showLoading) toast.error('Failed to load messages');
    } finally {
      if (showLoading) setMessagesLoading(false);
    }
  }, []);

  const fetchConversationDetail = useCallback(async (conversationId) => {
    if (!conversationId || String(conversationId).startsWith('temp_')) {
      setConversationDetail(null);
      return;
    }
    const res = await authFetch(`/api/automation/inbox/conversations/${conversationId}`);
    const data = await res.json();
    if (data.success) setConversationDetail(data.data);
  }, []);

  const fetchLabels = useCallback(async () => {
    const res = await authFetch('/api/automation/inbox/labels');
    const data = await res.json();
    if (data.success) setLabels(data.data || []);
  }, []);

  const fetchLeadDetail = useCallback(async (leadId) => {
    if (!leadId) return;
    const res = await authFetch(`/api/automation/leads/${leadId}`);
    const data = await res.json();
    if (data.success) setLeadDetail(data.data);
  }, []);

  const fetchTeam = useCallback(async () => {
    const res = await authFetch('/api/automation/team');
    const data = await res.json();
    if (data.success) {
      setTeamMembers(
        data.data
          .map((m) => ({
            _id: m.userId?._id,
            firstName: m.userId?.firstName || 'Team',
            lastName: m.userId?.lastName || '',
            email: m.userId?.email
          }))
          .filter((m) => m._id)
      );
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    const res = await authFetch('/api/automation/templates');
    const data = await res.json();
    if (data.success) setTemplates(data.manual || []);
  }, []);

  useEffect(() => {
    async function init() {
      const me = await authFetch('/api/auth/me').then((r) => r.json());
      if (me.success) {
        setBusinessName(me.data.companyName || 'us');
        setCurrentUserId(me.data._id || me.data.userId);
      }
      await Promise.all([fetchTeam(), fetchTemplates(), fetchLabels()]);
    }
    init();
  }, [fetchTeam, fetchTemplates, fetchLabels]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (search.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await authFetch(`/api/automation/inbox/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) setSearchResults(data.data);
      } catch {
        setSearchResults(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useRealtime({
    onEvent: useCallback((event) => {
      if (
        event.type === REALTIME_EVENTS.CHAT_MESSAGE ||
        event.type === REALTIME_EVENTS.CHAT_READ ||
        event.type === REALTIME_EVENTS.CHAT_MESSAGE_STATUS ||
        event.type === REALTIME_EVENTS.NOTIFICATION
      ) {
        if (event.type === REALTIME_EVENTS.NOTIFICATION) {
          return;
        }
        fetchConversations(true);
        const eventLeadId = event.data?.leadId;
        const eventConvId = event.data?.conversationId;
        if (
          (eventLeadId && eventLeadId === selectedLeadIdRef.current) ||
          (eventConvId && eventConvId === selectedChat?._id)
        ) {
          if (event.type === REALTIME_EVENTS.CHAT_MESSAGE_STATUS) {
            setMessages((prev) =>
              prev.map((m) =>
                m._id === event.data?.messageId || m.messageId === event.data?.externalMessageId
                  ? { ...m, status: event.data.status }
                  : m
              )
            );
          } else {
            fetchMessages(selectedChat, false);
            if (event.type === REALTIME_EVENTS.CHAT_MESSAGE) {
              fetchLeadDetail(eventLeadId);
            }
          }
        }
      }
    }, [fetchConversations, fetchMessages, fetchLeadDetail, selectedChat]),
  });

  useEffect(() => {
    if (!selectedChat) return;
    const leadId = selectedChat.leadId?._id || selectedChat.leadId;
    if (!leadId) return;
    fetchMessages(selectedChat, true);
    fetchLeadDetail(leadId);
    if (selectedChat._id) fetchConversationDetail(selectedChat._id);
  }, [selectedChat, fetchMessages, fetchLeadDetail, fetchConversationDetail]);

  const filteredConversations = useMemo(() => {
    let list = [...conversations];
    if (filter === 'unread') list = list.filter((c) => c.status === 'unread' || c.unreadCount > 0);
    else if (filter === 'intervened') list = list.filter((c) => c.status === 'intervened');
    else if (filter === 'assigned') list = list.filter((c) => c.assignedTo || c.leadId?.assignedTo);
    else if (filter === 'unassigned') list = list.filter((c) => !c.assignedTo && !c.leadId?.assignedTo);
    else if (filter === 'hot') {
      list = list.filter((c) => {
        const p = c.leadId?.priority;
        return p === 'high' || p === 'urgent';
      });
    } else if (filter === 'followup') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      list = list.filter((c) => c.leadId?.nextFollowUpAt && new Date(c.leadId.nextFollowUpAt) <= today);
    }
    return list;
  }, [conversations, filter]);

  const intelligence = useMemo(
    () => (leadDetail ? computeLeadIntelligence(leadDetail).intelligence : null),
    [leadDetail]
  );

  const markAsRead = useCallback(async (chat) => {
    const conversationId = chat._id;
    if (conversationId && !String(conversationId).startsWith('temp_')) {
      await authFetch(`/api/automation/inbox/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markRead: true }),
      });
    } else {
      const leadId = chat.leadId?._id || chat.leadId;
      await authFetch('/api/automation/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: 'read' }),
      });
    }
    setConversations((prev) =>
      prev.map((c) =>
        c._id === chat._id ? { ...c, status: 'read', inboxStatus: 'read', unreadCount: 0 } : c
      )
    );
  }, []);

  const selectChat = useCallback(
    (chat) => {
      setSelectedChat(chat);
      if (chat.inboxStatus === 'unread' || chat.status === 'unread' || chat.unreadCount > 0) {
        markAsRead(chat);
      }
    },
    [markAsRead]
  );

  useEffect(() => {
    if (!initialLeadId.current || !conversations.length) return;
    const match = conversations.find(
      (c) => c.leadId?._id === initialLeadId.current || c.leadId === initialLeadId.current
    );
    if (match) {
      selectChat(match);
      initialLeadId.current = null;
    }
  }, [conversations, selectChat]);

  const intervene = useCallback(
    async (showToast = true) => {
      if (!selectedChat?.leadId?._id) return;
      const leadId = selectedChat.leadId._id;
      try {
        await authFetch('/api/automation/chat/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId, status: 'intervened' })
        });
        const intro = `Thanks for reaching out to ${businessName}. Our team has joined the chat.`;
        await authFetch('/api/automation/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId, message: intro })
        });
        setSelectedChat((prev) => ({ ...prev, status: 'intervened' }));
        setConversations((prev) =>
          prev.map((c) => (c.leadId?._id === leadId ? { ...c, status: 'intervened' } : c))
        );
        await fetchMessages(selectedChat, false);
        if (showToast) toast.success('Chat taken over');
      } catch {
        toast.error('Intervene failed');
      }
    },
    [selectedChat, businessName, fetchMessages]
  );

  const loadOlderMessages = useCallback(async () => {
    if (!selectedChat || loadingMore || !hasMoreMessages) return;
    const oldest = messages[0]?.timestamp;
    if (!oldest) return;
    const leadId = selectedChat.leadId?._id || selectedChat.leadId;
    const conversationId = selectedChat._id;
    const q = conversationId
      ? `conversationId=${conversationId}&before=${new Date(oldest).toISOString()}`
      : `leadId=${leadId}&before=${new Date(oldest).toISOString()}`;
    try {
      setLoadingMore(true);
      const res = await authFetch(`/api/automation/inbox/messages?${q}`);
      const data = await res.json();
      if (data.success && data.data?.length) {
        setMessages((prev) => [...data.data, ...prev]);
        setHasMoreMessages(data.hasMore);
      } else {
        setHasMoreMessages(false);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [selectedChat, messages, loadingMore, hasMoreMessages]);

  const sendMessage = useCallback(
    async (text, options = {}) => {
      const {
        isInternal = false,
        media,
        attachments = [],
        bodyHtml,
        subject,
        cc,
        scheduledAt,
      } = options;
      const hasMedia = media?.url || attachments.length > 0;
      if (!selectedChat?.leadId?._id || (!text?.trim() && !hasMedia)) return false;
      const leadId = selectedChat.leadId._id;
      const mediaItem = media || attachments[0];
      const temp = {
        _id: Date.now(),
        direction: 'outgoing',
        type: mediaItem?.mimeType ? (mediaItem.mimeType.startsWith('image/') ? 'image' : 'document') : 'text',
        content: {
          body: text,
          mediaUrl: mediaItem?.url,
          fileName: mediaItem?.fileName,
          mimeType: mediaItem?.mimeType,
        },
        timestamp: new Date(),
        status: 'sending',
        isInternal,
      };
      setMessages((prev) => [...prev, temp]);
      try {
        const res = await authFetch('/api/automation/inbox/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: selectedChat._id?.startsWith?.('temp_') ? undefined : selectedChat._id,
            leadId,
            channel: selectedChat.channel || 'whatsapp',
            message: text || '',
            isInternal,
            subject: subject ?? emailSubject,
            cc,
            bodyHtml,
            scheduledAt,
            mediaUrl: mediaItem?.url,
            mimeType: mediaItem?.mimeType,
            fileName: mediaItem?.fileName,
            attachments,
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (data.scheduled) {
            toast.success('Email scheduled');
            return true;
          }
          setMessages((prev) =>
            prev.map((m) => (m._id === temp._id ? { ...m, status: 'sent', _id: data.data?._id || data.messageId || m._id } : m))
          );
          if (!isInternal && selectedChat.channel === 'whatsapp' && selectedChat.inboxStatus !== 'intervened' && selectedChat.status !== 'intervened') {
            await intervene(false);
          }
          await fetchMessages(selectedChat, false);
          if (isInternal) fetchConversationDetail(selectedChat._id);
          return true;
        }
        setMessages((prev) => prev.map((m) => (m._id === temp._id ? { ...m, status: 'failed' } : m)));
        toast.error(data.error || 'Send failed');
        return false;
      } catch {
        setMessages((prev) => prev.map((m) => (m._id === temp._id ? { ...m, status: 'failed' } : m)));
        toast.error('Connection error');
        return false;
      }
    },
    [selectedChat, fetchMessages, intervene, fetchConversationDetail, emailSubject]
  );

  const conversationAction = useCallback(
    async (action, data = {}) => {
      if (!selectedChat?._id) return;
      const res = await authFetch(`/api/automation/inbox/conversations/${selectedChat._id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      const result = await res.json();
      if (result.success) {
        if (action === 'export') {
          const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `conversation-${selectedChat._id}.json`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Exported');
        } else if (action === 'delete') {
          setSelectedChat(null);
          fetchConversations(true);
          toast.success('Deleted');
        } else {
          setSelectedChat((prev) => ({ ...prev, ...result.data }));
          fetchConversations(true);
          toast.success('Updated');
        }
      } else {
        toast.error(result.error || 'Action failed');
      }
    },
    [selectedChat, fetchConversations]
  );

  const saveEmailDraft = useCallback(
    async (draft) => {
      const res = await authFetch('/api/automation/inbox/email/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedChat?._id,
          leadId: selectedChat?.leadId?._id,
          subject: draft.subject,
          bodyHtml: draft.body,
          cc: draft.cc ? draft.cc.split(',').map((e) => ({ email: e.trim() })) : [],
        }),
      });
      const data = await res.json();
      if (data.success) toast.success('Draft saved');
    },
    [selectedChat]
  );

  const assignChat = useCallback(
    async (assigneeId) => {
      if (!selectedChat) return;
      const conversationId = selectedChat._id;
      const endpoint = conversationId && !String(conversationId).startsWith('temp_')
        ? `/api/automation/inbox/conversations/${conversationId}/assign`
        : '/api/automation/chat/assign';
      const res = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: assigneeId, conversationId }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat((prev) => ({ ...prev, assignedTo: data.data.assignedTo }));
        fetchConversationDetail(conversationId);
        toast.success('Conversation assigned');
      }
    },
    [selectedChat, fetchConversationDetail]
  );

  const claimConversation = useCallback(async () => {
    if (!selectedChat?._id) return;
    const res = await authFetch(`/api/automation/inbox/conversations/${selectedChat._id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: true }),
    });
    const data = await res.json();
    if (data.success) {
      setSelectedChat((prev) => ({ ...prev, assignedTo: data.data.assignedTo }));
      fetchConversationDetail(selectedChat._id);
      toast.success('Conversation claimed');
    }
  }, [selectedChat, fetchConversationDetail]);

  const updateConversation = useCallback(
    async (updates) => {
      if (!selectedChat?._id) return;
      const res = await authFetch(`/api/automation/inbox/conversations/${selectedChat._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat((prev) => ({ ...prev, ...updates }));
        setConversations((prev) =>
          prev.map((c) => (c._id === selectedChat._id ? { ...c, ...updates } : c))
        );
        if (updates.isArchived) toast.success('Archived');
        else if (updates.isSpam) toast.success('Marked as spam');
        else if (updates.isPinned !== undefined) toast.success(updates.isPinned ? 'Pinned' : 'Unpinned');
        fetchConversations(true);
      }
    },
    [selectedChat, fetchConversations]
  );

  const toggleLabel = useCallback(
    async (labelId, add) => {
      if (!selectedChat?._id) return;
      const res = await authFetch(`/api/automation/inbox/conversations/${selectedChat._id}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(add ? { labelIds: [labelId], add: true } : { labelIds: [labelId], remove: true }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat((prev) => ({ ...prev, labels: data.data.labels }));
        fetchConversationDetail(selectedChat._id);
      }
    },
    [selectedChat, fetchConversationDetail]
  );

  const updateLeadStatus = useCallback(
    async (status) => {
      if (!selectedChat?.leadId?._id) return;
      const userId = getUserId();
      const res = await authFetch(`/api/automation/leads/${selectedChat.leadId._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, performedBy: userId })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat((prev) => ({ ...prev, leadId: { ...prev.leadId, status } }));
        setLeadDetail(data.data);
        toast.success('Stage updated');
      }
    },
    [selectedChat]
  );

  const addNote = useCallback(
    async (note) => {
      if (!note.trim() || !selectedChat?.leadId?._id) return;
      const userId = getUserId();
      const res = await authFetch(`/api/automation/leads/${selectedChat.leadId._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim(), performedBy: userId })
      });
      const data = await res.json();
      if (data.success) {
        setLeadDetail(data.data);
        toast.success('Note saved');
      }
    },
    [selectedChat]
  );

  const initiateCall = useCallback(async () => {
    const lead = selectedChat?.leadId;
    if (!lead?.phone) return toast.error('No phone');
    try {
      const res = await authFetch('/api/automation/calls/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getUserId(),
          businessId: localStorage.getItem('businessId'),
          leadId: lead._id,
          leadPhone: lead.phone
        })
      });
      const result = await res.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent('lfg-initiate-call', { detail: result.data }));
      } else window.location.href = `tel:${lead.phone}`;
    } catch {
      window.location.href = `tel:${lead.phone}`;
    }
  }, [selectedChat]);

  return {
    conversations: filteredConversations,
    allCount: conversations.length,
    selectedChat,
    leadDetail,
    conversationDetail,
    labels,
    currentUserId,
    searchResults,
    messages,
    teamMembers,
    templates,
    intelligence,
    loading,
    messagesLoading,
    filter,
    setFilter,
    channelFilter,
    setChannelFilter,
    search,
    setSearch,
    selectChat,
    sendMessage,
    intervene,
    assignChat,
    claimConversation,
    updateConversation,
    toggleLabel,
    updateLeadStatus,
    addNote,
    initiateCall,
    loadOlderMessages,
    hasMoreMessages,
    loadingMore,
    emailSubject,
    setEmailSubject,
    emailCc,
    setEmailCc,
    saveEmailDraft,
    conversationAction,
    refresh: () => fetchConversations(true)
  };
}
