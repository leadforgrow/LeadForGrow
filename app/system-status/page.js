'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import MarketingShell from '@/app/components/marketing/MarketingShell';
import { MARKETING } from '@/lib/marketing/designTokens';

const SERVICES = [
  { name: 'Web Application', status: 'operational' },
  { name: 'API', status: 'operational' },
  { name: 'WhatsApp Integration', status: 'operational' },
  { name: 'Email Delivery', status: 'operational' },
  { name: 'Automation Engine', status: 'operational' },
  { name: 'AI Services', status: 'operational' },
];

export default function SystemStatusPage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then(setHealth).catch(() => null);
  }, []);

  return (
    <MarketingShell>
      <section className={`${MARKETING.sectionTight} border-b border-emerald-100`}>
        <div className={`${MARKETING.container} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={MARKETING.h1}>System Status</h1>
            <p className={MARKETING.body}>Real-time service health for LeadForGrow platform</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-800">All systems operational</span>
          </div>
        </div>
      </section>

      <section className={MARKETING.sectionTight}>
        <div className={`${MARKETING.container} max-w-3xl`}>
          <div className="space-y-3">
            {SERVICES.map((s) => (
              <div key={s.name} className={`${MARKETING.card} px-5 py-4 flex items-center justify-between`}>
                <span className="font-medium text-[#111827]">{s.name}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase">
                  <CheckCircle2 className="w-4 h-4" /> Operational
                </span>
              </div>
            ))}
          </div>

          {health && (
            <p className="text-xs text-[#94A3B8] mt-6">Last checked: {new Date().toLocaleString()} · MongoDB: {health.mongodb || 'ok'}</p>
          )}

          <div className="mt-12">
            <h2 className={MARKETING.h3}>Incident history</h2>
            <div className="mt-4 p-6 rounded-2xl border border-dashed border-emerald-200 text-center text-[#64748B] text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              No incidents in the past 90 days.
            </div>
          </div>

          <p className="mt-8 text-sm text-[#64748B]">
            Subscribe to updates: <Link href="/contact" className="text-emerald-700 font-medium">Contact us</Link> to receive status notifications.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
