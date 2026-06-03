'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Flame,
  FileBarChart,
  Bell,
  ClipboardList,
  History,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/constants';

const NAV: Record<Role, { href: string; label: string; icon: typeof LayoutDashboard }[]> = {
  admin: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/extinguishers', label: 'Extinguishers', icon: Flame },
    { href: '/admin/inspections', label: 'Inspections', icon: ClipboardList },
    { href: '/admin/reports', label: 'Reports', icon: FileBarChart },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  ],
  inspector: [
    { href: '/inspector', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/inspector/inspections', label: 'Inspections', icon: ClipboardList },
    { href: '/inspector/history', label: 'History', icon: History },
    { href: '/inspector/notifications', label: 'Notifications', icon: Bell },
  ],
  user: [
    { href: '/user', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/user/extinguishers', label: 'My Extinguishers', icon: Flame },
    { href: '/user/history', label: 'History', icon: History },
    { href: '/user/notifications', label: 'Notifications', icon: Bell },
    { href: '/user/profile', label: 'Profile', icon: User },
  ],
};

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = NAV[role] || [];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-6 py-5">
        <span className="text-xl font-bold text-gray-900">
          F<span className="text-[#FF383C]">E</span>MS
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== `/${role}` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-[#FF383C]/10 text-[#FF383C]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
