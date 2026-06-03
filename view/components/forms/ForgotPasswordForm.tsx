'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import { apiPost } from '@/lib/api';

type Step = 'email' | 'reset';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const passwordRules = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      match: password === confirmPassword && password.length > 0,
    }),
    [password, confirmPassword]
  );

  const requestReset = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost('/auth/forgot-password', { email: email.trim() });
      toast.success('If your email is registered, a reset code has been sent.');
      setStep('reset');
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to send reset code'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: FormEvent) => {
    e.preventDefault();

    if (!passwordRules.length || !passwordRules.upper || !passwordRules.lower || !passwordRules.number) {
      toast.error('Password does not meet requirements');
      return;
    }

    if (!passwordRules.match) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiPost('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        password,
      });
      toast.success('Password reset successfully. Please log in.');
      router.push('/login?reset=1');
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      await apiPost('/auth/resend-otp', { email: email.trim() });
      toast.success('A new reset code has been sent to your email');
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to resend code'
      );
    } finally {
      setResending(false);
    }
  };

  if (step === 'email') {
    return (
      <form onSubmit={requestReset} className="w-full max-w-md space-y-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we&apos;ll send you a reset code if an account exists.
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

        <Button type="submit" className="w-full py-3.5 text-base" loading={loading}>
          Send reset code
        </Button>

        <p className="text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-[#FF383C] hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={resetPassword} className="w-full max-w-md space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter the 6-digit code sent to <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <Input
        label="Reset code"
        placeholder="6-digit code"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        maxLength={6}
        required
      />

      <PasswordInput
        label="New password"
        placeholder="Create a new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <PasswordInput
        label="Confirm password"
        placeholder="Confirm your new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <ul className="space-y-1 text-xs text-gray-500">
        <li className={passwordRules.length ? 'text-green-600' : ''}>At least 8 characters</li>
        <li className={passwordRules.upper ? 'text-green-600' : ''}>One uppercase letter</li>
        <li className={passwordRules.lower ? 'text-green-600' : ''}>One lowercase letter</li>
        <li className={passwordRules.number ? 'text-green-600' : ''}>One number</li>
        <li className={passwordRules.match ? 'text-green-600' : ''}>Passwords match</li>
      </ul>

      <Button type="submit" className="w-full py-3.5 text-base" loading={loading}>
        Reset password
      </Button>

      <div className="flex flex-col items-center gap-2 text-sm">
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="font-medium text-[#FF383C] hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending…' : 'Resend code'}
        </button>
        <Link href="/login" className="text-gray-500 hover:text-gray-700">
          Back to login
        </Link>
      </div>
    </form>
  );
}
