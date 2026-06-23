'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DealKanbanCard from './DealKanbanCard';

export default function DealKanbanColumn({ stage, deals, formatValue }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });

  const totalValue = deals.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 ${isOver ? 'ring-2 ring-indigo-400' : ''}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color || '#6366f1' }} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{stage.label}</span>
          <span className="text-xs text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded">{deals.length}</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-3 px-1">{formatValue(totalValue)}</p>
      <SortableContext items={deals.map((d) => d._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {deals.map((deal) => (
            <DealKanbanCard key={deal._id} deal={deal} formatValue={formatValue} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
