'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authJson } from '@/lib/apiClient';

const AccessContext = createContext(null);

export function AccessProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState(null);
  const [usageLimits, setUsageLimits] = useState([]);
  const [moduleGroups, setModuleGroups] = useState([]);
  const [upgradeModal, setUpgradeModal] = useState({ open: false, tier: 'growth', feature: '' });

  const load = useCallback(async () => {
    try {
      const res = await authJson('/api/access/context');
      if (res.success) {
        setAccess(res.data.access);
        setUsageLimits(res.data.usageLimits || []);
        setModuleGroups(res.data.moduleGroups || []);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lfg_access', JSON.stringify(res.data.access.navAccess));
        }
      }
    } catch (e) {
      console.error('[AccessContext]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showUpgrade = (feature, tier = 'growth') => {
    setUpgradeModal({ open: true, tier, feature });
  };

  const closeUpgrade = () => setUpgradeModal((m) => ({ ...m, open: false }));

  const canAccessNav = (navId) => {
    if (!access) return true;
    if (access.isOwner) return true;
    const nav = access.navAccess?.[navId];
    if (!nav) return true;
    return nav.allowed;
  };

  const isNavLocked = (navId) => {
    const nav = access?.navAccess?.[navId];
    return nav?.locked === true;
  };

  const canModule = (moduleId, action = 'view') => {
    if (!access) return true;
    if (access.isOwner) return true;
    const mod = access.modules?.[moduleId];
    if (!mod) return false;
    if (mod.planLocked) return false;
    if (action === 'view') return mod.canView;
    return mod.actions?.includes(action);
  };

  return (
    <AccessContext.Provider
      value={{
        loading,
        access,
        usageLimits,
        moduleGroups,
        refresh: load,
        showUpgrade,
        closeUpgrade,
        upgradeModal,
        canAccessNav,
        isNavLocked,
        canModule,
        canManageAccess: access?.canManageAccess ?? false,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) {
    return {
      loading: false,
      access: null,
      usageLimits: [],
      moduleGroups: [],
      refresh: async () => {},
      showUpgrade: () => {},
      closeUpgrade: () => {},
      upgradeModal: { open: false },
      canAccessNav: () => true,
      isNavLocked: () => false,
      canModule: () => true,
      canManageAccess: false,
    };
  }
  return ctx;
}
