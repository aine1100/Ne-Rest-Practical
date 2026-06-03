'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardShell from '@/components/layout/DashboardShell';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import TableFilters, { buildFilterParams, emptyFilters, type TableFilterValues } from '@/components/ui/TableFilters';
import { apiGet } from '@/lib/api';
import { exportFilteredCsv } from '@/lib/export';
import { INSPECTION_STATUS } from '@/lib/constants';
import type { Inspection } from '@/lib/types/inspection';

export default function UserHistoryPage() {
  const [items, setItems] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TableFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<TableFilterValues>(emptyFilters);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  const load = (active = appliedFilters) => {
    setLoading(true);
    apiGet<Inspection[]>('/inspections', buildFilterParams(active))
      .then((res) => {
        setItems(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const exportCsv = async () => {
    setExporting(true);
    try {
      await exportFilteredCsv('/reports/export/inspections/csv', appliedFilters, 'fems-my-inspections.csv');
      toast.success('Inspections exported');
    } catch {
      toast.error('Failed to export inspections');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardShell title="Inspection History" allowedRole="user">
      <Card
        title={`My Inspection Requests (${total})`}
        action={
          <Button variant="secondary" onClick={exportCsv} loading={exporting}>Export CSV</Button>
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
        {loading ? <Loader /> : (
          <Table headers={['Extinguisher', 'Date', 'Status', 'Findings']} empty="No inspection records match your filters">
            {items.length === 0 ? null : items.map((i) => (
              <tr key={i.id}>
                <td className="px-4 py-3 text-sm">#{i.extinguisherId}</td>
                <td className="px-4 py-3 text-sm">{i.inspectionDate || 'Pending'}</td>
                <td className="px-4 py-3"><Badge status={i.status} /></td>
                <td className="px-4 py-3 text-sm text-gray-600">{i.findings || '—'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </DashboardShell>
  );
}
