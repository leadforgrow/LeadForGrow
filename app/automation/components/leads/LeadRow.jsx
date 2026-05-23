'use client';

import { memo } from 'react';
import { CheckSquare, Square, MessageSquare, Phone } from 'lucide-react';
import StatusBadge from './StatusBadge';
import WhatsAppIndicator from './WhatsAppIndicator';
import FollowupChip from './FollowupChip';
import LeadScoreBadge from './LeadScoreBadge';
import LeadActionsMenu from './LeadActionsMenu';
import { assigneeName, formatRelative, formatSource, formatDate, getLeadTags } from './utils';
import { statusLabel } from './utils';

function LeadRow({
  lead,
  selected,
  onSelect,
  onOpenDrawer,
  teamMembers,
  onAssign,
  onStatusChange,
  onCall
}) {
  const tags = getLeadTags(lead);

  return (
    <tr
      className={`group border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 cursor-pointer transition-colors ${
        selected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
      }`}
      onClick={() => onOpenDrawer(lead._id)}
    >
      <td className="py-2.5 pl-3 pr-2 w-10" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => onSelect(lead._id)} className="text-slate-400 hover:text-blue-600">
          {selected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
        </button>
      </td>
      <td className="py-2.5 px-3 min-w-[160px]">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{lead.name}</p>
        {lead.email && <p className="text-[11px] text-slate-400 truncate">{lead.email}</p>}
      </td>
      <td className="py-2.5 px-3 text-sm text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
        {lead.phone || '—'}
      </td>
      <td className="py-2.5 px-3">
        <WhatsAppIndicator lead={lead} />
      </td>
      <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
        {formatSource(lead.source)}
      </td>
      <td className="py-2.5 px-3">
        <StatusBadge status={lead.status} size="xs" />
      </td>
      <td className="py-2.5 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {statusLabel(lead.status)}
      </td>
      <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400 truncate max-w-[130px]">
        {assigneeName(lead.assignedTo)}
      </td>
      <td className="py-2.5 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {formatRelative(lead.lastContactedAt || lead.updatedAt)}
      </td>
      <td className="py-2.5 px-3">
        <FollowupChip date={lead.nextFollowUpAt} />
      </td>
      <td className="py-2.5 px-3">
        <LeadScoreBadge intelligence={lead.intelligence} />
      </td>
      <td className="py-2.5 px-3">
        <div className="flex flex-wrap gap-1 max-w-[120px]">
          {tags.length ? tags.map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-full">
              {t}
            </span>
          )) : <span className="text-xs text-slate-400">—</span>}
        </div>
      </td>
      <td className="py-2.5 px-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {formatDate(lead.receivedAt)}
      </td>
      <td className="py-2.5 px-2 w-24" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            onClick={() => onCall(lead)}
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>
          <a
            href={`/automation/chat?leadId=${lead._id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </a>
          <LeadActionsMenu
            lead={lead}
            teamMembers={teamMembers}
            onAssign={onAssign}
            onStatusChange={onStatusChange}
            onCall={onCall}
            onOpenDrawer={onOpenDrawer}
          />
        </div>
      </td>
    </tr>
  );
}

export default memo(LeadRow);
