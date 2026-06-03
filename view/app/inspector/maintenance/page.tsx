'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

export default function InspectorMaintenancePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/inspector');
  }, [router]);

  return <Loader />;
}
