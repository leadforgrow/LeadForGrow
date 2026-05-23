import { redirect } from 'next/navigation';

export default function LegacyDetailsRedirect() {
  redirect('/automation/settings/general?tab=profile');
}
