'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { SettingsTabs, SettingsCard } from '../../components/settings/SettingsCard';
import BillingCard from '../../components/settings/BillingCard';
import { MOCK_BILLING } from '../../hooks/useSettings';

const TABS = [
  { id: 'plans', label: 'Plans' },
  { id: 'usage', label: 'Usage' },
  { id: 'api', label: 'API Usage' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'limits', label: 'Limits' }
];

const PLANS = [
  { name: 'Starter', price: '₹999/mo', features: ['1,000 leads', '5,000 WhatsApp msgs', '3 team members'], current: false },
  { name: 'Growth', price: '₹4,999/mo', features: ['5,000 leads', '25,000 WhatsApp msgs', '10 team members', 'AI Assistant'], current: true },
  { name: 'Agency', price: '₹14,999/mo', features: ['Unlimited leads', '100,000 WhatsApp msgs', '50 team members', 'Multi-workspace'], current: false }
];

export default function BillingSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'plans';
  const billing = MOCK_BILLING;

  const setTab = (id) => router.replace(`/automation/settings/billing?tab=${id}`);

  return (
    <div className="space-y-5">
      <SettingsTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-xl border p-5 ${plan.current ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
              {plan.current && <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">Current plan</span>}
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-1">{plan.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{plan.price}</p>
              <ul className="mt-4 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-slate-600 dark:text-slate-400">· {f}</li>
                ))}
              </ul>
              {!plan.current && (
                <button type="button" className="mt-4 w-full py-2 text-xs font-medium text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30">
                  Upgrade
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'usage' && <BillingCard billing={billing} />}

      {tab === 'api' && (
        <SettingsCard title="API usage" description="Programmatic access consumption this billing period">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'API calls', value: '12,840', limit: '50,000' },
              { label: 'Webhooks sent', value: '3,210', limit: '10,000' },
              { label: 'Webhook failures', value: '14', limit: '—' },
              { label: 'Rate limit hits', value: '2', limit: '—' }
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-[10px] text-slate-400 uppercase">{s.label}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 tabular-nums">{s.value}</p>
                {s.limit !== '—' && <p className="text-[10px] text-slate-400">of {s.limit}</p>}
              </div>
            ))}
          </div>
        </SettingsCard>
      )}

      {tab === 'invoices' && (
        <SettingsCard title="Invoices" description="Billing history for your workspace">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                  <th className="text-left py-2 font-medium">Invoice</th>
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Amount</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-right py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {billing.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{inv.id}</td>
                    <td className="py-3 text-slate-500">{inv.date}</td>
                    <td className="py-3 text-slate-900 dark:text-slate-100">{inv.amount}</td>
                    <td className="py-3"><span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded text-[10px] font-semibold capitalize">{inv.status}</span></td>
                    <td className="py-3 text-right"><button type="button" className="text-blue-600 font-medium">Download</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      )}

      {tab === 'limits' && (
        <SettingsCard title="Workspace limits" description="Resource caps for your current plan">
          <BillingCard billing={billing} />
        </SettingsCard>
      )}
    </div>
  );
}
