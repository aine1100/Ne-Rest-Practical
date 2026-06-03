'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import NotificationsList from '@/components/notifications/NotificationsList';

export default function AdminNotificationsPage() {
  return (
    <DashboardShell title="Notifications" allowedRole="admin">
      <NotificationsList title="All Notifications" />
    </DashboardShell>
  );
}
