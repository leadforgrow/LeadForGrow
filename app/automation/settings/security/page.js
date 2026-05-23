'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { SettingsTabs, SettingsCard, SettingsToggle } from '../../components/settings/SettingsCard';
import SecurityPanel from '../../components/settings/SecurityPanel';
import { MOCK_SECURITY } from '../../hooks/useSettings';

const TABS = [
  { id: 'access', label: 'Access Control' },
  { id: '2fa', label: '2FA' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'audit', label: 'Audit Logs' },
  { id: 'tokens', label: 'API Tokens' }
];

export default function SecuritySettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'access';
  const [security, setSecurity] = useState(MOCK_SECURITY);
  const [accessRules, setAccessRules] = useState({ ipAllowlist: false, ssoOnly: false, sessionTimeout: 30 });

  const setTab = (id) => router.replace(`/automation/settings/security?tab=${id}`);

  return (
    <div className="space-y-5">
      <SettingsTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'access' && (
        <SettingsCard title="Access control" description="Enterprise access policies">
          <SettingsToggle enabled={accessRules.ipAllowlist} onChange={(v) => setAccessRules({ ...accessRules, ipAllowlist: v })} label="IP allowlist" description="Restrict login to approved IP addresses" />
          <SettingsToggle enabled={accessRules.ssoOnly} onChange={(v) => setAccessRules({ ...accessRules, ssoOnly: v })} label="SSO-only login" description="Require single sign-on for all users" />
          <SettingsToggle enabled={true} onChange={() => toast.success('Setting updated (demo)')} label={`Session timeout: ${accessRules.sessionTimeout} minutes`} description="Auto-logout after inactivity" />
        </SettingsCard>
      )}

      {(tab === '2fa' || tab === 'sessions' || tab === 'audit' || tab === 'tokens') && (
        <SecurityPanel
          security={security}
          onToggle2FA={(v) => {
            setSecurity({ ...security, twoFactorEnabled: v });
            toast.success(v ? '2FA enabled (demo)' : '2FA disabled (demo)');
          }}
        />
      )}
    </div>
  );
}
