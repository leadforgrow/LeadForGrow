'use client';

import ChartCard from './primitives/ChartCard';
import SimpleBarChart from './charts/SimpleBarChart';
import SimpleLineChart from './charts/SimpleLineChart';
import SimpleDonutChart from './charts/SimpleDonutChart';

export default function AnalyticsRow({ reports }) {
  const sourceData = (reports?.leadsBySource || []).map((s) => ({
    label: s._id || 'Direct',
    value: s.count || 0
  }));

  const campaignData = sourceData.slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ChartCard title="Lead Sources" subtitle="Where leads come from · 30 days">
        <SimpleBarChart data={sourceData} color="#2563eb" />
      </ChartCard>

      <ChartCard title="Daily Activity" subtitle="Leads received vs conversions">
        <SimpleLineChart
          data={reports?.dailyTrends || []}
          dataKey="leads"
          secondaryKey="conversions"
          height={180}
        />
      </ChartCard>

      <ChartCard title="Source Mix" subtitle="Channel distribution">
        <SimpleDonutChart data={campaignData} />
      </ChartCard>
    </div>
  );
}
