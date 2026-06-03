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
import TableFilters, { buildFilterParams, emptyFilters, type TableFilterValues } from '@/components/ui/TableFilters';
import { Modal } from '@/components/ui/Modal';
import { apiGet, apiPost } from '@/lib/api';
import { exportFilteredCsv } from '@/lib/export';
import { isTodayOrFuture, todayIsoDate } from '@/lib/dates';
import { INSPECTION_STATUS } from '@/lib/constants';
import type { User } from '@/lib/auth';
import type { ExtinguisherSummary } from '@/lib/types/extinguisher';
import type { Inspection } from '@/lib/types/inspection';

export default function AdminInspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [extinguishers, setExtinguishers] = useState<ExtinguisherSummary[]>([]);
  const [inspectors, setInspectors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    extinguisherId: '',
    inspectorId: '',
    inspectionDate: '',
    inspectionTime: '10:00',
    remarks: '',
  });
  const [requestForm, setRequestForm] = useState({
    extinguisherId: '',
    inspectionDate: '',
    inspectionTime: '10:00',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<TableFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<TableFilterValues>(emptyFilters);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  const load = (active = appliedFilters) => {
    setLoading(true);
    apiGet<Inspection[]>('/inspections', buildFilterParams(active))
      .then((res) => {
        setInspections(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    apiGet<ExtinguisherSummary[]>('/extinguishers', { limit: 100 }).then((res) => setExtinguishers(res.data));
    apiGet<User[]>('/users', { role: 'inspector', limit: 100 }).then((res) => setInspectors(res.data));
  }, []);

  const schedule = async (e: FormEvent) => {
    e.preventDefault();
    if (!isTodayOrFuture(scheduleForm.inspectionDate)) {
      toast.error('Inspection date must be today or a future date');
      return;
    }
    setSubmitting(true);
    try {
      await apiPost('/inspections', {
        extinguisherId: parseInt(scheduleForm.extinguisherId, 10),
        inspectorId: parseInt(scheduleForm.inspectorId, 10),
        inspectionDate: scheduleForm.inspectionDate,
        inspectionTime: scheduleForm.inspectionTime,
        remarks: scheduleForm.remarks || undefined,
      });
      toast.success('Inspection scheduled and assigned to inspector');
      setScheduleOpen(false);
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const requestInspection = async (e: FormEvent) => {
    e.preventDefault();
    if (requestForm.inspectionDate && !isTodayOrFuture(requestForm.inspectionDate)) {
      toast.error('Preferred date must be today or a future date');
      return;
    }
    setSubmitting(true);
    try {
      await apiPost('/inspections/request', {
        extinguisherId: parseInt(requestForm.extinguisherId, 10),
        inspectionDate: requestForm.inspectionDate || undefined,
        inspectionTime: requestForm.inspectionTime || undefined,
        remarks: requestForm.remarks || undefined,
      });
      toast.success('Inspection request submitted');
      setRequestOpen(false);
      load();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const extinguisherLabel = (id: number) =>
    extinguishers.find((e) => e.id === id)?.serialNumber || `#${id}`;

  const exportCsv = async () => {
    setExporting(true);
    try {
      await exportFilteredCsv('/reports/export/inspections/csv', appliedFilters, 'fems-inspections.csv');
      toast.success('Inspections exported');
    } catch {
      toast.error('Failed to export inspections');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardShell title="Inspections" allowedRole="admin">
      <Card
        title={`All Inspections (${total})`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportCsv} loading={exporting}>Export CSV</Button>
            <Button variant="secondary" onClick={() => setRequestOpen(true)}>Request Inspection</Button>
            <Button onClick={() => setScheduleOpen(true)}>Schedule Inspection</Button>
          </div>
        }
      >
        <TableFilters
          values={filters}
          onChange={setFilters}
          onApply={() => { setAppliedFilters(filters); load(filters); }}
          onReset={() => { setFilters(emptyFilters); setAppliedFilters(emptyFilters); load(emptyFilters); }}
          statusOptions={INSPECTION_STATUS}
          searchPlaceholder="Search ID, remarks, or findings…"
          dateLabel="Inspection"
        />
        {loading ? (
          <Loader />
        ) : (
          <Table headers={['ID', 'Extinguisher', 'Inspector', 'Date', 'Status', 'Findings']} empty="No inspections match your filters">
            {inspections.length === 0 ? null : inspections.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3 text-sm">#{i.id}</td>
                <td className="px-4 py-3 text-sm">{extinguisherLabel(i.extinguisherId)}</td>
                <td className="px-4 py-3 text-sm">{i.inspectorId ? `#${i.inspectorId}` : '—'}</td>
                <td className="px-4 py-3 text-sm">{i.inspectionDate || '—'}</td>
                <td className="px-4 py-3"><Badge status={i.status} /></td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{i.findings || '—'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={scheduleOpen} title="Schedule Inspection" onClose={() => setScheduleOpen(false)}>
        <form onSubmit={schedule} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Extinguisher</label>
            <select className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" value={scheduleForm.extinguisherId} onChange={(e) => setScheduleForm({ ...scheduleForm, extinguisherId: e.target.value })} required>
              <option value="">Select extinguisher</option>
              {extinguishers.map((e) => (
                <option key={e.id} value={e.id}>{e.serialNumber} — {e.building}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Inspector</label>
            <select className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" value={scheduleForm.inspectorId} onChange={(e) => setScheduleForm({ ...scheduleForm, inspectorId: e.target.value })} required>
              <option value="">Select inspector</option>
              {inspectors.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
              ))}
            </select>
          </div>
          <Input label="Date" type="date" min={todayIsoDate()} value={scheduleForm.inspectionDate} onChange={(e) => setScheduleForm({ ...scheduleForm, inspectionDate: e.target.value })} required />
          <Input label="Time (HH:MM)" value={scheduleForm.inspectionTime} onChange={(e) => setScheduleForm({ ...scheduleForm, inspectionTime: e.target.value })} required />
          <Input label="Remarks" value={scheduleForm.remarks} onChange={(e) => setScheduleForm({ ...scheduleForm, remarks: e.target.value })} />
          <Button type="submit" loading={submitting} className="w-full">Schedule</Button>
        </form>
      </Modal>

      <Modal open={requestOpen} title="Request Inspection" onClose={() => setRequestOpen(false)}>
        <form onSubmit={requestInspection} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Extinguisher</label>
            <select className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" value={requestForm.extinguisherId} onChange={(e) => setRequestForm({ ...requestForm, extinguisherId: e.target.value })} required>
              <option value="">Select extinguisher</option>
              {extinguishers.map((e) => (
                <option key={e.id} value={e.id}>{e.serialNumber}</option>
              ))}
            </select>
          </div>
          <Input label="Preferred Date (optional)" type="date" min={todayIsoDate()} value={requestForm.inspectionDate} onChange={(e) => setRequestForm({ ...requestForm, inspectionDate: e.target.value })} />
          <Input label="Preferred Time (optional)" value={requestForm.inspectionTime} onChange={(e) => setRequestForm({ ...requestForm, inspectionTime: e.target.value })} />
          <Input label="Notes" value={requestForm.remarks} onChange={(e) => setRequestForm({ ...requestForm, remarks: e.target.value })} />
          <Button type="submit" loading={submitting} className="w-full">Submit Request</Button>
        </form>
      </Modal>
    </DashboardShell>
  );
}
