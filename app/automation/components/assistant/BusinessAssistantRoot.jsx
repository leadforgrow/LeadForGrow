'use client';

import { BusinessAssistantProvider } from '../../context/BusinessAssistantContext';
import BusinessAssistantPanel from './BusinessAssistantPanel';
import BusinessAssistantFab from './BusinessAssistantFab';

export default function BusinessAssistantRoot({ children }) {
  return (
    <BusinessAssistantProvider>
      {children}
      <BusinessAssistantPanel />
      <BusinessAssistantFab />
    </BusinessAssistantProvider>
  );
}

export { BusinessAssistantTrigger } from './BusinessAssistantFab';
