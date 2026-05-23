'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SettingsTabs, SettingsCard } from '../../components/settings/SettingsCard';
import TeamSettingsPanel from '../../components/settings/TeamSettingsPanel';
import RoleMatrix from '../../components/settings/RoleMatrix';
import { usePermissions } from '../../hooks/usePermissions';

const TABS = [
  { id: 'members', label: 'Members' },
  { id: 'roles', label: 'Roles & Permissions' }
];

export default function TeamSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'members';
  const { members, roles, matrix, roleStats, inviteMember, removeMember, updatePermission } = usePermissions();

  const setTab = (id) => router.replace(`/automation/settings/team?tab=${id}`);

  if (tab === 'roles') {
    return (
      <div className="space-y-5">
        <SettingsTabs tabs={TABS} active={tab} onChange={setTab} />
        <SettingsCard title="Role definitions" description="Overview of workspace roles">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {roles.map((role) => (
              <div key={role.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 mb-1">{role.name}</span>
                <p className="text-xs text-slate-500">{role.description}</p>
              </div>
            ))}
          </div>
        </SettingsCard>
        <SettingsCard title="Permissions matrix" description="Configure access levels per role">
          <RoleMatrix roles={roles} matrix={matrix} onChange={updatePermission} />
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SettingsTabs tabs={TABS} active={tab} onChange={setTab} />
      <TeamSettingsPanel
        members={members}
        roles={roles}
        matrix={matrix}
        roleStats={roleStats}
        onInvite={(data) => { inviteMember(data); toast.success('Invite sent (demo)'); }}
        onRemove={(id) => { removeMember(id); toast.success('Member removed (demo)'); }}
        onPermissionChange={updatePermission}
      />
    </div>
  );
}
