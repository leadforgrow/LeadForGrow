'use client';

import { useDroppable } from '@dnd-kit/core';

export default function KanbanColumn({ id, title, count, children, colorClass }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 flex flex-col rounded-xl border ${
        isOver ? 'border-blue-400 bg-blue-50/30 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
      }`}
    >
      <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${colorClass}`} />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
        <span className="ml-auto text-xs font-medium text-slate-500 tabular-nums">{count}</span>
      </div>
      <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[200px]">
        {children}
      </div>
    </div>
  );
}
