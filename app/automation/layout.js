import { Toaster } from 'react-hot-toast';
import AccessControl from './components/AccessControl';
import Sidebar from './components/Sidebar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Automation - LeadForGrow',
  description: 'Lead management and automation dashboard'
};

export default function AutomationLayout({ children }) {
  return (
    <AccessControl>
      <div className="flex h-screen bg-[#fcfcfd] relative overflow-hidden">
        {/* Style injection to fix duplicate scrollbars */}
        <style dangerouslySetInnerHTML={{
          __html: `
          body { overflow: hidden !important; height: 100vh !important; }
        ` }} />

        {/* Background Decorative Blob */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none select-none z-0" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none select-none z-0" />

        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <Footer forceShow={true} />
        </main>
      </div>
    </AccessControl>
  );
}
