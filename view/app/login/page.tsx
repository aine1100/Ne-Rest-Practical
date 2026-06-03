import Image from 'next/image';
import { Suspense } from 'react';
import LoginForm from '@/components/forms/LoginForm';
import Loader from '@/components/ui/Loader';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-4 overflow-hidden rounded-2xl border-4 h-full ">
          <Image
            src="/extinguisher.jpg"
            alt="Fire extinguishers"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <Suspense fallback={<Loader />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
