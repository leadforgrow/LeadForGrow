'use client';

import { Search, Plug, CheckCircle2, AlertTriangle } from 'lucide-react';
import IntegrationCard from '../../components/integrations/IntegrationCard';
import IntegrationDetailPanel from '../../components/integrations/IntegrationDetailPanel';
import { useIntegrations } from '../../hooks/useIntegrations';
import { INTEGRATION_CATEGORIES } from '../../components/integrations/constants';

export default function IntegrationsSettingsPage() {
  const {
    integrations,
    category,
    setCategory,
    search,
    setSearch,
    selected,
    setSelectedId,
    stats,
    connect,
    disconnect,
    testConnection,
    connecting
  } = useIntegrations();

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Available', value: stats.total, icon: Plug, accent: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
          { label: 'Connected', value: stats.connected, icon: CheckCircle2, accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Healthy', value: stats.healthy, icon: CheckCircle2, accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
          { label: 'Needs attention', value: stats.needsAttention, icon: AlertTriangle, accent: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' }
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search integrations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {INTEGRATION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                category === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {integrations.length === 0 ? (
        <div className="text-center py-12 text-sm text-slate-400">No integrations match your search</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {integrations.map((item) => (
            <IntegrationCard
              key={item.id}
              integration={item}
              onConnect={(id) => { connect(id); setSelectedId(id); }}
              onOpen={setSelectedId}
              onSettings={setSelectedId}
            />
          ))}
        </div>
      )}

      <IntegrationDetailPanel
        integration={selected}
        onClose={() => setSelectedId(null)}
        onConnect={connect}
        onDisconnect={disconnect}
        onTest={testConnection}
        connecting={connecting}
      />
    </div>
  );
}
