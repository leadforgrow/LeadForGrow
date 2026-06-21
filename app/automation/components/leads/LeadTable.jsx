'use client';

import { CheckSquare, Square, ChevronUp, ChevronDown } from 'lucide-react';
import { TABLE_COLUMNS } from './constants';
import LeadRow from './LeadRow';

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-300" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-blue-600" />
    : <ChevronDown className="w-3 h-3 text-blue-600" />;
}

export default function LeadTable({
  leads,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenDrawer,
  teamMembers,
  onAssign,
  onStatusChange,
  onCall,
  onRowColorChange,
  sortField,
  sortDir,
  onSort
}) {
  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 pl-3 pr-2 w-10">
                <button type="button" onClick={onToggleSelectAll} className="text-slate-400 hover:text-blue-600">
                  {allSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              {TABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="py-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap"
                  style={{ minWidth: col.minWidth }}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key === 'stage' ? 'status' : col.key === 'whatsapp' ? 'source' : col.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      {col.label}
                      <SortIcon field={col.key === 'stage' ? 'status' : col.key} sortField={sortField} sortDir={sortDir} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th className="py-3 px-2 w-24 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={TABLE_COLUMNS.length + 2} className="py-16 text-center text-sm text-slate-500">
                  No leads match your filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <LeadRow
                  key={lead._id}
                  lead={lead}
                  selected={selectedIds.includes(lead._id)}
                  onSelect={onToggleSelect}
                  onOpenDrawer={onOpenDrawer}
                  teamMembers={teamMembers}
                  onAssign={onAssign}
                  onStatusChange={onStatusChange}
                  onCall={onCall}
                  onRowColorChange={onRowColorChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
