'use client';

import ChartCard from '../dashboard/primitives/ChartCard';

export default function AnalyticsCard({ title, subtitle, action, children, className = '' }) {
  return (
    <ChartCard title={title} subtitle={subtitle} action={action} className={className}>
      {children}
    </ChartCard>
  );
}
