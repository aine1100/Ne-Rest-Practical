'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/ui/Modal';
import { apiGet } from '@/lib/api';
import type { Role } from '@/lib/constants';

const NOTIFICATION_PATH: Record<Role, string> = {
  admin: '/admin/notifications',
  user: '/user/notifications',
  inspector: '/inspector/notifications',
};

export default function Header({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    apiGet<{ count: number }>('/notifications/unread-count')
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {});
  }, [user, title]);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    setConfirmLogout(false);
  };

  const notificationsHref = user ? NOTIFICATION_PATH[user.role] : '/login';

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-6 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center gap-4">
          <Link
            href={notificationsHref}
            className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#FF383C]"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF383C] px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs capitalize text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={() => setConfirmLogout(true)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#FF383C]"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <ConfirmDialog
        open={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
        loading={loading}
      />
    </>
  );
}
