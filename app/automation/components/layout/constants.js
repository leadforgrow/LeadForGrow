import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  Kanban,
  CheckSquare,
  SlidersHorizontal,
  GitBranch,
  Mail,
  Bot,
  FileInput,
  PhoneCall,
  BarChart3,
  CalendarDays,
  UserCog,
  Plug,
  Settings
} from 'lucide-react';

export const SIDEBAR_WIDTH = {
  expanded: 260,
  collapsed: 72
};

export const NAV_GROUPS = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', name: 'Dashboard', href: '/automation', icon: LayoutDashboard, exact: true },
      { id: 'leads', name: 'Leads', href: '/automation/leads', icon: Users, badgeKey: 'unreadLeads', urgent: true },
      {
        id: 'inbox',
        name: 'WhatsApp Inbox',
        href: '/automation/chat',
        icon: MessagesSquare,
        badgeKey: 'unreadChats',
        permission: ['dashboard_access', 'reports_access']
      },
      { id: 'pipeline', name: 'Pipeline', href: '/automation/leads?view=kanban', icon: Kanban, matchPrefix: '/automation/leads' },
      { id: 'tasks', name: 'Tasks', href: '/automation/tasks', icon: CheckSquare, badgeKey: 'overdueTasks', urgent: true }
    ]
  },
  {
    id: 'automation',
    label: 'Automation',
    items: [
      { id: 'rules', name: 'Automation Rules', href: '/automation/automation-rules', icon: SlidersHorizontal, badgeKey: 'activeAutomations', dot: 'live' },
      { id: 'sequences', name: 'Sequences', href: '/automation/sequences', icon: GitBranch },
      { id: 'templates', name: 'Email Templates', href: '/automation/templates', icon: Mail },
      { id: 'chatbot', name: 'Chatbot', href: '/automation/chatbot', icon: Bot },
      { id: 'forms', name: 'Forms', href: '/automation/forms', icon: FileInput, role: 'owner' },
      { id: 'call-recovery', name: 'Call Recovery', href: '/automation/call-integration', icon: PhoneCall }
    ]
  },
  {
    id: 'insights',
    label: 'Insights',
    role: 'owner',
    items: [
      { id: 'reports', name: 'Reports', href: '/automation/reports', icon: BarChart3 },
      { id: 'events', name: 'Events & Sessions', href: '/automation/events', icon: CalendarDays, badgeKey: 'activeEvents', dot: 'live' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    role: 'owner',
    items: [
      { id: 'team', name: 'Team', href: '/automation/settings/team', icon: UserCog, role: 'owner' },
      { id: 'integrations', name: 'Integrations', href: '/automation/settings/integrations', icon: Plug, role: 'owner' },
      { id: 'crm-settings', name: 'Settings', href: '/automation/settings', icon: Settings, role: 'owner', exact: true }
    ]
  }
];

export function filterNavGroups(groups, { userRole, permissions }) {
  const role = (userRole || 'member').toLowerCase();
  const isAdmin = role === 'owner' || role.includes('admin') || role.includes('super');

  return groups
    .filter((group) => {
      if (!group.role) return true;
      return isAdmin || group.role === role;
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.role && !isAdmin && item.role !== role) return false;
        if (item.permission && !item.permission.every((p) => permissions?.includes(p))) return false;
        return true;
      })
    }))
    .filter((group) => group.items.length > 0);
}

export function isNavItemActive(pathname, searchParams, item) {
  const href = item.href.split('?')[0];
  const query = item.href.includes('?') ? item.href.split('?')[1] : '';

  if (item.exact) return pathname === href;
  if (query && searchParams) {
    const params = new URLSearchParams(query);
    const view = params.get('view');
    if (view && searchParams.get('view') === view && pathname === href) return true;
    if (item.id === 'pipeline' && pathname === href && searchParams.get('view') === 'kanban') return true;
  }
  if (item.id === 'leads' && pathname === href && searchParams?.get('view') !== 'kanban') return true;
  if (item.id === 'pipeline') return pathname === href && searchParams?.get('view') === 'kanban';
  if (item.matchPrefix) return pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`);
  return pathname === href || pathname.startsWith(`${href}/`);
}
