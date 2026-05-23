import { redirect } from 'next/navigation';

export default function LegacyNotificationsRedirect() {
  redirect('/automation/settings/crm?tab=notifications');
}
