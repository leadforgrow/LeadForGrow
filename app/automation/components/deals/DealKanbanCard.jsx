'use client';

import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function DealKanbanCard({ deal, formatValue }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
    >
      <Link href={`/automation/deals/${deal._id}`} className="font-medium text-sm text-slate-900 dark:text-white hover:text-indigo-600" onClick={(e) => e.stopPropagation()}>
        {deal.title}
      </Link>
      <p className="text-sm font-semibold text-indigo-600 mt-1">{formatValue(deal.amount, deal.currency)}</p>
      {deal.leadId?.name && <p className="text-xs text-slate-400 mt-1">{deal.leadId.name}</p>}
      {deal.expectedCloseDate && (
        <p className="text-xs text-slate-400 mt-1">Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</p>
      )}
    </div>
  );
}
