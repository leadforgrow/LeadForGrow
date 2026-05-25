'use client';

import { Trash2, Download } from 'lucide-react';
import { mapTeamMemberOptions } from './utils';

export default function BulkActionsBar({ count, teamMembers, onAssign, onDelete, onExport }) {
  if (count === 0) return null;

  return (
    <div className="sticky top-[72px] z-20 flex items-center gap-3 px-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg mb-3">
      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{count} selected</span>
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        <select
          defaultValue=""
          onChange={(e) => { if (e.target.value) { onAssign(e.target.value); e.target.value = ''; } }}
          className="text-xs px-2 py-1.5 rounded-md border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900"
        >
          <option value="" disabled>Assign to...</option>
          {mapTeamMemberOptions(teamMembers).map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        <button type="button" onClick={onExport} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 hover:bg-blue-100/50">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
        <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
