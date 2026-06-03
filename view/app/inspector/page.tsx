'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { apiGet } from '@/lib/api';
import type { Inspection } from '@/lib/types/inspection';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#FF383C', '#F59E0B', '#3B82F6', '#10B981', '#6B7280', '#8B5CF6'];

export default function InspectorDashboard() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Inspection[]>('/inspections', { limit: 100 })
      .then((res) => {
        setInspections(res.data);
        setTotal(res.meta?.total ?? res.data.length);
      })
      .finally(() => setLoading(false));
  }, []);

  const requested = inspections.filter((i) => i.status === 'Requested').length;
  const accepted = inspections.filter((i) => i.status === 'Accepted').length;
  const scheduled = inspections.filter((i) => i.status === 'Scheduled').length;
  const overdue = inspections.filter((i) => i.status === 'Overdue').length;
  const completed = inspections.filter((i) => i.status === 'Completed').length;

  const statusChart = Object.entries(
    inspections.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const openJobs = inspections.filter((i) => ['Requested', 'Accepted', 'Scheduled', 'Overdue'].includes(i.status));

  return (
    <DashboardShell title="Inspector Dashboard" allowedRole="inspector">
      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Assignments" value={total} highlight />
            <StatCard label="Open Requests" value={requested} accent="text-amber-600" />
            <StatCard label="Accepted / Scheduled" value={accepted + scheduled} accent="text-blue-600" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Overdue" value={overdue} accent="text-red-500" />
            <StatCard label="Completed" value={completed} accent="text-green-600" />
            <Card>
              <p className="text-sm text-gray-500">Quick Actions</p>
              <Link href="/inspector/inspections" className="mt-3 inline-block text-sm font-medium text-[#FF383C] hover:underline">
                Manage inspections
              </Link>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Workload by Status">
              {statusChart.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500">No inspections yet.</p>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                        {statusChart.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card title="Priority Queue">
              {openJobs.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500">No open jobs right now.</p>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={openJobs.slice(0, 8).map((i) => ({ name: `#${i.extinguisherId}`, status: i.status, priority: i.status === 'Overdue' ? 3 : i.status === 'Requested' ? 2 : 1 }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis hide domain={[0, 3]} />
                      <Tooltip formatter={(_, __, item) => [item.payload.status, 'Status']} />
                      <Bar dataKey="priority" fill="#FF383C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <Card title="Upcoming Jobs">
            {openJobs.length === 0 ? (
              <p className="text-sm text-gray-500">Nothing scheduled.</p>
            ) : (
              <Table headers={['Extinguisher', 'Date', 'Status', 'Remarks']}>
                {openJobs.slice(0, 6).map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-3 text-sm">#{i.extinguisherId}</td>
                    <td className="px-4 py-3 text-sm">{i.inspectionDate || 'TBD'}</td>
                    <td className="px-4 py-3"><Badge status={i.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{i.remarks || '—'}</td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({ label, value, highlight, accent }: { label: string; value: number; highlight?: boolean; accent?: string }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${highlight ? 'text-[#FF383C]' : accent || 'text-gray-900'}`}>{value}</p>
    </Card>
  );
}
