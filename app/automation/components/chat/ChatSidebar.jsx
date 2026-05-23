'use client';

import { Search, Filter, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { INBOX_FILTERS } from './constants';
import ConversationItem from './ConversationItem';

export default function ChatSidebar({
  conversations,
  selectedId,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onSelect,
  loading
}) {
  return (
    <aside className="flex flex-col h-full w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="flex-shrink-0 p-3 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Inbox</h1>
          <Link
            href="/automation/leads/new"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600"
            title="New lead"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </Link>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {INBOX_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Filter className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No conversations</p>
            <p className="text-xs text-slate-400 mt-1">Try a different filter or search term.</p>
          </div>
        ) : (
          conversations.map((chat) => (
            <ConversationItem
              key={chat._id}
              chat={chat}
              active={selectedId === chat._id}
              onClick={() => onSelect(chat)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
