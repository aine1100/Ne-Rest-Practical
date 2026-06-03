'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardShell from '@/components/layout/DashboardShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { apiGet, apiDownload } from '@/lib/api';

export default function AdminReportsPage() {
  const [inventory, setInventory] = useState<Record<string, number> | null>(null);
  const [inspections, setInspections] = useState<Record<string, number> | null>(null);
  const [compliance, setCompliance] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet('/reports/inventory'),
      apiGet('/reports/inspections'),
      apiGet('/reports/compliance'),
    ])
      .then(([inv, insp, comp]) => {
        setInventory(inv.data as Record<string, number>);
        setInspections(insp.data as Record<string, number>);
        setCompliance(comp.data as Record<string, number>);
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const download = async (type: 'pdf' | 'csv') => {
    try {
      await apiDownload(`/reports/export/${type}`, `fems-report.${type}`);
      toast.success('Report downloaded');
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Export failed');
    }
  };

  return (
    <DashboardShell title="Reports" allowedRole="admin">
      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-6">
          <div className="flex gap-3">
            <Button onClick={() => download('pdf')}>Export PDF</Button>
            <Button variant="secondary" onClick={() => download('csv')}>Export CSV</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ReportCard title="Inventory" data={inventory} />
            <ReportCard title="Inspections" data={inspections} />
            <ReportCard title="Compliance" data={compliance} />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function ReportCard({ title, data }: { title: string; data: Record<string, number> | null }) {
  if (!data) return null;
  return (
    <Card title={title}>
      <dl className="space-y-2">
        {Object.entries(data).filter(([k]) => k !== 'byStatus').map(([key, val]) => (
          <div key={key} className="flex justify-between text-sm">
            <dt className="capitalize text-gray-500">{key.replace(/([A-Z])/g, ' $1')}</dt>
            <dd className="font-medium text-gray-900">{val}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
