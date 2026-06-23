'use client';

import { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import { PIPELINE_STAGES } from './constants';
import { formatSource } from './utils';
import { normalizeLeadStatus } from '@/lib/crm/leadStages';
import KanbanCard from './KanbanCard';
import KanbanColumn from './KanbanColumn';

const STAGE_DOTS = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.key, 'bg-emerald-500'])
);
STAGE_DOTS.new_lead = 'bg-slate-400';
STAGE_DOTS.won = 'bg-emerald-600';
STAGE_DOTS.lost = 'bg-red-400';

export default function CRMKanban({ leads, onStatusChange, onOpenDrawer }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columns = useMemo(() => {
    const map = {};
    PIPELINE_STAGES.forEach((s) => { map[s.key] = []; });
    leads.forEach((lead) => {
      const key = normalizeLeadStatus(lead.status);
      if (map[key]) map[key].push(lead);
      else map.new_lead.push(lead);
    });
    return map;
  }, [leads]);

  const activeLead = activeId ? leads.find((l) => l._id === activeId) : null;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const leadId = active.id;
    let newStatus = over.id;

    if (!PIPELINE_STAGES.some((s) => s.key === newStatus)) {
      const overLead = leads.find((l) => l._id === over.id);
      if (overLead) newStatus = overLead.status;
      else return;
    }

    const lead = leads.find((l) => l._id === leadId);
    if (lead && lead.status !== newStatus) {
      onStatusChange(leadId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[480px]">
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.key}
            id={stage.key}
            title={stage.label}
            count={columns[stage.key]?.length || 0}
            colorClass={STAGE_DOTS[stage.key] || 'bg-slate-400'}
          >
            <SortableContext items={columns[stage.key]?.map((l) => l._id) || []} strategy={verticalListSortingStrategy}>
              {(columns[stage.key] || []).map((lead) => (
                <KanbanCard
                  key={lead._id}
                  lead={lead}
                  onOpen={() => onOpenDrawer(lead._id)}
                />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="p-3 bg-white dark:bg-slate-900 border border-blue-300 rounded-lg shadow-lg w-64 rotate-2">
            <p className="font-medium text-sm">{activeLead.name}</p>
            <p className="text-xs text-slate-500">{formatSource(activeLead.source)}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
