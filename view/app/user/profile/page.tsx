'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardShell from '@/components/layout/DashboardShell';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { apiGet, apiPut } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/lib/auth';

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    apiGet<User>('/users/profile')
      .then((res) => setProfile(res.data))
      .finally(() => setLoading(false));
  }, []);

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await apiPut('/users/profile', { firstName: profile.firstName, lastName: profile.lastName });
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPut('/users/change-password', passwordForm);
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) return <DashboardShell title="Profile" allowedRole="user"><Loader /></DashboardShell>;

  return (
    <DashboardShell title="Profile" allowedRole="user">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Personal Info">
          <form onSubmit={updateProfile} className="space-y-4">
            <Input label="First Name" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
            <Input label="Last Name" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
            <Input label="Email" value={profile.email} disabled />
            <Button type="submit" loading={saving}>Save Profile</Button>
          </form>
        </Card>
        <Card title="Change Password">
          <form onSubmit={changePassword} className="space-y-4">
            <PasswordInput label="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required />
            <PasswordInput label="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
            <Button type="submit" loading={saving}>Change Password</Button>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
