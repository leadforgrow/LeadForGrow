'use client';

import { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { INTEGRATIONS } from '../components/integrations/constants';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const filtered = useMemo(() => {
    return integrations.filter((item) => {
      const matchCat = category === 'all' || item.category === category;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [integrations, category, search]);

  const selected = useMemo(
    () => integrations.find((i) => i.id === selectedId) || null,
    [integrations, selectedId]
  );

  const stats = useMemo(() => ({
    total: integrations.length,
    connected: integrations.filter((i) => i.connected).length,
    healthy: integrations.filter((i) => i.health === 'healthy').length,
    needsAttention: integrations.filter((i) => i.health === 'warning' || i.health === 'error').length
  }), [integrations]);

  const connect = useCallback(async (id) => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, connected: true, health: 'healthy', lastSynced: 'Just now', account: `${i.name} Account` }
          : i
      )
    );
    setConnecting(false);
    toast.success('Integration connected (demo)');
  }, []);

  const disconnect = useCallback(async (id) => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 500));
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, connected: false, health: 'disconnected', lastSynced: null, account: undefined } : i
      )
    );
    setConnecting(false);
    toast.success('Integration disconnected (demo)');
  }, []);

  const testConnection = useCallback(async () => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setConnecting(false);
    toast.success('Connection test passed (demo)');
  }, []);

  return {
    integrations: filtered,
    allIntegrations: integrations,
    category,
    setCategory,
    search,
    setSearch,
    selected,
    selectedId,
    setSelectedId,
    stats,
    connect,
    disconnect,
    testConnection,
    connecting
  };
}
