"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  User,
  Phone,
  MoreVertical,
  Send,
  CheckCheck,
  Clock,
  Filter,
  ChevronLeft,
  Info,
  Circle,
  Hash,
  Mail,
  Calendar,
  MessagesSquare,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { computeLeadIntelligence } from '@/lib/leadIntelligence';

export default function LiveChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [tab, setTab] = useState('unread'); // 'unread' (Requesting), 'read' (Active), 'intervened'
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [businessName, setBusinessName] = useState('us');

  useEffect(() => {
    async function fetchBusiness() {
      const bName = localStorage.getItem('businessName');
      if (bName) {
        setBusinessName(bName);
      } else {
        const userId = localStorage.getItem('userid');
        if (userId) {
          try {
            const res = await fetch(`/api/auth/me?userId=${userId}`);
            const data = await res.json();
            if (data.success) {
              const name = data.data.companyName || data.data.workspace || 'us';
              setBusinessName(name);
              localStorage.setItem('businessName', name);
            }
          } catch (e) { }
        }
      }
    }
    fetchBusiness();
  }, []);

  const handleFormatText = (symbol) => {
    setReplyText(prev => prev + symbol + symbol);
    // Ideally we'd place cursor between symbols, but for now append is better than nothing
  };

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.success(`Selected file: ${file.name}. Upload coming soon!`);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const commonEmojis = ['😊', '😂', '👍', '🙏', '🔥', '❤️', '✅', '👋', '🎉', '💡', '💬', '📞'];

  const addEmoji = (emoji) => {
    setReplyText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleShareLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setReplyText(prev => prev + (prev ? '\n' : '') + "My current location: " + mapLink);
        toast.success("Location added to message");
      }, (error) => {
        toast.error("Could not get location. Please check permissions.");
      });
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileListOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    fetchTeam();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchConversations(true); // Initial load with spinner

    // Polling for real-time updates
    const interval = setInterval(() => {
      fetchConversations(false); // Silent update
      if (selectedChat) {
        fetchMessages(selectedChat.leadId._id, false); // Silent update
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tab, searchTerm, selectedChat?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch(`/api/automation/chat/conversations?status=${tab === 'all' ? '' : tab}&search=${searchTerm}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      if (showLoading) toast.error('Failed to load conversations');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchMessages = async (leadId, showLoading = false) => {
    try {
      if (showLoading) setMessagesLoading(true);
      const res = await fetch(`/api/automation/chat/messages?leadId=${leadId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      if (showLoading) toast.error('Failed to load messages');
    } finally {
      if (showLoading) setMessagesLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const userId = localStorage.getItem('userid');
      const res = await fetch(`/api/automation/team?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        // Map TeamMember.userId to a flatter structure for the dropdown
        const members = data.data.map(m => ({
          _id: m.userId?._id,
          firstName: m.userId?.firstName || 'Unknown',
          lastName: m.userId?.lastName || '',
          email: m.userId?.email
        })).filter(m => m._id);
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.leadId._id, true); // Show loading when manually selecting
    if (window.innerWidth < 1024) {
      setIsMobileListOpen(false);
    }
    // Mark as read if it was unread
    if (chat.status === 'unread') {
      markAsRead(chat.leadId._id);
    }
  };

  const handleAssignChat = async (newAssigneeId) => {
    if (!selectedChat) return;
    try {
      const res = await fetch(`/api/automation/chat/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedChat._id,
          assignedTo: newAssigneeId
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat(prev => ({ ...prev, assignedTo: data.data.assignedTo }));
        toast.success('Conversation assigned');
      }
    } catch (error) {
      toast.error('Failed to assign');
    }
  };

  const handleIntervene = async () => {
    if (!selectedChat) return;
    try {
      // 1. Mark as intervened in DB
      const res = await fetch('/api/automation/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedChat.leadId._id, status: 'intervened' })
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      // 2. Send automatic intervention message
      const introMsg = `Thanks for reaching out to ${businessName}. Our support team has joined the chat.`;

      await fetch('/api/automation/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedChat.leadId._id, message: introMsg })
      });

      // 3. Update local state
      setSelectedChat(prev => ({ ...prev, status: 'intervened' }));
      setConversations(prev => prev.map(c =>
        (c.leadId?._id === selectedChat.leadId._id || c.leadId === selectedChat.leadId._id)
          ? { ...c, status: 'intervened' }
          : c
      ));

      // Add a local system message for immediate UI feedback
      setMessages(prev => [...prev, {
        _id: 'system-' + Date.now(),
        direction: 'system',
        content: { body: 'Support Team joined the chat' },
        timestamp: new Date()
      }]);

      fetchMessages(selectedChat.leadId._id, false);
      toast.success('You have taken control of this chat');
    } catch (error) {
      console.error('Intervention error:', error);
      toast.error('Failed to intervene. Please try again.');
    }
  };

  const updateLeadStatus = async (newStatus) => {
    if (!selectedChat?.leadId) return;
    try {
      const res = await fetch(`/api/automation/leads/${selectedChat.leadId._id}?userId=${localStorage.getItem('userid')}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat(prev => ({
          ...prev,
          leadId: { ...prev.leadId, status: newStatus }
        }));
        toast.success(`Lead stage updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update stage');
    }
  };

  const addLeadNote = async () => {
    if (!newNote.trim() || !selectedChat?.leadId) return;
    try {
      const res = await fetch(`/api/automation/leads/${selectedChat.leadId._id}?userId=${localStorage.getItem('userid')}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote, performedBy: localStorage.getItem('userid') })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat(prev => ({
          ...prev,
          leadId: data.data // Refresh the lead data to get the new note
        }));
        setNewNote('');
        toast.success('Note added');
      }
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChat) return;

    const tempText = replyText;
    setReplyText('');

    try {
      // Optimistic update
      const newMessage = {
        _id: Date.now(),
        direction: 'outgoing',
        content: { body: tempText },
        timestamp: new Date(),
        status: 'sending'
      };
      setMessages(prev => [...prev, newMessage]);

      const res = await fetch('/api/automation/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedChat.leadId._id, message: tempText })
      });
      const data = await res.json();

      if (data.success) {
        // Update message status to sent
        setMessages(prev => prev.map(m => m._id === newMessage._id ? { ...m, status: 'sent', _id: data.messageId } : m));

        // Auto-intervene if not already intervened
        if (selectedChat.status !== 'intervened') {
          handleIntervene();
        }
      } else {
        toast.error(data.error || 'Failed to send');
        setMessages(prev => prev.filter(m => m._id !== newMessage._id));
        setReplyText(tempText);
      }
    } catch (error) {
      toast.error('Connection error');
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)] bg-[#f0f2f5] overflow-hidden font-sans">
      {/* 1. Left Sidebar - Lead List */}
      <div className={`flex-col w-full lg:w-[350px] bg-white border-r border-slate-200 ${isMobileListOpen ? 'flex' : 'hidden lg:flex'}`}>
        {/* Sidebar Header */}
        <div className="p-3 bg-[#f0f2f5]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or mobile number"
              className="w-full pl-10 pr-4 py-2 bg-white border-none rounded-lg text-sm focus:outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lead List Tabs */}
        <div className="flex bg-[#075e54] text-white px-2">
          <button onClick={() => setTab('all')} className={`flex-1 py-3 text-[10px] font-bold border-b-2 transition-all ${tab === 'all' ? 'border-white opacity-100' : 'border-transparent opacity-60'}`}>ALL ({conversations.length})</button>
          <button onClick={() => setTab('unread')} className={`flex-1 py-3 text-[10px] font-bold border-b-2 transition-all ${tab === 'unread' ? 'border-white opacity-100' : 'border-transparent opacity-60'}`}>UNREAD ({conversations.filter(c => c.status === 'unread').length})</button>
          <button onClick={() => setTab('read')} className={`flex-1 py-3 text-[10px] font-bold border-b-2 transition-all ${tab === 'read' ? 'border-white opacity-100' : 'border-transparent opacity-60'}`}>READ ({conversations.filter(c => c.status === 'read').length})</button>
          <button onClick={() => setTab('intervened')} className={`flex-1 py-3 text-[10px] font-bold border-b-2 transition-all ${tab === 'intervened' ? 'border-white opacity-100' : 'border-transparent opacity-60'}`}>INTERVENED ({conversations.filter(c => c.status === 'intervened').length})</button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {conversations.filter(c => tab === 'all' || c.status === tab).map((chat) => (
            <div
              key={chat._id}
              onClick={() => handleSelectChat(chat)}
              className={`flex items-center gap-3 p-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedChat?._id === chat._id ? 'bg-[#f0f2f5]' : ''}`}
            >
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                {chat.leadId?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800 truncate">{chat.leadId?.name}</span>
                  <span className="text-[10px] text-slate-400">{new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{chat.lastMessagePreview}</p>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-10 opacity-30">
              <MessageSquare className="w-12 h-12 mb-4" />
              <p className="text-sm font-medium">Seems clear !</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Chat Window */}
      <div className={`flex-1 flex-col bg-[#e5ddd5] relative ${!isMobileListOpen ? 'flex' : 'hidden lg:flex'}`}>
        {/* Chat Area Header */}
        <div className="h-14 bg-[#075e54] flex items-center px-4 lg:px-6 justify-between text-white shadow-md z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileListOpen(true)}
              className="lg:hidden p-1 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            {selectedChat && (
              <>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {selectedChat.leadId?.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">{selectedChat.leadId?.name} (+{selectedChat.leadId?.phone})</h2>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setShowMobileProfile(true)}
              className="xl:hidden px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all font-bold"
            >
              Profile
            </button>
            <span className="hidden xl:inline">Chat Profile</span>
          </div>
        </div>

        {/* Messages Area with Doodle Pattern */}
        <div className="flex-1 overflow-y-auto p-8 relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}>
          {selectedChat ? (
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((msg, i) => (
                msg.direction === 'system' ? (
                  <div key={i} className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-white/50 backdrop-blur-sm border border-slate-200/50 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
                      {msg.content?.body}
                    </span>
                  </div>
                ) : (
                  <div key={i} className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2 rounded-lg shadow-sm text-sm max-w-[80%] relative ${msg.direction === 'outgoing' ? 'bg-[#dcf8c6] text-slate-800' : 'bg-white text-slate-800'}`}>
                      <p className="mb-1 leading-relaxed">{msg.content?.body}</p>
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[9px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.direction === 'outgoing' && <CheckCheck className="w-3 h-3 text-[#34b7f1]" />}
                      </div>
                    </div>
                  </div>
                )
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-20">
              <MessageSquare className="w-20 h-20 mb-4" />
              <h3 className="text-xl font-bold">Select a chat to start</h3>
            </div>
          )}

          {/* Intervene Button */}
          {selectedChat && selectedChat.status !== 'intervened' && (
            <div className="absolute bottom-24 left-0 right-0 flex justify-center">
              <button
                onClick={handleIntervene}
                className="bg-white px-8 py-2 rounded-full border border-slate-300 shadow-lg text-[#075e54] font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
              >
                Intervene
              </button>
            </div>
          )}
        </div>

        {/* Input Footer - Only show if intervened */}
        {selectedChat?.status === 'intervened' ? (
          <div className="bg-white border-t border-slate-200">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="flex items-center gap-6 px-6 py-3 border-b border-slate-50 text-slate-500">
              {/* Emoji Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }}
                  className={`transition-all cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 ${showEmojiPicker ? 'text-[#075e54] bg-[#075e54]/5' : 'hover:text-slate-800'}`}
                  title="Emojis"
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 w-48 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-4 gap-1">
                      {commonEmojis.map(e => (
                        <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:bg-slate-50 p-1.5 rounded transition-colors">{e}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-slate-800 transition-all cursor-pointer p-1.5 rounded-lg hover:bg-slate-100" title="Attach File"><Paperclip className="w-5 h-5" /></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-slate-800 transition-all cursor-pointer p-1.5 rounded-lg hover:bg-slate-100" title="Send Image"><ImageIcon className="w-5 h-5" /></button>
              <button type="button" onClick={handleShareLocation} className="hover:text-slate-800 transition-all cursor-pointer p-1.5 rounded-lg hover:bg-slate-100" title="Share Location"><MapPin className="w-5 h-5" /></button>

              <div className="flex-1"></div>

              <button
                type="button"
                onClick={() => window.open('/automation/templates', '_blank')}
                className="hover:text-[#075e54] transition-all flex items-center gap-2 text-[#075e54] bg-[#075e54]/5 px-4 py-1.5 rounded-full cursor-pointer hover:bg-[#075e54]/10 active:scale-95 border border-[#075e54]/10"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Quick Replies</span>
              </button>
            </div>
            <div className="p-4">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-5xl mx-auto">
                <textarea
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#075e54]/20 resize-none min-h-[45px] max-h-[150px]"
                  rows={1}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button type="submit" className="p-3 bg-[#075e54] text-white rounded-xl hover:bg-[#064a42] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#075e54]/20">
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="text-center mt-3">
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">Powered by LeadForGrow</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#f0f2f5] border-t border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Intervene to start chatting</span>
          </div>
        )}
      </div>

      {/* 3. Right Sidebar - Chat Profile */}
      <div className="hidden xl:flex w-[300px] bg-white border-l border-slate-200 flex-col overflow-y-auto">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 text-sm">Chat Profile</h3>
        </div>

        <div className="p-4 space-y-6">
          {/* Collapsible Sections */}
          <details open className="group">
            <summary className="flex items-center justify-between font-bold text-xs text-slate-500 uppercase tracking-widest cursor-pointer list-none">
              Attributes
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-open:-rotate-90" />
            </summary>
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-medium text-slate-400 block mb-1">Source</span>
                <span className="text-xs font-bold text-[#075e54]">{selectedChat?.leadId?.source || 'N/A'}</span>
              </div>
            </div>
          </details>

          <details open className="group">
            <summary className="flex items-center justify-between font-bold text-xs text-slate-500 uppercase tracking-widest cursor-pointer list-none">
              Notes
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-open:-rotate-90" />
            </summary>
            <div className="mt-4 space-y-3">
              <textarea
                className="w-full p-2 text-xs border border-slate-100 rounded-lg bg-slate-50 outline-none focus:border-[#075e54] h-20 resize-none"
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button onClick={addLeadNote} className="w-full py-2 bg-[#075e54] text-white rounded-lg text-xs font-bold">Add Note</button>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {selectedChat?.leadId?.notes?.slice().reverse().map((n, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-600">
                    {n.text}
                  </div>
                ))}
              </div>
            </div>
          </details>

          <details open className="group">
            <summary className="flex items-center justify-between font-bold text-xs text-slate-500 uppercase tracking-widest cursor-pointer list-none">
              Lead Stage
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-open:-rotate-90" />
            </summary>
            <div className="mt-4">
              <select
                value={selectedChat?.leadId?.status || 'new'}
                onChange={(e) => updateLeadStatus(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 outline-none"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="follow-up">Follow-up</option>
                <option value="converted">Finalized / Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </details>

          <details open className="group">
            <summary className="flex items-center justify-between font-bold text-xs text-slate-500 uppercase tracking-widest cursor-pointer list-none">
              Assign Team Member
              <ChevronLeft className="w-3.5 h-3.5 transition-transform group-open:-rotate-90" />
            </summary>
            <div className="mt-4">
              <select
                value={selectedChat?.assignedTo?._id || ''}
                onChange={(e) => handleAssignChat(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 outline-none"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(m => (
                  <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            </div>
          </details>

          <div className="pt-4">
            <button className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
              <AlertCircle className="w-3.5 h-3.5" />
              Block Incoming Messages
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Profile Drawer/Modal */}
      {showMobileProfile && selectedChat && (
        <div className="fixed inset-0 z-[110] flex justify-end xl:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileProfile(false)}
          />
          {/* Drawer Content */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#075e54] text-white">
              <h3 className="font-bold text-sm">Lead Profile</h3>
              <button 
                onClick={() => setShowMobileProfile(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl mb-3">
                  {selectedChat.leadId?.name?.charAt(0)}
                </div>
                <h4 className="font-bold text-slate-800 text-base">{selectedChat.leadId?.name}</h4>
                <p className="text-xs text-slate-500 mt-1">+{selectedChat.leadId?.phone}</p>
              </div>

              {/* Attributes */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Attributes</span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-medium text-slate-400 block mb-1">Source</span>
                  <span className="text-xs font-bold text-[#075e54]">{selectedChat?.leadId?.source || 'N/A'}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Notes</span>
                <textarea
                  className="w-full p-2 text-xs border border-slate-100 rounded-lg bg-slate-50 outline-none focus:border-[#075e54] h-20 resize-none"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button onClick={() => { addLeadNote(); setShowMobileProfile(false); }} className="w-full py-2 bg-[#075e54] text-white rounded-lg text-xs font-bold">Add Note</button>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedChat?.leadId?.notes?.slice().reverse().map((n, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-600">
                      {n.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Stage */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lead Stage</span>
                <select
                  value={selectedChat?.leadId?.status || 'new'}
                  onChange={(e) => { updateLeadStatus(e.target.value); setShowMobileProfile(false); }}
                  className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="converted">Finalized / Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Assign Team Member */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Assign Team Member</span>
                <select
                  value={selectedChat?.assignedTo?._id || ''}
                  onChange={(e) => { handleAssignChat(e.target.value); setShowMobileProfile(false); }}
                  className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(m => (
                    <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
