'use client';

import { statusConfig } from './utils';

export default function CompanyStatusBadge({ status, size = 'sm' }) {
  const config = statusConfig(status);
  const sizeCls = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';
  return (
    <span className={`inline-flex items-center rounded-full border font-medium whitespace-nowrap ${sizeCls} ${config.badge}`}>
      {config.label}
    </span>
  );
}
