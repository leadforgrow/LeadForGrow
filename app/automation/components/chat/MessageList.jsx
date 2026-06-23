'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import MessageBubble from './MessageBubble';

const ESTIMATED_ROW_HEIGHT = 72;
const OVERSCAN = 8;

export default function MessageList({ messages, loading, hasMore, onLoadMore, loadingMore }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const prevLengthRef = useRef(0);
  const shouldStickBottom = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (messages.length > prevLengthRef.current && shouldStickBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLengthRef.current = messages.length;
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    shouldStickBottom.current = nearBottom;
    if (el.scrollTop < 80 && hasMore && !loadingMore) {
      onLoadMore?.();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  const { visibleMessages, topSpacer, bottomSpacer } = useMemo(() => {
    const total = messages.length;
    if (total === 0) return { visibleMessages: [], topSpacer: 0, bottomSpacer: 0 };

    const startIdx = Math.max(0, Math.floor(scrollTop / ESTIMATED_ROW_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(containerHeight / ESTIMATED_ROW_HEIGHT) + OVERSCAN * 2;
    const endIdx = Math.min(total, startIdx + visibleCount);

    return {
      visibleMessages: messages.slice(startIdx, endIdx).map((m, i) => ({ ...m, _vIdx: startIdx + i })),
      topSpacer: startIdx * ESTIMATED_ROW_HEIGHT,
      bottomSpacer: Math.max(0, (total - endIdx) * ESTIMATED_ROW_HEIGHT),
    };
  }, [messages, scrollTop, containerHeight]);

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
        <p className="text-sm text-slate-500">No messages yet. Start the conversation.</p>
      </div>
    );
  }

  let lastDate = '';
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-4"
    >
      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div style={{ height: topSpacer }} />
      {visibleMessages.map((msg) => {
        const d = msg.timestamp ? new Date(msg.timestamp).toDateString() : '';
        const showDate = d && d !== lastDate;
        if (showDate) lastDate = d;
        return (
          <div key={msg._id || msg._vIdx} data-msg-id={msg._id}>
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
      <div style={{ height: bottomSpacer }} />
      <div ref={bottomRef} />
    </div>
  );
}
