'use client';

import { useState } from 'react';
import { UserPlus, Mail, Trash2, Building2 } from 'lucide-react';
import { SettingsCard, SettingsField, SettingsInput, SettingsSelect } from './SettingsCard';
import RoleMatrix from './RoleMatrix';
import { ROLES, DEPARTMENTS } from '../../hooks/usePermissions';

const ROLE_COLORS = {
  owner: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  admin: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  manager: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
  agent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  viewer: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
};

export default function TeamSettingsPanel({ members, roles, matrix, roleStats, onInvite, onRemove, onPermissionChange }) {
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ email: '', role: 'agent', department: 'Sales' });

  const handleInvite = () => {
    if (!invite.email.trim()) return;
    onInvite(invite);
    setInvite({ email: '', role: 'agent', department: 'Sales' });
    setShowInvite(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total members', value: roleStats.total },
          { label: 'Active', value: roleStats.active },
          { label: 'Pending invites', value: roleStats.pending },
          { label: 'Seat limit', value: `${roleStats.total}/${roleStats.limit}` }
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-50 tabular-nums mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <SettingsCard
        title="Team members"
        description={`${roleStats.total} of ${roleStats.limit} seats used`}
        footer={
          <button type="button" onClick={() => setShowInvite(true)} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700">
            <UserPlus className="w-3.5 h-3.5" /> Invite member
          </button>
        }
      >
        <div className="space-y-2 -mt-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 group">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{member.name}</p>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400"><Building2 className="w-3 h-3" /> {member.department}</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize ${ROLE_COLORS[member.role] || ROLE_COLORS.viewer}`}>
                {member.role}
              </span>
              <span className={`text-[10px] ${member.status === 'active' ? 'text-emerald-600' : member.status === 'pending' ? 'text-amber-600' : 'text-slate-400'}`}>
                {member.lastActive}
              </span>
              {member.role !== 'owner' && (
                <button type="button" onClick={() => onRemove(member.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {showInvite && (
          <div className="mt-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SettingsField label="Email" className="sm:col-span-1">
                <SettingsInput value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="colleague@company.com" />
              </SettingsField>
              <SettingsField label="Role">
                <SettingsSelect value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
                  {roles.filter((r) => r.id !== 'owner').map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </SettingsSelect>
              </SettingsField>
              <SettingsField label="Department">
                <SettingsSelect value={invite.department} onChange={(e) => setInvite({ ...invite, department: e.target.value })}>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </SettingsSelect>
              </SettingsField>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleInvite} className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg">Send invite</button>
              <button type="button" onClick={() => setShowInvite(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600">Cancel</button>
            </div>
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Role definitions" description="Overview of workspace roles">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roles.map((role) => (
            <div key={role.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-1 ${ROLE_COLORS[role.id]}`}>{role.name}</span>
              <p className="text-xs text-slate-500">{role.description}</p>
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Permissions matrix" description="Configure access levels per role">
        <RoleMatrix roles={roles} matrix={matrix} onChange={onPermissionChange} />
      </SettingsCard>
    </div>
  );
}
