'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardShell from '@/components/layout/DashboardShell';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import Pagination from '@/components/ui/Pagination';
import TableFilters, { buildFilterParams, emptyFilters, type TableFilterValues } from '@/components/ui/TableFilters';
import ExtinguisherDetailsModal from '@/components/extinguishers/ExtinguisherDetailsModal';
import InspectionDetailsModal from '@/components/inspections/InspectionDetailsModal';
import { Modal } from '@/components/ui/Modal';
import { apiGet, apiPatch } from '@/lib/api';
import { exportFilteredCsv } from '@/lib/export';
import { isTodayOrFuture, todayIsoDate } from '@/lib/dates';
import { INSPECTION_STATUS } from '@/lib/constants';
import type { Inspection } from '@/lib/types/inspection';
import type { ExtinguisherDetail } from '@/lib/types/extinguisher';

const PAGE_SIZE = 10;

type PaginatedState = {
  items: Inspection[];
  total: number;
  page: number;
  loading: boolean;
};

const emptyPaginated = (): PaginatedState => ({
  items: [],
  total: 0,
  page: 1,
  loading: true,
});

export default function InspectorInspectionsPage() {
  const [filters, setFilters] = useState<TableFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<TableFilterValues>(emptyFilters);
  const [exporting, setExporting] = useState(false);

  const [requests, setRequests] = useState<PaginatedState>(emptyPaginated());
  const [jobs, setJobs] = useState<PaginatedState>(emptyPaginated());
  const [recent, setRecent] = useState<PaginatedState>(emptyPaginated());

  const [acceptTarget, setAcceptTarget] = useState<Inspection | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Inspection | null>(null);
  const [acceptForm, setAcceptForm] = useState({ inspectionDate: '', inspectionTime: '10:00' });
  const [findings, setFindings] = useState('');
  const [outcome, setOutcome] = useState<'Completed' | 'Failed'>('Completed');
  const [submitting, setSubmitting] = useState(false);

  const [viewExtId, setViewExtId] = useState<number | null>(null);
  const [viewInspectionId, setViewInspectionId] = useState<number | null>(null);
  const [beforeExt, setBeforeExt] = useState<ExtinguisherDetail | null>(null);
  const [beforeLoading, setBeforeLoading] = useState(false);

  const loadSection = useCallback(
    async (
      statuses: string,
      page: number,
      setter: (value: PaginatedState | ((prev: PaginatedState) => PaginatedState)) => void
    ) => {
      setter((prev) => ({ ...prev, loading: true }));
      try {
        const res = await apiGet<Inspection[]>(
          '/inspections',
          buildFilterParams(appliedFilters, { statuses, page, limit: PAGE_SIZE })
        );
        setter({
          items: res.data,
          total: res.meta?.total ?? res.data.length,
          page,
          loading: false,
        });
      } catch {
        setter((prev) => ({ ...prev, loading: false }));
        toast.error('Failed to load inspections');
      }
    },
    [appliedFilters]
  );

  useEffect(() => {
    loadSection('Requested', 1, setRequests);
    loadSection('Accepted,Scheduled,Overdue', 1, setJobs);
    loadSection('Completed,Failed', 1, setRecent);
  }, [appliedFilters, loadSection]);

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

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

  const openAccept = (inspection: Inspection) => {
    setAcceptTarget(inspection);
    setAcceptForm({
      inspectionDate: inspection.inspectionDate || new Date().toISOString().slice(0, 10),
      inspectionTime: inspection.inspectionTime || '10:00',
    });
  };

  const openComplete = (inspection: Inspection) => {
    setCompleteTarget(inspection);
    setFindings('');
    setOutcome('Completed');
    setBeforeExt(null);
    setBeforeLoading(true);
    apiGet<ExtinguisherDetail>(`/extinguishers/${inspection.extinguisherId}`)
      .then((res) => setBeforeExt(res.data))
      .catch(() => toast.error('Failed to load extinguisher details'))
      .finally(() => setBeforeLoading(false));
  };

  const accept = async (e: FormEvent) => {
    e.preventDefault();
    if (!acceptTarget) return;
    if (!isTodayOrFuture(acceptForm.inspectionDate)) {
      toast.error('Inspection date must be today or a future date');
      return;
    }

    setSubmitting(true);
    try {
      await apiPatch(`/inspections/${acceptTarget.id}/accept`, acceptForm);
      toast.success('Inspection accepted');
      setAcceptTarget(null);
      loadSection('Requested', requests.page, setRequests);
      loadSection('Accepted,Scheduled,Overdue', 1, setJobs);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const complete = async (e: FormEvent) => {
    e.preventDefault();
    if (!completeTarget || !findings.trim()) return;

    setSubmitting(true);
    try {
      await apiPatch(`/inspections/${completeTarget.id}/complete`, { findings, status: outcome });
      toast.success(outcome === 'Completed' ? 'Inspection marked as passed' : 'Inspection marked as failed');
      setCompleteTarget(null);
      setFindings('');
      setOutcome('Completed');
      setBeforeExt(null);
      loadSection('Accepted,Scheduled,Overdue', jobs.page, setJobs);
      loadSection('Completed,Failed', 1, setRecent);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderActions = (inspection: Inspection, mode: 'request' | 'job' | 'recent') => (
    <div className="flex flex-wrap gap-1">
      <Button variant="ghost" onClick={() => setViewExtId(inspection.extinguisherId)}>Extinguisher</Button>
      {mode === 'request' && (
        <Button variant="ghost" onClick={() => openAccept(inspection)}>Accept</Button>
      )}
      {mode === 'job' && (
        <Button variant="ghost" onClick={() => openComplete(inspection)}>Complete</Button>
      )}
      {mode === 'recent' && (
        <Button variant="ghost" onClick={() => setViewInspectionId(inspection.id)}>Details</Button>
      )}
    </div>
  );

  return (
    <DashboardShell title="Inspections" allowedRole="inspector">
      <Card
        title="Search & Filters"
        action={
          <Button variant="secondary" onClick={exportCsv} loading={exporting}>Export CSV</Button>
        }
      >
        <TableFilters
          values={filters}
          onChange={setFilters}
          onApply={applyFilters}
          onReset={resetFilters}
          statusOptions={INSPECTION_STATUS}
          searchPlaceholder="Search ID, remarks, or findings…"
          dateLabel="Inspection"
        />
      </Card>

      <div className="mt-6 space-y-6">
        <Card title={`Inspection Requests (${requests.total})`}>
          {requests.loading ? <Loader /> : (
            <>
              <Table headers={['ID', 'Extinguisher', 'Requested Notes', 'Status', 'Actions']} empty="No pending requests">
                {requests.items.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 text-sm">#{i.id}</td>
                    <td className="px-4 py-3 text-sm">#{i.extinguisherId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{i.remarks || '—'}</td>
                    <td className="px-4 py-3"><Badge status={i.status} /></td>
                    <td className="px-4 py-3">{renderActions(i, 'request')}</td>
                  </tr>
                ))}
              </Table>
              <Pagination
                page={requests.page}
                totalPages={Math.ceil(requests.total / PAGE_SIZE) || 1}
                total={requests.total}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => loadSection('Requested', page, setRequests)}
              />
            </>
          )}
        </Card>

        <Card title={`My Active Inspections (${jobs.total})`}>
          {jobs.loading ? <Loader /> : (
            <>
              <Table headers={['ID', 'Extinguisher', 'Date', 'Time', 'Status', 'Actions']} empty="No active inspections">
                {jobs.items.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 text-sm">#{i.id}</td>
                    <td className="px-4 py-3 text-sm">#{i.extinguisherId}</td>
                    <td className="px-4 py-3 text-sm">{i.inspectionDate || '—'}</td>
                    <td className="px-4 py-3 text-sm">{i.inspectionTime || '—'}</td>
                    <td className="px-4 py-3"><Badge status={i.status} /></td>
                    <td className="px-4 py-3">{renderActions(i, 'job')}</td>
                  </tr>
                ))}
              </Table>
              <Pagination
                page={jobs.page}
                totalPages={Math.ceil(jobs.total / PAGE_SIZE) || 1}
                total={jobs.total}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => loadSection('Accepted,Scheduled,Overdue', page, setJobs)}
              />
            </>
          )}
        </Card>

        <Card title={`Recently Completed (${recent.total})`}>
          {recent.loading ? <Loader /> : (
            <>
              <Table headers={['ID', 'Extinguisher', 'Date', 'Status', 'Findings', 'Actions']} empty="No completed inspections yet">
                {recent.items.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 text-sm">#{i.id}</td>
                    <td className="px-4 py-3 text-sm">#{i.extinguisherId}</td>
                    <td className="px-4 py-3 text-sm">{i.inspectionDate || '—'}</td>
                    <td className="px-4 py-3"><Badge status={i.status} /></td>
                    <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">{i.findings || '—'}</td>
                    <td className="px-4 py-3">{renderActions(i, 'recent')}</td>
                  </tr>
                ))}
              </Table>
              <Pagination
                page={recent.page}
                totalPages={Math.ceil(recent.total / PAGE_SIZE) || 1}
                total={recent.total}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => loadSection('Completed,Failed', page, setRecent)}
              />
            </>
          )}
        </Card>
      </div>

      <Modal open={!!acceptTarget} title="Accept Inspection" onClose={() => setAcceptTarget(null)}>
        <form onSubmit={accept} className="space-y-4">
          <p className="text-sm text-gray-600">
            Accept inspection request #{acceptTarget?.id} for extinguisher #{acceptTarget?.extinguisherId}
          </p>
          {acceptTarget && (
            <Button type="button" variant="secondary" onClick={() => setViewExtId(acceptTarget.extinguisherId)}>
              View extinguisher before accepting
            </Button>
          )}
          <Input label="Inspection Date" type="date" min={todayIsoDate()} value={acceptForm.inspectionDate} onChange={(e) => setAcceptForm({ ...acceptForm, inspectionDate: e.target.value })} required />
          <Input label="Inspection Time" value={acceptForm.inspectionTime} onChange={(e) => setAcceptForm({ ...acceptForm, inspectionTime: e.target.value })} required />
          <Button type="submit" loading={submitting} className="w-full">Accept</Button>
        </form>
      </Modal>

      <Modal open={!!completeTarget} title="Submit Inspection Findings" onClose={() => { setCompleteTarget(null); setBeforeExt(null); setOutcome('Completed'); }}>
        <form onSubmit={complete} className="space-y-4">
          <p className="text-sm text-gray-600">
            Record findings for inspection #{completeTarget?.id}. Review the extinguisher state before completing.
          </p>

          {beforeLoading ? (
            <Loader />
          ) : beforeExt ? (
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm">
              <p className="font-semibold text-amber-800">Before inspection</p>
              <p className="mt-1 text-gray-700">{beforeExt.serialNumber} — {beforeExt.type}</p>
              <p className="text-gray-600">{beforeExt.building}, {beforeExt.floor}, {beforeExt.room}</p>
              <div className="mt-2"><Badge status={beforeExt.status} /></div>
              <Button type="button" variant="ghost" className="mt-2 px-0" onClick={() => setViewExtId(beforeExt.id)}>
                Full details
              </Button>
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">Inspection result</label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  outcome === 'Completed'
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  value="Completed"
                  checked={outcome === 'Completed'}
                  onChange={() => setOutcome('Completed')}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-green-700">Passed</span>
                  <span className="mt-1 block text-xs text-gray-600">Extinguisher is in good condition. Status will become Active.</span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  outcome === 'Failed'
                    ? 'border-red-500 bg-red-50 ring-1 ring-red-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  value="Failed"
                  checked={outcome === 'Failed'}
                  onChange={() => setOutcome('Failed')}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-red-700">Failed</span>
                  <span className="mt-1 block text-xs text-gray-600">Issues found. Status will become Damaged.</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Findings</label>
            <textarea
              className="min-h-[120px] w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#FF383C] focus:ring-1 focus:ring-[#FF383C]"
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Describe the condition of the extinguisher, any issues found, etc."
              required
            />
          </div>
          <Button type="submit" loading={submitting} className="w-full">
            {outcome === 'Completed' ? 'Submit as Passed' : 'Submit as Failed'}
          </Button>
        </form>
      </Modal>

      <ExtinguisherDetailsModal
        extinguisherId={viewExtId}
        open={viewExtId != null}
        onClose={() => setViewExtId(null)}
        title="Extinguisher Details (Before Inspection)"
      />

      <InspectionDetailsModal
        inspectionId={viewInspectionId}
        open={viewInspectionId != null}
        onClose={() => setViewInspectionId(null)}
      />
    </DashboardShell>
  );
}
