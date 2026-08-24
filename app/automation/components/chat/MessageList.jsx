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
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#efeae2] dark:bg-[#0b141a]">
        <div className="w-9 h-9 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Loading messages…</p>
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
      className="flex-1 overflow-y-auto px-4 py-4 bg-[#efeae2] dark:bg-[#0b141a]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='16' cy='16' r='2'/%3E%3Ccircle cx='56' cy='36' r='2'/%3E%3Ccircle cx='36' cy='64' r='2'/%3E%3Cpath d='M8 48h8v2H8zM52 8h10v2H52zM24 34h12v2H24z'/%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      {loadingMore && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-[#25d366] border-t-transparent rounded-full animate-spin" />
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
              <div className="flex justify-center my-3">
                <span className="text-[11px] font-medium text-[#54656f] dark:text-[#8696a0] px-3 py-1 bg-[#ffffff]/95 dark:bg-[#182229]/95 rounded-lg shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] uppercase tracking-wide">
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
