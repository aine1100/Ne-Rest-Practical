'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/layout/DashboardShell';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import { apiGet } from '@/lib/api';
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

const COLORS = ['#FF383C', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#6B7280', '#EC4899'];

export default function AdminDashboard() {
  const [inventory, setInventory] = useState<Record<string, unknown> | null>(null);
  const [inspections, setInspections] = useState<Record<string, unknown> | null>(null);
  const [compliance, setCompliance] = useState<Record<string, unknown> | null>(null);
  const [userTotal, setUserTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    Promise.all([
      apiGet('/reports/inventory'),
      apiGet('/reports/compliance'),
      apiGet('/reports/inspections'),
      apiGet('/users', { limit: 1 }),
    ])
      .then(([inv, comp, insp, users]) => {
        setInventory(inv.data as Record<string, unknown>);
        setCompliance(comp.data as Record<string, unknown>);
        setInspections(insp.data as Record<string, unknown>);
        setUserTotal(users.meta?.total ?? 0);
      })
      .catch((err: { message?: string; response?: { data?: { message?: string } } }) => {
        setError(
          err.response?.data?.message ||
            (err.message === 'Network Error'
              ? 'Cannot reach the API. Start the backend with npm run dev from the Rest folder.'
              : err.message || 'Failed to load dashboard data')
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const extinguisherChart = inventory?.byStatus
    ? Object.entries(inventory.byStatus as Record<string, number>).map(([name, value]) => ({ name, value }))
    : [];

  const inspectionChart = inspections?.byStatus
    ? Object.entries(inspections.byStatus as Record<string, number>).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <DashboardShell title="Admin Dashboard" allowedRole="admin">
      {loading ? (
        <Loader />
      ) : error ? (
        <Card><p className="text-sm text-red-600">{error}</p></Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Extinguishers" value={(inventory?.total as number) ?? 0} />
            <StatCard label="Active Units" value={(inventory?.active as number) ?? 0} accent="text-green-600" />
            <StatCard label="Inspection Due" value={(inventory?.inspectionDue as number) ?? 0} accent="text-amber-600" />
            <StatCard label="Compliance Rate" value={`${(compliance?.compliancePercent as number) ?? 0}%`} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Registered Users" value={userTotal} />
            <StatCard label="Total Inspections" value={(inspections?.total as number) ?? 0} />
            <StatCard label="Pending Requests" value={((inspections?.requested as number) ?? 0) + ((inspections?.accepted as number) ?? 0)} accent="text-amber-600" />
            <StatCard label="Expired Units" value={(inventory?.expired as number) ?? 0} accent="text-red-500" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Scheduled" value={(inspections?.scheduled as number) ?? 0} accent="text-blue-600" />
            <StatCard label="Completed" value={(inspections?.completed as number) ?? 0} accent="text-green-600" />
            <StatCard label="Overdue" value={(inspections?.overdue as number) ?? 0} accent="text-red-500" />
            <StatCard label="Under Maintenance" value={(inventory?.underMaintenance as number) ?? 0} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Extinguisher Status Mix">
              {extinguisherChart.length === 0 ? (
                <EmptyChart />
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={extinguisherChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                        {extinguisherChart.map((_, i) => (
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

            <Card title="Inspection Pipeline">
              {inspectionChart.length === 0 ? (
                <EmptyChart />
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inspectionChart} layout="vertical" margin={{ left: 20 }}>
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
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <QuickLink href="/admin/extinguishers" title="Manage Extinguishers" desc="Register, assign, and filter inventory" />
            <QuickLink href="/admin/inspections" title="Inspections" desc="Schedule and track inspection requests" />
            <QuickLink href="/admin/users" title="User Management" desc="Invite users and manage roles" />
          </div>

          <Card title="System Alerts">
            <div className="flex flex-wrap gap-3">
              {((inventory?.expired as number) ?? 0) > 0 && <Badge status="Expired" />}
              {((inventory?.inspectionDue as number) ?? 0) > 0 && <Badge status="Inspection Due" />}
              {((inspections?.overdue as number) ?? 0) > 0 && <Badge status="Overdue" />}
              {((inventory?.expired as number) ?? 0) === 0 &&
                ((inventory?.inspectionDue as number) ?? 0) === 0 &&
                ((inspections?.overdue as number) ?? 0) === 0 && (
                  <p className="text-sm text-green-600">No critical alerts right now.</p>
                )}
            </div>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold text-gray-900 ${accent || ''}`}>{value}</p>
    </Card>
  );
}

function EmptyChart() {
  return <p className="py-16 text-center text-sm text-gray-500">No data yet.</p>;
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#FF383C]/30 hover:shadow-md">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </Link>
  );
}
