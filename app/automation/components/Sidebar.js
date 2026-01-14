"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Zap, 
  UserCog, 
  BarChart3, 
  Settings,
  Globe,
  CreditCard,
  HelpCircle,
  ChevronRight,
  FileText,
  PhoneCall
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [userData, setUserData] = useState({ email: 'Business Owner', plan: 'Checking...' });

  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem('userid');
        if (!userId) return;

        const res = await fetch(`/api/auth/me?userId=${userId}`);
        const data = await res.json();
        
        if (data.success) {
          setUserData({
            email: data.data.email,
            plan: data.data.plan.toUpperCase() + ' Plan'
          });
          // Update localStorage as a cache, but API remains source of truth
          localStorage.setItem('userPlan', data.data.plan);
        }
      } catch (error) {
        console.error('Sidebar user fetch error:', error);
      }
    }
    fetchUser();
  }, []);
  const navigation = [
    { name: 'Dashboard', href: '/automation', icon: LayoutDashboard },
    { name: 'Leads', href: '/automation/leads', icon: Users },
    { name: 'Tasks & Follow-ups', href: '/automation/tasks', icon: CheckSquare },
    { name: 'Automation', href: '/automation/automation-rules', icon: Zap },
    { name: 'Forms', href: '/automation/forms', icon: FileText, role: 'owner' },
    { name: 'Team & Roles', href: '/automation/team', icon: UserCog, role: 'owner' },
    { name: 'Reports', href: '/automation/reports', icon: BarChart3 },
    { name: 'Website & Integrations', href: '/automation/integrations', icon: Globe, role: 'owner' },
    { name: 'Settings', href: '/automation/settings', icon: Settings, role: 'owner' },
    { name: 'Billing & Plan', href: '/automation/billing', icon: CreditCard, role: 'owner' },
    { name: 'Call Recovery', href: '/automation/call-integration', icon: PhoneCall },
    { name: 'Help & Support', href: '/automation/help', icon: HelpCircle }
  ];

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : 'member';
  const filteredNavigation = navigation.filter(item => !item.role || item.role === userRole || userRole === 'owner');

  return (
    <div className="w-72 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <Link href="/user/home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              LeadForGrow
            </h2>
            <p className="text-xs text-slate-500 font-medium">Automation Hub</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-none'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                  <span className={`font-semibold text-sm tracking-tight transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    {item.name}
                  </span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-sm">
              {userData.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{userData.email}</p>
            <p className="text-xs text-slate-500 truncate">{userData.plan}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
