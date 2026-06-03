'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardShell from '@/components/layout/DashboardShell';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Pagination from '@/components/ui/Pagination';
import TableFilters, { buildFilterParams, emptyFilters, type TableFilterValues } from '@/components/ui/TableFilters';
import InspectionDetailsModal from '@/components/inspections/InspectionDetailsModal';
import ExtinguisherDetailsModal from '@/components/extinguishers/ExtinguisherDetailsModal';
import { apiGet } from '@/lib/api';
import { exportFilteredCsv } from '@/lib/export';
import { INSPECTION_STATUS } from '@/lib/constants';
import type { Inspection } from '@/lib/types/inspection';

const PAGE_SIZE = 10;

export default function InspectorHistoryPage() {
  const [items, setItems] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<TableFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<TableFilterValues>(emptyFilters);
  const [viewInspectionId, setViewInspectionId] = useState<number | null>(null);
  const [viewExtId, setViewExtId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(
    (activePage = page, active = appliedFilters) => {
      setLoading(true);
      apiGet<Inspection[]>(
        '/inspections',
        buildFilterParams(active, { statuses: 'Completed,Failed', page: activePage, limit: PAGE_SIZE })
      )
        .then((res) => {
          setItems(res.data);
          setTotal(res.meta?.total ?? res.data.length);
        })
        .finally(() => setLoading(false));
    },
    [page, appliedFilters]
  );

  useEffect(() => {
    load(page, appliedFilters);
  }, [page, appliedFilters]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      await exportFilteredCsv(
        '/reports/export/inspections/csv',
        appliedFilters,
        'fems-inspection-history.csv',
        { statuses: 'Completed,Failed' }
      );
      toast.success('Inspection history exported');
    } catch {
      toast.error('Failed to export inspection history');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardShell title="Inspection History" allowedRole="inspector">
      <Card
        title={`Completed Inspections (${total})`}
        action={
          <Button variant="secondary" onClick={exportCsv} loading={exporting}>Export CSV</Button>
        }
      >
        <TableFilters
          values={filters}
          onChange={setFilters}
          onApply={() => { setAppliedFilters(filters); setPage(1); }}
          onReset={() => { setFilters(emptyFilters); setAppliedFilters(emptyFilters); setPage(1); }}
          statusOptions={INSPECTION_STATUS.filter((s) => ['Completed', 'Failed'].includes(s))}
          searchPlaceholder="Search ID, remarks, or findings…"
          dateLabel="Inspection"
        />
        {loading ? <Loader /> : (
          <>
            <Table headers={['ID', 'Extinguisher', 'Date', 'Status', 'Before → After', 'Findings', 'Actions']} empty="No completed inspections">
              {items.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 text-sm">#{i.id}</td>
                  <td className="px-4 py-3 text-sm">#{i.extinguisherId}</td>
                  <td className="px-4 py-3 text-sm">{i.inspectionDate || '—'}</td>
                  <td className="px-4 py-3"><Badge status={i.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {i.statusBefore && i.statusAfter
                      ? `${i.statusBefore} → ${i.statusAfter}`
                      : '—'}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-600">{i.findings || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" onClick={() => setViewInspectionId(i.id)}>Details</Button>
                      <Button variant="ghost" onClick={() => setViewExtId(i.extinguisherId)}>Extinguisher</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
            <Pagination
              page={page}
              totalPages={Math.ceil(total / PAGE_SIZE) || 1}
              total={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <InspectionDetailsModal
        inspectionId={viewInspectionId}
        open={viewInspectionId != null}
        onClose={() => setViewInspectionId(null)}
      />

      <ExtinguisherDetailsModal
        extinguisherId={viewExtId}
        open={viewExtId != null}
        onClose={() => setViewExtId(null)}
        title="Extinguisher Profile"
      />
    </DashboardShell>
  );
}
