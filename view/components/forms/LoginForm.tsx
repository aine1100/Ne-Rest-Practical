'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      toast.success('Account verified successfully. Please log in.');
    }
    if (searchParams.get('reset') === '1') {
      toast.success('Password reset successfully. Please log in with your new password.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Fms</h1>
        <p className="mt-2 text-sm text-gray-500">
          Login to access your account to start using fms system
        </p>
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <PasswordInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm font-medium text-[#FF383C] hover:underline">
          Forgot your password?
        </Link>
      </div>

      <Button type="submit" className="w-full py-3.5 text-base" loading={loading}>
        Login
      </Button>
    </form>
  );
}
