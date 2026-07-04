'use client';

import { AlertCircle, Calendar, Clock } from 'lucide-react';
import { getFollowUpMeta } from './utils';

const TONE_STYLES = {
  muted: {
    pill: 'bg-[#F9FAFB] text-[#98A2B3] border-[#EAECF0]',
    sub: 'text-[#98A2B3]',
    icon: Calendar,
  },
  overdue: {
    pill: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
    sub: 'text-[#D92D20]',
    icon: AlertCircle,
  },
  today: {
    pill: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
    sub: 'text-[#B54708]',
    icon: Clock,
  },
  upcoming: {
    pill: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
    sub: 'text-[#175CD3]',
    icon: Calendar,
  },
};

export default function FollowupChip({ date }) {
  const meta = getFollowUpMeta(date);
  const style = TONE_STYLES[meta.tone] || TONE_STYLES.muted;
  const Icon = style.icon;

  if (meta.key === 'none') {
    return (
      <div className="flex flex-col items-center justify-center gap-1 min-w-[96px]">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F4F7] text-[#98A2B3]">
          <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
        </span>
        <span className="text-[10px] font-medium text-[#98A2B3] leading-none">Not set</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1 min-w-[96px]">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold leading-none shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${style.pill}`}
      >
        <Icon className="w-3 h-3 shrink-0" strokeWidth={2.25} />
        {meta.dateLabel}
      </span>
      <span className={`text-[10px] font-medium leading-none ${style.sub}`}>{meta.subLabel}</span>
    </div>
  );
}
