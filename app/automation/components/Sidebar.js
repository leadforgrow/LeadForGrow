"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Sparkles,
  UserCog,
  BarChart3,
  Settings,
  Globe,
  CreditCard,
  HelpCircle,
  FileText,
  PhoneCall,
  Menu,
  X,
  ChevronDown,
  Building2,
  Bot,
  LogOut,
  Calendar
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [userData, setUserData] = useState({
    email: 'Business Owner',
    plan: 'Checking...',
    workspace: 'Default Workspace'
  });
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [contextualData, setContextualData] = useState({
    unreadLeads: 0,
    overdueTasks: 0,
    activeAutomations: 0
  });

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      } else {
        const savedState = localStorage.getItem('sidebarOpen');
        setIsOpen(savedState !== 'false');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
            plan: data.data.plan.toUpperCase(),
            workspace: data.data.workspace || 'Default Workspace'
          });
          localStorage.setItem('userPlan', data.data.plan);
          localStorage.setItem('businessId', data.data.businessId);
        }
      } catch (error) {
        console.error('Sidebar user fetch error:', error);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Clear storage
      localStorage.clear();
      // Clear token cookie
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // Redirect to landing page
      window.location.href = '/';
    }
  };

  useEffect(() => {
    // Fetch contextual indicators
    async function fetchContextualData() {
      try {
        // Replace with actual API calls
        // const response = await fetch('/api/sidebar/context');
        // const data = await response.json();

        // Mock data for demonstration
        setContextualData({
          unreadLeads: 3,
          overdueTasks: 2,
          activeAutomations: 5
        });
      } catch (error) {
        console.error('Failed to fetch contextual data:', error);
      }
    }

    fetchContextualData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchContextualData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', newState.toString());
    }
  };

  const rawRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : 'member';
  const userRole = (rawRole || 'member').toLowerCase();

  // Navigation structure with logical grouping
  const navigationGroups = [
    {
      label: 'Overview',
      role: 'owner', // Restricted to owners/admins
      items: [
        { name: 'Dashboard', href: '/automation', icon: LayoutDashboard }
      ]
    },
    {
      label: 'Analytics',
      role: 'owner', // Restricted to owners/admins
      items: [
        { name: 'Reports', href: '/automation/reports', icon: BarChart3 }
      ]
    },
    {
      label: 'Customer Data',
      items: [
        {
          name: 'Leads',
          href: '/automation/leads',
          icon: Users,
          count: contextualData.unreadLeads,
          urgent: contextualData.unreadLeads > 0
        },
        {
          name: 'Tasks & Follow-ups',
          href: '/automation/tasks',
          icon: CheckSquare,
          count: contextualData.overdueTasks,
          status: contextualData.overdueTasks > 0 ? 'warning' : 'neutral'
        },
        {
          name: 'Events & Sessions',
          href: '/automation/events',
          icon: Calendar
        }
      ]
    },
    {
      label: 'Automation',
      items: [
        { name: 'Automation Rules', href: '/automation/automation-rules', icon: Sparkles, count: contextualData.activeAutomations, status: 'active' },
        { name: 'Automation Sequences', href: '/automation/sequences', icon: Sparkles },
        { name: 'Email Templates', href: '/automation/templates', icon: FileText },
        { name: 'Chatbot', href: '/automation/chatbot', icon: Bot },
        { name: 'Forms', href: '/automation/forms', icon: FileText, role: 'owner' },
        { name: 'Call Recovery', href: '/automation/call-integration', icon: PhoneCall }
      ]
    },
    {
      label: 'Workspace',
      role: 'owner',
      highImpact: true,
      items: [
        { name: 'Team & Roles', href: '/automation/team', icon: UserCog, role: 'owner' },
        { name: 'Integrations', href: '/automation/integrations', icon: Globe, role: 'owner' },
        { name: 'Settings', href: '/automation/settings', icon: Settings, role: 'owner' },
        { name: 'Billing & Plan', href: '/pricing', icon: CreditCard, role: 'owner' }
      ]
    },
    {
      label: 'Support',
      items: [
        { name: 'Help & Support', href: '/contact', icon: HelpCircle }
      ]
    }
  ];

  // Filter groups and items based on role
  const filteredGroups = navigationGroups
    .filter(group => {
      if (!group.role) return true;
      if (userRole === 'owner') return true;
      if (userRole.includes('admin') || userRole.includes('super')) return true;
      return group.role === userRole;
    })
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!item.role) return true;
        if (userRole === 'owner') return true;
        if (userRole.includes('admin') || userRole.includes('super')) return true;
        return item.role === userRole;
      })
    }))
    .filter(group => group.items.length > 0);

  const renderIndicator = (item) => {
    if (item.count !== undefined && item.count > 0) {
      // Red badge = requires action (urgent/warning)
      // Neutral badge = informational only
      const requiresAction = item.urgent || item.status === 'warning';
      return (
        <span className={`
          inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-xs font-semibold tabular-nums
          ${requiresAction
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-slate-50 text-slate-600 border border-slate-200'
          }
        `}>
          {item.count > 99 ? '99+' : item.count}
        </span>
      );
    }

    // Green dot = active/running (informational)
    if (item.status === 'active') {
      return (
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Active" />
      );
    }

    return null;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'sticky'} 
        top-0 left-0 h-screen bg-white/95 backdrop-blur-2xl border-r border-slate-200/50 flex flex-col z-50
        shadow-[8px_0_40px_-10px_rgba(0,0,0,0.03)]
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72 translate-x-0' : isMobile ? 'w-72 -translate-x-full' : 'w-1 -translate-x-full'}
      `}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <Link href="/user/home" className="flex items-center gap-3 group flex-1 min-w-0">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base">L</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  LeadForGrow
                </h2>
              </div>
            </Link>
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors text-slate-600 flex-shrink-0"
              title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.label} className={`${groupIndex > 0 ? 'mt-6' : ''} ${group.highImpact ? 'mt-8 pt-2 border-t border-slate-100' : ''}`}>
              <div className="px-3 mb-2">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${group.highImpact ? 'text-slate-400' : 'text-slate-500'}`}>
                  {group.label}
                </h3>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                        if (isMobile) setIsOpen(false);
                      }}
                      className={`
                        relative flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm
                        ${isActive
                          ? 'bg-slate-100 text-slate-900 font-medium'
                          : `${group.highImpact ? 'text-slate-600' : 'text-slate-700'} hover:bg-slate-50 hover:text-slate-900 font-normal`
                        }
                        ${item.name === 'Reports' && userData.plan === 'TRIAL' ? 'opacity-50 grayscale' : ''}
                      `}
                      title={item.count !== undefined && item.count > 0 && item.status === 'active' ? `${item.count} active rules` : undefined}
                    >
                      {/* Left accent bar for active state */}
                      {isActive && (
                        <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-indigo-600 rounded-r-full"></div>
                      )}

                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-700' : group.highImpact ? 'text-slate-400' : 'text-slate-500'}`} strokeWidth={1.5} />
                        <span className="truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {renderIndicator(item)}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200">
          {/* Workspace Context */}
          <div className="px-4 py-3 border-b border-slate-100">
            <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors group">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {userData.workspace}
                  </p>
                  <p className="text-xs text-slate-500">
                    {userData.plan} Plan
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
            </button>
          </div>

          {/* User Info & Logout */}
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col gap-1">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-indigo-700 font-semibold text-sm">
                  {userData.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{userData.email}</p>
                <p className="text-xs text-slate-500">
                  {userRole === 'owner' ? 'Owner' : 'Team Member'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer group"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Hamburger Button - Shows when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors shadow-lg"
          title="Expand sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
