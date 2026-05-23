'use client';

import ChartCard from '../dashboard/primitives/ChartCard';
import ReportsTable from './ReportsTable';
import { formatSource } from './utils';

export default function CampaignAnalytics({ sources = [], totalLeads = 0 }) {
  const rows = sources.map((s, i) => {
    const share = totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0;
    return {
      id: s._id || i,
      source: formatSource(s._id),
      leads: s.count,
      share: `${share}%`,
      cpl: '—',
      conversion: '—'
    };
  });

  const columns = [
    { key: 'source', label: 'Source / Campaign' },
    { key: 'leads', label: 'Leads', render: (r) => <span className="tabular-nums font-medium">{r.leads}</span> },
    { key: 'share', label: 'Share' },
    { key: 'cpl', label: 'CPL' },
    { key: 'conversion', label: 'Conv. rate' }
  ];

  return (
    <ChartCard title="Campaign & Source Analysis" subtitle="Attribution and channel performance">
      <ReportsTable columns={columns} rows={rows} emptyMessage="No campaign data for this period." />
    </ChartCard>
  );
}
