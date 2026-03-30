import { Toaster } from 'react-hot-toast';
import AccessControl from './components/AccessControl';
import Sidebar from './components/Sidebar';
import Footer from '../components/Footer';
import GlobalDialer from './components/GlobalDialer';
import ReminderMonitor from './components/ReminderMonitor';

export const metadata = {
  title: 'Automation - LeadForGrow',
  description: 'Lead management and automation dashboard'
};

export default function AutomationLayout({ children }) {
  return (
    <AccessControl>
      <div className="flex h-screen bg-[#f8f9fc] relative overflow-hidden">
        {/* Style injection to fix duplicate scrollbars */}
        <style dangerouslySetInnerHTML={{
          __html: `
          body { overflow: hidden !important; height: 100vh !important; }
        ` }} />

        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col bg-[#f8f9fc]">
          <div className="flex-1">
            {children}
          </div>
        </main>

        <GlobalDialer />
        <ReminderMonitor />
      </div>
    </AccessControl>
  );
}
