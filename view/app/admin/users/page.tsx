'use client';

import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardShell from '@/components/layout/DashboardShell';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import ConfirmDialog, { Modal } from '@/components/ui/Modal';
import TableFilters, { buildFilterParams, emptyFilters, type TableFilterValues } from '@/components/ui/TableFilters';
import { useAuth } from '@/context/AuthContext';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api';
import { exportFilteredCsv } from '@/lib/export';
import type { User } from '@/lib/auth';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'user' });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState<TableFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<TableFilterValues>(emptyFilters);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  const load = (active = appliedFilters) => {
    setLoading(true);
    apiGet<User[]>('/users', buildFilterParams(active))
      .then((res) => {
        setUsers(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openInvite = () => {
    setEditUser(null);
    setForm({ firstName: '', lastName: '', email: '', role: 'user' });
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setModalOpen(true);
  };

  const invite = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiPost('/users', form);
      toast.success('User invited — OTP sent to email');
      setModalOpen(false);
      setForm({ firstName: '', lastName: '', email: '', role: 'user' });
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setSubmitting(true);
    try {
      await apiPut(`/users/${editUser.id}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
      });
      toast.success('User updated');
      setModalOpen(false);
      setEditUser(null);
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const removeUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/users/${deleteTarget.id}`);
      toast.success('User deleted');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = (user: User) =>
    user.role !== 'admin' && user.id !== currentUser?.id;

  const exportCsv = async () => {
    setExporting(true);
    try {
      await exportFilteredCsv('/reports/export/users/csv', appliedFilters, 'fems-users.csv');
      toast.success('Users exported');
    } catch {
      toast.error('Failed to export users');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardShell title="User Management" allowedRole="admin">
      <Card
        title={`All Users (${total})`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportCsv} loading={exporting}>Export CSV</Button>
            <Button onClick={openInvite}>Invite User</Button>
          </div>
        }
      >
        <TableFilters
          values={filters}
          onChange={setFilters}
          onApply={() => { setAppliedFilters(filters); load(filters); }}
          onReset={() => { setFilters(emptyFilters); setAppliedFilters(emptyFilters); load(emptyFilters); }}
          statusOptions={['pending', 'active', 'inactive', 'suspended']}
          searchPlaceholder="Search name or email…"
          dateLabel="Joined"
        />
        {loading ? (
          <Loader />
        ) : (
          <Table headers={['Name', 'Email', 'Role', 'Status', 'Actions']} empty="No users match your filters">
            {users.length === 0 ? null : users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-sm">{u.firstName} {u.lastName}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-sm capitalize">{u.role}</td>
                <td className="px-4 py-3"><Badge status={u.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => openEdit(u)}>Edit</Button>
                    {canDelete(u) && (
                      <Button variant="ghost" className="text-red-500" onClick={() => setDeleteTarget(u)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title={editUser ? 'Edit User' : 'Invite User'}
        onClose={() => {
          setModalOpen(false);
          setEditUser(null);
        }}
      >
        <form onSubmit={editUser ? saveEdit : invite} className="space-y-4">
          <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            readOnly={!!editUser}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Role</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              disabled={editUser?.role === 'admin' && editUser.id === currentUser?.id}
            >
              <option value="user">User</option>
              <option value="inspector">Inspector</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" loading={submitting} className="w-full">
            {editUser ? 'Save Changes' : 'Send Invite'}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        onConfirm={removeUser}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </DashboardShell>
  );
}
