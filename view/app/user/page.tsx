'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/api';
import type { ExtinguisherSummary } from '@/lib/types/extinguisher';
import type { Inspection } from '@/lib/types/inspection';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#FF383C', '#3B82F6', '#6B7280'];

export default function UserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [extinguishers, setExtinguishers] = useState<ExtinguisherSummary[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [totalAssigned, setTotalAssigned] = useState(0);
  const [totalInspections, setTotalInspections] = useState(0);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.all([
      apiGet<ExtinguisherSummary[]>('/extinguishers', { assignedUserId: user.id, limit: 100 }),
      apiGet<Inspection[]>('/inspections', { limit: 50 }),
      apiGet<Inspection[]>('/inspections', { limit: 1 }),
    ])
      .then(([extRes, inspRes, inspCountRes]) => {
        setExtinguishers(extRes.data);
        setInspections(inspRes.data);
        setTotalAssigned(extRes.meta?.total ?? extRes.data.length);
        setTotalInspections(inspCountRes.meta?.total ?? inspRes.data.length);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const activeCount = extinguishers.filter((e) => e.status === 'Active').length;
  const dueCount = extinguishers.filter((e) => e.status === 'Inspection Due').length;
  const expiredCount = extinguishers.filter((e) => e.status === 'Expired').length;
  const pendingInspections = inspections.filter((i) => ['Requested', 'Accepted', 'Scheduled'].includes(i.status)).length;
  const completedInspections = inspections.filter((i) => i.status === 'Completed').length;

  const buildings = useMemo(
    () => new Set(extinguishers.map((e) => e.building).filter(Boolean)).size,
    [extinguishers]
  );

  const nextExpiry = useMemo(() => {
    const upcoming = extinguishers
      .filter((e) => e.expiryDate)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0];
    return upcoming ?? null;
  }, [extinguishers]);

  const statusChart = Object.entries(
    extinguishers.reduce<Record<string, number>>((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const typeChart = Object.entries(
    extinguishers.reduce<Record<string, number>>((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const inspectionChart = Object.entries(
    inspections.reduce<Record<string, number>>((acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <DashboardShell title="My Dashboard" allowedRole="user">
      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-6">
          <Card>
            <p className="text-sm text-gray-500">Welcome back</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You have <span className="font-semibold text-[#FF383C]">{totalAssigned}</span> extinguisher
              {totalAssigned === 1 ? '' : 's'} assigned across {buildings} building{buildings === 1 ? '' : 's'}.
              {nextExpiry && (
                <> Next expiry: <span className="font-medium">{nextExpiry.serialNumber}</span> on {nextExpiry.expiryDate}.</>
              )}
            </p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Assigned Extinguishers" value={totalAssigned} highlight />
            <StatCard label="Active" value={activeCount} />
            <StatCard label="Inspection Due" value={dueCount} />
            <StatCard label="Pending Inspections" value={pendingInspections} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Inspection Requests" value={totalInspections} />
            <StatCard label="Completed Inspections" value={completedInspections} />
            <StatCard label="Expired Units" value={expiredCount} />
            <Card>
              <p className="text-sm text-gray-500">Quick Actions</p>
              <div className="mt-3 flex flex-col gap-2">
                <Link href="/user/extinguishers" className="text-sm font-medium text-[#FF383C] hover:underline">View my extinguishers</Link>
                <Link href="/user/history" className="text-sm font-medium text-[#FF383C] hover:underline">Inspection history</Link>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Status Breakdown">
              {statusChart.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500">No extinguishers assigned yet.</p>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} label>
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

            <Card title="Extinguisher Types">
              {typeChart.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500">No type data yet.</p>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <Card title="Inspection Activity">
            {inspectionChart.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No inspection requests yet.</p>
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inspectionChart} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FF383C" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="My Assigned Extinguishers">
            {extinguishers.length === 0 ? (
              <p className="text-sm text-gray-500">No extinguishers assigned to you yet.</p>
            ) : (
              <Table headers={['Serial', 'Type', 'Location', 'Status', 'Expiry']}>
                {extinguishers.slice(0, 5).map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-sm font-medium">{e.serialNumber}</td>
                    <td className="px-4 py-3 text-sm">{e.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{e.building}, {e.floor}, {e.room}</td>
                    <td className="px-4 py-3"><Badge status={e.status} /></td>
                    <td className="px-4 py-3 text-sm">{e.expiryDate}</td>
                  </tr>
                ))}
              </Table>
            )}
            {extinguishers.length > 5 && (
              <Link href="/user/extinguishers" className="mt-3 inline-block text-sm font-medium text-[#FF383C] hover:underline">
                View all {totalAssigned} extinguishers
              </Link>
            )}
          </Card>

          <Card title="Recent Inspection Requests">
            {inspections.length === 0 ? (
              <p className="text-sm text-gray-500">You have not requested any inspections yet.</p>
            ) : (
              <Table headers={['Extinguisher', 'Date', 'Status', 'Findings']}>
                {inspections.slice(0, 5).map((i) => (
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
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${highlight ? 'text-[#FF383C]' : 'text-gray-900'}`}>{value}</p>
    </Card>
  );
}
