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
import ExtinguisherDetailsModal from '@/components/extinguishers/ExtinguisherDetailsModal';
import RequestInspectionModal from '@/components/inspections/RequestInspectionModal';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';
import { exportFilteredCsv } from '@/lib/export';
import { EXTINGUISHER_STATUS } from '@/lib/constants';
import type { ExtinguisherSummary } from '@/lib/types/extinguisher';

export default function UserExtinguishersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ExtinguisherSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<number | null>(null);
  const [inspectionTarget, setInspectionTarget] = useState<ExtinguisherSummary | null>(null);
  const [filters, setFilters] = useState<TableFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<TableFilterValues>(emptyFilters);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  const load = (active = appliedFilters) => {
    if (!user) return;
    setLoading(true);
    apiGet<ExtinguisherSummary[]>('/extinguishers', buildFilterParams(active, { assignedUserId: user.id }))
      .then((res) => {
        setItems(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      await exportFilteredCsv(
        '/reports/export/extinguishers/csv',
        appliedFilters,
        'fems-my-extinguishers.csv',
        user ? { assignedUserId: user.id } : undefined
      );
      toast.success('Extinguishers exported');
    } catch {
      toast.error('Failed to export extinguishers');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardShell title="My Extinguishers" allowedRole="user">
      <Card
        title={`Assigned Fire Extinguishers (${total})`}
        action={
          <Button variant="secondary" onClick={exportCsv} loading={exporting}>Export CSV</Button>
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
        {loading ? <Loader /> : (
          <Table headers={['Serial', 'Type', 'Location', 'Status', 'Expiry', 'Actions']} empty="No extinguishers match your filters">
            {items.length === 0 ? null : items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm font-medium">{item.serialNumber}</td>
                <td className="px-4 py-3 text-sm">{item.type}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.building} / {item.floor} / {item.room}</td>
                <td className="px-4 py-3"><Badge status={item.status} /></td>
                <td className="px-4 py-3 text-sm">{item.expiryDate}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setViewId(item.id)}>View</Button>
                    <Button variant="ghost" onClick={() => setInspectionTarget(item)}>Request Inspection</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <ExtinguisherDetailsModal extinguisherId={viewId} open={viewId !== null} onClose={() => setViewId(null)} />

      <RequestInspectionModal
        open={!!inspectionTarget}
        extinguisherId={inspectionTarget?.id ?? null}
        extinguisherLabel={inspectionTarget?.serialNumber}
        onClose={() => setInspectionTarget(null)}
      />
    </DashboardShell>
  );
}
