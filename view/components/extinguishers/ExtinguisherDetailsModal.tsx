'use client';

import { useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { apiGet } from '@/lib/api';
import type { ExtinguisherDetail } from '@/lib/types/extinguisher';

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
}

export default function ExtinguisherDetailsModal({
  extinguisherId,
  open,
  onClose,
  title = 'Extinguisher Details',
}: {
  extinguisherId: number | null;
  open: boolean;
  onClose: () => void;
  title?: string;
}) {
  const [detail, setDetail] = useState<ExtinguisherDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !extinguisherId) {
      setDetail(null);
      return;
    }

    setLoading(true);
    apiGet<ExtinguisherDetail>(`/extinguishers/${extinguisherId}`)
      .then((res) => setDetail(res.data))
      .catch(() => {
        toast.error('Failed to load extinguisher details');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [open, extinguisherId]);

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {loading ? (
        <Loader />
      ) : detail ? (
        <dl>
          <DetailRow label="Serial Number" value={detail.serialNumber} />
          <DetailRow label="Type" value={detail.type} />
          <DetailRow label="Size" value={detail.size} />
          <DetailRow label="Status" value={<Badge status={detail.status} />} />
          <DetailRow label="Building" value={detail.building} />
          <DetailRow label="Floor" value={detail.floor} />
          <DetailRow label="Room" value={detail.room} />
          <DetailRow label="Manufacture Date" value={formatDate(detail.manufactureDate)} />
          <DetailRow label="Installation Date" value={formatDate(detail.installationDate)} />
          <DetailRow label="Expiry Date" value={formatDate(detail.expiryDate)} />
          {detail.assignedUserId != null && (
            <DetailRow label="Assigned User ID" value={detail.assignedUserId} />
          )}
          <DetailRow label="Registered" value={formatDate(detail.createdAt)} />
          <DetailRow label="Last Updated" value={formatDate(detail.updatedAt)} />
        </dl>
      ) : (
        <p className="text-sm text-gray-500">No details available.</p>
      )}
    </Modal>
  );
}
