'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, Bell, X, Calendar, Clock, Volume2, MessageCircle, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authFetch, getUserId } from '@/lib/apiClient';

export default function ReminderMonitor() {
    const [reminders, setReminders] = useState([]);
    const [activeCall, setActiveCall] = useState(null);
    const router = useRouter();
    const pollInterval = useRef(null);
    const notifiedTaskIds = useRef(new Set());

    const fetchDueTasks = async () => {
        try {
            const res = await authFetch('/api/automation/tasks?status=pending');
            const data = await res.json();

            if (data.success) {
                const now = new Date();
                const upcomingTasks = data.data.filter(task => {
                    const dueDate = new Date(task.dueDate);
                    // Alert if due within the next 5 mins, or any time in the past —
                    // overdue follow-ups must never silently stop being surfaced.
                    const diffInMins = (dueDate - now) / (1000 * 60);
                    return diffInMins <= 5;
                });

                // Filter out those already notified in this session to avoid spamming
                const newTasks = upcomingTasks.filter(task => !notifiedTaskIds.current.has(task._id));

                if (newTasks.length > 0) {
                    setReminders(prev => [...prev, ...newTasks]);
                    newTasks.forEach(t => notifiedTaskIds.current.add(t._id));
                    // Play subtle sound if possible
                    const audio = new Audio('/notification.mp3'); // Fallback to silent if file missing
                    audio.play().catch(() => { });
                }
            }
        } catch (error) {
            console.error('Reminder Poll Error:', error);
        }
    };

    useEffect(() => {
        fetchDueTasks();
        pollInterval.current = setInterval(fetchDueTasks, 30000); // Poll every 30s
        return () => clearInterval(pollInterval.current);
    }, []);

    const handleAction = async (task) => {
        const userId = getUserId();

        // 1. Execute Task Action
        if (task.type === 'call') {
            const bId = localStorage.getItem('businessId');
            const res = await authFetch('/api/automation/calls/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId, businessId: bId,
                    leadId: task.leadId?._id || task.leadId,
                    leadPhone: task.leadId?.phone || ''
                })
            });
            const result = await res.json();
            if (result.success) window.dispatchEvent(new CustomEvent('lfg-initiate-call', { detail: result.data }));
        } else if (task.type === 'whatsapp') {
            const phone = (task.leadId?.phone || '').replace(/\D/g, '');
            window.open(`https://wa.me/${phone}`, '_blank');
        } else if (task.type === 'email') {
            window.open(`mailto:${task.leadId?.email || ''}`, '_blank');
        }

        // 2. Mark task as completed
        await authFetch(`/api/automation/tasks/${task._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed', performedBy: userId })
        });

        dismissReminder(task._id);
    };

    const dismissReminder = (id) => {
        setReminders(prev => prev.filter(r => r._id !== id));
    };

    if (reminders.length === 0) return null;

    // Cap simultaneous popups so a backlog of overdue follow-ups doesn't flood the
    // screen — show the most urgent ones and summarize the rest instead of hiding them.
    const MAX_VISIBLE = 3;
    const sorted = [...reminders].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const visible = sorted.slice(0, MAX_VISIBLE);
    const overflowCount = sorted.length - visible.length;

    return (
        <div className="fixed top-20 right-6 z-[100] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
            {overflowCount > 0 && (
                <div className="pointer-events-auto bg-indigo-600 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold">+{overflowCount} more follow-up{overflowCount === 1 ? '' : 's'} need attention</span>
                    <button
                        onClick={() => router.push('/automation/tasks')}
                        className="shrink-0 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                    >
                        View all
                    </button>
                </div>
            )}
            {visible.map((task) => (
                <div
                    key={task._id}
                    className="pointer-events-auto bg-white border-l-4 border-indigo-600 rounded-xl shadow-2xl p-4 animate-in slide-in-from-right-10 duration-500 overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                {task.type === 'call' && <Phone className="w-5 h-5 animate-bounce" />}
                                {task.type === 'whatsapp' && <MessageCircle className="w-5 h-5 animate-pulse" />}
                                {task.type === 'email' && <Mail className="w-5 h-5 animate-pulse" />}
                                {task.type !== 'call' && task.type !== 'whatsapp' && task.type !== 'email' && <Bell className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 leading-tight">
                                    {task.type === 'call' ? 'Call Due!' :
                                        task.type === 'whatsapp' ? 'WhatsApp Due!' :
                                            task.type === 'email' ? 'Email Due!' : 'Follow-up Due!'}
                                </h4>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                                    {task.leadId?.name || 'Scheduled Lead'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => dismissReminder(task._id)} className="p-1 hover:bg-slate-50 rounded-md transition-colors">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Today, {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction(task)}
                            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-sans"
                        >
                            {task.type === 'call' && <><Phone className="w-3.5 h-3.5" /> Call Now</>}
                            {task.type === 'whatsapp' && <><MessageCircle className="w-3.5 h-3.5" /> Send Message</>}
                            {task.type === 'email' && <><Mail className="w-3.5 h-3.5" /> Send Email</>}
                            {task.type !== 'call' && task.type !== 'whatsapp' && task.type !== 'email' && <>Mark Done</>}
                        </button>
                        <button
                            onClick={() => {
                                router.push(`/automation/leads/${task.leadId?._id || task.leadId}`);
                                dismissReminder(task._id);
                            }}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                            View Lead
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
