'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const BusinessAssistantContext = createContext(null);

export function BusinessAssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <BusinessAssistantContext.Provider value={{ isOpen, open, close, toggle, setIsOpen }}>
      {children}
    </BusinessAssistantContext.Provider>
  );
}

export function useBusinessAssistant() {
  const ctx = useContext(BusinessAssistantContext);
  if (!ctx) {
    throw new Error('useBusinessAssistant must be used within BusinessAssistantProvider');
  }
  return ctx;
}

/** Safe hook for optional usage outside provider */
export function useBusinessAssistantOptional() {
  return useContext(BusinessAssistantContext);
}
