'use client';

import { X, RefreshCw, Plug, Unplug, Copy, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { COLOR_MAP, HEALTH_STYLES } from './constants';

export default function IntegrationDetailPanel({
  integration,
  onClose,
  onConnect,
  onDisconnect,
  onTest,
  connecting
}) {
  if (!integration) return null;

  const health = HEALTH_STYLES[integration.health] || HEALTH_STYLES.disconnected;
  const colorClass = COLOR_MAP[integration.color] || COLOR_MAP.blue;

  const mockLogs = [
    { id: 1, type: 'success', message: 'Webhook received: new_lead', time: '2 min ago' },
    { id: 2, type: 'success', message: 'Sync completed — 12 records', time: '15 min ago' },
    { id: 3, type: 'warning', message: 'Rate limit approaching', time: '1 hr ago' },
    { id: 4, type: 'error', message: 'Token refresh failed (retry scheduled)', time: '3 hr ago' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${colorClass}`}>
              {integration.initials}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{integration.name}</h2>
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium mt-0.5 ${health.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
                {integration.connected ? health.label : 'Not connected'}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-400">{integration.description}</p>

          {integration.connected && integration.account && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Connected account</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{integration.account}</p>
              {integration.lastSynced && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Last synced {integration.lastSynced}</p>
              )}
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">Permissions</h3>
            <div className="flex flex-wrap gap-1.5">
              {(integration.permissions || []).map((p) => (
                <span key={p} className="px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 rounded-md">{p}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">Features</h3>
            <ul className="space-y-1">
              {(integration.features || []).map((f) => (
                <li key={f} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {integration.connected && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">Webhook endpoint</h3>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <code className="flex-1 text-[10px] font-mono text-slate-600 dark:text-slate-400 break-all">
                    https://leadforgrow.com/api/webhooks/{integration.id}
                  </code>
                  <button type="button" className="p-1.5 text-slate-400 hover:text-blue-600"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50 mb-2">Recent activity</h3>
                <div className="space-y-2">
                  {mockLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 text-xs">
                      {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />}
                      {log.type === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />}
                      {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" />}
                      <div>
                        <p className="text-slate-700 dark:text-slate-300">{log.message}</p>
                        <p className="text-slate-400">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {integration.connected ? (
            <>
              <button
                type="button"
                onClick={onTest}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${connecting ? 'animate-spin' : ''}`} /> Test connection
              </button>
              <button
                type="button"
                onClick={() => onDisconnect(integration.id)}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
              >
                <Unplug className="w-4 h-4" /> Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onConnect(integration.id)}
              disabled={connecting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              <Plug className="w-4 h-4" /> Connect {integration.name}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
