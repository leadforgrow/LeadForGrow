'use client';

import { SCORE_CONFIG } from './constants';

export default function LeadScoreBadge({ intelligence }) {
  const level = intelligence?.engagementScore?.level || 'Low';
  const score = intelligence?.engagementScore?.score ?? 0;
  const config = SCORE_CONFIG[level] || SCORE_CONFIG.Low;

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md tabular-nums ${config.badge}`}>
      {Math.round(score)}
    </span>
  );
}
