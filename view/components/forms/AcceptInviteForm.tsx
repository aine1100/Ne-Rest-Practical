'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { apiPost } from '@/lib/api';

export default function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromLink = searchParams.get('email') || '';

  const [email] = useState(emailFromLink);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const step = tempToken ? 'password' : 'otp';

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

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Invite link is invalid. Ask your admin to resend the invite.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost<{ tempToken: string }>('/auth/verify-otp', { email, otp });
      setTempToken(res.data.tempToken);
      toast.success('OTP verified. Set your password to finish.');
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Invalid or expired OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = async (e: FormEvent) => {
    e.preventDefault();
    if (!tempToken) return;

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
      await apiPost('/auth/set-password', { tempToken, password });
      toast.success('Account verified! Please log in.');
      router.push('/login?verified=1');
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to set password'
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await apiPost('/auth/resend-otp', { email });
      toast.success('A new OTP has been sent to your email');
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to resend OTP'
      );
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Invalid invite link</h1>
        <p className="text-sm text-gray-500">This link is missing an email address. Contact your administrator.</p>
        <Button className="w-full" onClick={() => router.push('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <form onSubmit={verifyOtp} className="w-full max-w-md space-y-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accept Invite</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        <Input label="Email" type="email" value={email} readOnly />
        <Input
          label="Verification Code"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
        />

        <Button type="submit" className="w-full py-3.5 text-base" loading={loading}>
          Verify OTP
        </Button>

        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="w-full text-sm text-[#FF383C] hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending…' : 'Resend OTP'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={completeSetup} className="w-full max-w-md space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Set Your Password</h1>
        <p className="mt-2 text-sm text-gray-500">Create a password, then you can log in to FEMS.</p>
      </div>

      <Input
        label="Password"
        type="password"
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
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
        Complete Setup
      </Button>
    </form>
  );
}
