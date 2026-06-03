'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME } from '@/lib/constants';
import Loader from '@/components/ui/Loader';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace(ROLE_HOME[user.role] || '/login');
    else router.replace('/login');
  }, [user, loading, router]);

  return <Loader />;
}
