'use client';

import { useAppNotifications } from '../hooks/useAppNotifications';

/**
 * NotificationsHost — invisible component. Its only job is to mount
 * `useAppNotifications` once at the top of the automation layout so
 * real-time sound + browser-notification behaviour is active on every
 * page (Dashboard, Deals, Bills, etc.), not just when the user has the
 * Inbox open.
 *
 * Renders nothing. Add to layout.
 */
export default function NotificationsHost() {
  useAppNotifications();
  return null;
}
