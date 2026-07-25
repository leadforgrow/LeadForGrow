'use client';

import { TRIGGER_TYPES, ACTION_TYPES, LOGIC_TYPES, NODE_COLORS } from '@/lib/whatsappFlows/constants';

function PaletteSection({ title, items, colorKey, onAdd }) {
  const colors = NODE_COLORS[colorKey];
  return (
    <div className="mb-5">
      <h3 className={`text-[10px] uppercase tracking-wider font-semibold mb-2 ${colors.text}`}>{title}</h3>
      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.type}
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/reactflow', item.type);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => onAdd(item.type)}
            className={`w-full text-left px-2.5 py-2 rounded-lg border ${colors.border} ${colors.bg} hover:brightness-110 text-xs text-slate-200 transition`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NodePalette({ onAdd }) {
  return (
    <aside className="w-56 shrink-0 border-r border-white/10 bg-slate-950/80 overflow-y-auto p-3 hidden md:block">
      <p className="text-[11px] text-slate-500 mb-4">Drag onto canvas or click to add</p>
      <PaletteSection title="Triggers" items={TRIGGER_TYPES} colorKey="trigger" onAdd={onAdd} />
      <PaletteSection title="Actions" items={ACTION_TYPES} colorKey="action" onAdd={onAdd} />
      <PaletteSection title="Logic" items={LOGIC_TYPES} colorKey="logic" onAdd={onAdd} />
    </aside>
  );
}
