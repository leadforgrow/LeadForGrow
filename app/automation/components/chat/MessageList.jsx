'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-slate-500">No messages yet. Intervene to start replying.</p>
      </div>
    );
  }

  let lastDate = '';
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {messages.map((msg, i) => {
        const d = msg.timestamp ? new Date(msg.timestamp).toDateString() : '';
        const showDate = d && d !== lastDate;
        if (showDate) lastDate = d;
        return (
          <div key={msg._id || i}>
            {showDate && (
              <div className="flex justify-center my-4">
                <span className="text-[11px] font-medium text-slate-500 px-3 py-1 bg-white/90 dark:bg-slate-800/90 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-sm">
                  {new Date(msg.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
            <MessageBubble message={msg} />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
