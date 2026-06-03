'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';
import Loader from '@/components/ui/Loader';
import type { Role } from '@/lib/constants';
import { ROLE_HOME } from '@/lib/constants';

export default function DashboardShell({
  children,
  title,
  allowedRole,
}: {
  children: React.ReactNode;
  title: string;
  allowedRole: Role;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== allowedRole) {
      router.replace(ROLE_HOME[user.role] || '/login');
    }
  }, [user, loading, allowedRole, router]);

  if (loading || !user || user.role !== allowedRole) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Sidebar role={user.role} />
      <div className="flex min-h-screen flex-col pl-64">
        <Header title={title} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
