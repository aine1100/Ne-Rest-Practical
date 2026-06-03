'use client';

import DashboardShell from '@/components/layout/DashboardShell';
import NotificationsList from '@/components/notifications/NotificationsList';

export default function InspectorNotificationsPage() {
  return (
    <DashboardShell title="Notifications" allowedRole="inspector">
      <NotificationsList title="My Notifications" />
    </DashboardShell>
  );
}
