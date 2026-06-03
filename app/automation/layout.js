import { Toaster } from 'react-hot-toast';
import AccessControl from './components/AccessControl';
import { AccessProvider } from './context/AccessContext';
import UpgradeGateModal from './components/access/UpgradeGateModal';
import Sidebar from './components/Sidebar';
import GlobalDialer from './components/GlobalDialer';
import ReminderMonitor from './components/ReminderMonitor';
import BusinessAssistantRoot from './components/assistant/BusinessAssistantRoot';

export const metadata = {
  title: 'Automation - LeadForGrow',
  description: 'Lead management and automation dashboard'
};

export default function AutomationLayout({ children }) {
  return (
    <AccessControl>
      <AccessProvider>
      <BusinessAssistantRoot>
        <div className="flex h-screen bg-[#f8f9fc] dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
          <style dangerouslySetInnerHTML={{
            __html: `body { overflow: hidden !important; height: 100vh !important; }`
          }} />

          <Sidebar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-[#f8f9fc] dark:bg-slate-950 transition-colors duration-300">
            <div className="flex-1">{children}</div>
          </main>

          <GlobalDialer />
          <ReminderMonitor />
        </div>
      </BusinessAssistantRoot>
      <UpgradeGateModal />
      </AccessProvider>
    </AccessControl>
  );
}
