'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import NotificationsList from '@/components/notifications/NotificationsList';

export default function UserNotificationsPage() {
  return (
    <DashboardShell title="Notifications" allowedRole="user">
      <NotificationsList title="My Notifications" />
    </DashboardShell>
  );
}
