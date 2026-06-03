'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { apiGet, apiPatch } from '@/lib/api';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function NotificationsList({ title = 'Notifications' }: { title?: string }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiGet<NotificationItem[]>('/notifications', { limit: 50 })
      .then((res) => setItems(res.data))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (id: number) => {
    try {
      await apiPatch(`/notifications/${id}/read`);
      load();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await apiPatch('/notifications/read-all');
      toast.success('All marked as read');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <Card title={title} action={<Button variant="secondary" onClick={markAllRead}>Mark all read</Button>}>
      {loading ? (
        <Loader />
      ) : (
        <Table headers={['Title', 'Message', 'Type', 'Status', 'Date', 'Action']} empty="No notifications yet">
          {items.length === 0 ? null : items.map((n) => (
            <tr key={n.id}>
              <td className="px-4 py-3 text-sm font-medium">{n.title}</td>
              <td className="max-w-md px-4 py-3 text-sm text-gray-600">{n.message}</td>
              <td className="px-4 py-3 text-xs text-gray-500">{n.type}</td>
              <td className="px-4 py-3"><Badge status={n.status} /></td>
              <td className="px-4 py-3 text-sm text-gray-500">{new Date(n.createdAt).toLocaleString()}</td>
              <td className="px-4 py-3">
                {n.status === 'unread' && (
                  <Button variant="ghost" onClick={() => markRead(n.id)}>Mark read</Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
}
