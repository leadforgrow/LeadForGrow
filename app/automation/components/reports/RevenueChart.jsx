'use client';

import ChartCard from '../dashboard/primitives/ChartCard';
import SimpleLineChart from '../dashboard/charts/SimpleLineChart';

export default function RevenueChart({ dailyTrends = [], period }) {
  return (
    <ChartCard title="Lead Volume & Conversions" subtitle={`Daily trends · last ${period} days`}>
      <SimpleLineChart data={dailyTrends} dataKey="leads" secondaryKey="conversions" height={200} />
    </ChartCard>
  );
}
