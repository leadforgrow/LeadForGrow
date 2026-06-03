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
  const [search, setSearch] = useState('');
  const [businessName, setBusinessName] = useState('us');
  const initialLeadId = useRef(searchParams.get('leadId'));
  const selectedLeadIdRef = useRef(null);
  selectedLeadIdRef.current = selectedChat?.leadId?._id;

  const fetchConversations = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const statusParam = ['unread', 'intervened'].includes(filter) ? filter : '';
      const res = await authFetch(
        `/api/automation/chat/conversations?status=${statusParam}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      if (data.success) setConversations(data.data || []);
    } catch {
      if (!silent) toast.error('Failed to load conversations');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filter, search]);

  const fetchMessages = useCallback(async (leadId, showLoading = false) => {
    if (!leadId) return;
    try {
      if (showLoading) setMessagesLoading(true);
      const res = await authFetch(`/api/automation/chat/messages?leadId=${leadId}`);
      const data = await res.json();
      if (data.success) setMessages(data.data || []);
    } catch {
      if (showLoading) toast.error('Failed to load messages');
    } finally {
      if (showLoading) setMessagesLoading(false);
    }
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
      if (me.success) setBusinessName(me.data.companyName || 'us');
      await Promise.all([fetchTeam(), fetchTemplates()]);
    }
    init();
  }, [fetchTeam, fetchTemplates]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useRealtime({
    onEvent: useCallback((event) => {
      if (
        event.type === REALTIME_EVENTS.CHAT_MESSAGE ||
        event.type === REALTIME_EVENTS.CHAT_READ
      ) {
        fetchConversations(true);
        const eventLeadId = event.data?.leadId;
        if (eventLeadId && eventLeadId === selectedLeadIdRef.current) {
          fetchMessages(eventLeadId, false);
          if (event.type === REALTIME_EVENTS.CHAT_MESSAGE) {
            fetchLeadDetail(eventLeadId);
          }
        }
      }
    }, [fetchConversations, fetchMessages, fetchLeadDetail]),
  });

  useEffect(() => {
    if (!selectedChat?.leadId?._id) return;
    fetchMessages(selectedChat.leadId._id, true);
    fetchLeadDetail(selectedChat.leadId._id);
  }, [selectedChat?.leadId?._id, fetchMessages, fetchLeadDetail]);

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

  const markAsRead = useCallback(async (leadId) => {
    await authFetch('/api/automation/chat/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, status: 'read' })
    });
    setConversations((prev) =>
      prev.map((c) =>
        c.leadId?._id === leadId ? { ...c, status: 'read', unreadCount: 0 } : c
      )
    );
  }, []);

  const selectChat = useCallback(
    (chat) => {
      setSelectedChat(chat);
      if (chat.status === 'unread' || chat.unreadCount > 0) {
        markAsRead(chat.leadId._id);
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
        await fetchMessages(leadId, false);
        if (showToast) toast.success('Chat taken over');
      } catch {
        toast.error('Intervene failed');
      }
    },
    [selectedChat, businessName, fetchMessages]
  );

  const sendMessage = useCallback(
    async (text) => {
      if (!selectedChat?.leadId?._id || !text.trim()) return false;
      const leadId = selectedChat.leadId._id;
      const temp = {
        _id: Date.now(),
        direction: 'outgoing',
        content: { body: text },
        timestamp: new Date(),
        status: 'sending'
      };
      setMessages((prev) => [...prev, temp]);
      try {
        const res = await authFetch('/api/automation/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId, message: text })
        });
        const data = await res.json();
        if (data.success) {
          setMessages((prev) =>
            prev.map((m) => (m._id === temp._id ? { ...m, status: 'sent', _id: data.messageId || m._id } : m))
          );
          if (selectedChat.status !== 'intervened') {
            await intervene(false);
          }
          await fetchMessages(leadId, false);
          return true;
        }
        setMessages((prev) => prev.filter((m) => m._id !== temp._id));
        toast.error(data.error || 'Send failed');
        return false;
      } catch {
        setMessages((prev) => prev.filter((m) => m._id !== temp._id));
        toast.error('Connection error');
        return false;
      }
    },
    [selectedChat, fetchMessages, intervene]
  );

  const assignChat = useCallback(
    async (assigneeId) => {
      if (!selectedChat) return;
      const res = await authFetch('/api/automation/chat/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedChat._id, assignedTo: assigneeId })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat((prev) => ({ ...prev, assignedTo: data.data.assignedTo }));
        toast.success('Conversation assigned');
      }
    },
    [selectedChat]
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
    messages,
    teamMembers,
    templates,
    intelligence,
    loading,
    messagesLoading,
    filter,
    setFilter,
    search,
    setSearch,
    selectChat,
    sendMessage,
    intervene,
    assignChat,
    updateLeadStatus,
    addNote,
    initiateCall,
    refresh: () => fetchConversations(true)
  };
}
