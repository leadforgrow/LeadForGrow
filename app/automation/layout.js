import { Toaster } from 'react-hot-toast';
import AccessControl from './components/AccessControl';
import Sidebar from './components/Sidebar';

export const metadata = {
  title: 'Automation - LeadForGrow',
  description: 'Lead management and automation dashboard'
};

export default function AutomationLayout({ children }) {
  return (
    <AccessControl>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </AccessControl>
  );
}
