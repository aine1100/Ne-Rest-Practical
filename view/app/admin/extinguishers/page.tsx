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
import ExtinguisherDetailsModal from '@/components/extinguishers/ExtinguisherDetailsModal';
import RequestInspectionModal from '@/components/inspections/RequestInspectionModal';
import TableFilters, { buildFilterParams, emptyFilters, type TableFilterValues } from '@/components/ui/TableFilters';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api';
import { exportFilteredCsv } from '@/lib/export';
import { EXTINGUISHER_STATUS, EXTINGUISHER_TYPES } from '@/lib/constants';
import type { User } from '@/lib/auth';
import type { ExtinguisherSummary } from '@/lib/types/extinguisher';

type Extinguisher = ExtinguisherSummary;

const emptyForm = {
  serialNumber: '',
  type: 'Water',
  size: '5kg',
  building: '',
  floor: '',
  room: '',
  manufactureDate: '',
  installationDate: '',
  expiryDate: '',
  assignedUserId: '',
};

export default function AdminExtinguishersPage() {
  const [items, setItems] = useState<Extinguisher[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Extinguisher | null>(null);
  const [assignTarget, setAssignTarget] = useState<Extinguisher | null>(null);
  const [inspectionTarget, setInspectionTarget] = useState<Extinguisher | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [assignUserId, setAssignUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState<TableFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<TableFilterValues>(emptyFilters);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  const load = (active = appliedFilters) => {
    setLoading(true);
    apiGet<Extinguisher[]>('/extinguishers', buildFilterParams(active))
      .then((res) => {
        setItems(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .catch(() => toast.error('Failed to load extinguishers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    apiGet<User[]>('/users', { role: 'user', limit: 100 })
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, []);

  const validateDates = () => {
    if (!form.manufactureDate || !form.installationDate || !form.expiryDate) return null;

    const manufacture = new Date(form.manufactureDate);
    const installation = new Date(form.installationDate);
    const expiry = new Date(form.expiryDate);

    if (installation < manufacture) return 'Installation date cannot be before manufacture date';
    if (expiry <= manufacture) return 'Expiry date must be after manufacture date';
    if (installation > expiry) return 'Installation date cannot be after expiry date';
    return null;
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: Extinguisher) => {
    setEditingId(item.id);
    setForm({
      serialNumber: item.serialNumber,
      type: item.type,
      size: item.size ?? '',
      building: item.building,
      floor: item.floor,
      room: item.room,
      manufactureDate: item.manufactureDate ?? '',
      installationDate: item.installationDate ?? '',
      expiryDate: item.expiryDate,
      assignedUserId: item.assignedUserId ? String(item.assignedUserId) : '',
    });
    setModalOpen(true);
  };

  const buildPayload = () => ({
    serialNumber: form.serialNumber,
    type: form.type,
    size: form.size,
    building: form.building,
    floor: form.floor,
    room: form.room,
    manufactureDate: form.manufactureDate,
    installationDate: form.installationDate,
    expiryDate: form.expiryDate,
    assignedUserId: form.assignedUserId ? parseInt(form.assignedUserId, 10) : null,
  });

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const dateError = validateDates();
    if (dateError) {
      toast.error(dateError);
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await apiPut(`/extinguishers/${editingId}`, buildPayload());
        toast.success('Extinguisher updated');
      } else {
        await apiPost('/extinguishers', buildPayload());
        toast.success('Extinguisher registered');
      }
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const assignUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!assignTarget || !assignUserId) return;

    setAssigning(true);
    try {
      await apiPut(`/extinguishers/${assignTarget.id}`, {
        assignedUserId: parseInt(assignUserId, 10),
      });
      toast.success('Extinguisher assigned to user');
      setAssignTarget(null);
      setAssignUserId('');
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to assign');
    } finally {
      setAssigning(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/extinguishers/${deleteTarget.id}`);
      toast.success('Extinguisher deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const userLabel = (userId?: number | null) => {
    if (!userId) return 'Unassigned';
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : `User #${userId}`;
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await exportFilteredCsv('/reports/export/extinguishers/csv', appliedFilters, 'fems-extinguishers.csv');
      toast.success('Extinguishers exported');
    } catch {
      toast.error('Failed to export extinguishers');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardShell title="Extinguisher Management" allowedRole="admin">
      <Card
        title={`Fire Extinguishers (${total})`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportCsv} loading={exporting}>Export CSV</Button>
            <Button onClick={openCreate}>Add Extinguisher</Button>
          </div>
        }
      >
        <TableFilters
          values={filters}
          onChange={setFilters}
          onApply={() => { setAppliedFilters(filters); load(filters); }}
          onReset={() => { setFilters(emptyFilters); setAppliedFilters(emptyFilters); load(emptyFilters); }}
          statusOptions={EXTINGUISHER_STATUS}
          searchPlaceholder="Search serial, building, room…"
          dateLabel="Expiry"
        />
        {loading ? (
          <Loader />
        ) : (
          <Table headers={['Serial', 'Type', 'Location', 'Assigned To', 'Status', 'Expiry', 'Actions']} empty="No extinguishers match your filters">
            {items.length === 0 ? null : items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm font-medium">{item.serialNumber}</td>
                <td className="px-4 py-3 text-sm">{item.type}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.building} / {item.floor} / {item.room}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{userLabel(item.assignedUserId)}</td>
                <td className="px-4 py-3"><Badge status={item.status} /></td>
                <td className="px-4 py-3 text-sm">{item.expiryDate}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Button variant="ghost" onClick={() => setViewId(item.id)}>View</Button>
                    <Button variant="ghost" onClick={() => { setAssignTarget(item); setAssignUserId(item.assignedUserId ? String(item.assignedUserId) : ''); }}>Assign</Button>
                    <Button variant="ghost" onClick={() => setInspectionTarget(item)}>Inspect</Button>
                    <Button variant="ghost" onClick={() => openEdit(item)}>Edit</Button>
                    <Button variant="ghost" className="text-red-500" onClick={() => setDeleteTarget(item)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} title={editingId ? 'Edit Extinguisher' : 'Register Extinguisher'} onClose={() => { setModalOpen(false); setEditingId(null); }}>
        <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
          <Input label="Serial Number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Type</label>
            <select className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {EXTINGUISHER_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} required />
          <Input label="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} required />
          <Input label="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} required />
          <Input label="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} required />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Assign To User</label>
            <select className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" value={form.assignedUserId} onChange={(e) => setForm({ ...form, assignedUserId: e.target.value })}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
              ))}
            </select>
          </div>
          <Input label="Manufacture Date" type="date" value={form.manufactureDate} onChange={(e) => setForm({ ...form, manufactureDate: e.target.value })} required />
          <Input label="Installation Date" type="date" value={form.installationDate} min={form.manufactureDate || undefined} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} required />
          <Input label="Expiry Date" type="date" value={form.expiryDate} min={form.manufactureDate || undefined} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
          <div className="sm:col-span-2">
            <Button type="submit" loading={submitting} className="w-full">{editingId ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!assignTarget} title="Assign Extinguisher" onClose={() => setAssignTarget(null)}>
        <form onSubmit={assignUser} className="space-y-4">
          <p className="text-sm text-gray-600">
            Assign <span className="font-medium">{assignTarget?.serialNumber}</span> to a user.
          </p>
          <select className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} required>
            <option value="">Select user</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
            ))}
          </select>
          <Button type="submit" loading={assigning} className="w-full">Assign</Button>
        </form>
      </Modal>

      <RequestInspectionModal
        open={!!inspectionTarget}
        extinguisherId={inspectionTarget?.id ?? null}
        extinguisherLabel={inspectionTarget?.serialNumber}
        onClose={() => setInspectionTarget(null)}
      />

      <ExtinguisherDetailsModal extinguisherId={viewId} open={viewId !== null} onClose={() => setViewId(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Extinguisher"
        message={`Are you sure you want to delete extinguisher ${deleteTarget?.serialNumber}? This action cannot be undone.`}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </DashboardShell>
  );
}
