'use client';

import { useState, useMemo } from 'react';

export const ROLES = [
  { id: 'owner', name: 'Owner', description: 'Full access to all workspace settings and billing', color: 'amber' },
  { id: 'admin', name: 'Admin', description: 'Manage team, CRM settings, and integrations', color: 'blue' },
  { id: 'manager', name: 'Sales Manager', description: 'Manage leads, reports, and team performance', color: 'violet' },
  { id: 'agent', name: 'Sales Agent', description: 'Work leads, tasks, and WhatsApp inbox', color: 'emerald' },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to leads and reports', color: 'slate' }
];

export const PERMISSION_MODULES = [
  { id: 'leads', label: 'Leads & Pipeline' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'chat', label: 'WhatsApp Inbox' },
  { id: 'reports', label: 'Reports' },
  { id: 'automation', label: 'Automation Rules' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'team', label: 'Team Management' },
  { id: 'settings', label: 'CRM Settings' },
  { id: 'billing', label: 'Billing' }
];

const DEFAULT_MATRIX = {
  owner: { leads: 'full', tasks: 'full', chat: 'full', reports: 'full', automation: 'full', integrations: 'full', team: 'full', settings: 'full', billing: 'full' },
  admin: { leads: 'full', tasks: 'full', chat: 'full', reports: 'full', automation: 'full', integrations: 'full', team: 'full', settings: 'full', billing: 'view' },
  manager: { leads: 'full', tasks: 'full', chat: 'full', reports: 'full', automation: 'view', integrations: 'none', team: 'view', settings: 'view', billing: 'none' },
  agent: { leads: 'edit', tasks: 'edit', chat: 'edit', reports: 'view', automation: 'none', integrations: 'none', team: 'none', settings: 'none', billing: 'none' },
  viewer: { leads: 'view', tasks: 'view', chat: 'view', reports: 'view', automation: 'none', integrations: 'none', team: 'none', settings: 'none', billing: 'none' }
};

export const MOCK_TEAM_MEMBERS = [
  { id: '1', name: 'Saurabh Kumar', email: 'admin@leadforgrow.com', role: 'owner', department: 'Leadership', status: 'active', lastActive: 'Now' },
  { id: '2', name: 'Priya Sharma', email: 'priya@leadforgrow.com', role: 'manager', department: 'Sales', status: 'active', lastActive: '5 min ago' },
  { id: '3', name: 'Rahul Mehta', email: 'rahul@leadforgrow.com', role: 'agent', department: 'Sales', status: 'active', lastActive: '1 hr ago' },
  { id: '4', name: 'Anita Desai', email: 'anita@leadforgrow.com', role: 'agent', department: 'Support', status: 'away', lastActive: '2 days ago' }
];

export const DEPARTMENTS = ['Sales', 'Support', 'Marketing', 'Leadership'];

export function usePermissions() {
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);
  const [members, setMembers] = useState(MOCK_TEAM_MEMBERS);

  const updatePermission = (roleId, moduleId, level) => {
    setMatrix((prev) => ({
      ...prev,
      [roleId]: { ...prev[roleId], [moduleId]: level }
    }));
  };

  const inviteMember = (data) => {
    setMembers((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: data.name || data.email.split('@')[0],
        email: data.email,
        role: data.role || 'agent',
        department: data.department || 'Sales',
        status: 'pending',
        lastActive: 'Invited'
      }
    ]);
  };

  const removeMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const roleStats = useMemo(() => ({
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    pending: members.filter((m) => m.status === 'pending').length,
    limit: 10
  }), [members]);

  return { matrix, updatePermission, members, inviteMember, removeMember, roleStats, roles: ROLES };
}
